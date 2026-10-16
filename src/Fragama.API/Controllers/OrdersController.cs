using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Fragama.Application.Common;
using Fragama.Domain.Entities;
using Fragama.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Fragama.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public OrdersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? status, [FromQuery] string? search, CancellationToken cancellationToken)
        {
            var query = _context.SalesOrders
                .Include(o => o.Customer)
                .Include(o => o.Details)
                .ThenInclude(d => d.Product)
                .AsNoTracking();

            if (!string.IsNullOrWhiteSpace(status) && status != "ALL")
            {
                query = query.Where(o => o.Status == status);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.Trim().ToLower();
                query = query.Where(o => o.OrderNumber.ToLower().Contains(s) ||
                                         (o.CustomerName != null && o.CustomerName.ToLower().Contains(s)) ||
                                         (o.Customer != null && o.Customer.BusinessName.ToLower().Contains(s)));
            }

            var orders = await query.OrderByDescending(o => o.CreatedAt).ToListAsync(cancellationToken);

            var result = orders.Select(o => new
            {
                id = o.Id,
                order_number = o.OrderNumber,
                customer_id = o.CustomerId,
                customer_name = !string.IsNullOrWhiteSpace(o.CustomerName) ? o.CustomerName : (o.Customer?.BusinessName ?? "Cliente"),
                customer_tax_id = o.CustomerTaxId ?? o.Customer?.TaxId ?? "",
                customer_phone = o.CustomerPhone ?? o.Customer?.Phone ?? "",
                customer_address = o.CustomerAddress ?? o.Customer?.Address ?? "",
                payment_terms = o.PaymentTerms ?? "Contado",
                payment_method = o.PaymentMethod ?? "Efectivo",
                subtotal = o.SubTotal,
                discount_amount = o.DiscountAmount,
                tax_amount = o.TaxAmount,
                total_amount = o.TotalAmount,
                status = o.Status,
                delivery_notes = o.DeliveryNotes,
                created_at = o.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss"),
                items = o.Details.Select(d => new
                {
                    product_id = d.ProductId,
                    product_name = d.Product?.Name ?? "Producto",
                    quantity = d.Quantity,
                    unit_price = d.UnitPrice,
                    tax_rate = d.TaxRate,
                    total = d.TotalLine
                }).ToList()
            });

            return Ok(result);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
        {
            var order = await _context.SalesOrders
                .Include(o => o.Customer)
                .Include(o => o.Details)
                .ThenInclude(d => d.Product)
                .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);

            if (order == null)
            {
                return NotFound(ApiResponse<string>.Fail("Pedido no encontrado."));
            }

            return Ok(new
            {
                id = order.Id,
                order_number = order.OrderNumber,
                customer_id = order.CustomerId,
                customer_name = !string.IsNullOrWhiteSpace(order.CustomerName) ? order.CustomerName : (order.Customer?.BusinessName ?? "Cliente"),
                customer_tax_id = order.CustomerTaxId ?? order.Customer?.TaxId ?? "",
                payment_terms = order.PaymentTerms ?? "Contado",
                payment_method = order.PaymentMethod ?? "Efectivo",
                subtotal = order.SubTotal,
                tax_amount = order.TaxAmount,
                total_amount = order.TotalAmount,
                status = order.Status,
                delivery_notes = order.DeliveryNotes,
                created_at = order.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss")
            });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateOrderInputDto input, CancellationToken cancellationToken)
        {
            if (input == null || input.Items == null || !input.Items.Any())
            {
                return BadRequest(ApiResponse<string>.Fail("El pedido debe contener al menos una línea de producto."));
            }

            // Customer lookup or default
            int customerId = input.CustomerId > 0 ? input.CustomerId : 1;
            var customer = await _context.Customers.FindAsync(new object[] { customerId }, cancellationToken);

            string customerName = !string.IsNullOrWhiteSpace(input.CustomerName)
                ? input.CustomerName.Trim()
                : (customer?.BusinessName ?? "Cliente Mostrador");

            var order = new SalesOrder
            {
                OrderNumber = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{new Random().Next(1000, 9999)}",
                CustomerId = customerId,
                CustomerName = customerName,
                CustomerTaxId = input.CustomerTaxId ?? customer?.TaxId,
                CustomerPhone = input.CustomerPhone ?? customer?.Phone,
                CustomerAddress = input.CustomerAddress ?? customer?.Address,
                PaymentTerms = input.PaymentTerms ?? "Contado",
                PaymentMethod = input.PaymentMethod ?? "Efectivo",
                DeliveryNotes = input.Notes,
                Status = "PENDIENTE",
                UserId = 1,
                CreatedAt = DateTime.UtcNow
            };

            decimal subtotal = 0;
            decimal taxes = 0;

            foreach (var itm in input.Items)
            {
                var product = await _context.Products.FindAsync(new object[] { itm.ProductId }, cancellationToken);
                decimal price = itm.UnitPrice > 0 ? itm.UnitPrice : (product?.UnitPrice ?? 0m);
                decimal taxRate = product?.TaxRate ?? 13m;
                decimal lineTotal = itm.Quantity * price;
                decimal lineTax = lineTotal * (taxRate / 100m);

                subtotal += lineTotal;
                taxes += lineTax;

                order.Details.Add(new SalesOrderDetail
                {
                    ProductId = itm.ProductId,
                    Quantity = itm.Quantity,
                    UnitPrice = price,
                    TaxRate = taxRate,
                    CreatedAt = DateTime.UtcNow
                });
            }

            order.SubTotal = subtotal;
            order.TaxAmount = taxes;
            order.TotalAmount = subtotal + taxes;

            _context.SalesOrders.Add(order);
            await _context.SaveChangesAsync(cancellationToken);

            return CreatedAtAction(nameof(GetById), new { id = order.Id }, new
            {
                id = order.Id,
                order_number = order.OrderNumber,
                status = order.Status,
                customer_name = order.CustomerName,
                total = order.TotalAmount,
                message = "Pedido creado y registrado exitosamente en la base de datos."
            });
        }

        [HttpPost("{id:int}/status")]
        [HttpPatch("{id:int}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateOrderStatusInputDto input, CancellationToken cancellationToken)
        {
            var order = await _context.SalesOrders.FindAsync(new object[] { id }, cancellationToken);
            if (order == null)
            {
                return NotFound(ApiResponse<string>.Fail($"Pedido ID {id} no encontrado."));
            }

            order.Status = input.Status.ToUpper();
            if (!string.IsNullOrWhiteSpace(input.Notes))
            {
                order.DeliveryNotes = input.Notes;
            }

            if (order.Status == "ENTREGADO")
            {
                order.DeliveryDate = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync(cancellationToken);

            return Ok(new
            {
                id = order.Id,
                order_number = order.OrderNumber,
                status = order.Status,
                message = $"Estado de pedido actualizado a '{order.Status}' con éxito."
            });
        }
    }

    public class CreateOrderInputDto
    {
        public int CustomerId { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerTaxId { get; set; }
        public string? CustomerPhone { get; set; }
        public string? CustomerAddress { get; set; }
        public string? PaymentTerms { get; set; }
        public string? PaymentMethod { get; set; }
        public string? Notes { get; set; }
        public List<CreateOrderItemInputDto> Items { get; set; } = new();
    }

    public class CreateOrderItemInputDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }

    public class UpdateOrderStatusInputDto
    {
        public string Status { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }
}
