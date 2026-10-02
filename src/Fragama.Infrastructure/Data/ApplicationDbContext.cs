using System;
using Fragama.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Fragama.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<Role> Roles => Set<Role>();
        public DbSet<User> Users => Set<User>();
        public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
        public DbSet<ProductFamily> Families => Set<ProductFamily>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<WarehouseLocation> Locations => Set<WarehouseLocation>();
        public DbSet<Product> Products => Set<Product>();
        public DbSet<InventoryMovement> InventoryMovements => Set<InventoryMovement>();
        public DbSet<Customer> Customers => Set<Customer>();
        public DbSet<Invoice> Invoices => Set<Invoice>();
        public DbSet<InvoiceDetail> InvoiceDetails => Set<InvoiceDetail>();
        public DbSet<DispatchOrder> DispatchOrders => Set<DispatchOrder>();
        public DbSet<DispatchItem> DispatchItems => Set<DispatchItem>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ProductFamily configuration
            modelBuilder.Entity<ProductFamily>(entity =>
            {
                entity.ToTable("ProductFamilies");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("FamilyId");
                entity.HasIndex(e => e.Code).IsUnique();

                entity.HasMany(f => f.Subcategories)
                    .WithOne(c => c.Family)
                    .HasForeignKey(c => c.FamilyId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Category configuration
            modelBuilder.Entity<Category>(entity =>
            {
                entity.ToTable("Categories");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("CategoryId");
                entity.HasIndex(e => e.Code).IsUnique();
            });

            // Product entity configuration
            modelBuilder.Entity<Product>(entity =>
            {
                entity.ToTable("Products");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("ProductId");
                entity.HasIndex(e => e.Sku).IsUnique();
                entity.HasIndex(e => e.Barcode).IsUnique();
                entity.Property(e => e.CostPrice).HasPrecision(18, 2);
                entity.Property(e => e.SalePrice).HasPrecision(18, 2);
                entity.Property(e => e.WeightKg).HasPrecision(8, 2);
                entity.Property(e => e.VolumeM3).HasPrecision(8, 4);
                entity.Property(e => e.RowVersion).IsRowVersion();

                entity.HasOne(e => e.Category)
                    .WithMany(c => c.Products)
                    .HasForeignKey(e => e.CategoryId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Location)
                    .WithMany()
                    .HasForeignKey(e => e.LocationId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // InventoryMovement entity configuration
            modelBuilder.Entity<InventoryMovement>(entity =>
            {
                entity.ToTable("InventoryMovements");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("MovementId");
                entity.Property(e => e.UnitCost).HasPrecision(18, 2);
                entity.HasIndex(e => e.MovementNumber).IsUnique();
                entity.HasIndex(e => new { e.ProductId, e.CreatedAt });

                entity.HasOne(e => e.Product)
                    .WithMany()
                    .HasForeignKey(e => e.ProductId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // DispatchOrder entity configuration
            modelBuilder.Entity<DispatchOrder>(entity =>
            {
                entity.ToTable("DispatchOrders");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("DispatchOrderId");
                entity.HasIndex(e => e.DispatchCode).IsUnique();
                entity.Property(e => e.RowVersion).IsRowVersion();

                entity.HasOne(e => e.Driver)
                    .WithMany(u => u.AssignedDispatches)
                    .HasForeignKey(e => e.DriverId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Invoice)
                    .WithMany()
                    .HasForeignKey(e => e.InvoiceId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasMany(e => e.Items)
                    .WithOne(i => i.DispatchOrder)
                    .HasForeignKey(i => i.DispatchOrderId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Invoice entity configuration
            modelBuilder.Entity<Invoice>(entity =>
            {
                entity.ToTable("Invoices");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("InvoiceId");
                entity.Property(e => e.SubTotal).HasPrecision(18, 2);
                entity.Property(e => e.TaxAmount).HasPrecision(18, 2);
                entity.Property(e => e.DiscountAmount).HasPrecision(18, 2);
                entity.Property(e => e.TotalAmount).HasPrecision(18, 2);
            });

            modelBuilder.Entity<InvoiceDetail>(entity =>
            {
                entity.ToTable("InvoiceDetails");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("DetailId");
                entity.Property(e => e.UnitPrice).HasPrecision(18, 2);
            });
        }
    }
}
