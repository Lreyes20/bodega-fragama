"""
Test Suite de Producción WMS - Distribuidora Fragama S.A.
Cartago, Costa Rica
Arquitectura de Alta Disponibilidad & Ciberseguridad

Verifica el 100% de los flujos críticos de Bodega (WMS), Kardex ACID, FEFO,
Recepción de Mercancía, Conteos Físicos, Proveedores, Clientes y Seguridad.
"""

import os
import sys
import json
import time
import pytest
from datetime import datetime, date
from starlette.testclient import TestClient

import server

@pytest.fixture(scope="module")
def client():
    server.init_database_schema()
    return TestClient(server.app)

class TestWmsSystemHealth:
    def test_healthz_endpoint(self, client):
        res = client.get("/healthz")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "ok"
        assert data["service"] == "fragama-wms"

    def test_api_health_endpoint(self, client):
        res = client.get("/api/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "healthy"
        assert "databases" in data
        assert data["databases"]["sqlite_relational"] == "ONLINE"

class TestProductCatalogWms:
    def test_get_all_products_with_wms_attributes(self, client):
        res = client.get("/api/products")
        assert res.status_code == 200
        prods = res.json()
        assert len(prods) >= 200
        sample = prods[0]
        # Validar campos WMS enterprise
        assert "sku" in sample
        assert "barcode" in sample
        assert "batchNumber" in sample
        assert "expiryDate" in sample
        assert "hazardClass" in sample
        assert "warehouseZone" in sample
        assert "warehouseLocation" in sample
        assert "hasLowStockAlert" in sample
        assert "isExpiringSoon" in sample

    def test_get_product_detail_with_kardex(self, client):
        res = client.get("/api/products/101")
        assert res.status_code == 200
        p = res.json()
        assert p["id"] == 101
        assert "movements" in p
        assert isinstance(p["movements"], list)

    def test_barcode_lookup_scanner(self, client):
        res = client.get("/api/products/barcode/7441001001011")
        assert res.status_code == 200
        p = res.json()
        assert p["sku"] == "BAN-BAG-099"
        assert p["name"] == "Bandeja 9x9 con o sin división Bagazo de Caña"

    def test_barcode_lookup_not_found(self, client):
        res = client.get("/api/products/barcode/9999999999999")
        assert res.status_code == 404

class TestKardexAndStockOperations:
    def test_positive_inventory_adjustment(self, client):
        # Ajuste positivo
        res = client.post("/api/inventory/adjust", json={
            "productId": 101,
            "movementType": "AJUSTE_POSITIVO",
            "quantity": 10,
            "notes": "Ingreso por ajuste físico",
            "referenceDocument": "AUD-POS-001"
        })
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert data["difference"] == 10
        assert data["finalStock"] > data["previousStock"]
        assert data["movementNumber"].startswith("ENT-")

    def test_negative_stock_prevention(self, client):
        # Intentar sacar más stock del existente debe ser rechazado
        res = client.post("/api/inventory/adjust", json={
            "productId": 101,
            "movementType": "AJUSTE_NEGATIVO",
            "quantity": 999999,
            "notes": "Intento de sobregiro de inventario"
        })
        assert res.status_code == 400
        assert "Stock insuficiente" in res.json()["detail"]

    def test_inbound_goods_receipt(self, client):
        doc_num = f"FAC-GOY-{int(time.time()) % 100000}"
        res = client.post("/api/inventory/receive", json={
            "supplierId": 1,
            "supplierName": "Químicos Industriales Goyca S.A.",
            "documentNumber": doc_num,
            "items": [
                {
                    "productId": 104,
                    "quantity": 40,
                    "unitCost": 65.0,
                    "batchNumber": "LOT-GOY-2026-N",
                    "expiryDate": "2028-12-31",
                    "warehouseLocation": "PAS-PAP-01/EST-01/N-1/P-01"
                }
            ],
            "notes": "Descarga de tarima en muelle 1"
        })
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert data["itemsReceivedCount"] == 1
        assert data["documentNumber"] == doc_num

    def test_cycle_count_audit_reconciliation(self, client):
        res = client.post("/api/inventory/cycle-count", json={
            "auditorName": "Lic. Auditoria Fragama",
            "counts": [
                {
                    "productId": 105,
                    "physicalStock": 200,
                    "notes": "Conteo físico en rack verificado"
                }
            ],
            "notes": "Auditoría mensual de cierre"
        })
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert data["auditCode"].startswith("AUD-")
        assert data["totalItemsAudited"] == 1

class TestWmsAlertsAndLocations:
    def test_inventory_alerts(self, client):
        res = client.get("/api/inventory/alerts")
        assert res.status_code == 200
        alerts = res.json()
        assert "summary" in alerts
        assert "lowStockAlerts" in alerts
        assert "expiringSoonAlerts" in alerts
        assert "expiredAlerts" in alerts
        assert alerts["summary"]["totalSkus"] >= 200

    def test_warehouse_locations(self, client):
        res = client.get("/api/inventory/locations")
        assert res.status_code == 200
        locs = res.json()
        assert len(locs) >= 4
        # Verificar zonas macro de Cartago
        zones = [l["zone"] for l in locs]
        assert any("QUIMICOS" in z for z in zones)
        assert any("PAPEL" in z for z in zones)

class TestSuppliersManagement:
    def test_get_suppliers(self, client):
        res = client.get("/api/suppliers")
        assert res.status_code == 200
        supps = res.json()
        assert len(supps) >= 3

    def test_create_and_update_supplier(self, client):
        tax = f"3-102-{int(time.time()) % 1000000:06d}"
        res = client.post("/api/suppliers", json={
            "taxId": tax,
            "name": "Distribuciones Químicas del Este",
            "category": "Químicos y Desinfectantes",
            "contact": "Lic. Marco Antonio",
            "phone": "2552-0000",
            "whatsapp": "8552-0000",
            "email": "ventas@quimicaseste.cr",
            "city": "Cartago",
            "address": "Zona Industrial de Cartago"
        })
        assert res.status_code == 200
        supp_id = res.json()["supplierId"]

        # Actualizar
        put_res = client.put(f"/api/suppliers/{supp_id}", json={
            "terms": "Crédito 45 días"
        })
        assert put_res.status_code == 200
        assert put_res.json()["success"] is True

class TestCustomersManagement:
    def test_get_customers(self, client):
        res = client.get("/api/customers")
        assert res.status_code == 200
        custs = res.json()
        assert len(custs) >= 4

    def test_create_and_update_customer(self, client):
        tax = f"3-101-{int(time.time()) % 1000000:06d}"
        res = client.post("/api/customers", json={
            "taxId": tax,
            "name": "Restaurante La Casona de Cartago",
            "phone": "2551-7788",
            "email": "lacasona@cartago.cr",
            "route": "Cartago Centro",
            "address": "Frente a Ruinas de Cartago"
        })
        assert res.status_code == 200
        cust_id = res.json()["customerId"]

        # Actualizar
        put_res = client.put(f"/api/customers/{cust_id}", json={
            "terms": "Crédito 30 días"
        })
        assert put_res.status_code == 200
        assert put_res.json()["success"] is True

class TestSecurityAndSanitization:
    def test_xss_sanitization(self):
        dirty = "<script>alert('xss')</script><b>Nombre Seguro</b>"
        clean = server.sanitize_text(dirty)
        assert "<script>" not in clean
        assert "Nombre Seguro" in clean

    def test_rate_limiter(self):
        ip = "192.168.100.99"
        # Reset bucket
        server.RATE_LIMIT_BUCKETS[f"{ip}:api"] = []
        for _ in range(server.RATE_LIMIT_MAX_API_PER_MIN):
            assert server.check_rate_limit(ip, is_order=False) is True
        # El siguiente debe ser bloqueado
        assert server.check_rate_limit(ip, is_order=False) is False

class TestErpAdvancedWms:
    def test_financial_valuation(self, client):
        res = client.get("/api/inventory/valuation")
        assert res.status_code == 200
        data = res.json()
        assert "summary" in data
        assert data["summary"]["totalPhysicalUnits"] > 0
        assert data["summary"]["totalCostValuation"] > 0
        assert data["summary"]["totalSaleValuation"] >= data["summary"]["totalCostValuation"]
        assert len(data["breakdownByWarehouseZone"]) >= 3

    def test_reorder_suggestions_engine(self, client):
        res = client.get("/api/inventory/reorder-suggestions")
        assert res.status_code == 200
        data = res.json()
        assert "suggestions" in data
        assert "totalEstimatedBudget" in data

    def test_fefo_picking_recommendations(self, client):
        res = client.get("/api/inventory/fefo-recommendations")
        assert res.status_code == 200
        data = res.json()
        assert "recommendations" in data
        assert len(data["recommendations"]) > 0
        assert "fefoStatus" in data["recommendations"][0]

    def test_kardex_csv_export(self, client):
        res = client.get("/api/inventory/export")
        assert res.status_code == 200
        assert "text/csv" in res.headers["content-type"]
        assert "Numero_Movimiento" in res.text

class TestHaciendaTaxCostaRica:
    def test_d104_tax_summary(self, client):
        res = client.get("/api/tax/d104-summary")
        assert res.status_code == 200
        data = res.json()
        assert "empresa" in data
        assert data["empresa"]["cedulaJuridica"] == "3-101-778899"
        assert data["empresa"]["actividadEconomica"] == "466901"
        assert "resumenOperaciones" in data
        assert "casillasFormularioD104" in data
        assert data["casillasFormularioD104"]["casilla01"]["codigo"] == "01"
        assert data["casillasFormularioD104"]["casilla13"]["codigo"] == "13"
        assert data["casillasFormularioD104"]["casilla45"]["codigo"] == "45"
        assert len(data["cabysCatalogBreakdown"]) >= 5

    def test_electronic_invoice_xml_generation(self, client):
        res = client.get("/api/tax/electronic-invoice/0")
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert len(data["clave"]) == 50
        assert data["clave"].startswith("506")
        assert len(data["consecutivo"]) == 20
        assert "<FacturaElectronica" in data["xml"]
        assert "<Clave>" in data["xml"]
        assert "<CodigoActividad>466901</CodigoActividad>" in data["xml"]

    def test_d104_csv_export(self, client):
        res = client.get("/api/tax/export-d104-csv")
        assert res.status_code == 200
        assert "text/csv" in res.headers["content-type"]
        assert "CASILLAS OFICIALES FORMULARIO D-104" in res.text

    def test_products_have_cabys_code(self, client):
        res = client.get("/api/products")
        assert res.status_code == 200
        prods = res.json()
        assert len(prods) > 0
        p = prods[0]
        assert "cabysCode" in p
        assert len(p["cabysCode"]) == 13
        assert p["taxRate"] == 13.0


