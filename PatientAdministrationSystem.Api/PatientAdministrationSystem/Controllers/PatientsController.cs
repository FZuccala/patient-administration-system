using Microsoft.AspNetCore.Mvc;
using PatientAdministrationSystem.Application.Interfaces;
using PatientAdministrationSystem.Application.Models;
using System.ComponentModel.DataAnnotations;

namespace Hci.Ah.Home.Api.Gateway.Controllers.Patients;

[Route("api/patients")]
[ApiExplorerSettings(GroupName = "Patients")]
[ApiController]
public class PatientsController : ControllerBase
{
    private readonly IPatientsService _patientsService;

    public PatientsController(IPatientsService patientsService)
    {
        _patientsService = patientsService;
    }

    /// <summary>
    /// Search for patient visits with optional filters
    /// </summary>
    /// <param name="searchTerm">Search term to filter by patient name, email, or hospital name</param>
    /// <param name="hospitalId">Filter by specific hospital</param>
    /// <param name="fromDate">Filter visits from this date</param>
    /// <param name="toDate">Filter visits until this date</param>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Page size (default: 10, max: 100)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paginated list of patient visits</returns>
    [HttpGet("visits")]
    [ProducesResponseType(typeof(SearchResponse<PatientVisitDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(500)]
    public async Task<ActionResult<SearchResponse<PatientVisitDto>>> SearchPatientVisits(
        [FromQuery] string? searchTerm,
        [FromQuery] Guid? hospitalId,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery, Range(1, int.MaxValue)] int page = 1,
        [FromQuery, Range(1, 100)] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var request = new SearchRequest
            {
                SearchTerm = searchTerm,
                HospitalId = hospitalId,
                FromDate = fromDate,
                ToDate = toDate,
                Page = page,
                PageSize = pageSize
            };

            var result = await _patientsService.SearchPatientVisitsAsync(request, cancellationToken);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "An internal server error occurred" });
        }
    }

    /// <summary>
    /// Get a specific patient visit by patient ID and visit ID
    /// </summary>
    /// <param name="patientId">Patient ID</param>
    /// <param name="visitId">Visit ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Patient visit details</returns>
    [HttpGet("{patientId:guid}/visits/{visitId:guid}")]
    [ProducesResponseType(typeof(PatientVisitDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(400)]
    [ProducesResponseType(500)]
    public async Task<ActionResult<PatientVisitDto>> GetPatientVisit(
        Guid patientId, 
        Guid visitId, 
        CancellationToken cancellationToken = default)
    {
        try
        {
            var result = await _patientsService.GetPatientVisitByIdAsync(patientId, visitId, cancellationToken);
            
            if (result == null)
            {
                return NotFound(new { error = "Patient visit not found" });
            }

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "An internal server error occurred" });
        }
    }

    /// <summary>
    /// Get all available hospitals
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of hospitals</returns>
    [HttpGet("hospitals")]
    [ProducesResponseType(typeof(IEnumerable<object>), 200)]
    [ProducesResponseType(500)]
    public async Task<ActionResult> GetAllHospitals(CancellationToken cancellationToken = default)
    {
        try
        {
            var hospitals = await _patientsService.GetAllHospitalsAsync(cancellationToken);
            var result = hospitals.Select(h => new { id = h.Id, name = h.Name });
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "An internal server error occurred" });
        }
    }
}