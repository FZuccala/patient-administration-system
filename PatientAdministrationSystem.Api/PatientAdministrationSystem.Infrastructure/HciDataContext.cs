using PatientAdministrationSystem.Application.Entities;
using Microsoft.EntityFrameworkCore;

namespace PatientAdministrationSystem.Infrastructure;

public class HciDataContext : DbContext, IHciDataContext
{
    public HciDataContext()
    {
    }

    public HciDataContext(DbContextOptions options) : base(options)
    {
    }


    public DbSet<PatientEntity> Patients { get; set; } = null!;

    public DbSet<HospitalEntity> Hospitals { get; set; } = null!;

    public DbSet<VisitEntity> Visits { get; set; } = null!;
    
    public DbSet<PatientHospitalRelation> PatientHospitalRelations { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<HospitalEntity>();

        modelBuilder.Entity<HospitalEntity>()
            .HasData(
                new HospitalEntity
                {
                    Id = new Guid("ff0c022e-1aff-4ad8-2231-08db0378ac98"),
                    Name = "Default hospital"
                }
            );

        modelBuilder.Entity<PatientEntity>();

        modelBuilder.Entity<PatientEntity>()
            .HasData(
                new PatientEntity
                {
                    Id = new Guid("c00b9ff3-b1b6-42fe-8b5a-4c28408fb64a"),
                    FirstName = "Aliaksandr",
                    LastName = "Huzen",
                    Email = "huzen.av@gmail.com"
                }
                , new PatientEntity
                {
                    Id = new Guid("1ec2d3f7-8aa8-4bf5-91b8-045378919049"),
                    FirstName = "Vinny",
                    LastName = "Lawlor",
                    Email = "vinny.lawlor@hci.care"
                }
            );


        modelBuilder.Entity<VisitEntity>()
            .HasData(
                new VisitEntity
                {
                    Id = new Guid("a7a5182a-995c-4bce-bce0-6038be112b7b"),
                    Date = new DateTime(2023, 08, 22)
                }
            );

        modelBuilder.Entity<PatientHospitalRelation>()
            .HasKey(x => new { x.PatientId, x.HospitalId, x.VisitId });

        modelBuilder.Entity<PatientEntity>()
            .HasMany(x => x.PatientHospitals)
            .WithOne(x => x.Patient)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<HospitalEntity>()
            .HasMany(x => x.PatientHospitals)
            .WithOne(x => x.Hospital)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<VisitEntity>()
            .HasMany(x => x.PatientHospitals)
            .WithOne(x => x.Visit)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PatientHospitalRelation>()
            .HasData(
                new PatientHospitalRelation
                {
                    PatientId = new Guid("c00b9ff3-b1b6-42fe-8b5a-4c28408fb64a"),
                    HospitalId = new Guid("9ca78c33-4590-43c1-a7c4-55696a5efd44"),
                    VisitId = new Guid("a7a5182a-995c-4bce-bce0-6038be112b7b")
                });
    }
}