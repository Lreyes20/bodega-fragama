using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using Fragama.Domain.Entities;
using Fragama.Domain.Enums;
using Fragama.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace Fragama.Infrastructure.Data
{
    public class Repository<T> : IRepository<T> where T : class
    {
        protected readonly ApplicationDbContext _context;
        protected readonly DbSet<T> _dbSet;

        public Repository(ApplicationDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _dbSet = context.Set<T>();
        }

        public virtual async Task<T?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
            => await _dbSet.FindAsync(new object[] { id }, cancellationToken);

        public virtual async Task<IReadOnlyList<T>> GetAllAsync(CancellationToken cancellationToken = default)
            => await _dbSet.ToListAsync(cancellationToken);

        public virtual async Task<IReadOnlyList<T>> FindAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default)
            => await _dbSet.Where(predicate).ToListAsync(cancellationToken);

        public virtual async Task<T> AddAsync(T entity, CancellationToken cancellationToken = default)
        {
            await _dbSet.AddAsync(entity, cancellationToken);
            return entity;
        }

        public virtual Task UpdateAsync(T entity, CancellationToken cancellationToken = default)
        {
            _dbSet.Update(entity);
            return Task.CompletedTask;
        }

        public virtual Task DeleteAsync(T entity, CancellationToken cancellationToken = default)
        {
            _dbSet.Remove(entity);
            return Task.CompletedTask;
        }
    }

    public class ProductRepository : Repository<Product>, IProductRepository
    {
        public ProductRepository(ApplicationDbContext context) : base(context) { }

        public async Task<Product?> GetBySkuAsync(string sku, CancellationToken cancellationToken = default)
            => await _dbSet.Include(p => p.Category).Include(p => p.Location)
                           .FirstOrDefaultAsync(p => p.Sku == sku, cancellationToken);

        public async Task<Product?> GetByBarcodeAsync(string barcode, CancellationToken cancellationToken = default)
            => await _dbSet.Include(p => p.Category).Include(p => p.Location)
                           .FirstOrDefaultAsync(p => p.Barcode == barcode, cancellationToken);

        public async Task<IReadOnlyList<Product>> GetLowStockProductsAsync(CancellationToken cancellationToken = default)
            => await _dbSet.Include(p => p.Category)
                           .Where(p => p.IsActive && p.CurrentStock <= p.MinimumStock)
                           .ToListAsync(cancellationToken);

        public async Task<Product?> GetWithLockForStockUpdateAsync(int productId, CancellationToken cancellationToken = default)
        {
            // En SQL Server con Entity Framework se puede usar AsTracking() y query con bloqueo de fila
            return await _dbSet.FirstOrDefaultAsync(p => p.Id == productId, cancellationToken);
        }
    }

    public class InventoryRepository : Repository<InventoryMovement>, IInventoryRepository
    {
        public InventoryRepository(ApplicationDbContext context) : base(context) { }

        public async Task<IReadOnlyList<InventoryMovement>> GetKardexByProductAsync(int productId, int limit = 50, CancellationToken cancellationToken = default)
        {
            return await _dbSet.Include(m => m.User)
                               .Where(m => m.ProductId == productId)
                               .OrderByDescending(m => m.CreatedAt)
                               .Take(limit)
                               .ToListAsync(cancellationToken);
        }

        public async Task<string> GenerateNextMovementNumberAsync(MovementTypeEnum type)
        {
            string prefix = type switch
            {
                MovementTypeEnum.EntradaCompra => "ENT",
                MovementTypeEnum.SalidaVenta => "SAL",
                MovementTypeEnum.TrasladoInterno => "TRA",
                MovementTypeEnum.AjustePositivo => "AJP",
                MovementTypeEnum.AjusteNegativo => "AJN",
                MovementTypeEnum.DevolucionCliente => "DEV",
                _ => "MOV"
            };

            var today = DateTime.UtcNow.ToString("yyyyMMdd");
            int countToday = await _dbSet.CountAsync(m => m.CreatedAt.Date == DateTime.UtcNow.Date);
            return $"{prefix}-{today}-{(countToday + 1):D4}";
        }
    }

    public class DispatchRepository : Repository<DispatchOrder>, IDispatchRepository
    {
        public DispatchRepository(ApplicationDbContext context) : base(context) { }

        public async Task<IReadOnlyList<DispatchOrder>> GetActiveDispatchesByDriverAsync(int driverId, CancellationToken cancellationToken = default)
        {
            return await _dbSet.Include(d => d.Invoice).ThenInclude(i => i!.Customer)
                               .Include(d => d.Items).ThenInclude(i => i.Product)
                               .Where(d => d.DriverId == driverId && 
                                           (d.Status == DispatchStatus.Asignado || d.Status == DispatchStatus.EnRuta))
                               .OrderBy(d => d.DepartureTime)
                               .ToListAsync(cancellationToken);
        }

        public async Task<DispatchOrder?> GetWithDetailsAsync(int dispatchId, CancellationToken cancellationToken = default)
        {
            return await _dbSet.Include(d => d.Driver)
                               .Include(d => d.Invoice).ThenInclude(i => i!.Customer)
                               .Include(d => d.Items).ThenInclude(i => i.Product)
                               .FirstOrDefaultAsync(d => d.Id == dispatchId, cancellationToken);
        }
    }

    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _context;
        private IDbContextTransaction? _currentTransaction;

        public UnitOfWork(ApplicationDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            Products = new ProductRepository(_context);
            Inventory = new InventoryRepository(_context);
            Dispatches = new DispatchRepository(_context);
            Invoices = new Repository<Invoice>(_context);
            Users = new Repository<User>(_context);
            Roles = new Repository<Role>(_context);
            RefreshTokens = new Repository<RefreshToken>(_context);
            Locations = new Repository<WarehouseLocation>(_context);
        }

        public IProductRepository Products { get; }
        public IInventoryRepository Inventory { get; }
        IDispatchRepository IUnitOfWork.Dispatches => Dispatches;
        public DispatchRepository Dispatches { get; }
        public IRepository<Invoice> Invoices { get; }
        public IRepository<User> Users { get; }
        public IRepository<Role> Roles { get; }
        public IRepository<RefreshToken> RefreshTokens { get; }
        public IRepository<WarehouseLocation> Locations { get; }

        public async Task<int> CommitAsync(CancellationToken cancellationToken = default)
        {
            return await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
        {
            if (_currentTransaction == null)
            {
                _currentTransaction = await _context.Database.BeginTransactionAsync(cancellationToken);
            }
        }

        public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                await _context.SaveChangesAsync(cancellationToken);
                if (_currentTransaction != null)
                {
                    await _currentTransaction.CommitAsync(cancellationToken);
                }
            }
            catch
            {
                await RollbackTransactionAsync(cancellationToken);
                throw;
            }
            finally
            {
                if (_currentTransaction != null)
                {
                    await _currentTransaction.DisposeAsync();
                    _currentTransaction = null;
                }
            }
        }

        public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
        {
            if (_currentTransaction != null)
            {
                await _currentTransaction.RollbackAsync(cancellationToken);
                await _currentTransaction.DisposeAsync();
                _currentTransaction = null;
            }
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
