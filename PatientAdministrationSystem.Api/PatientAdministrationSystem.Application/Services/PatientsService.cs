using PatientAdministrationSystem.Application.Entities;
using PatientAdministrationSystem.Application.Interfaces;
using PatientAdministrationSystem.Application.Models;
using PatientAdministrationSystem.Application.Repositories.Interfaces;
using System.Linq.Expressions;

namespace PatientAdministrationSystem.Application.Services;

public class PatientsService : IPatientsService
{
    private readonly IPatientsRepository _repository;

    public PatientsService(IPatientsRepository repository)
    {
        _repository = repository;
    }

    public async Task<SearchResponse<PatientVisitDto>> SearchPatientVisitsAsync(SearchRequest request, CancellationToken cancellationToken = default)
    {
        // Input validation
        if (request == null)
            throw new ArgumentNullException(nameof(request));

        var validationResult = ValidateSearchRequest(request);
        if (!validationResult.IsValid)
        {
            throw new ArgumentException(string.Join("; ", validationResult.Errors));
        }

        // Sanitize search term
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            request.SearchTerm = request.SearchTerm.Trim();
            // Prevent SQL injection by removing potentially dangerous characters
            if (request.SearchTerm.Contains("'") || request.SearchTerm.Contains("--") || request.SearchTerm.Contains(";"))
            {
                throw new ArgumentException("Search term contains invalid characters");
            }
        }

        return await _repository.SearchPatientVisitsAsync(request, cancellationToken);
    }

    private ValidationResult ValidateSearchRequest(SearchRequest request)
    {
        var result = ValidationResult.Success();

        // Validate page and page size
        if (request.Page <= 0)
        {
            result.AddError("Page must be greater than 0");
        }

        if (request.PageSize <= 0 || request.PageSize > 100)
        {
            result.AddError("PageSize must be between 1 and 100");
        }

        // Validate date range
        if (request.FromDate.HasValue && request.ToDate.HasValue && request.FromDate > request.ToDate)
        {
            result.AddError("FromDate cannot be greater than ToDate");
        }

        // Validate future dates
        if (request.FromDate.HasValue && request.FromDate > DateTime.Now.AddDays(1))
        {
            result.AddError("FromDate cannot be in the future");
        }

        if (request.ToDate.HasValue && request.ToDate > DateTime.Now.AddDays(1))
        {
            result.AddError("ToDate cannot be in the future");
        }

        // Validate search term length
        if (!string.IsNullOrWhiteSpace(request.SearchTerm) && request.SearchTerm.Length > 100)
        {
            result.AddError("Search term cannot exceed 100 characters");
        }

        return result;
    }

    public async Task<IEnumerable<HospitalEntity>> GetAllHospitalsAsync(CancellationToken cancellationToken = default)
    {
        return await _repository.GetAllHospitalsAsync(cancellationToken);
    }

    public async Task<PatientVisitDto?> GetPatientVisitByIdAsync(Guid patientId, Guid visitId, CancellationToken cancellationToken = default)
    {
        if (patientId == Guid.Empty)
            throw new ArgumentException("PatientId cannot be empty", nameof(patientId));
        
        if (visitId == Guid.Empty)
            throw new ArgumentException("VisitId cannot be empty", nameof(visitId));

        return await _repository.GetPatientVisitByIdAsync(patientId, visitId, cancellationToken);
    }
}