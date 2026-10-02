using System.Collections.Generic;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Fragama.Application.Common;
using Fragama.Application.DTOs;
using Fragama.Application.Services;
using Fragama.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Fragama.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ReportsController(IReportService reportService)
        {
            _reportService = reportService;
        }

        [HttpGet("inventory-valuation")]
        [Authorize(Roles = $"{RolesConstant.Administrador},{RolesConstant.Bodeguero}")]
        public async Task<IActionResult> GetInventoryValuation(CancellationToken cancellationToken)
        {
            var report = await _reportService.GetInventoryValuationReportAsync(cancellationToken);
            return Ok(ApiResponse<InventoryValuationReportDto>.Ok(report));
        }

        [HttpGet("driver-performance")]
        [Authorize(Roles = $"{RolesConstant.Administrador}")]
        public async Task<IActionResult> GetDriverPerformance(CancellationToken cancellationToken)
        {
            var report = await _reportService.GetDriverPerformanceReportAsync(cancellationToken);
            return Ok(ApiResponse<IReadOnlyList<DriverPerformanceReportDto>>.Ok(report));
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BulkImportController : ControllerBase
    {
        private readonly IBulkImportService _bulkImportService;

        public BulkImportController(IBulkImportService bulkImportService)
        {
            _bulkImportService = bulkImportService;
        }

        /// <summary>
        /// Recibe los datos de las filas del Excel para procesar inserción o aumento de inventario (Upsert)
        /// </summary>
        [HttpPost("products")]
        [Authorize(Roles = $"{RolesConstant.Administrador},{RolesConstant.Bodeguero}")]
        public async Task<IActionResult> ImportProducts([FromBody] List<BulkProductImportRowDto> rows, CancellationToken cancellationToken)
        {
            int currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _bulkImportService.ProcessBulkImportAsync(rows, currentUserId, cancellationToken);
            return Ok(ApiResponse<BulkImportResultDto>.Ok(result, "Carga masiva procesada exitosamente"));
        }
    }
}
