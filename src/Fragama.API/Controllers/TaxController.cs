using System.Threading;
using System.Threading.Tasks;
using Fragama.Application.DTOs;
using Fragama.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Fragama.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TaxController : ControllerBase
    {
        private readonly ITaxService _taxService;

        public TaxController(ITaxService taxService)
        {
            _taxService = taxService;
        }

        [HttpGet("d104-summary")]
        public async Task<IActionResult> GetD104Summary(CancellationToken cancellationToken)
        {
            var summary = await _taxService.GetD104SummaryAsync(cancellationToken);
            return Ok(summary);
        }

        [HttpGet("electronic-invoice/{orderId:int}")]
        public async Task<IActionResult> GetElectronicInvoice(int orderId, CancellationToken cancellationToken)
        {
            var invoice = await _taxService.GenerateElectronicInvoiceAsync(orderId, cancellationToken);
            return Ok(invoice);
        }

        [HttpPost("custom-electronic-invoice")]
        public async Task<IActionResult> GenerateCustomElectronicInvoice([FromBody] CustomElectronicInvoiceRequestDto request, CancellationToken cancellationToken)
        {
            var invoice = await _taxService.GenerateCustomElectronicInvoiceAsync(request, cancellationToken);
            return Ok(invoice);
        }

        [HttpGet("export-d104-csv")]
        public async Task<IActionResult> ExportD104Csv(CancellationToken cancellationToken)
        {
            var bytes = await _taxService.ExportD104CsvAsync(cancellationToken);
            return File(bytes, "text/csv", "declaracion_iva_d104_fragama.csv");
        }
    }
}
