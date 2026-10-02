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

## 4. Despliegue en Visual Studio 2022

El repositorio cuenta con la solución estándar completa [`Fragama.sln`](file:///Users/leonardoreyes/Desktop/bodega/Fragama.sln) configurada para Visual Studio:

1. **Abrir la Solución**:
   - Haga doble clic en [`Fragama.sln`](file:///Users/leonardoreyes/Desktop/bodega/Fragama.sln) o abra Visual Studio y elija *Archivo -> Abrir -> Proyecto o Solución*.
2. **Proyectos Integrados**:
   - `Fragama.Domain`: Entidades, interfaces y enums de dominio.
   - `Fragama.Application`: Servicios de Kardex, importación masiva y validaciones ACID.
   - `Fragama.Infrastructure`: Entity Framework Core, DbContext y repositorios.
   - `Fragama.API`: Web API ASP.NET Core con Swagger y soporte para servir la SPA/Frontend desde `wwwroot`.
3. **Ejecutar con F5**:
   - El proyecto de inicio está configurado como `Fragama.API`. Al presionar **F5** o **Ctrl + F5**, Visual Studio levantará la API y el explorador abrirá automáticamente Swagger en `/swagger` y la interfaz web en `/`.

---

## 5. Acceso al Servidor en Vivo

El sistema interactivo está corriendo en:
```
http://localhost:8080
```
*(O abriendo directamente [`frontend/index.html`](file:///Users/leonardoreyes/Desktop/bodega/frontend/index.html) en su navegador)*.
