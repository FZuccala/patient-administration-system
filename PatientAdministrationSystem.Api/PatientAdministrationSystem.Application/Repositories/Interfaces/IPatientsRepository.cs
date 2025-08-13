using System.Linq.Expressions;
using PatientAdministrationSystem.Application.Entities;
using PatientAdministrationSystem.Application.Models;

namespace PatientAdministrationSystem.Application.Repositories.Interfaces;

public interface IPatientsRepository
{
    Task<SearchResponse<PatientVisitDto>> SearchPatientVisitsAsync(SearchRequest request, CancellationToken cancellationToken = default);
    Task<IEnumerable<HospitalEntity>> GetAllHospitalsAsync(CancellationToken cancellationToken = default);
    Task<PatientVisitDto?> GetPatientVisitByIdAsync(Guid patientId, Guid visitId, CancellationToken cancellationToken = default);
}