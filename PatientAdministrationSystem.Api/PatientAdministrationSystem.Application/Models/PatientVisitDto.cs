namespace PatientAdministrationSystem.Application.Models;

public class PatientVisitDto
{
    public Guid PatientId { get; set; }
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public Guid HospitalId { get; set; }
    public string HospitalName { get; set; } = null!;
    public Guid VisitId { get; set; }
    public DateTime VisitDate { get; set; }
}
