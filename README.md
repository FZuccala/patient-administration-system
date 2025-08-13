# Health Care Informed Engineering - Take home assessment

<p align="center">
  <img src="patient-search-repo-image.png">
</p>

We are a very practical team at Health Care Informed and this extends to the way that we work with you to find out if this team is a great fit for you. We want
you to come away with a great understanding of the work that we actually do day to day and what it is like to work with us.

So instead of coding at a whiteboard with someone watching over your shoulder under high pressure, which is not a thing we often do, we instead discuss code
that you have written previously when we meet face to face.

The Brief:

“A Health Care Informed customer needs to be able to\* \*\*\_find patient visit information**\* _at one of their hospitals. Create a simple web application
using React, Typescript, C# that allows a customer to_ **_search_\*\* _patient/hospital visit information and display results. The application should have a
very simple styled UX, some simple API’s and leverages the data store and sample data provided”._

## Guidelines

- Don’t spend too long on it (~4 hours) and keep things simple. This is not a time limit just a guideline.
- Clone the repo and create your own GitHub repositiory. Please dont fork.
  - When you’re done, **send us a link to the Github project and the Loom** to vinny.lawlor@hci.care - it will be reviewed by engineering and the CTO within 2
    days.

## Focus areas

### DO focus on:

1. Solving the customer problem - understand the customer requirement and make sensible trade offs for feature quality versus **keeping it simple**.
2. Structure your front and back end code well so it's clean, modular & well organised. Attention to detail important.
   1. Strong, best practice RESTful API design, API contracts that are clean and make sense
   2. Validation
   3. Error handling
3. Testing: Add a single test to the backend & front end - add some comments for other things you'd test
4. The deliverable is well packaged and easy for us to run (document in your readme.md)
5. Share a screen recording with a short demo of the application (max 5 mins - can use [Loom](https://www.loom.com/)) so we can see what it looks like.
   - Bring us through the solution, talk us through how it solves the customer problem
   - Clearly communicate any assumptions you want to make, shortcuts you take etc.
   - Answer this question: What would you do if you had 1 more week on this? Where do you spend your time?

### Don't worry about implementing:

- Authentication
- Styling

# Patient Administration System - Complete Implementation

## Solution Overview

I have implemented a complete web application to search patient visit information at hospitals. The solution includes:

### Backend (.NET 9 Web API)

- **Clean architecture** with layer separation (Application, Infrastructure, API)
- **RESTful API** with well-defined endpoints
- **Robust validation** on both server and client side
- **Comprehensive error handling**
- **In-memory database** with Entity Framework
- **Unit tests** with MSTest and Moq

### Frontend (React + TypeScript + Vite)

- **Modern and responsive interface** with attractive design
- **Advanced search** with multiple filters
- **Pagination** to handle large datasets
- **Client-side validation**
- **Loading and error state management**
- **Unit tests** with Vitest and React Testing Library

## Implemented Features

### API Endpoints

- `GET /api/patients/visits` - Search visits with optional filters
- `GET /api/patients/{patientId}/visits/{visitId}` - Get specific visit
- `GET /api/patients/hospitals` - List all hospitals

### Search Filters

- **Search term**: Name, last name, email or hospital
- **Specific hospital**: Filter by selected hospital
- **Date range**: From/to for visit dates
- **Pagination**: Page and page size control

### Validations

- Date range validation
- Future date prevention
- Search term length limit
- Basic SQL injection prevention
- Pagination parameter validation

## How to Run the Application

### Prerequisites

- .NET 9 SDK
- Node.js (version 18 or higher)
- npm or yarn

### 1. Run the Backend

```bash
cd PatientAdministrationSystem.Api/PatientAdministrationSystem
dotnet restore
dotnet run
```

The API will be available at `http://localhost:5000`

### 2. Run the Frontend

```bash
cd PatientAdministrationSystem.App
npm install
npm run dev
```

The web application will be available at `http://localhost:5173`

### 3. Run Tests

**Backend:**

```bash
cd PatientAdministrationSystem.Api
dotnet test
```

**Frontend:**

```bash
cd PatientAdministrationSystem.App
npm test
```

## Project Structure

```
PatientAdministrationSystem.Api/
├── PatientAdministrationSystem/           # API Layer
│   ├── Controllers/PatientsController.cs  # REST endpoints
│   └── Program.cs                         # Configuration and test data
├── PatientAdministrationSystem.Application/  # Business Logic
│   ├── Entities/                          # Domain entities
│   ├── Models/                           # DTOs and request/response models
│   ├── Services/                         # Business services
│   └── Repositories/Interfaces/          # Repository contracts
├── PatientAdministrationSystem.Infrastructure/  # Data Access
│   ├── HciDataContext.cs                 # Entity Framework context
│   └── Repositories/                     # Data access implementations
└── PatientAdministrationSystem.Tests/    # Unit tests

PatientAdministrationSystem.App/
├── src/
│   ├── components/                       # React components
│   │   ├── SearchForm.tsx               # Search form
│   │   ├── PatientVisitTable.tsx       # Results table
│   │   └── __tests__/                   # Component tests
│   ├── services/                        # API services
│   ├── types/                          # TypeScript definitions
│   └── api/                            # HTTP client configuration
```

## Design Decisions and Assumptions

### Assumptions

1. **Test data**: I added additional sample data to demonstrate functionality
2. **Relationships**: I assumed that a patient can have multiple visits at different hospitals
3. **Search**: The search is case-insensitive and searches in name, last name, email and hospital
4. **Pagination**: I implemented pagination to handle large datasets

### Technical Decisions

1. **Clean architecture**: I separated layers to facilitate maintenance and testing
2. **DTOs**: I created specific models for API responses
3. **Dual validation**: Validation on both client and server for better UX and security
4. **Error handling**: I implemented consistent error handling throughout the application
5. **Responsive design**: The interface adapts to different screen sizes

## What I would do with one more week

### High Priority (Days 1-2)

1. **Authentication and authorization** - JWT tokens, user roles
2. **Comprehensive logging** - Structured logging with Serilog
3. **Caching** - Redis to improve performance
4. **More tests** - Integration tests, E2E tests with Playwright

### Medium Priority (Days 3-4)

5. **Monitoring** - Health checks, metrics with Application Insights
6. **Database optimization** - Indexes, optimized queries
7. **API documentation** - More detailed Swagger/OpenAPI
8. **Internationalization** - Support for multiple languages

### Low Priority (Days 5-7)

9. **Data export** - Excel, PDF, CSV
10. **Notifications** - Real-time updates with SignalR
11. **Auditing** - Change and access tracking
12. **Deployment** - Docker containers, CI/CD pipelines

### UX/UI Improvements

- Advanced filters (multiple hospitals, age ranges)
- Column sorting
- Real-time search (debounced)
- Dark/light themes
- Improved accessibility (WCAG compliance)

## Technologies Used

### Backend

- .NET 9 Web API
- Entity Framework Core (In-Memory)
- MSTest + Moq for testing
- Swagger/OpenAPI for documentation

### Frontend

- React 18 + TypeScript
- Vite for build tooling
- Axios for HTTP requests
- Vitest + React Testing Library for testing
- Modern CSS with Flexbox/Grid

## Development howto guide (Original)

### PatientAdministrationSystem.App

1. FE Application in React / Typescript built on [Vite](https://vitejs.dev/guide/)
2. We've included an API client (Axios) in the `api` folder but feel free to use whatever you like
3. Run using:

```
cd PatientAdministrationSystem.App
npm install
npm run dev
```

### PatientAdministrationSystem.Api

- BE: .NET Core solution file containing API's and in-memory database with Entity Framework ready for implementation.
- Add functionality to the
  [PatientService](https://github.com/vinnyhci/hci-take-home-interview-v3/blob/main/PatientAdministrationSystem.Api/PatientAdministrationSystem.Application/Services/PatientsService.cs)/[IPatientService](https://github.com/vinnyhci/hci-take-home-interview-v3/PatientAdministrationSystem.Api/PatientAdministrationSystem.Application/Services/Interfaces/IPatientsService.cs)
  (app/business layer) and PatientsRepository (data layer) that query the HCIDataContext (database) and add your API contracts to the
  [PatientsController](https://github.com/vinnyhci/hci-take-home-interview-v3/blob/main/PatientAdministrationSystem.Api/PatientAdministrationSystem/Controllers/PatientsController.cs).
  Please define strong interfaces here, return types etc.
