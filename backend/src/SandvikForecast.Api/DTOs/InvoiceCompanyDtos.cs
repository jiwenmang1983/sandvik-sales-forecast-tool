using System.ComponentModel.DataAnnotations;

namespace SandvikForecast.Api.DTOs;

public class CreateInvoiceCompanyDto
{
    [Required]
    public string CompanyCode { get; set; } = string.Empty;

    [Required]
    public string CompanyName { get; set; } = string.Empty;

    [Required]
    public string TaxNumber { get; set; } = string.Empty;

    public string? BankAccount { get; set; }
    public string? Address { get; set; }
    public string? Phone { get; set; }

    public bool IsActive { get; set; } = true;
}

public class UpdateInvoiceCompanyDto
{
    public string? CompanyCode { get; set; }
    public string? CompanyName { get; set; }
    public string? TaxNumber { get; set; }
    public string? BankAccount { get; set; }
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public bool? IsActive { get; set; }
}
