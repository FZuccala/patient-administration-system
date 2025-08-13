using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using PatientAdministrationSystem.Application.Entities;
using PatientAdministrationSystem.Application.Models;
using PatientAdministrationSystem.Application.Repositories.Interfaces;

namespace PatientAdministrationSystem.Infrastructure.Repositories;

public class PatientsRepository : IPatientsRepository
{
    private readonly HciDataContext _context;

    public PatientsRepository(HciDataContext context)
    {
        _context = context;
    }

    public async Task<SearchResponse<PatientVisitDto>> SearchPatientVisitsAsync(SearchRequest request, CancellationToken cancellationToken = default)
    {
        var query = from phr in _context.Set<PatientHospitalRelation>()
                   join patient in _context.Patients on phr.PatientId equals patient.Id
                   join hospital in _context.Hospitals on phr.HospitalId equals hospital.Id
                   join visit in _context.Visits on phr.VisitId equals visit.Id
                   select new PatientVisitDto
                   {
                       PatientId = patient.Id,
                       FirstName = patient.FirstName,
                       LastName = patient.LastName,
                       Email = patient.Email,
                       HospitalId = hospital.Id,
                       HospitalName = hospital.Name,
                       VisitId = visit.Id,
                       VisitDate = visit.Date
                   };

        // Apply filters
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(x => 
                x.FirstName.ToLower().Contains(searchTerm) ||
                x.LastName.ToLower().Contains(searchTerm) ||
                x.Email.ToLower().Contains(searchTerm) ||
                x.HospitalName.ToLower().Contains(searchTerm));
        }

        if (request.HospitalId.HasValue)
        {
            query = query.Where(x => x.HospitalId == request.HospitalId.Value);
        }

        if (request.FromDate.HasValue)
        {
            query = query.Where(x => x.VisitDate >= request.FromDate.Value);
        }

        if (request.ToDate.HasValue)
        {
            query = query.Where(x => x.VisitDate <= request.ToDate.Value);
        }

        // Get total count before pagination
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply pagination
        var data = await query
            .OrderBy(x => x.LastName)
            .ThenBy(x => x.FirstName)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        return new SearchResponse<PatientVisitDto>
        {
            Data = data,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }

    public async Task<IEnumerable<HospitalEntity>> GetAllHospitalsAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Hospitals
            .OrderBy(h => h.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<PatientVisitDto?> GetPatientVisitByIdAsync(Guid patientId, Guid visitId, CancellationToken cancellationToken = default)
    {
        return await (from phr in _context.Set<PatientHospitalRelation>()
                     join patient in _context.Patients on phr.PatientId equals patient.Id
                     join hospital in _context.Hospitals on phr.HospitalId equals hospital.Id
                     join visit in _context.Visits on phr.VisitId equals visit.Id
                     where patient.Id == patientId && visit.Id == visitId
                     select new PatientVisitDto
                     {
                         PatientId = patient.Id,
                         FirstName = patient.FirstName,
                         LastName = patient.LastName,
                         Email = patient.Email,
                         HospitalId = hospital.Id,
                         HospitalName = hospital.Name,
                         VisitId = visit.Id,
                         VisitDate = visit.Date
                     }).FirstOrDefaultAsync(cancellationToken);
    }
}