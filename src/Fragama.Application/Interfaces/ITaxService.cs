using System.Threading;
using System.Threading.Tasks;
using Fragama.Application.DTOs;

namespace Fragama.Application.Interfaces
{
    public interface ITaxService
    {
        Task<D104TaxSummaryResponseDto> GetD104SummaryAsync(CancellationToken cancellationToken = default);
        Task<ElectronicInvoiceResponseDto> GenerateElectronicInvoiceAsync(int invoiceId, CancellationToken cancellationToken = default);
        Task<ElectronicInvoiceResponseDto> GenerateCustomElectronicInvoiceAsync(CustomElectronicInvoiceRequestDto request, CancellationToken cancellationToken = default);
        Task<byte[]> ExportD104CsvAsync(CancellationToken cancellationToken = default);
    }
}
