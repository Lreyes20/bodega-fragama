using System;
using System.Collections.Generic;
using Fragama.Domain.Enums;

namespace Fragama.Application.DTOs
{
    // ================== AUTH & RBAC DTOs ==================
    public class LoginRequestDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LoginResponseDto
    {
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? LicensePlate { get; set; }
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public DateTime AccessTokenExpiresAt { get; set; }
    }

    public class RefreshTokenRequestDto
    {
        public string RefreshToken { get; set; } = string.Empty;
    }

    // ================== PRODUCT DTOs ==================
    public class ProductDto
    {
        public int Id { get; set; }
        public string Sku { get; set; } = string.Empty;
        public string Barcode { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string? LocationCode { get; set; }
        public decimal CostPrice { get; set; }
        public decimal SalePrice { get; set; }
        public int CurrentStock { get; set; }
        public int MinimumStock { get; set; }
        public int MaximumStock { get; set; }
        public string UnitOfMeasure { get; set; } = "UNIDAD";
        public bool HasLowStockAlert { get; set; }
    }

    public class CreateProductDto
    {
        public string Sku { get; set; } = string.Empty;
        public string? CustomBarcode { get; set; } // Opcional, si no se envía se autogenera EAN-13
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int CategoryId { get; set; }
        public int? LocationId { get; set; }
        public decimal CostPrice { get; set; }
        public decimal SalePrice { get; set; }
        public int InitialStock { get; set; }
        public int MinimumStock { get; set; } = 5;
        public int MaximumStock { get; set; } = 500;
        public string UnitOfMeasure { get; set; } = "UNIDAD";
        public decimal WeightKg { get; set; }
    }

    public class BarcodePrintDto
    {
        public string Sku { get; set; } = string.Empty;
        public string Barcode { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string SvgContent { get; set; } = string.Empty;
        public string Base64Image { get; set; } = string.Empty;
    }

    // ================== INVENTORY & KARDEX DTOs ==================
    public class StockMovementRequestDto
    {
        public int ProductId { get; set; }
        public MovementTypeEnum MovementType { get; set; }
        public int Quantity { get; set; }
        public int? TargetLocationId { get; set; }
        public decimal? UnitCost { get; set; }
        public string? ReferenceDocument { get; set; }
        public string? Notes { get; set; }
    }

    public class KardexEntryDto
    {
        public long MovementId { get; set; }
        public string MovementNumber { get; set; } = string.Empty;
        public string MovementTypeName { get; set; } = string.Empty;
        public int Sign { get; set; } // +1, -1, 0
        public DateTime Date { get; set; }
        public int Quantity { get; set; }
        public int PreviousStock { get; set; }
        public int FinalStock { get; set; }
        public decimal UnitCost { get; set; }
        public decimal TotalAmount { get; set; }
        public string? ReferenceDocument { get; set; }
        public string? PerformedBy { get; set; }
        public string? Notes { get; set; }
    }

    // ================== DISPATCH & DRIVER DTOs ==================
    public class DispatchOrderDto
    {
        public int DispatchOrderId { get; set; }
        public string DispatchCode { get; set; } = string.Empty;
        public string DriverName { get; set; } = string.Empty;
        public string VehiclePlate { get; set; } = string.Empty;
        public string InvoiceNumber { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string DeliveryAddress { get; set; } = string.Empty;
        public string ContactRecipient { get; set; } = string.Empty;
        public string ContactPhone { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime DepartureTime { get; set; }
        public DateTime? DeliveredTime { get; set; }
        public string? ObservationNotes { get; set; }
        public List<DispatchItemDto> Items { get; set; } = new List<DispatchItemDto>();
    }

    public class DispatchItemDto
    {
        public int ItemId { get; set; }
        public int ProductId { get; set; }
        public string ProductSku { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public int QuantityShipped { get; set; }
        public int QuantityDelivered { get; set; }
        public bool IsVerifiedByDriver { get; set; }
    }

    public class UpdateDispatchStatusDto
    {
        public DispatchStatus NewStatus { get; set; }
        public string? ObservationNotes { get; set; }
        public string? RecipientSignatureBase64 { get; set; }
        public List<DispatchItemCheckDto>? DeliveredItems { get; set; }
    }

    public class DispatchItemCheckDto
    {
        public int ProductId { get; set; }
        public int QuantityDelivered { get; set; }
    }
}
