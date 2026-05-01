using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SandvikForecast.Core.Entities;
using SandvikForecast.Core.Interfaces;

namespace SandvikForecast.Api.Controllers;

[ApiController]
[Route("api/basedata")]
[Authorize]
public class BaseDataController : ControllerBase
{
    private readonly IRepository<Customer> _customerRepo;
    private readonly IRepository<InvoiceCompany> _invoiceRepo;
    private readonly IRepository<ProductHierarchy> _productRepo;

    public BaseDataController(
        IRepository<Customer> customerRepo,
        IRepository<InvoiceCompany> invoiceRepo,
        IRepository<ProductHierarchy> productRepo)
    {
        _customerRepo = customerRepo;
        _invoiceRepo = invoiceRepo;
        _productRepo = productRepo;
    }

    #region Customers

    [HttpGet("customers")]
    public async Task<ActionResult> GetCustomers([FromQuery] string? status, [FromQuery] string? keyword)
    {
        try
        {
            var customers = await _customerRepo.GetAllAsync();
            
            // Filter by status (IsActive)
            if (!string.IsNullOrEmpty(status))
            {
                var isActive = status == "active";
                customers = customers.Where(c => c.IsActive == isActive);
            }
            
            // Filter by keyword (CustomerName or CustomerCode)
            if (!string.IsNullOrEmpty(keyword))
            {
                customers = customers.Where(c => 
                    c.CustomerName.Contains(keyword) || 
                    c.CustomerCode.Contains(keyword));
            }
            
            return Ok(new { success = true, data = customers.ToList() });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    [HttpGet("customers/{id}")]
    public async Task<ActionResult> GetCustomer(string id)
    {
        try
        {
            var customer = await _customerRepo.GetByIdAsync(id);
            if (customer == null)
                return NotFound(new { success = false, message = "Customer not found" });
            return Ok(new { success = true, data = customer });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    [HttpPost("customers")]
    public async Task<ActionResult> CreateCustomer([FromBody] CreateCustomerRequest request)
    {
        try
        {
            var customer = new Customer
            {
                CustomerCode = request.Code,
                CustomerName = request.Name,
                Region = request.Region ?? "",
                IsActive = request.IsActive ?? true
            };
            
            var created = await _customerRepo.AddAsync(customer);
            return StatusCode(201, new { success = true, data = created, message = "Customer created" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    [HttpPut("customers/{id}")]
    public async Task<ActionResult> UpdateCustomer(string id, [FromBody] UpdateCustomerRequest request)
    {
        try
        {
            var customer = await _customerRepo.GetByIdAsync(id);
            if (customer == null)
                return NotFound(new { success = false, message = "Customer not found" });
            
            if (!string.IsNullOrEmpty(request.Name))
                customer.CustomerName = request.Name;
            if (!string.IsNullOrEmpty(request.Code))
                customer.CustomerCode = request.Code;
            if (!string.IsNullOrEmpty(request.Region))
                customer.Region = request.Region;
            if (request.IsActive.HasValue)
                customer.IsActive = request.IsActive.Value;
            
            await _customerRepo.UpdateAsync(customer);
            return Ok(new { success = true, data = customer, message = "Customer updated" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    [HttpDelete("customers/{id}")]
    public async Task<ActionResult> DeleteCustomer(string id)
    {
        try
        {
            await _customerRepo.DeleteAsync(id);
            return Ok(new { success = true, message = "Customer deleted" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    #endregion

    #region Invoice Companies

    [HttpGet("invoicecompanies")]
    public async Task<ActionResult> GetInvoiceCompanies([FromQuery] string? status, [FromQuery] string? keyword)
    {
        try
        {
            var companies = await _invoiceRepo.GetAllAsync();
            
            if (!string.IsNullOrEmpty(status))
            {
                var isActive = status == "active";
                companies = companies.Where(c => c.IsActive == isActive);
            }
            
            if (!string.IsNullOrEmpty(keyword))
            {
                companies = companies.Where(c => 
                    c.CompanyName.Contains(keyword) || 
                    c.CompanyCode.Contains(keyword));
            }
            
            return Ok(new { success = true, data = companies.ToList() });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    [HttpGet("invoicecompanies/{id}")]
    public async Task<ActionResult> GetInvoiceCompany(string id)
    {
        try
        {
            var company = await _invoiceRepo.GetByIdAsync(id);
            if (company == null)
                return NotFound(new { success = false, message = "Invoice company not found" });
            return Ok(new { success = true, data = company });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    [HttpPost("invoicecompanies")]
    public async Task<ActionResult> CreateInvoiceCompany([FromBody] CreateInvoiceCompanyRequest request)
    {
        try
        {
            var company = new InvoiceCompany
            {
                CompanyCode = request.Code,
                CompanyName = request.Name,
                TaxNumber = request.TaxNumber ?? "",
                BankAccount = request.BankAccount ?? "",
                Address = request.Address ?? "",
                Phone = request.Phone ?? "",
                IsActive = request.IsActive ?? true
            };
            
            var created = await _invoiceRepo.AddAsync(company);
            return StatusCode(201, new { success = true, data = created, message = "Invoice company created" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    [HttpPut("invoicecompanies/{id}")]
    public async Task<ActionResult> UpdateInvoiceCompany(string id, [FromBody] UpdateInvoiceCompanyRequest request)
    {
        try
        {
            var company = await _invoiceRepo.GetByIdAsync(id);
            if (company == null)
                return NotFound(new { success = false, message = "Invoice company not found" });
            
            if (!string.IsNullOrEmpty(request.Name))
                company.CompanyName = request.Name;
            if (!string.IsNullOrEmpty(request.Code))
                company.CompanyCode = request.Code;
            if (!string.IsNullOrEmpty(request.TaxNumber))
                company.TaxNumber = request.TaxNumber;
            if (!string.IsNullOrEmpty(request.BankAccount))
                company.BankAccount = request.BankAccount;
            if (!string.IsNullOrEmpty(request.Address))
                company.Address = request.Address;
            if (!string.IsNullOrEmpty(request.Phone))
                company.Phone = request.Phone;
            if (request.IsActive.HasValue)
                company.IsActive = request.IsActive.Value;
            
            await _invoiceRepo.UpdateAsync(company);
            return Ok(new { success = true, data = company, message = "Invoice company updated" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    [HttpDelete("invoicecompanies/{id}")]
    public async Task<ActionResult> DeleteInvoiceCompany(string id)
    {
        try
        {
            await _invoiceRepo.DeleteAsync(id);
            return Ok(new { success = true, message = "Invoice company deleted" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    #endregion

    #region Products

    [HttpGet("products")]
    public async Task<ActionResult> GetProducts([FromQuery] string? status, [FromQuery] string? pa, [FromQuery] string? keyword)
    {
        try
        {
            var products = await _productRepo.GetAllAsync();
            
            if (!string.IsNullOrEmpty(status))
            {
                var isActive = status == "active";
                products = products.Where(p => p.IsActive == isActive);
            }
            
            if (!string.IsNullOrEmpty(pa))
            {
                // Filter by PA level product name containing the PA value
                products = products.Where(p => p.ProductLevel == 1 && p.ProductName.Contains(pa));
            }
            
            if (!string.IsNullOrEmpty(keyword))
            {
                products = products.Where(p => 
                    p.ProductCode.Contains(keyword) || 
                    p.ProductName.Contains(keyword));
            }
            
            return Ok(new { success = true, data = products.ToList() });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    [HttpGet("products/{id}")]
    public async Task<ActionResult> GetProduct(string id)
    {
        try
        {
            var product = await _productRepo.GetByIdAsync(id);
            if (product == null)
                return NotFound(new { success = false, message = "Product not found" });
            return Ok(new { success = true, data = product });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    [HttpPost("products")]
    public async Task<ActionResult> CreateProduct([FromBody] CreateProductRequest request)
    {
        try
        {
            var product = new ProductHierarchy
            {
                ProductLevel = request.ProductLevel,
                ParentId = request.ParentId,
                ProductCode = request.Code,
                ProductName = request.Name,
                SortOrder = request.SortOrder,
                IsActive = request.IsActive ?? true
            };
            
            var created = await _productRepo.AddAsync(product);
            return StatusCode(201, new { success = true, data = created, message = "Product created" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    [HttpPut("products/{id}")]
    public async Task<ActionResult> UpdateProduct(string id, [FromBody] UpdateProductRequest request)
    {
        try
        {
            var product = await _productRepo.GetByIdAsync(id);
            if (product == null)
                return NotFound(new { success = false, message = "Product not found" });
            
            if (!string.IsNullOrEmpty(request.Name))
                product.ProductName = request.Name;
            if (!string.IsNullOrEmpty(request.Code))
                product.ProductCode = request.Code;
            if (request.ProductLevel.HasValue)
                product.ProductLevel = request.ProductLevel.Value;
            if (!string.IsNullOrEmpty(request.ParentId))
                product.ParentId = request.ParentId;
            if (request.SortOrder.HasValue)
                product.SortOrder = request.SortOrder.Value;
            if (request.IsActive.HasValue)
                product.IsActive = request.IsActive.Value;
            
            await _productRepo.UpdateAsync(product);
            return Ok(new { success = true, data = product, message = "Product updated" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    [HttpDelete("products/{id}")]
    public async Task<ActionResult> DeleteProduct(string id)
    {
        try
        {
            await _productRepo.DeleteAsync(id);
            return Ok(new { success = true, message = "Product deleted" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    #endregion
}

#region DTOs

public record CreateCustomerRequest(string Code, string Name, string? Region, bool? IsActive);
public record UpdateCustomerRequest(string? Name, string? Code, string? Region, bool? IsActive);

public record CreateInvoiceCompanyRequest(string Code, string Name, string? TaxNumber, string? BankAccount, string? Address, string? Phone, bool? IsActive);
public record UpdateInvoiceCompanyRequest(string? Name, string? Code, string? TaxNumber, string? BankAccount, string? Address, string? Phone, bool? IsActive);

public record CreateProductRequest(string Code, string Name, int ProductLevel, string? ParentId, int SortOrder, bool? IsActive);
public record UpdateProductRequest(string? Name, string? Code, int? ProductLevel, string? ParentId, int? SortOrder, bool? IsActive);

#endregion