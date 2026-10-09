-- ==============================================================================
-- DISTRIBUIDORA FRAGAMA - MIGRACIÓN SQL SERVER (HACIENDA COSTA RICA)
-- Normativa: Ley 9635, Catálogo CABYS BCCR (13 Dígitos) y Factura Electrónica v4.3
-- Compatible con: Microsoft SQL Server 2017+ / Azure SQL / Visual Studio
-- ==============================================================================

USE [FragamaWarehouseDb];
GO

PRINT 'Iniciando actualización tributaria de Hacienda Costa Rica en SQL Server...';
GO

-- 1. Agregar columnas CabysCode y TaxRate a la tabla Products
IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[Products]') AND name = 'CabysCode'
)
BEGIN
    ALTER TABLE [dbo].[Products] 
    ADD [CabysCode] NVARCHAR(13) NOT NULL CONSTRAINT [DF_Products_CabysCode] DEFAULT '3532200000000';
    PRINT 'Columna Products.CabysCode agregada exitosamente.';
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[Products]') AND name = 'TaxRate'
)
BEGIN
    ALTER TABLE [dbo].[Products] 
    ADD [TaxRate] DECIMAL(5,2) NOT NULL CONSTRAINT [DF_Products_TaxRate] DEFAULT 13.00;
    PRINT 'Columna Products.TaxRate (IVA 13%) agregada exitosamente.';
END
GO

-- 2. Clasificación CABYS oficial para las categorías del almacén
PRINT 'Actualizando códigos CABYS oficiales por familia de productos...';

-- Químicos, Cloros y Desinfectantes
UPDATE p
SET p.CabysCode = '3532200000000', p.TaxRate = 13.00
FROM [dbo].[Products] p
LEFT JOIN [dbo].[Categories] c ON p.CategoryId = c.CategoryId
WHERE c.Code LIKE '%QUIM%' OR p.Sku LIKE '%QUIM%' OR p.Name LIKE '%Desinfectante%' OR p.Name LIKE '%Cloro%' OR p.Name LIKE '%Jabón%' OR p.Name LIKE '%Desengrasante%';

-- Papelería Institucional e Higiene
UPDATE p
SET p.CabysCode = '3219300000000', p.TaxRate = 13.00
FROM [dbo].[Products] p
LEFT JOIN [dbo].[Categories] c ON p.CategoryId = c.CategoryId
WHERE c.Code LIKE '%PAP%' OR p.Sku LIKE '%PAP%' OR p.Name LIKE '%Papel%' OR p.Name LIKE '%Toalla%' OR p.Name LIKE '%Servilleta%';

-- Bolsas y Plásticos
UPDATE p
SET p.CabysCode = '3641000000000', p.TaxRate = 13.00
FROM [dbo].[Products] p
LEFT JOIN [dbo].[Categories] c ON p.CategoryId = c.CategoryId
WHERE c.Code LIKE '%PLAS%' OR p.Sku LIKE '%PLAS%' OR p.Name LIKE '%Bolsa%' OR p.Name LIKE '%Basura%';

-- Vasos y Tapas Descartables
UPDATE p
SET p.CabysCode = '3649000000000', p.TaxRate = 13.00
FROM [dbo].[Products] p
LEFT JOIN [dbo].[Categories] c ON p.CategoryId = c.CategoryId
WHERE p.Name LIKE '%Vaso%' OR p.Name LIKE '%Tapa%' OR p.Name LIKE '%Envase%' OR p.Name LIKE '%Deli%';

-- Bandejas Ecológicas Biodegradables
UPDATE p
SET p.CabysCode = '3215900000000', p.TaxRate = 13.00
FROM [dbo].[Products] p
WHERE p.Name LIKE '%Bandeja%' OR p.Name LIKE '%Plato%' OR p.Sku LIKE '%BAN%';

-- Cajas de Pizza y Cartón Corrugado
UPDATE p
SET p.CabysCode = '3215100000000', p.TaxRate = 13.00
FROM [dbo].[Products] p
WHERE p.Name LIKE '%Caja%' OR p.Name LIKE '%Pizza%';
GO

-- 3. Agregar campos de Facturación Electrónica a Invoices
IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[Invoices]') AND name = 'ElectronicInvoiceKey'
)
BEGIN
    ALTER TABLE [dbo].[Invoices] 
    ADD [ElectronicInvoiceKey] NVARCHAR(50) NULL,
        [ConsecutiveNumber] NVARCHAR(20) NULL,
        [EconomicActivityCode] NVARCHAR(10) NOT NULL CONSTRAINT [DF_Invoices_Activity] DEFAULT '466901';
    PRINT 'Campos de Factura Electrónica v4.3 agregados a Invoices.';
END
GO

-- 4. Agregar CabysCode a InvoiceDetails
IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[InvoiceDetails]') AND name = 'CabysCode'
)
BEGIN
    ALTER TABLE [dbo].[InvoiceDetails] 
    ADD [CabysCode] NVARCHAR(13) NOT NULL CONSTRAINT [DF_InvoiceDetails_Cabys] DEFAULT '3532200000000',
        [TaxRate] DECIMAL(5,2) NOT NULL CONSTRAINT [DF_InvoiceDetails_TaxRate] DEFAULT 13.00;
    PRINT 'Campos de IVA y CABYS agregados a InvoiceDetails.';
END
GO

PRINT '✅ Migración SQL Server de Hacienda Costa Rica completada con éxito.';
GO
