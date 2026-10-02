using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Fragama.Application.DTOs;

namespace Fragama.Application.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponseDto> LoginAsync(LoginRequestDto request, string ipAddress, CancellationToken cancellationToken = default);
        Task<LoginResponseDto> RefreshTokenAsync(string refreshToken, string ipAddress, CancellationToken cancellationToken = default);
        Task RevokeTokenAsync(string refreshToken, string ipAddress, CancellationToken cancellationToken = default);
    }

    public interface IInventoryService
    {
        /// <summary>
        /// Procesa un movimiento atómico de inventario con TransactionScope o UnitOfWork,
        /// validando que no ocurra stock negativo y actualizando el Kardex de forma inmutable.
        /// </summary>
        Task<KardexEntryDto> RegisterMovementAsync(StockMovementRequestDto request, int userId, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<KardexEntryDto>> GetKardexAsync(int productId, int limit = 50, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<ProductDto>> GetLowStockAlertsAsync(CancellationToken cancellationToken = default);
    }

    public interface IProductService
    {
        Task<IReadOnlyList<ProductDto>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<ProductDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<ProductDto?> GetByBarcodeAsync(string barcode, CancellationToken cancellationToken = default);
        Task<ProductDto> CreateAsync(CreateProductDto dto, int userId, CancellationToken cancellationToken = default);
        Task<BarcodePrintDto> GenerateBarcodeForProductAsync(int productId, CancellationToken cancellationToken = default);
    }

    public interface IDispatchService
    {
        Task<IReadOnlyList<DispatchOrderDto>> GetDriverRouteAsync(int driverId, CancellationToken cancellationToken = default);
        Task<DispatchOrderDto> UpdateDeliveryStatusAsync(int dispatchId, UpdateDispatchStatusDto dto, int driverId, CancellationToken cancellationToken = default);
        Task<DispatchOrderDto> VerifyCargoBeforeDepartureAsync(int dispatchId, int driverId, CancellationToken cancellationToken = default);
    }

    public interface ICurrentUserService
    {
        int? UserId { get; }
        string? Email { get; }
        string? Role { get; }
    }
}
