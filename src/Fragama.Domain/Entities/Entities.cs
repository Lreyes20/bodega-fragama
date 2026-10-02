using System;
using System.Collections.Generic;
using Fragama.Domain.Common;
using Fragama.Domain.Enums;

namespace Fragama.Domain.Entities
{
    public class Role : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string NormalizedName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
        public ICollection<User> Users { get; set; } = new List<User>();
    }

    public class User : BaseEntity
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string NormalizedEmail { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string DocumentNumber { get; set; } = string.Empty;
        public string? LicensePlate { get; set; }
        public bool IsActive { get; set; } = true;
        public int RoleId { get; set; }
        public Role? Role { get; set; }

        public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
        public ICollection<DispatchOrder> AssignedDispatches { get; set; } = new List<DispatchOrder>();
    }

    public class RefreshToken : BaseEntity
    {
        public int UserId { get; set; }
        public User? User { get; set; }
        public string Token { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public bool IsRevoked { get; set; }
        public string? CreatedByIp { get; set; }
        public DateTime? RevokedAt { get; set; }
        public string? RevokedByIp { get; set; }
        public string? ReplacedByToken { get; set; }

        public bool IsActive => !IsRevoked && DateTime.UtcNow < ExpiresAt;
    }

    /// <summary>
    /// Familia Macro de Productos (ej. Químicos y Desinfectantes, Papelería y Desechables, Seguridad y EPP, Maquinaria)
    /// Permite organizar el almacén por zonas de almacenamiento y normativas químicas.
    /// </summary>
    public class ProductFamily : BaseEntity
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string IconName { get; set; } = "bi-boxes";
        public string WarehouseZone { get; set; } = "ZONA-A"; // ZONA QUÍMICOS, ZONA SECA, etc.
        public bool IsActive { get; set; } = true;
        public ICollection<Category> Subcategories { get; set; } = new List<Category>();
    }

    /// <summary>
    /// Subfamilia o Categoría de Producto (ej. dentro de Químicos: Desengrasantes, Cloros, Jabones)
    /// </summary>
    public class Category : BaseEntity
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int FamilyId { get; set; }
        public ProductFamily? Family { get; set; }
        public bool IsActive { get; set; } = true;
        public ICollection<Product> Products { get; set; } = new List<Product>();
    }

    public class WarehouseLocation : BaseEntity
    {
        public string WarehouseCode { get; set; } = "BOD-CARTAGO";
        public string Zone { get; set; } = "ZONA-QUIMICA";     // Zona del almacén
        public string Aisle { get; set; } = string.Empty;      // Pasillo
        public string Rack { get; set; } = string.Empty;       // Estante
        public string ShelfLevel { get; set; } = string.Empty; // Nivel
        public string Position { get; set; } = "P-01";         // Posición Pallet
        public decimal? MaxWeightKg { get; set; }
        public bool IsOccupied { get; set; }
        public string FullLocationCode => $"{WarehouseCode}-{Aisle}-{Rack}-{ShelfLevel}-{Position}";
    }

    /// <summary>
    /// Producto con Atributos WMS Avanzados (Lote, Vencimiento, Control Químico, Cubicaje)
    /// </summary>
    public class Product : BaseEntity
    {
        public string Sku { get; set; } = string.Empty;
        public string Barcode { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int CategoryId { get; set; }
        public Category? Category { get; set; }
        public int? LocationId { get; set; }
        public WarehouseLocation? Location { get; set; }
        
        // Atributos de Lote y Trazabilidad WMS
        public string? BatchNumber { get; set; }          // Número de Lote
        public DateTime? ExpiryDate { get; set; }         // Fecha de Vencimiento
        public bool IsPerishable { get; set; }            // Si requiere control FEFO (First Expired, First Out)
        public string HazardClass { get; set; } = "NO_PELIGROSO"; // CORROSIVO, INFLAMABLE, TOXICO, NO_PELIGROSO

        // Precios y Stock
        public decimal CostPrice { get; set; }            // Costo en Colones (₡)
        public decimal SalePrice { get; set; }            // Precio Venta en Colones (₡)
        public int CurrentStock { get; set; }
        public int MinimumStock { get; set; } = 10;
        public int MaximumStock { get; set; } = 1000;
        public string UnitOfMeasure { get; set; } = "GALON";
        
        // Logística y Cubicaje
        public decimal WeightKg { get; set; }             // Peso para capacidad de camión
        public decimal VolumeM3 { get; set; }             // Volumen cúbico para estiba

        public bool IsActive { get; set; } = true;
        public byte[] RowVersion { get; set; } = Array.Empty<byte>();

        public bool HasLowStockAlert => CurrentStock <= MinimumStock;
        public bool IsExpiringSoon => ExpiryDate.HasValue && ExpiryDate.Value <= DateTime.UtcNow.AddDays(30);
    }

    public class InventoryMovement : BaseEntity
    {
        public string MovementNumber { get; set; } = string.Empty;
        public MovementTypeEnum MovementType { get; set; }
        public int ProductId { get; set; }
        public Product? Product { get; set; }
        public string? BatchNumber { get; set; }
        public int? SourceLocationId { get; set; }
        public WarehouseLocation? SourceLocation { get; set; }
        public int? TargetLocationId { get; set; }
        public WarehouseLocation? TargetLocation { get; set; }
        public int Quantity { get; set; }
        public int PreviousStock { get; set; }
        public int FinalStock { get; set; }
        public decimal UnitCost { get; set; }
        public decimal TotalAmount => Quantity * UnitCost;
        public string? ReferenceDocument { get; set; }
        public string? Notes { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
    }

    public class Customer : BaseEntity
    {
        public string TaxId { get; set; } = string.Empty; // Cédula Jurídica
        public string BusinessName { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string Address { get; set; } = string.Empty;
        public string Canton { get; set; } = "Cartago";
        public string Province { get; set; } = "Cartago";
        public bool IsActive { get; set; } = true;
    }

    public class Invoice : BaseEntity
    {
        public string InvoiceNumber { get; set; } = string.Empty;
        public int CustomerId { get; set; }
        public Customer? Customer { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
        public decimal SubTotal { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public string Status { get; set; } = "EMITIDA";
        public bool RequiresDelivery { get; set; }
        public ICollection<InvoiceDetail> Details { get; set; } = new List<InvoiceDetail>();
    }

    public class InvoiceDetail : BaseEntity
    {
        public int InvoiceId { get; set; }
        public Invoice? Invoice { get; set; }
        public int ProductId { get; set; }
        public Product? Product { get; set; }
        public string? BatchNumber { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalLine => Quantity * UnitPrice;
    }

    public class SalesOrder : BaseEntity
    {
        public string OrderNumber { get; set; } = string.Empty;
        public int CustomerId { get; set; }
        public Customer? Customer { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
        public decimal SubTotal { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = "PENDIENTE"; // COTIZACION, PENDIENTE, ALISTADO, FACTURADO, EN_RUTA, ENTREGADO
        public string? DeliveryNotes { get; set; }
        public DateTime? DeliveryDate { get; set; }
        public ICollection<SalesOrderDetail> Details { get; set; } = new List<SalesOrderDetail>();
    }

    public class SalesOrderDetail : BaseEntity
    {
        public int SalesOrderId { get; set; }
        public SalesOrder? SalesOrder { get; set; }
        public int ProductId { get; set; }
        public Product? Product { get; set; }
        public string? BatchNumber { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalLine => Quantity * UnitPrice;
    }

    public class DispatchOrder : BaseEntity
    {
        public string DispatchCode { get; set; } = string.Empty;
        public int DriverId { get; set; }
        public User? Driver { get; set; }
        public int WarehouseStaffId { get; set; }
        public User? WarehouseStaff { get; set; }
        public int InvoiceId { get; set; }
        public Invoice? Invoice { get; set; }
        public string VehiclePlate { get; set; } = string.Empty;
        public string Province { get; set; } = "Cartago";
        public string Canton { get; set; } = "Central";
        public string DeliveryAddress { get; set; } = string.Empty;
        public string ContactRecipient { get; set; } = string.Empty;
        public string ContactPhone { get; set; } = string.Empty;
        public string PackageSummary { get; set; } = string.Empty; // Resumen de bultos para el QR (ej: 10x Bolsas, 20x Cajas)
        public string? QrCodeToken { get; set; }
        public DispatchStatus Status { get; set; } = DispatchStatus.EnRuta;
        public DateTime DepartureTime { get; set; } = DateTime.UtcNow;
        public DateTime? DeliveredTime { get; set; }
        public string? RecipientSignatureUrl { get; set; }
        public string? ObservationNotes { get; set; }
        public byte[] RowVersion { get; set; } = Array.Empty<byte>();

        public ICollection<DispatchItem> Items { get; set; } = new List<DispatchItem>();
    }

    public class DispatchItem : BaseEntity
    {
        public int DispatchOrderId { get; set; }
        public DispatchOrder? DispatchOrder { get; set; }
        public int ProductId { get; set; }
        public Product? Product { get; set; }
        public string? BatchNumber { get; set; }
        public int QuantityShipped { get; set; }
        public int QuantityDelivered { get; set; }
        public bool IsVerifiedByDriver { get; set; }
    }

    /// <summary>
    /// Proveedor Homologado de Insumos y Materias Primas para Distribuidora Fragama
    /// </summary>
    public class Supplier : BaseEntity
    {
        public string TaxId { get; set; } = string.Empty; // Cédula Jurídica
        public string BusinessName { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty; // Químicos, Papelería, Bolsas, Equipos
        public string ContactPerson { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string? MobileWhatsApp { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string? City { get; set; } = "Cartago";
        public string PaymentTerms { get; set; } = "Crédito 30 días";
        public bool IsActive { get; set; } = true;
    }
}
