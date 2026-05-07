# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sandvik Forecast Tool (SFT) is a sales forecasting management system for Sandvik China Division. It supports forecast submission, multi-level approval workflows, and organizational hierarchy management.

- **Repository:** `/mnt/d/Git/SandvikForecastTool`
- **GitHub:** https://github.com/jiwenmang1983/sandvik-sales-forecast-tool
- **Main branch:** `master`

---

## Tech Stack

- **Backend:** ASP.NET Core 8 + Entity Framework Core + MySQL (Pomelo provider)
- **Frontend:** Vue 3 + Vite + Ant Design Vue 4 + axios
- **Auth:** JWT (local dev) + Microsoft 365 SSO (production)
- **Email:** Queue architecture via `IEmailQueueService` + `BackgroundService`
- **Testing:** Playwright for E2E tests

---

## Build Commands

### Backend
```bash
cd backend/src/SandvikForecast.Api && dotnet build --nologo
```

### Frontend
```bash
cd frontend && npm install && npm run build
```

### Development Servers
```bash
# Backend API (from backend/src/SandvikForecast.Api)
dotnet run

# Frontend (from frontend)
npm run dev
```

### Run Tests
```bash
# Backend unit tests
dotnet test

# Frontend E2E tests (Playwright)
cd frontend && npx playwright test
```

---

## Architecture

### Backend — Clean Architecture (3 projects)

```
backend/src/
├── SandvikForecast.Api/        # Entry point, Controllers, Middleware, Filters
│   ├── Controllers/            # 24 API controllers (Auth, Forecast, Approval, Org, etc.)
│   ├── DTOs/                  # Request/Response DTOs
│   ├── Filters/                # API filters (e.g., ApiStandardResponseFilter)
│   ├── Middleware/             # Custom middleware
│   └── Services/               # API-level services
├── SandvikForecast.Core/       # Domain entities, interfaces (no framework deps)
│   └── Entities/               # User, ForecastPeriod, ApprovalRequest, OrgNode, etc.
└── SandvikForecast.Infrastructure/  # EF Core, repositories, external services
    ├── Data/
    │   └── SandvikDbContext.cs # EF Core DbContext with all DbSets
    ├── Migrations/              # EF Core migrations
    └── Repositories/            # Repository implementations
```

**Key patterns:**
- `IRepository<T>` generic repository pattern
- `SandvikDbContext` manages all entity sets; migrations use Pomelo MySQL
- Email uses `IEmailQueueService` (in Core) + `EmailQueueHostedService` (background consumer in Api)
- JWT auth with `[Authorize]` attribute; M365 SSO via cookie-based flow

### Frontend — Standard Vue 3 SPA Structure

```
frontend/src/
├── api/                # Axios API clients (one file per domain: auth, forecast, approval, etc.)
├── components/         # Reusable Vue components
├── router/index.js     # Vue Router with auth guards; uses hash history
├── store/             # Pinia/Vuex stores (if present)
├── utils/             # Helper functions
└── views/             # Page components (Login, Dashboard, Forecast, Approval, etc.)
```

**Key routes:** Login, Dashboard, Forecast, Approval, OrgChart, BaseData (Products/DataDict tabs), Users, Permissions, FcVersion, ApprovalFlow, TemplateManagement, ForecastPeriod, EmailQueue, UserInvoicePermission

---

## Database

- **Engine:** MySQL 8.0 (configured in `appsettings.json` or environment)
- **Connection string:** `Server=localhost;Port=3306;Database=sandvik_forecast;User=root;Password=Sandvik2026!;`
- **Migrations:** EF Core code-first migrations in `SandvikForecast.Infrastructure/Migrations/`
- **Schema:** Auto-created on startup via `db.Database.EnsureCreated()` in `Program.cs`

---

## Key API Patterns

- All controllers return `ApiStandardResponse<T>` wrapper (configured via `ApiStandardResponseFilter`)
- JWT token passed via `Authorization: Bearer <token>` header
- CORS policy `AllowVue` permits `http://localhost:5173` and `http://localhost:5174`
- Soft delete pattern used (e.g., `IsDeleted` flag) where applicable

---

## Project Documents

| Document | Purpose |
|----------|---------|
| `docs/PRD.md` | Product requirements (source of truth for features) |
| `docs/WBS.md` | Work breakdown structure + issue tracking |
| `docs/TEST_SUITE.md` | Test case suite |
| `PLAYBOOK.md` | Team collaboration rules (roles, CC调度, Git workflow) |
| `CONTRIBUTING.md` | Development standards and PR process |

---

## Git Workflow

- **Default:** Regular `git push` to master (no force-push without Mark's approval)
- **Commit format:** `<type>: <description>` where type is `feat|fix|docs|refactor|test|chore`
- **Build required:** Both `dotnet build` and `npm run build` must pass before push
- **Branch naming:** `feat/<description>`, `fix/<description>`, `bugfix/<description>`

---

## Environment

- **Backend:** Runs on `http://localhost:5000` (Kestrel default)
- **Frontend dev:** Runs on `http://localhost:5173`
- **MySQL:** Expected on `localhost:3306`
- **JWT Secret:** Configured in `appsettings.json` (`Jwt:Secret` key)
