-- ==============================================================================
-- SISTEMA DE GESTIÓN DE INVENTARIOS Y BODEGA - DISTRIBUIDORA FRAGAMA
-- Cartago, Costa Rica (dist.fragama)
-- WMS ROBUSTO CON CONTROL POR FAMILIAS, SUBFAMILIAS, LOTES Y VENCIMIENTOS
-- ==============================================================================

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'FragamaWarehouseDb')
BEGIN
    CREATE DATABASE FragamaWarehouseDb COLLATE Modern_Spanish_CI_AS;
END
GO

USE FragamaWarehouseDb;
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- ------------------------------------------------------------------------------
-- 1. SEGURIDAD Y CONTROL DE ACCESO BASADO EN ROLES (RBAC)
-- ------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Roles')
BEGIN
    CREATE TABLE Roles (
        RoleId INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(50) NOT NULL UNIQUE,
        NormalizedName NVARCHAR(50) NOT NULL UNIQUE,
        Description NVARCHAR(250) NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        UserId INT IDENTITY(1,1) PRIMARY KEY,
        FullName NVARCHAR(150) NOT NULL,
        Email NVARCHAR(150) NOT NULL UNIQUE,
        NormalizedEmail NVARCHAR(150) NOT NULL UNIQUE,
        PasswordHash NVARCHAR(MAX) NOT NULL,
        SecurityStamp NVARCHAR(MAX) NULL,
        PhoneNumber NVARCHAR(20) NULL,
        DocumentNumber NVARCHAR(30) NOT NULL UNIQUE,
        LicensePlate NVARCHAR(20) NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        RoleId INT NOT NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NULL,
        CONSTRAINT FK_Users_Roles FOREIGN KEY (RoleId) REFERENCES Roles(RoleId)
    );
    CREATE NONCLUSTERED INDEX IX_Users_RoleId ON Users(RoleId);
    CREATE NONCLUSTERED INDEX IX_Users_Email ON Users(NormalizedEmail);
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'RefreshTokens')
BEGIN
    CREATE TABLE RefreshTokens (
        TokenId INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NOT NULL,
        Token NVARCHAR(256) NOT NULL UNIQUE,
        ExpiresAt DATETIME2 NOT NULL,
        IsRevoked BIT NOT NULL DEFAULT 0,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CreatedByIp NVARCHAR(50) NULL,
        RevokedAt DATETIME2 NULL,
        RevokedByIp NVARCHAR(50) NULL,
        ReplacedByToken NVARCHAR(256) NULL,
        CONSTRAINT FK_RefreshTokens_Users FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE
    );
END
GO

-- ------------------------------------------------------------------------------
-- 2. JERARQUÍA DE CATÁLOGO ROBUSTA: FAMILIAS Y SUBFAMILIAS (CATEGORÍAS)
-- ------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ProductFamilies')
BEGIN
    CREATE TABLE ProductFamilies (
        FamilyId INT IDENTITY(1,1) PRIMARY KEY,
        Code NVARCHAR(20) NOT NULL UNIQUE,
        Name NVARCHAR(100) NOT NULL,
        Description NVARCHAR(255) NULL,
        WarehouseZone NVARCHAR(50) NOT NULL DEFAULT 'ZONA-A', -- Área segregada de bodega
        IconName NVARCHAR(50) NOT NULL DEFAULT 'bi-boxes',
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Categories')
BEGIN
    CREATE TABLE Categories (
        CategoryId INT IDENTITY(1,1) PRIMARY KEY,
        FamilyId INT NOT NULL,
        Code NVARCHAR(20) NOT NULL UNIQUE,
        Name NVARCHAR(100) NOT NULL,
        Description NVARCHAR(255) NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Categories_Families FOREIGN KEY (FamilyId) REFERENCES ProductFamilies(FamilyId)
    );
    CREATE NONCLUSTERED INDEX IX_Categories_FamilyId ON Categories(FamilyId);
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'WarehouseLocations')
BEGIN
    CREATE TABLE WarehouseLocations (
        LocationId INT IDENTITY(1,1) PRIMARY KEY,
        WarehouseCode NVARCHAR(15) NOT NULL DEFAULT 'BOD-CARTAGO',
        Zone NVARCHAR(50) NOT NULL DEFAULT 'ZONA-QUIMICOS',
        Aisle NVARCHAR(20) NOT NULL,
        Rack NVARCHAR(20) NOT NULL,
        ShelfLevel NVARCHAR(20) NOT NULL,
        Position NVARCHAR(20) NOT NULL DEFAULT 'P-01',
        MaxWeightKg DECIMAL(10,2) NULL,
        IsOccupied BIT NOT NULL DEFAULT 0,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT UQ_Location UNIQUE (WarehouseCode, Aisle, Rack, ShelfLevel, Position)
    );
END
GO

-- ------------------------------------------------------------------------------
-- 3. PRODUCTOS CON CONTROL WMS (LOTE, FEFO, PELIGROSIDAD Y VOLUMEN)
-- ------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Products')
BEGIN
    CREATE TABLE Products (
        ProductId INT IDENTITY(1,1) PRIMARY KEY,
        Sku NVARCHAR(50) NOT NULL UNIQUE,
        Barcode NVARCHAR(100) NOT NULL UNIQUE,
        Name NVARCHAR(200) NOT NULL,
        Description NVARCHAR(MAX) NULL,
        CategoryId INT NOT NULL,
        LocationId INT NULL,
        
        -- Control de Lote, Vencimiento y Normativa Química
        BatchNumber NVARCHAR(50) NULL,
        ExpiryDate DATETIME2 NULL,
        IsPerishable BIT NOT NULL DEFAULT 0,
        HazardClass NVARCHAR(30) NOT NULL DEFAULT 'NO_PELIGROSO', -- CORROSIVO, INFLAMABLE, TOXICO, NO_PELIGROSO
        
        CostPrice DECIMAL(18,2) NOT NULL DEFAULT 0.00,  -- Colones (₡)
        SalePrice DECIMAL(18,2) NOT NULL DEFAULT 0.00,  -- Colones (₡)
        CurrentStock INT NOT NULL DEFAULT 0,
        MinimumStock INT NOT NULL DEFAULT 10,
        MaximumStock INT NOT NULL DEFAULT 1000,
        UnitOfMeasure NVARCHAR(20) NOT NULL DEFAULT 'GALON',
        WeightKg DECIMAL(8,2) NOT NULL DEFAULT 0.00,
        VolumeM3 DECIMAL(8,4) NOT NULL DEFAULT 0.0000,
        IsActive BIT NOT NULL DEFAULT 1,
        RowVersion ROWVERSION NOT NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NULL,
        CONSTRAINT FK_Products_Categories FOREIGN KEY (CategoryId) REFERENCES Categories(CategoryId),
        CONSTRAINT FK_Products_Locations FOREIGN KEY (LocationId) REFERENCES WarehouseLocations(LocationId),
        CONSTRAINT CK_Products_StockPositive CHECK (CurrentStock >= 0),
        CONSTRAINT CK_Products_PricePositive CHECK (SalePrice >= CostPrice)
    );
    CREATE NONCLUSTERED INDEX IX_Products_Barcode ON Products(Barcode);
    CREATE NONCLUSTERED INDEX IX_Products_Sku ON Products(Sku);
    CREATE NONCLUSTERED INDEX IX_Products_CategoryId ON Products(CategoryId);
    CREATE NONCLUSTERED INDEX IX_Products_Stock_Alert ON Products(CurrentStock, MinimumStock) WHERE IsActive = 1;
    CREATE NONCLUSTERED INDEX IX_Products_Expiry ON Products(ExpiryDate) WHERE ExpiryDate IS NOT NULL;
END
GO

-- ------------------------------------------------------------------------------
-- 4. KARDEX Y MOVIMIENTOS TRANSACCIONALES CON TRAZABILIDAD DE LOTE
-- ------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MovementTypes')
BEGIN
    CREATE TABLE MovementTypes (
        MovementTypeId INT PRIMARY KEY,
        Code NVARCHAR(20) NOT NULL UNIQUE,
        Description NVARCHAR(100) NOT NULL,
        Sign INT NOT NULL
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'InventoryMovements')
BEGIN
    CREATE TABLE InventoryMovements (
        MovementId BIGINT IDENTITY(1,1) PRIMARY KEY,
        MovementNumber NVARCHAR(50) NOT NULL UNIQUE,
        MovementTypeId INT NOT NULL,
        ProductId INT NOT NULL,
        BatchNumber NVARCHAR(50) NULL,
        SourceLocationId INT NULL,
        TargetLocationId INT NULL,
        Quantity INT NOT NULL,
        PreviousStock INT NOT NULL,
        FinalStock INT NOT NULL,
        UnitCost DECIMAL(18,2) NOT NULL,
        TotalAmount AS (Quantity * UnitCost) PERSISTED,
        ReferenceDocument NVARCHAR(100) NULL,
        Notes NVARCHAR(500) NULL,
        UserId INT NOT NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Movements_Type FOREIGN KEY (MovementTypeId) REFERENCES MovementTypes(MovementTypeId),
        CONSTRAINT FK_Movements_Product FOREIGN KEY (ProductId) REFERENCES Products(ProductId),
        CONSTRAINT FK_Movements_SourceLocation FOREIGN KEY (SourceLocationId) REFERENCES WarehouseLocations(LocationId),
        CONSTRAINT FK_Movements_TargetLocation FOREIGN KEY (TargetLocationId) REFERENCES WarehouseLocations(LocationId),
        CONSTRAINT FK_Movements_User FOREIGN KEY (UserId) REFERENCES Users(UserId),
        CONSTRAINT CK_Movements_QuantityPositive CHECK (Quantity > 0)
    );
    CREATE NONCLUSTERED INDEX IX_Movements_ProductId ON InventoryMovements(ProductId, CreatedAt DESC);
END
GO

-- ------------------------------------------------------------------------------
-- 5. FACTURACIÓN Y DESPACHOS LOGÍSTICOS
-- ------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Customers')
BEGIN
    CREATE TABLE Customers (
        CustomerId INT IDENTITY(1,1) PRIMARY KEY,
        TaxId NVARCHAR(30) NOT NULL UNIQUE,
        BusinessName NVARCHAR(180) NOT NULL,
        Email NVARCHAR(120) NULL,
        Phone NVARCHAR(25) NULL,
        Address NVARCHAR(250) NOT NULL,
        Canton NVARCHAR(80) NOT NULL DEFAULT 'Cartago',
        Province NVARCHAR(80) NOT NULL DEFAULT 'Cartago',
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Suppliers')
BEGIN
    CREATE TABLE Suppliers (
        SupplierId INT IDENTITY(1,1) PRIMARY KEY,
        TaxId NVARCHAR(30) NOT NULL UNIQUE,
        BusinessName NVARCHAR(180) NOT NULL,
        Category NVARCHAR(80) NOT NULL,
        ContactPerson NVARCHAR(120) NOT NULL,
        Phone NVARCHAR(25) NOT NULL,
        MobileWhatsApp NVARCHAR(25) NULL,
        Email NVARCHAR(120) NOT NULL,
        Address NVARCHAR(250) NOT NULL,
        City NVARCHAR(80) NOT NULL DEFAULT 'Cartago',
        PaymentTerms NVARCHAR(50) NOT NULL DEFAULT 'Crédito 30 días',
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SalesOrders')
BEGIN
    CREATE TABLE SalesOrders (
        SalesOrderId INT IDENTITY(1,1) PRIMARY KEY,
        OrderNumber NVARCHAR(50) NOT NULL UNIQUE,
        CustomerId INT NOT NULL,
        UserId INT NOT NULL, -- Colaborador que crea el pedido
        AssignedToUserId INT NULL, -- Persona asignada para control detallado y alisto / gestión
        SubTotal DECIMAL(18,2) NOT NULL,
        DiscountAmount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        TaxAmount DECIMAL(18,2) NOT NULL,
        TotalAmount DECIMAL(18,2) NOT NULL,
        Status NVARCHAR(30) NOT NULL DEFAULT 'PENDIENTE', -- COTIZACION, PENDIENTE, ALISTADO, FACTURADO, EN_RUTA, ENTREGADO
        DeliveryNotes NVARCHAR(500) NULL,
        DeliveryDate DATETIME2 NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NULL,
        CONSTRAINT FK_SalesOrders_Customer FOREIGN KEY (CustomerId) REFERENCES Customers(CustomerId),
        CONSTRAINT FK_SalesOrders_User FOREIGN KEY (UserId) REFERENCES Users(UserId),
        CONSTRAINT FK_SalesOrders_AssignedUser FOREIGN KEY (AssignedToUserId) REFERENCES Users(UserId)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SalesOrderDetails')
BEGIN
    CREATE TABLE SalesOrderDetails (
        DetailId INT IDENTITY(1,1) PRIMARY KEY,
        SalesOrderId INT NOT NULL,
        ProductId INT NOT NULL,
        BatchNumber NVARCHAR(50) NULL,
        Quantity INT NOT NULL,
        UnitPrice DECIMAL(18,2) NOT NULL,
        TotalLine AS (Quantity * UnitPrice) PERSISTED,
        CONSTRAINT FK_SalesOrderDetails_Order FOREIGN KEY (SalesOrderId) REFERENCES SalesOrders(SalesOrderId) ON DELETE CASCADE,
        CONSTRAINT FK_SalesOrderDetails_Product FOREIGN KEY (ProductId) REFERENCES Products(ProductId)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Invoices')
BEGIN
    CREATE TABLE Invoices (
        InvoiceId INT IDENTITY(1,1) PRIMARY KEY,
        InvoiceNumber NVARCHAR(50) NOT NULL UNIQUE,
        CustomerId INT NOT NULL,
        UserId INT NOT NULL,
        SubTotal DECIMAL(18,2) NOT NULL,
        TaxAmount DECIMAL(18,2) NOT NULL,
        DiscountAmount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        TotalAmount DECIMAL(18,2) NOT NULL,
        PaymentMethod NVARCHAR(30) NOT NULL,
        Status NVARCHAR(20) NOT NULL DEFAULT 'EMITIDA',
        RequiresDelivery BIT NOT NULL DEFAULT 0,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Invoices_Customer FOREIGN KEY (CustomerId) REFERENCES Customers(CustomerId),
        CONSTRAINT FK_Invoices_User FOREIGN KEY (UserId) REFERENCES Users(UserId)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'InvoiceDetails')
BEGIN
    CREATE TABLE InvoiceDetails (
        DetailId INT IDENTITY(1,1) PRIMARY KEY,
        InvoiceId INT NOT NULL,
        ProductId INT NOT NULL,
        BatchNumber NVARCHAR(50) NULL,
        Quantity INT NOT NULL,
        UnitPrice DECIMAL(18,2) NOT NULL,
        TotalLine AS (Quantity * UnitPrice) PERSISTED,
        CONSTRAINT FK_InvoiceDetails_Invoice FOREIGN KEY (InvoiceId) REFERENCES Invoices(InvoiceId) ON DELETE CASCADE,
        CONSTRAINT FK_InvoiceDetails_Product FOREIGN KEY (ProductId) REFERENCES Products(ProductId)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DispatchOrders')
BEGIN
    CREATE TABLE DispatchOrders (
        DispatchOrderId INT IDENTITY(1,1) PRIMARY KEY,
        DispatchCode NVARCHAR(50) NOT NULL UNIQUE,
        DriverId INT NOT NULL,
        WarehouseStaffId INT NOT NULL,
        InvoiceId INT NOT NULL,
        VehiclePlate NVARCHAR(20) NOT NULL,
        Province NVARCHAR(80) NOT NULL DEFAULT 'Cartago',
        Canton NVARCHAR(80) NOT NULL DEFAULT 'Central',
        DeliveryAddress NVARCHAR(300) NOT NULL,
        ContactRecipient NVARCHAR(150) NOT NULL,
        ContactPhone NVARCHAR(30) NOT NULL,
        PackageSummary NVARCHAR(500) NULL,
        QrCodeToken NVARCHAR(120) NULL,
        Status NVARCHAR(30) NOT NULL DEFAULT 'EN_RUTA',
        DepartureTime DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        DeliveredTime DATETIME2 NULL,
        RecipientSignatureUrl NVARCHAR(500) NULL,
        ObservationNotes NVARCHAR(MAX) NULL,
        RowVersion ROWVERSION NOT NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NULL,
        CONSTRAINT FK_DispatchOrders_Driver FOREIGN KEY (DriverId) REFERENCES Users(UserId),
        CONSTRAINT FK_DispatchOrders_Invoice FOREIGN KEY (InvoiceId) REFERENCES Invoices(InvoiceId)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DispatchItems')
BEGIN
    CREATE TABLE DispatchItems (
        DispatchItemId INT IDENTITY(1,1) PRIMARY KEY,
        DispatchOrderId INT NOT NULL,
        ProductId INT NOT NULL,
        BatchNumber NVARCHAR(50) NULL,
        QuantityShipped INT NOT NULL,
        QuantityDelivered INT NOT NULL DEFAULT 0,
        IsVerifiedByDriver BIT NOT NULL DEFAULT 0,
        CONSTRAINT FK_DispatchItems_DispatchOrder FOREIGN KEY (DispatchOrderId) REFERENCES DispatchOrders(DispatchOrderId) ON DELETE CASCADE,
        CONSTRAINT FK_DispatchItems_Product FOREIGN KEY (ProductId) REFERENCES Products(ProductId)
    );
END
GO

-- ------------------------------------------------------------------------------
-- 6. SEED DATA: FAMILIAS, SUBFAMILIAS Y PRODUCTOS WMS FRAGAMA
-- ------------------------------------------------------------------------------

-- Roles RBAC
IF NOT EXISTS (SELECT 1 FROM Roles WHERE Name = 'Administrador')
BEGIN
    INSERT INTO Roles (Name, NormalizedName, Description) VALUES 
    ('Administrador', 'ADMINISTRADOR', 'Control total, gestión de usuarios, auditoría y parametrización'),
    ('Bodeguero', 'BODEGUERO', 'Entradas, salidas de almacén, inventario físico, escaneo de códigos de barra'),
    ('Cajero', 'CAJERO', 'Facturación, cobros, atención en caja y salidas por venta'),
    ('Chofer', 'CHOFER', 'Rutas de reparto GAM, confirmación de entregas móviles y recepción de carga'),
    ('Vendedor', 'VENDEDOR', 'Toma de pedidos, cotizaciones institucionales y seguimiento de clientes');
END
GO

-- Tipos de Movimiento
IF NOT EXISTS (SELECT 1 FROM MovementTypes WHERE MovementTypeId = 1)
BEGIN
    INSERT INTO MovementTypes (MovementTypeId, Code, Description, Sign) VALUES
    (1, 'ENT_COMPRA', 'Entrada por Compra a Laboratorio / Fabricante', 1),
    (2, 'SAL_VENTA', 'Salida por Venta / Despacho a Cliente', -1),
    (3, 'TRA_INTERNO', 'Traslado entre Pasillos / Zonas de Bodega', 0),
    (4, 'AJU_POSITIVO', 'Ajuste de Auditoría Positivo', 1),
    (5, 'AJU_NEGATIVO', 'Ajuste de Auditoría Negativo / Merma por Derrame', -1),
    (6, 'DEV_CLIENTE', 'Devolución de Cliente / Rechazo de Reparto', 1);
END
GO

-- FAMILIAS MACRO DE BODEGA FRAGAMA
IF NOT EXISTS (SELECT 1 FROM ProductFamilies WHERE Code = 'FAM-QUIM')
BEGIN
    INSERT INTO ProductFamilies (Code, Name, Description, WarehouseZone, IconName) VALUES
    ('FAM-QUIM', 'Químicos y Desinfectantes', 'Línea de formulaciones químicas concentradas y biodegradables', 'ZONA-QUIMICOS', 'bi-droplet-half'),
    ('FAM-PAP',  'Papelería y Desechables', 'Papel higiénico institucional, toallas en rollo e interdobladas', 'ZONA-SECA-PAPEL', 'bi-file-earmark-text'),
    ('FAM-PLAS', 'Bolsas y Plásticos', 'Bolsas de polietileno alta/baja densidad y contenedores industriales', 'ZONA-PLASTICOS', 'bi-box-seam'),
    ('FAM-UTI',  'Útiles, Fibras y Equipos', 'Mopas, escobillones, guantes de nitrilo, dispensadores y maquinaria', 'ZONA-ACCESORIOS', 'bi-tools');
END
GO

-- SUBFAMILIAS (CATEGORÍAS ASOCIADAS A FAMILIAS)
IF NOT EXISTS (SELECT 1 FROM Categories WHERE Code = 'SUB-DESENG')
BEGIN
    INSERT INTO Categories (FamilyId, Code, Name, Description) VALUES
    -- Familia Químicos (FamilyId: 1)
    (1, 'SUB-DESENG', 'Desengrasantes Industriales', 'Solventes alcalinos para talleres, cocinas y plantas'),
    (1, 'SUB-CLORO',  'Cloros y Desinfectantes Clorados', 'Blanqueadores concentrados al 5.25% y 10%'),
    (1, 'SUB-JABON',  'Jabones Líquidos y Antibacteriales', 'Higiene de manos para dispensadores'),
    (1, 'SUB-PISOS',  'Ceras y Selladores de Pisos', 'Tratamiento y abrillantado de pisos de terrazo y vinil'),

    -- Familia Papelería (FamilyId: 2)
    (2, 'SUB-JUMBO',  'Papel Higiénico Jumbo Roll', 'Rollos de 250m a 500m institucional doble hoja'),
    (2, 'SUB-TOALLA', 'Toallas de Mano en Rollo e Interdobladas', 'Toallas absorbentes de alta resistencia'),
    (2, 'SUB-SERVI',  'Servilletas y Vasos Desechables', 'Consumibles para sodas, cafeterías y comedores'),

    -- Familia Plásticos (FamilyId: 3)
    (3, 'SUB-BOLBAS', 'Bolsas para Basura Calibre Pesado', 'Bolsas negras, rojas y verdes para clasificación'),
    (3, 'SUB-DISPEN', 'Dispensadores Institucionales', 'Dispensadores de jabón, papel toalla y papel higiénico'),

    -- Familia Útiles (FamilyId: 4)
    (4, 'SUB-MOPAS',  'Mopas Industriales y Repuestos', 'Microfibra y algodón 18", 24" y 36"'),
    (4, 'SUB-EPP',    'Guantes y Protección Personal', 'Guantes de nitrilo, látex y mascarillas');
END
GO

-- Ubicaciones Físicas en Bodega Cartago
IF NOT EXISTS (SELECT 1 FROM WarehouseLocations WHERE Aisle = 'PAS-QUIM-01')
BEGIN
    INSERT INTO WarehouseLocations (WarehouseCode, Zone, Aisle, Rack, ShelfLevel, Position, MaxWeightKg, IsOccupied) VALUES
    ('BOD-CARTAGO', 'ZONA-QUIMICOS', 'PAS-QUIM-01', 'EST-01', 'NIVEL-1', 'P-01', 2500.00, 1),
    ('BOD-CARTAGO', 'ZONA-QUIMICOS', 'PAS-QUIM-01', 'EST-02', 'NIVEL-2', 'P-02', 2000.00, 1),
    ('BOD-CARTAGO', 'ZONA-SECA-PAPEL', 'PAS-PAP-02', 'EST-01', 'NIVEL-1', 'P-01', 1200.00, 1),
    ('BOD-CARTAGO', 'ZONA-SECA-PAPEL', 'PAS-PAP-02', 'EST-02', 'NIVEL-2', 'P-02', 1000.00, 1),
    ('BOD-CARTAGO', 'ZONA-ACCESORIOS', 'PAS-UTI-03', 'EST-01', 'NIVEL-1', 'P-01', 800.00, 1);
END
GO

-- PRODUCTOS CON ATRIBUTOS WMS ROBUSTOS
IF NOT EXISTS (SELECT 1 FROM Products WHERE Sku = 'FRAG-DES-001')
BEGIN
    INSERT INTO Products (Sku, Barcode, Name, Description, CategoryId, LocationId, BatchNumber, ExpiryDate, IsPerishable, HazardClass, CostPrice, SalePrice, CurrentStock, MinimumStock, MaximumStock, UnitOfMeasure, WeightKg, VolumeM3)
    VALUES
    ('FRAG-DES-001', '7401009823011', 'Desengrasante Industrial Alcalino Galón (3.8L)', 'Fórmula concentrada para cocinas industriales y talleres', 1, 1, 'LOT-2026-089A', '2028-06-30', 1, 'CORROSIVO', 4800.00, 6950.00, 185, 25, 500, 'GALON', 4.10, 0.0045),
    ('FRAG-CLO-001', '7401009823028', 'Cloro Concentrado Fragama 5.25% Galón (3.8L)', 'Desinfectante y blanqueador clorado de alta concentración', 2, 2, 'LOT-2026-092C', '2027-12-31', 1, 'CORROSIVO', 2100.00, 3250.00, 320, 40, 800, 'GALON', 4.00, 0.0045),
    ('FRAG-JAB-001', '7401009823035', 'Jabón Líquido Antibacterial Manos Galón', 'Aroma manzana verde con aloe vera para dispensadores', 3, 1, 'LOT-2026-104B', '2028-03-31', 1, 'NO_PELIGROSO', 3900.00, 5600.00, 140, 20, 350, 'GALON', 3.90, 0.0042),
    ('FRAG-PAP-001', '7401009823042', 'Papel Higiénico Jumbo Roll 250m (Caja x6)', 'Papel doble hoja premium para dispensador institucional', 5, 3, 'LOT-2026-PAP01', NULL, 0, 'NO_PELIGROSO', 9800.00, 13850.00, 95, 15, 300, 'CAJA', 6.50, 0.0380),
    ('FRAG-TOA-001', '7401009823059', 'Toalla de Mano Interdoblada Sanitis (Caja x20)', '20 paquetes x 150 toallas papel absorbente blanco', 6, 4, 'LOT-2026-TOA04', NULL, 0, 'NO_PELIGROSO', 14200.00, 19500.00, 70, 15, 200, 'CAJA', 8.20, 0.0450),
    ('FRAG-BOL-001', '7401009823066', 'Bolsa Basura Negra 30x40 Calibre 1.2 (Paq x50)', 'Bolsa plástica extra fuerte para contenedor industrial', 8, 4, 'LOT-2026-BOL22', NULL, 0, 'NO_PELIGROSO', 3100.00, 4450.00, 18, 25, 250, 'PAQUETE', 2.10, 0.0080),
    ('FRAG-MOP-001', '7401009823073', 'Mopa Industrial Microfibra 24" Completa', 'Incluye cabezal de microfibra, marco metálico y cabo de aluminio', 10, 5, 'LOT-2026-MOP08', NULL, 0, 'NO_PELIGROSO', 6500.00, 9200.00, 45, 10, 120, 'UNIDAD', 1.20, 0.0150);
END
GO

-- Clientes Comerciales en Costa Rica
IF NOT EXISTS (SELECT 1 FROM Customers WHERE TaxId = '3-101-582910')
BEGIN
    INSERT INTO Customers (TaxId, BusinessName, Email, Phone, Address, Canton, Province) VALUES
    ('3-101-582910', 'Restaurante y Marisquería El Fogón Tico S.A.', 'administracion@fogontico.cr', '2551-3344', '200m Sur de la Basílica de Los Ángeles', 'Cartago Central', 'Cartago'),
    ('3-102-774411', 'Colegio Bilingüe San Nicolás', 'proveeduria@sannicolas.ed.cr', '2591-8899', 'Frente a Plaza de Deportes de Taras', 'San Nicolás', 'Cartago'),
    ('3-101-998822', 'Parque Logístico e Industrial del Este', 'compras@logisticaeste.cr', '2272-1100', 'Zona Franca Cartago Lote 14', 'La Unión', 'Cartago');
END
GO

-- Usuarios Demo y Administrador Principal
IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = 'creyes@fragama.com')
BEGIN
    INSERT INTO Users (FullName, Email, NormalizedEmail, PasswordHash, PhoneNumber, DocumentNumber, LicensePlate, RoleId, IsActive) VALUES
    ('Christian Reyes (creyes)', 'creyes@fragama.com', 'CREYES@FRAGAMA.COM', 'AQAAAAIAAYagAAAAENK47Gf8Lq...', '2552-0001', '3-0214-0001', NULL, 1, 1);
END
GO

IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = 'admin@fragama.com')
BEGIN
    INSERT INTO Users (FullName, Email, NormalizedEmail, PasswordHash, PhoneNumber, DocumentNumber, LicensePlate, RoleId, IsActive) VALUES
    ('Gerencia Fragama (Admin)', 'admin@fragama.com', 'ADMIN@FRAGAMA.COM', 'AQAAAAIAAYagAAAAENK47Gf8Lq...', '2552-0011', '3-0214-0899', NULL, 1, 1),
    ('Carlos Calvo (Encargado Bodega)', 'bodega@fragama.com', 'BODEGA@FRAGAMA.COM', 'AQAAAAIAAYagAAAAENK47Gf8Lq...', '8844-2211', '1-1452-0988', NULL, 2, 1),
    ('Laura Monge (Ventas y Caja)', 'caja@fragama.com', 'CAJA@FRAGAMA.COM', 'AQAAAAIAAYagAAAAENK47Gf8Lq...', '8711-3355', '3-0411-0522', NULL, 3, 1),
    ('Minor Coto (Chofer Unidad-02)', 'chofer@fragama.com', 'CHOFER@FRAGAMA.COM', 'AQAAAAIAAYagAAAAENK47Gf8Lq...', '8399-4400', '3-0399-0144', 'CL-294012', 4, 1),
    ('Ana Mora (Ejecutiva Comercial)', 'ventas@fragama.com', 'VENTAS@FRAGAMA.COM', 'AQAAAAIAAYagAAAAENK47Gf8Lq...', '8955-1122', '3-0288-0331', NULL, 5, 1);
END
GO

-- Proveedores Homologados en Costa Rica
IF NOT EXISTS (SELECT 1 FROM Suppliers WHERE TaxId = '3-101-045920')
BEGIN
    INSERT INTO Suppliers (TaxId, BusinessName, Category, ContactPerson, Phone, MobileWhatsApp, Email, Address, City, PaymentTerms) VALUES
    ('3-101-045920', 'Clorox de Centroamérica S.A.', 'Químicos y Desinfectantes', 'Lic. Fernando Solís', '2290-4400', '8833-2211', 'pedidos.cr@clorox.com', '400m Norte de Pozuelo, Complejo Industrial La Uruca', 'San José, La Uruca', 'Crédito 30 días'),
    ('3-101-028491', 'Kimberly-Clark Costa Rica S.A.', 'Papelería y Desechables', 'Ing. Gabriela Mora', '2298-3100', '8700-4455', 'ventas.institucional@kcc.com', 'Centro Corporativo El Cafetal, Edificio Kimberly, Piso 3', 'Heredia, Belén', 'Crédito 45 días'),
    ('3-101-445588', 'Corporación Plásticos del Este S.A.', 'Bolsas y Plásticos', 'Don Ronald Brenes', '2573-8800', '8455-9900', 'ventas@plasticosdeleste.cr', 'Zona Franca Cartago, Nave Industrial 12', 'Cartago, La Unión', 'Crédito 30 días'),
    ('3-101-019283', '3M Costa Rica S.A.', 'Útiles, Fibras y Equipos', 'Licda. Marcela Vargas', '2277-1000', '8922-3344', 'compras.cr@mmm.com', 'Parque Empresarial Forum 2, Edificio B', 'San José, Santa Ana', 'Crédito 30 días'),
    ('3-101-382910', 'Distribuidora Química Industrial Tica S.A. (QUIMITICA)', 'Químicos y Desinfectantes', 'Lic. Jorge Calvo', '2552-1920', '8311-6677', 'ventas@quimitica.co.cr', '300m Oeste del Cruce de Taras, Cartago', 'Cartago, Taras', 'Crédito 15 días');
END
GO

-- ==============================================================================
-- GESTIÓN DE SEGURIDAD, AUDITORÍA Y USUARIOS (ACTIVOS Y DADOS DE BAJA)
-- ==============================================================================

-- Vista para consultar usuarios activos y dados de baja
IF OBJECT_ID('vw_UsersManagement', 'V') IS NOT NULL
    DROP VIEW vw_UsersManagement;
GO

CREATE VIEW vw_UsersManagement AS
SELECT 
    u.UserId,
    u.FullName,
    u.Email,
    u.DocumentNumber,
    u.PhoneNumber,
    u.LicensePlate,
    r.RoleId,
    r.Name AS RoleName,
    u.IsActive,
    CASE WHEN u.IsActive = 1 THEN 'Activo' ELSE 'Dado de Baja' END AS StatusDescription,
    u.CreatedAt,
    u.UpdatedAt
FROM Users u
INNER JOIN Roles r ON u.RoleId = r.RoleId;
GO

-- Procedimiento: Dar de baja a un colaborador (Desactivación)
IF OBJECT_ID('sp_DeactivateUser', 'P') IS NOT NULL
    DROP PROCEDURE sp_DeactivateUser;
GO

CREATE PROCEDURE sp_DeactivateUser
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;
    -- Protección al administrador creyes
    IF EXISTS (SELECT 1 FROM Users WHERE UserId = @UserId AND Email = 'creyes@fragama.com')
    BEGIN
        RAISERROR('El usuario principal creyes no puede ser dado de baja.', 16, 1);
        RETURN;
    END

    UPDATE Users
    SET IsActive = 0,
        UpdatedAt = SYSUTCDATETIME()
    WHERE UserId = @UserId;
END
GO

-- Procedimiento: Reactivar a un colaborador dado de baja
IF OBJECT_ID('sp_ReactivateUser', 'P') IS NOT NULL
    DROP PROCEDURE sp_ReactivateUser;
GO

CREATE PROCEDURE sp_ReactivateUser
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Users
    SET IsActive = 1,
        UpdatedAt = SYSUTCDATETIME()
    WHERE UserId = @UserId;
END
GO

-- Procedimiento: Crear nuevo colaborador con contraseña asignada por el Administrador
IF OBJECT_ID('sp_CreateUserWithAdminPassword', 'P') IS NOT NULL
    DROP PROCEDURE sp_CreateUserWithAdminPassword;
GO

CREATE PROCEDURE sp_CreateUserWithAdminPassword
    @FullName NVARCHAR(150),
    @Email NVARCHAR(150),
    @PasswordHash NVARCHAR(MAX),
    @DocumentNumber NVARCHAR(30),
    @RoleId INT,
    @PhoneNumber NVARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Users (FullName, Email, NormalizedEmail, PasswordHash, DocumentNumber, PhoneNumber, RoleId, IsActive, CreatedAt)
    VALUES (@FullName, @Email, UPPER(@Email), @PasswordHash, @DocumentNumber, @PhoneNumber, @RoleId, 1, SYSUTCDATETIME());
    
    SELECT SCOPE_IDENTITY() AS NewUserId;
END
GO

-- Procedimiento: Actualizar contraseña asignada por el Administrador
IF OBJECT_ID('sp_UpdateUserPasswordByAdmin', 'P') IS NOT NULL
    DROP PROCEDURE sp_UpdateUserPasswordByAdmin;
GO

CREATE PROCEDURE sp_UpdateUserPasswordByAdmin
    @UserId INT,
    @NewPasswordHash NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Users
    SET PasswordHash = @NewPasswordHash,
        UpdatedAt = SYSUTCDATETIME()
    WHERE UserId = @UserId;
END
GO

-- ==============================================================================
-- CONTROL DETALLADO Y ASIGNACIÓN DE PEDIDOS (SALES ORDERS ASSIGNMENT)
-- ==============================================================================

-- Vista detallada de pedidos con colaborador asignado y cliente
IF OBJECT_ID('vw_SalesOrdersDetailed', 'V') IS NOT NULL
    DROP VIEW vw_SalesOrdersDetailed;
GO

CREATE VIEW vw_SalesOrdersDetailed AS
SELECT 
    so.SalesOrderId,
    so.OrderNumber,
    so.CustomerId,
    c.BusinessName AS CustomerName,
    c.TaxId AS CustomerTaxId,
    c.Phone AS CustomerPhone,
    c.Address AS CustomerAddress,
    so.UserId AS CreatedByUserId,
    uCreator.FullName AS CreatedByUserName,
    so.AssignedToUserId,
    ISNULL(uAssigned.FullName, 'Sin Asignar') AS AssignedToUserName,
    ISNULL(rAssigned.Name, 'N/A') AS AssignedToUserRole,
    ISNULL(uAssigned.Email, 'N/A') AS AssignedToUserEmail,
    so.SubTotal,
    so.DiscountAmount,
    so.TaxAmount,
    so.TotalAmount,
    so.Status,
    so.DeliveryDate,
    so.DeliveryNotes,
    so.CreatedAt,
    so.UpdatedAt
FROM SalesOrders so
INNER JOIN Customers c ON so.CustomerId = c.CustomerId
INNER JOIN Users uCreator ON so.UserId = uCreator.UserId
LEFT JOIN Users uAssigned ON so.AssignedToUserId = uAssigned.UserId
LEFT JOIN Roles rAssigned ON uAssigned.RoleId = rAssigned.RoleId;
GO

-- Procedimiento: Asignar o reasignar pedido a un colaborador para control detallado
IF OBJECT_ID('sp_AssignSalesOrderToUser', 'P') IS NOT NULL
    DROP PROCEDURE sp_AssignSalesOrderToUser;
GO

CREATE PROCEDURE sp_AssignSalesOrderToUser
    @SalesOrderId INT,
    @AssignedToUserId INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE SalesOrders
    SET AssignedToUserId = @AssignedToUserId,
        UpdatedAt = SYSUTCDATETIME()
    WHERE SalesOrderId = @SalesOrderId;
END
GO


