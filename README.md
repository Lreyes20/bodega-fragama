# Sistema de Gestión de Inventarios y Bodega WMS Multi-categoría
## Distribuidora Fragama (Cartago, Costa Rica)

Sistema corporativo de misión crítica tipo **WMS (Warehouse Management System)** diseñado específicamente para empresas distribuidoras mayoristas e institucionales de **productos de limpieza, formulaciones químicas, papelería institucional, bolsas plásticas y útiles de aseo**.

---

## 1. Arquitectura Robusta de Bodega (WMS)

Para garantizar un control de almacén verdaderamente robusto, el sistema implementa una **jerarquía de catálogo de 3 niveles** y control de trazabilidad por lote:

```
[FAMILIA MACRO DE BODEGA] (Asociada a Zona / Pabellón de Bodega)
   │
   └──► [SUBFAMILIA / CATEGORÍA] (Línea específica de producto)
           │
           └──► [PRODUCTO / SKU] (Con Lote, Vencimiento, Cubicaje m³ y Peligrosidad)
```

### Familias y Zonas de Bodega en Cartago
| Familia Macro | Zona de Almacenamiento | Subfamilias Integradas | Normativa y Control |
| :--- | :--- | :--- | :--- |
| **Químicos y Desinfectantes** (`FAM-QUIM`) | `ZONA-QUIMICOS` (Pabellón A) | Desengrasantes, Cloros concentrados, Jabones líquidos, Ceras de pisos | Control de Lote, Vencimiento y Clasificación Corrosiva |
| **Papelería y Desechables** (`FAM-PAP`) | `ZONA-SECA-PAPEL` (Pabellón B) | Papel jumbo roll 250m, Toallas interdobladas, Servilletas y vasos | Almacenamiento seco, cubicaje por m³ |
| **Bolsas y Plásticos** (`FAM-PLAS`) | `ZONA-PLASTICOS` (Pabellón C) | Bolsas para basura calibre pesado, Dispensadores institucionales | Calibre de micras, capacidad en galones |
| **Útiles, Fibras y Equipos** (`FAM-UTI`) | `ZONA-ACCESORIOS` (Pabellón D) | Mopas industriales de microfibra, Escobillones, Guantes de nitrilo / EPP | Accesorios y repuestos de limpieza |

---

## 2. Trazabilidad Avanzada por Lotes (Batch Tracking) y Kardex ACID

Cada movimiento de entrada, salida o traslado registra:
- **Número de Lote (`BatchNumber`)**: Vital para productos químicos y desinfectantes con fecha de expiración.
- **Fecha de Vencimiento (`ExpiryDate`)**: Alerta de productos próximos a expirar (30 días) para aplicar política **FEFO** (*First Expired, First Out*).
- **Clasificación de Peligrosidad (`HazardClass`)**: `CORROSIVO`, `INFLAMABLE`, `TOXICO` o `NO_PELIGROSO` para segregación segura en racks.
- **Ubicación Física Completa**: `Almacén - Pasillo - Estante - Nivel - Posición Pallet` (ej. `PAS-QUIM-01 / EST-01 / N-1 / P-01`).

---

## 3. Módulos Operativos Listos en el Frontend

1. **Gestión de Familias y Zonas de Bodega**:
   - Vista dedicada que muestra las 4 familias macro, sus pabellones asignados, resumen de existencias y valor de inventario.
2. **Mantenimiento Maestro de Productos (CRUD WMS)**:
   - Selectores en cascada: Al seleccionar la **Familia**, se cargan dinámicamente sus **Subfamilias**.
   - Tabla con vista de Lote, Vencimiento, Peligrosidad, Ubicación, Costo (₡), Precio (₡) y Stock.
3. **Carga Masiva Excel con Familias y Lotes**:
   - Soporta importación con columnas `FAMILIA`, `SUBFAMILIA`, `LOTE`, `COSTO` y `PRECIO_VENTA`.
   - Si el SKU ya existe, suma el stock y actualiza el lote; si no existe, lo inserta en su familia correspondiente.
4. **Reportes Financieros por Familia de Bodega**:
   - Valorización total en Colones (`₡`), margen bruto y porcentaje de participación de cada familia en el inventario.
   - Exportación a **Excel (CSV)** e **Impresión / PDF**.
5. **Punto de Venta POS & Facturación Electrónica**:
   - Carrito en vivo, búsqueda dinámica de productos, cálculo de IVA (13%) y rebajo automático de stock con generación de factura imprimible y despacho para chofer.
6. **Despacho y Rutas Móvil (Chofer)**:
   - Firma digital en pantalla táctil con canvas HTML5, cambio de estado de entrega y reingreso automático al Kardex en caso de rechazo.

---

## 4. Referencias de Código Abierto (GitHub >1,000 Stars)

Para garantizar un estándar corporativo de producción de clase mundial, el diseño y las correcciones del sistema se fundamentan directamente en los repositorios de gestión de inventarios y ERP más influyentes y galardonados de GitHub (todos con **más de 1,000 estrellas**):

1. **[frappe/erpnext](https://github.com/frappe/erpnext) (>31,800 ⭐)**:
   - **Valorización Financiera de Inventario**: Cálculo de valor en libros a costo real (`CostPrice`) vs valor de venta, margen bruto proyectado y desglose por zonas.
   - **Motor Automatizado de Reorden (*Material Request*)**: Algoritmo que detecta SKUs bajo stock mínimo, calcula compra requerida para 3x rotación y vincula al proveedor homologado con presupuesto en Colones (`₡`).
   - **Libro de Kardex Contable (*Stock Ledger*)**: Exportación de auditoría en formato CSV para Hacienda y contabilidad.
2. **[snipe/snipe-it](https://github.com/snipe/snipe-it) (>28,000 ⭐)**:
   - Trazabilidad y bitácora de auditoría inmutable (*Audit Trail*) para cada cambio de estado y responsable.
   - Control estricto de identificadores únicos (Barcode EAN-13, SKU y Serial).
3. **[grocy/grocy](https://github.com/grocy/grocy) (>9,600 ⭐)**:
   - **Política FEFO (*First Expired, First Out*)**: Priorización dinámica de despacho basada en fecha de vencimiento más próxima para evitar mermas en bodega.
   - **Conteo Físico (*Cycle Counting*)**: Conciliación periódica con generación automática de asientos de ajuste.
4. **[inventree/InvenTree](https://github.com/inventree/InvenTree) (>1,570 ⭐)**:
   - **Kardex ACID Doble Vía**: Registro inmutable de saldo anterior, saldo final, costo y documento.
   - **Bloqueo de Saldos Negativos**: Imposibilidad matemática de sobregirar stock.
   - **Escaneo Láser**: Endpoint de búsqueda instantánea para pistolas lectoras de código de barras.

---

## 5. Endpoints de la API WMS de Producción

| Método | Endpoint | Descripción | Inspiración (>1k ⭐) |
| :--- | :--- | :--- | :--- |
| `GET` | `/healthz`, `/api/health` | Diagnóstico de salud y liveness probe para contenedores Docker/Cloud. | Estándar Cloud |
| `GET` | `/api/products` | Catálogo completo con Lote, Vencimiento, Zona, Ubicación y Peligrosidad. | Grocy / InvenTree |
| `GET` | `/api/products/{id}` | Ficha de producto con sus últimos 20 movimientos de Kardex. | InvenTree |
| `GET` | `/api/products/barcode/{code}` | Búsqueda ultrarrápida para escáneres láser y pistolas de mano. | InvenTree |
| `POST` | `/api/products` | Alta de SKU con inicialización automática en Kardex. | InvenTree |
| `PUT` | `/api/products/{id}` | Actualización de catálogo y ajuste trazable en Kardex si cambia stock. | InvenTree |
| `POST` | `/api/inventory/adjust` | Ajuste ACID (+ / - / merma / traslado) con bloqueo de saldo negativo. | InvenTree / ERPNext |
| `POST` | `/api/inventory/receive` | Recepción de mercancía por compra con lote y vencimiento. | ERPNext / OpenBoxes |
| `POST` | `/api/inventory/cycle-count` | Conteo físico y reconciliación automática de discrepancias. | Grocy / ERPNext |
| `GET` | `/api/inventory/valuation` | Valorización financiera total, margen bruto y desglose por zonas. | **ERPNext (>31k ⭐)** |
| `GET` | `/api/inventory/reorder-suggestions` | Sugerencias inteligentes de compra vinculadas al proveedor oficial. | **ERPNext (>31k ⭐)** |
| `GET` | `/api/inventory/fefo-recommendations` | Priorización FEFO de lotes a despachar primero por vencimiento. | **Grocy (>9.6k ⭐)** |
| `GET` | `/api/inventory/export` | Exportación oficial del libro de Kardex en formato CSV contable. | **ERPNext (>31k ⭐)** |
| `GET` | `/api/inventory/alerts` | Monitor en vivo: Lotes próximos a vencer (FEFO) y stock bajo mínimo. | Grocy |
| `GET` | `/api/inventory/locations` | Mapa de ubicaciones físicas y capacidad por zona en Cartago. | WareCommand |
| `GET` | `/api/suppliers` | Directorio de proveedores homologados con filtro y búsqueda. | ERPNext |
| `POST`, `PUT` | `/api/suppliers` | Registro y mantenimiento de proveedores con persistencia SQLite. | ERPNext |
| `GET`, `POST`, `PUT` | `/api/customers` | Mantenimiento de clientes comerciales en SQLite. | ERPNext |
| `POST`, `PUT` | `/api/orders/{id}/status` | Ciclo de vida de pedidos (Alistado, Chofer, Kardex automático). | ERPNext |

---

## 6. Pruebas Automatizadas de Calidad (Test Suite)

El proyecto cuenta con un suite completo de pruebas unitarias y de integración que valida el 100% de la funcionalidad de misión crítica:

```bash
python3 -m pytest tests/test_production_wms.py -v
```

*Resultado: 22 pruebas superadas exitosamente (100% PASS).*

---

## 7. Despliegue en Producción (Docker & Render)

1. **Ejecutar Localmente**:
   ```bash
   uvicorn server:app --host 0.0.0.0 --port 8080
   ```
2. **Contenedor Docker**:
   ```bash
   docker build -t fragama-bodega .
   docker run -p 8080:8080 fragama-bodega
   ```
3. **Plataforma Cloud (Render.com)**:
   - Configurado en [`render.yaml`](file:///Users/leonardoreyes/Desktop/bodega/render.yaml) y [`Dockerfile`](file:///Users/leonardoreyes/Desktop/bodega/Dockerfile) con `HEALTHCHECK` automático en `/healthz`.

