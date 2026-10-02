using System;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Fragama.Application.Common;
using Fragama.Application.DTOs;
using Fragama.Application.Interfaces;
using Fragama.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Fragama.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request, CancellationToken cancellationToken)
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "0.0.0.0";
            var result = await _authService.LoginAsync(request, ipAddress, cancellationToken);
            return Ok(ApiResponse<LoginResponseDto>.Ok(result, "Autenticación exitosa en Sistema Fragama"));
        }

        [HttpPost("refresh-token")]
        [AllowAnonymous]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequestDto request, CancellationToken cancellationToken)
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "0.0.0.0";
            var result = await _authService.RefreshTokenAsync(request.RefreshToken, ipAddress, cancellationToken);
            return Ok(ApiResponse<LoginResponseDto>.Ok(result, "Token renovado exitosamente"));
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class InventoryController : ControllerBase
    {
        private readonly IInventoryService _inventoryService;

        public InventoryController(IInventoryService inventoryService)
        {
            _inventoryService = inventoryService;
        }

        /// <summary>
        /// Registra un movimiento atómico de inventario (Entrada, Salida, Traslado).
        /// Restringido a roles con permisos de bodega: Administrador y Bodeguero.
        /// </summary>
        [HttpPost("movements")]
        [Authorize(Roles = $"{RolesConstant.Administrador},{RolesConstant.Bodeguero}")]
        public async Task<IActionResult> RegisterMovement([FromBody] StockMovementRequestDto request, CancellationToken cancellationToken)
        {
            int currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _inventoryService.RegisterMovementAsync(request, currentUserId, cancellationToken);
            return Ok(ApiResponse<KardexEntryDto>.Ok(result, "Movimiento de inventario procesado y asentado en Kardex con éxito"));
        }

        /// <summary>
        /// Consulta el Kardex histórico de un producto en orden cronológico inverso.
        /// </summary>
        [HttpGet("kardex/{productId:int}")]
        [Authorize(Roles = $"{RolesConstant.Administrador},{RolesConstant.Bodeguero},{RolesConstant.Cajero}")]
        public async Task<IActionResult> GetKardex(int productId, [FromQuery] int limit = 50, CancellationToken cancellationToken = default)
        {
            var kardex = await _inventoryService.GetKardexAsync(productId, limit, cancellationToken);
            return Ok(ApiResponse<IReadOnlyList<KardexEntryDto>>.Ok(kardex));
        }

        /// <summary>
        /// Retorna las alertas de productos con stock en o por debajo del umbral mínimo.
        /// </summary>
        [HttpGet("alerts/low-stock")]
        public async Task<IActionResult> GetLowStockAlerts(CancellationToken cancellationToken)
        {
            var alerts = await _inventoryService.GetLowStockAlertsAsync(cancellationToken);
            return Ok(ApiResponse<IReadOnlyList<ProductDto>>.Ok(alerts));
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductsController(IProductService productService)
        {
            _productService = productService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var products = await _productService.GetAllAsync(cancellationToken);
            return Ok(ApiResponse<IReadOnlyList<ProductDto>>.Ok(products));
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
        {
            var product = await _productService.GetByIdAsync(id, cancellationToken);
            if (product == null) return NotFound(ApiResponse<string>.Fail("Producto no encontrado"));
            return Ok(ApiResponse<ProductDto>.Ok(product));
        }

        [HttpGet("barcode/{barcode}")]
        public async Task<IActionResult> GetByBarcode(string barcode, CancellationToken cancellationToken)
        {
            var product = await _productService.GetByBarcodeAsync(barcode, cancellationToken);
            if (product == null) return NotFound(ApiResponse<string>.Fail("Código de barras no encontrado"));
            return Ok(ApiResponse<ProductDto>.Ok(product));
        }

        [HttpPost]
        [Authorize(Roles = $"{RolesConstant.Administrador},{RolesConstant.Bodeguero}")]
        public async Task<IActionResult> Create([FromBody] CreateProductDto dto, CancellationToken cancellationToken)
        {
            int currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var created = await _productService.CreateAsync(dto, currentUserId, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, ApiResponse<ProductDto>.Ok(created, "Producto creado exitosamente"));
        }

        [HttpGet("{id:int}/barcode-label")]
        public async Task<IActionResult> GetBarcodeLabel(int id, CancellationToken cancellationToken)
        {
            var label = await _productService.GenerateBarcodeForProductAsync(id, cancellationToken);
            return Ok(ApiResponse<BarcodePrintDto>.Ok(label));
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DispatchesController : ControllerBase
    {
        private readonly IDispatchService _dispatchService;

        public DispatchesController(IDispatchService dispatchService)
        {
            _dispatchService = dispatchService;
        }

        /// <summary>
        /// Consulta la ruta activa y despachos asignados para el chofer conectado en su vista móvil.
        /// </summary>
        [HttpGet("my-route")]
        [Authorize(Roles = $"{RolesConstant.Chofer},{RolesConstant.Administrador}")]
        public async Task<IActionResult> GetMyRoute(CancellationToken cancellationToken)
        {
            int driverId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var route = await _dispatchService.GetDriverRouteAsync(driverId, cancellationToken);
            return Ok(ApiResponse<IReadOnlyList<DispatchOrderDto>>.Ok(route));
        }

        /// <summary>
        /// El chofer valida físicamente la carga subida a su unidad antes de iniciar la ruta.
        /// </summary>
        [HttpPost("{dispatchId:int}/verify-cargo")]
        [Authorize(Roles = $"{RolesConstant.Chofer},{RolesConstant.Bodeguero},{RolesConstant.Administrador}")]
        public async Task<IActionResult> VerifyCargo(int dispatchId, CancellationToken cancellationToken)
        {
            int driverId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var updated = await _dispatchService.VerifyCargoBeforeDepartureAsync(dispatchId, driverId, cancellationToken);
            return Ok(ApiResponse<DispatchOrderDto>.Ok(updated, "Carga verificada por el conductor. Unidad lista para ruta."));
        }

        /// <summary>
        /// Actualiza el estado de entrega en el punto de destino (Entregado, Rechazado, Con Observaciones).
        /// </summary>
        [HttpPatch("{dispatchId:int}/status")]
        [Authorize(Roles = $"{RolesConstant.Chofer},{RolesConstant.Administrador}")]
        public async Task<IActionResult> UpdateStatus(
            int dispatchId, 
            [FromBody] UpdateDispatchStatusDto dto, 
            CancellationToken cancellationToken)
        {
            int driverId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var updated = await _dispatchService.UpdateDeliveryStatusAsync(dispatchId, dto, driverId, cancellationToken);
            return Ok(ApiResponse<DispatchOrderDto>.Ok(updated, $"Estado de entrega actualizado a '{dto.NewStatus}'."));
        }
    }
}
