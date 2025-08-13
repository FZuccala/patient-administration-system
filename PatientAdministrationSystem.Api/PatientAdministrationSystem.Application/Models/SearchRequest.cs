using System.ComponentModel.DataAnnotations;

namespace PatientAdministrationSystem.Application.Models;

public class SearchRequest
{
    [StringLength(100, MinimumLength = 1)]
    public string? SearchTerm { get; set; }
    
    public Guid? HospitalId { get; set; }
    
    public DateTime? FromDate { get; set; }
    
    public DateTime? ToDate { get; set; }
    
    [Range(1, 100)]
    public int PageSize { get; set; } = 10;
    
    [Range(1, int.MaxValue)]
    public int Page { get; set; } = 1;
}
