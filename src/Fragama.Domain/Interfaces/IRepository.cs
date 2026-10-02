using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using Fragama.Domain.Entities;
using Fragama.Domain.Enums;

namespace Fragama.Domain.Interfaces
{
    public interface IRepository<T> where T : class
    {
        Task<T?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<T>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<IReadOnlyList<T>> FindAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);
        Task<T> AddAsync(T entity, CancellationToken cancellationToken = default);
        Task UpdateAsync(T entity, CancellationToken cancellationToken = default);
        Task DeleteAsync(T entity, CancellationToken cancellationToken = default);
    }

    public interface IProductRepository : IRepository<Product>
    {
        Task<Product?> GetBySkuAsync(string sku, CancellationToken cancellationToken = default);
        Task<Product?> GetByBarcodeAsync(string barcode, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<Product>> GetLowStockProductsAsync(CancellationToken cancellationToken = default);
        Task<Product?> GetWithLockForStockUpdateAsync(int productId, CancellationToken cancellationToken = default);
    }

    public interface IInventoryRepository : IRepository<InventoryMovement>
    {
        Task<IReadOnlyList<InventoryMovement>> GetKardexByProductAsync(int productId, int limit = 50, CancellationToken cancellationToken = default);
        Task<string> GenerateNextMovementNumberAsync(MovementTypeEnum type);
    }

    public interface IDispatchRepository : IRepository<DispatchOrder>
    {
        Task<IReadOnlyList<DispatchOrder>> GetActiveDispatchesByDriverAsync(int driverId, CancellationToken cancellationToken = default);
        Task<DispatchOrder?> GetWithDetailsAsync(int dispatchId, CancellationToken cancellationToken = default);
    }

    public interface IUnitOfWork : IDisposable
    {
        IProductRepository Products { get; }
        IInventoryRepository Inventory { get; }
        IDispatchRepository Dispatches { get; }
        IRepository<Invoice> Invoices { get; }
        IRepository<User> Users { get; }
        IRepository<Role> Roles { get; }
        IRepository<RefreshToken> RefreshTokens { get; }
        IRepository<WarehouseLocation> Locations { get; }

        Task<int> CommitAsync(CancellationToken cancellationToken = default);
        Task BeginTransactionAsync(CancellationToken cancellationToken = default);
        Task CommitTransactionAsync(CancellationToken cancellationToken = default);
        Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
    }
}
