using System;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Fragama.Application.Common;
using Fragama.Application.DTOs;
using Fragama.Application.Interfaces;
using Fragama.Domain.Entities;
using Fragama.Domain.Interfaces;

namespace Fragama.Application.Services
{
    public class BarcodeService : IProductService
    {
        private readonly IUnitOfWork _unitOfWork;

        public BarcodeService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        }

        public async Task<IReadOnlyList<ProductDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var products = await _unitOfWork.Products.GetAllAsync(cancellationToken);
            var list = new List<ProductDto>();
            foreach (var p in products)
            {
                list.Add(new ProductDto
                {
                    Id = p.Id,
                    Sku = p.Sku,
                    Barcode = p.Barcode,
                    Name = p.Name,
                    CategoryId = p.CategoryId,
                    CostPrice = p.CostPrice,
                    SalePrice = p.SalePrice,
                    CurrentStock = p.CurrentStock,
                    MinimumStock = p.MinimumStock,
                    MaximumStock = p.MaximumStock,
                    UnitOfMeasure = p.UnitOfMeasure,
                    HasLowStockAlert = p.HasLowStockAlert
                });
            }
            return list;
        }

        public async Task<ProductDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var p = await _unitOfWork.Products.GetByIdAsync(id, cancellationToken);
            if (p == null) return null;
            return new ProductDto
            {
                Id = p.Id,
                Sku = p.Sku,
                Barcode = p.Barcode,
                Name = p.Name,
                CategoryId = p.CategoryId,
                CostPrice = p.CostPrice,
                SalePrice = p.SalePrice,
                CurrentStock = p.CurrentStock,
                MinimumStock = p.MinimumStock,
                MaximumStock = p.MaximumStock,
                UnitOfMeasure = p.UnitOfMeasure,
                HasLowStockAlert = p.HasLowStockAlert
            };
        }

        public async Task<ProductDto?> GetByBarcodeAsync(string barcode, CancellationToken cancellationToken = default)
        {
            var p = await _unitOfWork.Products.GetByBarcodeAsync(barcode, cancellationToken);
            if (p == null) return null;
            return await GetByIdAsync(p.Id, cancellationToken);
        }

        public async Task<ProductDto> CreateAsync(CreateProductDto dto, int userId, CancellationToken cancellationToken = default)
        {
            // Validar SKU único
            var existingSku = await _unitOfWork.Products.GetBySkuAsync(dto.Sku, cancellationToken);
            if (existingSku != null)
                throw new BusinessRuleException($"El código SKU '{dto.Sku}' ya está registrado.");

            // Asignar o generar código de barras EAN-13
            string barcode = string.IsNullOrWhiteSpace(dto.CustomBarcode)
                ? GenerateEan13Barcode()
                : dto.CustomBarcode;

            var existingBarcode = await _unitOfWork.Products.GetByBarcodeAsync(barcode, cancellationToken);
            if (existingBarcode != null)
                throw new BusinessRuleException($"El código de barras '{barcode}' ya existe en el sistema.");

            var product = new Product
            {
                Sku = dto.Sku.Trim().ToUpperInvariant(),
                Barcode = barcode,
                Name = dto.Name.Trim(),
                Description = dto.Description,
                CategoryId = dto.CategoryId,
                LocationId = dto.LocationId,
                CostPrice = dto.CostPrice,
                SalePrice = dto.SalePrice,
                CurrentStock = dto.InitialStock,
                MinimumStock = dto.MinimumStock,
                MaximumStock = dto.MaximumStock,
                UnitOfMeasure = dto.UnitOfMeasure,
                WeightKg = dto.WeightKg,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Products.AddAsync(product, cancellationToken);
            await _unitOfWork.CommitAsync(cancellationToken);

            // Si tiene stock inicial, registrar asiento inicial en Kardex
            if (dto.InitialStock > 0)
            {
                var movementNumber = await _unitOfWork.Inventory.GenerateNextMovementNumberAsync(Domain.Enums.MovementTypeEnum.AjustePositivo);
                await _unitOfWork.Inventory.AddAsync(new InventoryMovement
                {
                    MovementNumber = movementNumber,
                    MovementType = Domain.Enums.MovementTypeEnum.AjustePositivo,
                    ProductId = product.Id,
                    Quantity = dto.InitialStock,
                    PreviousStock = 0,
                    FinalStock = dto.InitialStock,
                    UnitCost = dto.CostPrice,
                    ReferenceDocument = "INVENTARIO-INICIAL",
                    Notes = "Alta de producto y stock de apertura de bodega",
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow
                }, cancellationToken);
                await _unitOfWork.CommitAsync(cancellationToken);
            }

            return new ProductDto
            {
                Id = product.Id,
                Sku = product.Sku,
                Barcode = product.Barcode,
                Name = product.Name,
                CategoryId = product.CategoryId,
                CostPrice = product.CostPrice,
                SalePrice = product.SalePrice,
                CurrentStock = product.CurrentStock,
                MinimumStock = product.MinimumStock,
                MaximumStock = product.MaximumStock,
                UnitOfMeasure = product.UnitOfMeasure
            };
        }

        public async Task<BarcodePrintDto> GenerateBarcodeForProductAsync(int productId, CancellationToken cancellationToken = default)
        {
            var product = await _unitOfWork.Products.GetByIdAsync(productId, cancellationToken);
            if (product == null)
                throw new NotFoundException(nameof(Product), productId);

            string svg = GenerateBarcodeSvg(product.Barcode, product.Sku, product.Name);

            return new BarcodePrintDto
            {
                Sku = product.Sku,
                Barcode = product.Barcode,
                ProductName = product.Name,
                Price = product.SalePrice,
                SvgContent = svg,
                Base64Image = Convert.ToBase64String(Encoding.UTF8.GetBytes(svg))
            };
        }

        /// <summary>
        /// Genera un EAN-13 válido con prefijo empresarial Fragama (740) y dígito verificador módulo 10
        /// </summary>
        private static string GenerateEan13Barcode()
        {
            var rnd = new Random();
            string body = $"740{rnd.Next(100000000, 999999999):D9}"; // 12 dígitos
            int checkDigit = CalculateEan13CheckDigit(body);
            return body + checkDigit;
        }

        private static int CalculateEan13CheckDigit(string first12Digits)
        {
            int sum = 0;
            for (int i = 0; i < 12; i++)
            {
                int val = first12Digits[i] - '0';
                sum += (i % 2 == 0) ? val : val * 3;
            }
            int mod = sum % 10;
            return mod == 0 ? 0 : 10 - mod;
        }

        private static string GenerateBarcodeSvg(string barcode, string sku, string name)
        {
            var sb = new StringBuilder();
            sb.Append("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 120' width='260' height='120'>");
            sb.Append("<rect width='100%' height='100%' fill='#FFFFFF'/>");
            sb.Append($"<text x='130' y='18' font-family='sans-serif' font-size='10' font-weight='bold' text-anchor='middle' fill='#0B192C'>DISTRIBUIDORA FRAGAMA</text>");
            sb.Append($"<text x='130' y='32' font-family='sans-serif' font-size='9' text-anchor='middle' fill='#555555'>{sku} - {name}</text>");

            // Simulación de patrones de barras Code128 / EAN en SVG
            int x = 20;
            for (int i = 0; i < barcode.Length; i++)
            {
                int val = barcode[i] - '0';
                int barWidth = (val % 3) + 1;
                sb.Append($"<rect x='{x}' y='40' width='{barWidth}' height='50' fill='#000000'/>");
                x += barWidth + 2;
                if (val % 2 == 0)
                {
                    sb.Append($"<rect x='{x}' y='40' width='2' height='50' fill='#000000'/>");
                    x += 3;
                }
            }

            sb.Append($"<text x='130' y='105' font-family='monospace' font-size='13' font-weight='bold' text-anchor='middle' fill='#1E3E62'>{barcode}</text>");
            sb.Append("</svg>");
            return sb.ToString();
        }
    }
}
