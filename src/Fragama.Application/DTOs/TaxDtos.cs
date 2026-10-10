using System;
using System.Collections.Generic;

namespace Fragama.Application.DTOs
{
    public class TaxCompanyDto
    {
        public string RazonSocial { get; set; } = "Distribuidora Fragama S.A.";
        public string NombreComercial { get; set; } = "Distribuidora Fragama";
        public string CedulaJuridica { get; set; } = "3-101-778899";
        public string ActividadEconomica { get; set; } = "466901";
        public string ActividadDescripcion { get; set; } = "Comercio al por mayor de artículos de limpieza, productos químicos y suministros de embalaje";
        public string Ubicacion { get; set; } = "Parque Industrial Cartago, Costa Rica";
        public string Regimen { get; set; } = "Régimen Tradicional (General)";
    }

    public class TaxPeriodDto
    {
        public int Mes { get; set; }
        public int Anio { get; set; }
        public string Descripcion { get; set; } = string.Empty;
        public string FechaLimitePago { get; set; } = string.Empty;
    }

    public class TaxOperationsSummaryDto
    {
        public int TotalComprobantes { get; set; }
        public decimal SubtotalBruto { get; set; }
        public decimal DescuentoTotal { get; set; }
        public decimal VentasNetasGravadas13 { get; set; }
        public decimal VentasExentas { get; set; }
        public decimal DebitoFiscalIva { get; set; }
        public decimal TotalComprasGravadas { get; set; }
        public decimal CreditoFiscalIva { get; set; }
        public decimal ImpuestoNetoAPagar { get; set; }
        public decimal SaldoAFavorContribuyente { get; set; }
    }

    public class D104BoxDto
    {
        public string Codigo { get; set; } = string.Empty;
        public string Concepto { get; set; } = string.Empty;
        public decimal Monto { get; set; }
    }

    public class D104BoxesDto
    {
        public D104BoxDto Casilla01 { get; set; } = new();
        public D104BoxDto Casilla05 { get; set; } = new();
        public D104BoxDto Casilla13 { get; set; } = new();
        public D104BoxDto Casilla23 { get; set; } = new();
        public D104BoxDto Casilla33 { get; set; } = new();
        public D104BoxDto Casilla45 { get; set; } = new();
    }

    public class CabysSummaryItemDto
    {
        public string Category { get; set; } = string.Empty;
        public string CategoryLabel { get; set; } = string.Empty;
        public string Cabys { get; set; } = string.Empty;
        public int Count { get; set; }
        public decimal TaxRate { get; set; }
    }

    public class D104TaxSummaryResponseDto
    {
        public TaxCompanyDto Empresa { get; set; } = new();
        public TaxPeriodDto Periodo { get; set; } = new();
        public TaxOperationsSummaryDto ResumenOperaciones { get; set; } = new();
        public D104BoxesDto CasillasFormularioD104 { get; set; } = new();
        public List<CabysSummaryItemDto> CabysCatalogBreakdown { get; set; } = new();
    }

    public class ElectronicInvoiceResponseDto
    {
        public bool Success { get; set; }
        public string Clave { get; set; } = string.Empty;
        public string Consecutivo { get; set; } = string.Empty;
        public string FechaEmision { get; set; } = string.Empty;
        public string Emisor { get; set; } = string.Empty;
        public string EmisorNombre { get; set; } = string.Empty;
        public string EmisorCedula { get; set; } = string.Empty;
        public string Receptor { get; set; } = string.Empty;
        public string ReceptorCedula { get; set; } = string.Empty;
        public decimal MontoGravado { get; set; }
        public decimal MontoIva13 { get; set; }
        public decimal TotalFactura { get; set; }
        public string TipoDocumento { get; set; } = "01";
        public string Moneda { get; set; } = "CRC";
        public string Xml { get; set; } = string.Empty;
    }

    public class CustomInvoiceLineDto
    {
        public int NumeroLinea { get; set; } = 1;
        public string Cabys { get; set; } = "3532200000000";
        public string Sku { get; set; } = "SKU-001";
        public string Detalle { get; set; } = "Producto Comercial";
        public decimal Cantidad { get; set; } = 1;
        public decimal PrecioUnitario { get; set; } = 1000;
        public decimal TarifaIva { get; set; } = 13;
    }

    public class CustomInvoiceEmisorDto
    {
        public string Nombre { get; set; } = "Distribuidora Fragama S.A.";
        public string Cedula { get; set; } = "3101778899";
        public string TipoIdentificacion { get; set; } = "02";
        public string NombreComercial { get; set; } = "Distribuidora Fragama";
        public string ActividadEconomica { get; set; } = "466901";
        public string Correo { get; set; } = "facturacion@fragama.cr";
        public string Telefono { get; set; } = "25510000";
        public string Provincia { get; set; } = "3";
        public string Canton { get; set; } = "01";
        public string Distrito { get; set; } = "01";
        public string Direccion { get; set; } = "Parque Industrial y Logístico, Cartago Centro, Costa Rica";
    }

    public class CustomInvoiceReceptorDto
    {
        public string Nombre { get; set; } = "Cliente General";
        public string Cedula { get; set; } = "3014042047";
        public string TipoIdentificacion { get; set; } = "02";
        public string Correo { get; set; } = "facturacion@cliente.cr";
    }

    public class CustomElectronicInvoiceRequestDto
    {
        public int OrderId { get; set; } = 0;
        public string TipoDocumento { get; set; } = "01";
        public string Sucursal { get; set; } = "001";
        public string Terminal { get; set; } = "00001";
        public string CondicionVenta { get; set; } = "01";
        public string MedioPago { get; set; } = "04";
        public string Moneda { get; set; } = "CRC";
        public CustomInvoiceEmisorDto Emisor { get; set; } = new();
        public CustomInvoiceReceptorDto Receptor { get; set; } = new();
        public List<CustomInvoiceLineDto> Lineas { get; set; } = new();
    }
}

