using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using System.Transactions;
using Fragama.Application.Common;
using Fragama.Application.DTOs;
using Fragama.Application.Interfaces;
using Fragama.Domain.Entities;
using Fragama.Domain.Enums;
using Fragama.Domain.Interfaces;

namespace Fragama.Application.Services
{
    public class InventoryService : IInventoryService
    {
        private readonly IUnitOfWork _unitOfWork;

        public InventoryService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        }

        /// <summary>
        /// Registra un movimiento de inventario transaccional garantizando ACID con TransactionScope.
        /// Valida en tiempo real que ningún egreso genere inventario negativo no autorizado.
        /// </summary>
        public async Task<KardexEntryDto> RegisterMovementAsync(
            StockMovementRequestDto request, 
            int userId, 
            CancellationToken cancellationToken = default)
        {
            if (request.Quantity <= 0)
                throw new BusinessRuleException("La cantidad del movimiento debe ser un valor positivo mayor a cero.");

            // Configuración de TransactionScope con aislamiento ReadCommitted y soporte asíncrono
            var transactionOptions = new TransactionOptions
            {
                IsolationLevel = IsolationLevel.ReadCommitted,
                Timeout = TimeSpan.FromSeconds(30)
            };

            using var scope = new TransactionScope(
                TransactionScopeOption.Required, 
                transactionOptions, 
                TransactionScopeAsyncFlowOption.Enabled);

            // 1. Obtener producto con control de concurrencia
            var product = await _unitOfWork.Products.GetWithLockForStockUpdateAsync(request.ProductId, cancellationToken);
            if (product == null)
                throw new NotFoundException(nameof(Product), request.ProductId);

            // 2. Determinar signo según el tipo de movimiento
            int sign = GetMovementSign(request.MovementType);
            int stockDelta = sign * request.Quantity;

            // 3. Regla Crítica: Validación anti stock negativo
            int previousStock = product.CurrentStock;
            int finalStock = previousStock + stockDelta;

            if (finalStock < 0)
            {
                throw new InsufficientStockException(product.Sku, request.Quantity, previousStock);
            }

            // 4. Actualizar stock del producto
            product.CurrentStock = finalStock;
            product.UpdatedAt = DateTime.UtcNow;

            // Si es traslado o reubicación, actualizar ubicación
            if (request.TargetLocationId.HasValue && request.MovementType == MovementTypeEnum.TrasladoInterno)
            {
                product.LocationId = request.TargetLocationId.Value;
            }

            await _unitOfWork.Products.UpdateAsync(product, cancellationToken);

            // 5. Generar código correlativo de movimiento
            string movementNumber = await _unitOfWork.Inventory.GenerateNextMovementNumberAsync(request.MovementType);

            // 6. Registrar asiento inmutable en Kardex
            decimal unitCost = request.UnitCost ?? product.CostPrice;
            var movement = new InventoryMovement
            {
                MovementNumber = movementNumber,
                MovementType = request.MovementType,
                ProductId = product.Id,
                SourceLocationId = product.LocationId,
                TargetLocationId = request.TargetLocationId,
                Quantity = request.Quantity,
                PreviousStock = previousStock,
                FinalStock = finalStock,
                UnitCost = unitCost,
                ReferenceDocument = request.ReferenceDocument,
                Notes = request.Notes,
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Inventory.AddAsync(movement, cancellationToken);

            // 7. Persistir en la base de datos
            await _unitOfWork.CommitAsync(cancellationToken);

            // 8. Completar la transacción atómica
            scope.Complete();

            return new KardexEntryDto
            {
                MovementId = movement.Id,
                MovementNumber = movement.MovementNumber,
                MovementTypeName = request.MovementType.ToString(),
                Sign = sign,
                Date = movement.CreatedAt,
                Quantity = movement.Quantity,
                PreviousStock = previousStock,
                FinalStock = finalStock,
                UnitCost = movement.UnitCost,
                TotalAmount = movement.TotalAmount,
                ReferenceDocument = movement.ReferenceDocument,
                PerformedBy = $"Usuario #{userId}",
                Notes = movement.Notes
            };
        }

        public async Task<IReadOnlyList<KardexEntryDto>> GetKardexAsync(int productId, int limit = 50, CancellationToken cancellationToken = default)
        {
            var movements = await _unitOfWork.Inventory.GetKardexByProductAsync(productId, limit, cancellationToken);
            var result = new List<KardexEntryDto>();

            foreach (var m in movements)
            {
                result.Add(new KardexEntryDto
                {
                    MovementId = m.Id,
                    MovementNumber = m.MovementNumber,
                    MovementTypeName = m.MovementType.ToString(),
                    Sign = GetMovementSign(m.MovementType),
                    Date = m.CreatedAt,
                    Quantity = m.Quantity,
                    PreviousStock = m.PreviousStock,
                    FinalStock = m.FinalStock,
                    UnitCost = m.UnitCost,
                    TotalAmount = m.TotalAmount,
                    ReferenceDocument = m.ReferenceDocument,
                    PerformedBy = m.User?.FullName ?? $"Usuario #{m.UserId}",
                    Notes = m.Notes
                });
            }

            return result;
        }

        public async Task<IReadOnlyList<ProductDto>> GetLowStockAlertsAsync(CancellationToken cancellationToken = default)
        {
            var products = await _unitOfWork.Products.GetLowStockProductsAsync(cancellationToken);
            var dtos = new List<ProductDto>();

            foreach (var p in products)
            {
                dtos.Add(new ProductDto
                {
                    Id = p.Id,
                    Sku = p.Sku,
                    Barcode = p.Barcode,
                    Name = p.Name,
                    CategoryId = p.CategoryId,
                    CategoryName = p.Category?.Name ?? "General",
                    LocationCode = p.Location?.FullLocationCode,
                    CostPrice = p.CostPrice,
                    SalePrice = p.SalePrice,
                    CurrentStock = p.CurrentStock,
                    MinimumStock = p.MinimumStock,
                    MaximumStock = p.MaximumStock,
                    UnitOfMeasure = p.UnitOfMeasure,
                    HasLowStockAlert = true
                });
            }

            return dtos;
        }

        private static int GetMovementSign(MovementTypeEnum type)
        {
            return type switch
            {
                MovementTypeEnum.EntradaCompra => 1,
                MovementTypeEnum.AjustePositivo => 1,
                MovementTypeEnum.DevolucionCliente => 1,
                MovementTypeEnum.SalidaVenta => -1,
                MovementTypeEnum.AjusteNegativo => -1,
                MovementTypeEnum.TrasladoInterno => 0,
                _ => 0
            };
        }
    }
}
