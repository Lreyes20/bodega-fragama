using System;
using System.Collections.Generic;

namespace Fragama.Application.DTOs
{
    // ================== EXCEL BULK IMPORT DTOs ==================
    public class BulkProductImportRowDto
    {
        public string Sku { get; set; } = string.Empty;
        public string? Barcode { get; set; }
        public string Name { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public string? LocationCode { get; set; }
        public decimal CostPrice { get; set; }
        public decimal SalePrice { get; set; }
        public int Quantity { get; set; } // Cantidad a ingresar o inicial
        public int MinimumStock { get; set; } = 5;
        public int MaximumStock { get; set; } = 500;
        public string UnitOfMeasure { get; set; } = "UNIDAD";
    }

    public class BulkImportResultDto
    {
        public int TotalProcessed { get; set; }
        public int CreatedCount { get; set; }
        public int UpdatedCount { get; set; }
        public int ErrorCount { get; set; }
        public List<string> SuccessMessages { get; set; } = new();
        public List<string> ErrorMessages { get; set; } = new();
    }

    // ================== REPORT DTOs ==================
    public class InventoryValuationReportDto
    {
        public decimal TotalInventoryCost { get; set; }
        public decimal TotalInventorySaleValue { get; set; }
        public decimal PotentialGrossMargin { get; set; }
        public int TotalActiveProducts { get; set; }
        public int TotalUnitsInWarehouse { get; set; }
        public List<CategoryValuationDto> Categories { get; set; } = new();
    }

    public class CategoryValuationDto
    {
        public string CategoryName { get; set; } = string.Empty;
        public int ProductCount { get; set; }
        public int TotalStock { get; set; }
        public decimal TotalCost { get; set; }
        public decimal TotalSaleValue { get; set; }
    }

    public class DriverPerformanceReportDto
    {
        public int DriverId { get; set; }
        public string DriverName { get; set; } = string.Empty;
        public string VehiclePlate { get; set; } = string.Empty;
        public int TotalDispatches { get; set; }
        public int DeliveredCount { get; set; }
        public int RejectedCount { get; set; }
        public int ObservedCount { get; set; }
        public decimal DeliverySuccessRate => TotalDispatches > 0 ? (decimal)DeliveredCount / TotalDispatches * 100 : 0;
    }
}
