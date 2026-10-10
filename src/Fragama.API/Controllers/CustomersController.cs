using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Fragama.Application.Common;
using Fragama.Application.DTOs;
using Fragama.Domain.Entities;
using Fragama.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Fragama.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CustomersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CustomersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? search, [FromQuery] string? canton, [FromQuery] string? terms, CancellationToken cancellationToken)
        {
            var query = _context.Customers.AsNoTracking().Where(c => c.IsActive);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.Trim().ToLower();
                query = query.Where(c => c.BusinessName.ToLower().Contains(s) ||
                                         c.TaxId.ToLower().Contains(s) ||
                                         (c.TradeName != null && c.TradeName.ToLower().Contains(s)) ||
                                         (c.Phone != null && c.Phone.Contains(s)) ||
                                         (c.Email != null && c.Email.ToLower().Contains(s)));
            }

            if (!string.IsNullOrWhiteSpace(canton) && canton != "ALL")
            {
                query = query.Where(c => c.Canton == canton);
            }

            if (!string.IsNullOrWhiteSpace(terms) && terms != "ALL")
            {
                query = query.Where(c => c.PaymentTerms.Contains(terms));
            }

            var list = await query.OrderBy(c => c.Id).ToListAsync(cancellationToken);
            var dtos = list.Select(c => new CustomerDto
            {
                Id = c.Id,
                TaxId = c.TaxId,
                DocType = c.DocType,
                Name = c.BusinessName,
                TradeName = c.TradeName,
                Email = c.Email,
                Phone = c.Phone,
                Address = c.Address,
                Province = c.Province,
                Canton = c.Canton,
                District = c.District,
                Terms = c.PaymentTerms,
                PaymentMethodDefault = c.PaymentMethodDefault,
                EconomicActivity = c.EconomicActivity,
                IsActive = c.IsActive
            }).ToList();

            return Ok(dtos);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
        {
            var c = await _context.Customers.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
            if (c == null) return NotFound(ApiResponse<string>.Fail("Cliente no encontrado"));

            var dto = new CustomerDto
            {
                Id = c.Id,
                TaxId = c.TaxId,
                DocType = c.DocType,
                Name = c.BusinessName,
                TradeName = c.TradeName,
                Email = c.Email,
                Phone = c.Phone,
                Address = c.Address,
                Province = c.Province,
                Canton = c.Canton,
                District = c.District,
                Terms = c.PaymentTerms,
                PaymentMethodDefault = c.PaymentMethodDefault,
                EconomicActivity = c.EconomicActivity,
                IsActive = c.IsActive
            };
            return Ok(dto);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCustomerDto dto, CancellationToken cancellationToken)
        {
            var customer = new Customer
            {
                TaxId = dto.TaxId.Trim(),
                DocType = dto.DocType ?? "02",
                BusinessName = dto.Name.Trim(),
                TradeName = dto.TradeName?.Trim(),
                Email = dto.Email?.Trim(),
                Phone = dto.Phone?.Trim(),
                Address = dto.Address ?? "Cartago Centro",
                Province = dto.Province ?? "Cartago",
                Canton = dto.Canton ?? "Cartago",
                District = dto.District ?? "Oriental",
                PaymentTerms = dto.Terms ?? "Contado",
                PaymentMethodDefault = dto.PaymentMethodDefault ?? "04",
                EconomicActivity = dto.EconomicActivity ?? "466901",
                IsActive = true
            };

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync(cancellationToken);

            return CreatedAtAction(nameof(GetById), new { id = customer.Id }, new { success = true, customerId = customer.Id, message = $"Cliente '{customer.BusinessName}' creado exitosamente." });
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateCustomerDto dto, CancellationToken cancellationToken)
        {
            var customer = await _context.Customers.FindAsync(new object[] { id }, cancellationToken);
            if (customer == null) return NotFound(ApiResponse<string>.Fail("Cliente no encontrado"));

            if (dto.TaxId != null) customer.TaxId = dto.TaxId.Trim();
            if (dto.DocType != null) customer.DocType = dto.DocType;
            if (dto.Name != null) customer.BusinessName = dto.Name.Trim();
            if (dto.TradeName != null) customer.TradeName = dto.TradeName.Trim();
            if (dto.Email != null) customer.Email = dto.Email.Trim();
            if (dto.Phone != null) customer.Phone = dto.Phone.Trim();
            if (dto.Address != null) customer.Address = dto.Address.Trim();
            if (dto.Province != null) customer.Province = dto.Province;
            if (dto.Canton != null) customer.Canton = dto.Canton;
            if (dto.District != null) customer.District = dto.District;
            if (dto.Terms != null) customer.PaymentTerms = dto.Terms;
            if (dto.PaymentMethodDefault != null) customer.PaymentMethodDefault = dto.PaymentMethodDefault;
            if (dto.EconomicActivity != null) customer.EconomicActivity = dto.EconomicActivity;
            if (dto.IsActive.HasValue) customer.IsActive = dto.IsActive.Value;

            await _context.SaveChangesAsync(cancellationToken);
            return Ok(new { success = true, message = $"Cliente '{customer.BusinessName}' actualizado correctamente." });
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            var customer = await _context.Customers.FindAsync(new object[] { id }, cancellationToken);
            if (customer == null) return NotFound(ApiResponse<string>.Fail("Cliente no encontrado"));

            customer.IsActive = false;
            await _context.SaveChangesAsync(cancellationToken);
            return Ok(new { success = true, message = $"Cliente ID {id} desactivado correctamente." });
        }
    }
}
