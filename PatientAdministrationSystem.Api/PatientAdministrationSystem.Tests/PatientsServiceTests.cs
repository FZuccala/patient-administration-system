using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using PatientAdministrationSystem.Application.Entities;
using PatientAdministrationSystem.Application.Models;
using PatientAdministrationSystem.Application.Repositories.Interfaces;
using PatientAdministrationSystem.Application.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PatientAdministrationSystem.Tests
{
    [TestClass]
    public class PatientsServiceTests
    {
        private Mock<IPatientsRepository> _mockRepository;
        private PatientsService _service;

        [TestInitialize]
        public void Setup()
        {
            _mockRepository = new Mock<IPatientsRepository>();
            _service = new PatientsService(_mockRepository.Object);
        }

        [TestMethod]
        public async Task SearchPatientVisitsAsync_WithValidRequest_ReturnsResults()
        {
            // Arrange
            var request = new SearchRequest
            {
                SearchTerm = "John",
                Page = 1,
                PageSize = 10
            };

            var expectedResponse = new SearchResponse<PatientVisitDto>
            {
                Data = new List<PatientVisitDto>
                {
                    new PatientVisitDto
                    {
                        PatientId = Guid.NewGuid(),
                        FirstName = "John",
                        LastName = "Doe",
                        Email = "john.doe@test.com",
                        HospitalId = Guid.NewGuid(),
                        HospitalName = "Test Hospital",
                        VisitId = Guid.NewGuid(),
                        VisitDate = DateTime.Now.AddDays(-1)
                    }
                },
                TotalCount = 1,
                Page = 1,
                PageSize = 10
            };

            _mockRepository.Setup(r => r.SearchPatientVisitsAsync(It.IsAny<SearchRequest>(), It.IsAny<CancellationToken>()))
                          .ReturnsAsync(expectedResponse);

            // Act
            var result = await _service.SearchPatientVisitsAsync(request);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(1, result.Data.Count());
            Assert.AreEqual("John", result.Data.First().FirstName);
            _mockRepository.Verify(r => r.SearchPatientVisitsAsync(It.IsAny<SearchRequest>(), It.IsAny<CancellationToken>()), Times.Once);
        }

        [TestMethod]
        [ExpectedException(typeof(ArgumentNullException))]
        public async Task SearchPatientVisitsAsync_WithNullRequest_ThrowsArgumentNullException()
        {
            // Act
            await _service.SearchPatientVisitsAsync(null);
        }

        [TestMethod]
        [ExpectedException(typeof(ArgumentException))]
        public async Task SearchPatientVisitsAsync_WithInvalidPageSize_ThrowsArgumentException()
        {
            // Arrange
            var request = new SearchRequest
            {
                Page = 1,
                PageSize = 101 // Invalid page size
            };

            // Act
            await _service.SearchPatientVisitsAsync(request);
        }

        [TestMethod]
        [ExpectedException(typeof(ArgumentException))]
        public async Task SearchPatientVisitsAsync_WithInvalidDateRange_ThrowsArgumentException()
        {
            // Arrange
            var request = new SearchRequest
            {
                FromDate = DateTime.Now,
                ToDate = DateTime.Now.AddDays(-1), // ToDate before FromDate
                Page = 1,
                PageSize = 10
            };

            // Act
            await _service.SearchPatientVisitsAsync(request);
        }

        [TestMethod]
        public async Task GetAllHospitalsAsync_ReturnsHospitals()
        {
            // Arrange
            var expectedHospitals = new List<HospitalEntity>
            {
                new HospitalEntity { Id = Guid.NewGuid(), Name = "Hospital A" },
                new HospitalEntity { Id = Guid.NewGuid(), Name = "Hospital B" }
            };

            _mockRepository.Setup(r => r.GetAllHospitalsAsync(It.IsAny<CancellationToken>()))
                          .ReturnsAsync(expectedHospitals);

            // Act
            var result = await _service.GetAllHospitalsAsync();

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(2, result.Count());
            _mockRepository.Verify(r => r.GetAllHospitalsAsync(It.IsAny<CancellationToken>()), Times.Once);
        }

        [TestMethod]
        [ExpectedException(typeof(ArgumentException))]
        public async Task GetPatientVisitByIdAsync_WithEmptyPatientId_ThrowsArgumentException()
        {
            // Act
            await _service.GetPatientVisitByIdAsync(Guid.Empty, Guid.NewGuid());
        }

        [TestMethod]
        [ExpectedException(typeof(ArgumentException))]
        public async Task GetPatientVisitByIdAsync_WithEmptyVisitId_ThrowsArgumentException()
        {
            // Act
            await _service.GetPatientVisitByIdAsync(Guid.NewGuid(), Guid.Empty);
        }

        /*
         * Additional tests that could be implemented:
         * 
         * 1. Test repository error handling and exception propagation
         * 2. Test search term sanitization (SQL injection prevention)
         * 3. Test pagination edge cases (large page numbers, etc.)
         * 4. Test concurrent access scenarios
         * 5. Test performance with large datasets
         * 6. Test different date formats and edge cases
         * 7. Test hospital filtering functionality
         * 8. Integration tests with real database
         * 9. Test caching mechanisms if implemented
         * 10. Test logging and monitoring functionality
         */
    }
}
