using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Transactions;
using Fragama.Application.Common;
using Fragama.Application.DTOs;
using Fragama.Domain.Entities;
using Fragama.Domain.Enums;
using Fragama.Domain.Interfaces;

namespace Fragama.Application.Services
{
    public interface IBulkImportService
    {
        Task<BulkImportResultDto> ProcessBulkImportAsync(List<BulkProductImportRowDto> rows, int userId, CancellationToken cancellationToken = default);
    }

    public interface IReportService
    {
        Task<InventoryValuationReportDto> GetInventoryValuationReportAsync(CancellationToken cancellationToken = default);
        Task<IReadOnlyList<DriverPerformanceReportDto>> GetDriverPerformanceReportAsync(CancellationToken cancellationToken = default);
    }

    public class BulkImportAndReportService : IBulkImportService, IReportService
    {
        private readonly IUnitOfWork _unitOfWork;

        public BulkImportAndReportService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        }

        public async Task<BulkImportResultDto> ProcessBulkImportAsync(
            List<BulkProductImportRowDto> rows, 
            int userId, 
            CancellationToken cancellationToken = default)
        {
            var result = new BulkImportResultDto { TotalProcessed = rows.Count };

            // Ejecución atómica en lote
            using var scope = new TransactionScope(
                TransactionScopeOption.Required,
                new TransactionOptions { IsolationLevel = IsolationLevel.ReadCommitted, Timeout = TimeSpan.FromMinutes(2) },
                TransactionScopeAsyncFlowOption.Enabled);

            var categories = await _unitOfWork.Users.FindAsync(_ => true, cancellationToken); // Placeholder o categories repo
            var allProducts = await _unitOfWork.Products.GetAllAsync(cancellationToken);

            int rowIndex = 1;
            foreach (var row in rows)
            {
                rowIndex++;
                if (string.IsNullOrWhiteSpace(row.Sku) || string.IsNullOrWhiteSpace(row.Name))
                {
                    result.ErrorCount++;
                    result.ErrorMessages.Add($"Fila {rowIndex}: SKU y Nombre del producto son obligatorios.");
                    continue;
                }

                string sku = row.Sku.Trim().ToUpperInvariant();
                var existing = allProducts.FirstOrDefault(p => p.Sku == sku);

                if (existing != null)
                {
                    // ==========================================
                    // CASO 1: PRODUCTO EXISTENTE -> UPSERT / AUMENTO
                    // ==========================================
                    int prevStock = existing.CurrentStock;
                    existing.SalePrice = row.SalePrice > 0 ? row.SalePrice : existing.SalePrice;
                    existing.CostPrice = row.CostPrice > 0 ? row.CostPrice : existing.CostPrice;
                    existing.MinimumStock = row.MinimumStock > 0 ? row.MinimumStock : existing.MinimumStock;
                    existing.MaximumStock = row.MaximumStock > 0 ? row.MaximumStock : existing.MaximumStock;
                    existing.UpdatedAt = DateTime.UtcNow;

                    if (row.Quantity > 0)
                    {
                        existing.CurrentStock += row.Quantity;

                        // Registrar asiento de aumento en Kardex
                        var movCode = await _unitOfWork.Inventory.GenerateNextMovementNumberAsync(MovementTypeEnum.EntradaCompra);
                        await _unitOfWork.Inventory.AddAsync(new InventoryMovement
                        {
                            MovementNumber = movCode,
                            MovementType = MovementTypeEnum.EntradaCompra,
                            ProductId = existing.Id,
                            Quantity = row.Quantity,
                            PreviousStock = prevStock,
                            FinalStock = existing.CurrentStock,
                            UnitCost = row.CostPrice > 0 ? row.CostPrice : existing.CostPrice,
                            ReferenceDocument = "IMPORT-EXCEL-MASS",
                            Notes = $"Aumento masivo por carga Excel. Usuario #{userId}",
                            UserId = userId,
                            CreatedAt = DateTime.UtcNow
                        }, cancellationToken);
                    }

                    await _unitOfWork.Products.UpdateAsync(existing, cancellationToken);
                    result.UpdatedCount++;
                    result.SuccessMessages.Add($"SKU [{sku}] actualizado: Stock {prevStock} -> {existing.CurrentStock}.");
                }
                else
                {
                    // ==========================================
                    // CASO 2: PRODUCTO NUEVO -> INSERCIÓN
                    // ==========================================
                    string barcode = string.IsNullOrWhiteSpace(row.Barcode) 
                        ? $"740{new Random().Next(100000000, 999999999):D9}0" 
                        : row.Barcode;

                    var newProduct = new Product
                    {
                        Sku = sku,
                        Barcode = barcode,
                        Name = row.Name.Trim(),
                        CategoryId = 1, // Categoría por defecto si no especifica
                        CostPrice = row.CostPrice,
                        SalePrice = row.SalePrice,
                        CurrentStock = row.Quantity,
                        MinimumStock = row.MinimumStock,
                        MaximumStock = row.MaximumStock,
                        UnitOfMeasure = string.IsNullOrWhiteSpace(row.UnitOfMeasure) ? "UNIDAD" : row.UnitOfMeasure,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    };

                    await _unitOfWork.Products.AddAsync(newProduct, cancellationToken);
                    await _unitOfWork.CommitAsync(cancellationToken); // Generar ProductId

                    if (row.Quantity > 0)
                    {
                        var movCode = await _unitOfWork.Inventory.GenerateNextMovementNumberAsync(MovementTypeEnum.AjustePositivo);
                        await _unitOfWork.Inventory.AddAsync(new InventoryMovement
                        {
                            MovementNumber = movCode,
                            MovementType = MovementTypeEnum.AjustePositivo,
                            ProductId = newProduct.Id,
                            Quantity = row.Quantity,
                            PreviousStock = 0,
                            FinalStock = row.Quantity,
                            UnitCost = row.CostPrice,
                            ReferenceDocument = "IMPORT-EXCEL-NUEVO",
                            Notes = "Stock inicial por importación masiva de catálogo",
                            UserId = userId,
                            CreatedAt = DateTime.UtcNow
                        }, cancellationToken);
                    }

                    result.CreatedCount++;
                    result.SuccessMessages.Add($"SKU [{sku}] insertado con stock inicial: {row.Quantity}.");
                }
            }

            await _unitOfWork.CommitAsync(cancellationToken);
            scope.Complete();

            return result;
        }

        public async Task<InventoryValuationReportDto> GetInventoryValuationReportAsync(CancellationToken cancellationToken = default)
        {
            var products = await _unitOfWork.Products.GetAllAsync(cancellationToken);
            var active = products.Where(p => p.IsActive).ToList();

            var report = new InventoryValuationReportDto
            {
                TotalActiveProducts = active.Count,
                TotalUnitsInWarehouse = active.Sum(p => p.CurrentStock),
                TotalInventoryCost = active.Sum(p => p.CurrentStock * p.CostPrice),
                TotalInventorySaleValue = active.Sum(p => p.CurrentStock * p.SalePrice)
            };

            report.PotentialGrossMargin = report.TotalInventorySaleValue - report.TotalInventoryCost;

            var groups = active.GroupBy(p => p.Category?.Name ?? "General");
            foreach (var g in groups)
            {
                report.Categories.Add(new CategoryValuationDto
                {
                    CategoryName = g.Key,
                    ProductCount = g.Count(),
                    TotalStock = g.Sum(p => p.CurrentStock),
                    TotalCost = g.Sum(p => p.CurrentStock * p.CostPrice),
                    TotalSaleValue = g.Sum(p => p.CurrentStock * p.SalePrice)
                });
            }

            return report;
        }

        public async Task<IReadOnlyList<DriverPerformanceReportDto>> GetDriverPerformanceReportAsync(CancellationToken cancellationToken = default)
        {
            var dispatches = await _unitOfWork.Dispatches.GetAllAsync(cancellationToken);
            var groups = dispatches.GroupBy(d => d.DriverId);
            var list = new List<DriverPerformanceReportDto>();

            foreach (var g in groups)
            {
                var first = g.First();
                list.Add(new DriverPerformanceReportDto
                {
                    DriverId = g.Key,
                    DriverName = first.Driver?.FullName ?? $"Chofer #{g.Key}",
                    VehiclePlate = first.VehiclePlate,
                    TotalDispatches = g.Count(),
                    DeliveredCount = g.Count(d => d.Status == DispatchStatus.Entregado),
                    RejectedCount = g.Count(d => d.Status == DispatchStatus.Rechazado),
                    ObservedCount = g.Count(d => d.Status == DispatchStatus.Observado)
                });
            }

            return list;
        }
    }
}
