# NITDA DTD — Digital Transformation Dashboard (Frontend)

> **National Information Technology Development Agency (NITDA)**  
> Digital Transformation Dashboard — Frontend Application

A data-driven performance management and monitoring platform built for NITDA to track KPIs, manage strategic plans (SRAP), monitor stakeholder activities, and generate scorecards across all departments.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Features](#features)
5. [Application Routes](#application-routes)
6. [State Management](#state-management)
7. [Getting Started](#getting-started)
8. [Environment Variables](#environment-variables)
9. [Available Scripts](#available-scripts)
10. [Contributing](#contributing)

---

## Overview

The **NITDA DTD Frontend** is a React-based single-page application (SPA) that powers the Digital Transformation Dashboard. It provides:

- A **Staff Dashboard** for internal NITDA personnel to manage KPIs, SRAPs, users, departments, and roles.
- A **Stakeholder Dashboard** for external stakeholders to submit and track their activity data.
- A **Public Dashboard** accessible without authentication for transparency reporting.
- Role-based access control, analytics, audit logs, and scorecard generation.

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | [React 18](https://react.dev) |
| Build Tool | [Vite](https://vitejs.dev) with SWC |
| Language | JavaScript / TypeScript (JSX/TSX) |
| Styling | [Tailwind CSS v3](https://tailwindcss.com) |
| UI Components | [shadcn/ui](https://ui.shadcn.com) + [Radix UI](https://www.radix-ui.com) |
| State Management | [Redux Toolkit](https://redux-toolkit.js.org) + [React Redux](https://react-redux.js.org) |
| Server State | [TanStack React Query v5](https://tanstack.com/query) |
| Routing | [React Router DOM v6](https://reactrouter.com) |
| HTTP Client | [Axios](https://axios-http.com) |
| Forms | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) |
| Charts | [Recharts](https://recharts.org) |
| Animations | [Framer Motion](https://www.framer.com/motion) |
| Date Utilities | [date-fns](https://date-fns.org) |
| Export | [xlsx](https://www.npmjs.com/package/xlsx) |
| Notifications | [Sonner](https://sonner.emilkowal.ski) |
| Tours / Guides | [Driver.js](https://driverjs.com) |
| Icons | [Lucide React](https://lucide.dev) |

---

## Project Structure

```
nitda-dtd-fe/
├── public/                        # Static assets
├── src/
│   ├── App.jsx                    # Root component with routing configuration
│   ├── main.tsx                   # Application entry point
│   ├── store.jsx                  # Redux store configuration
│   ├── index.css                  # Global styles
│   │
│   ├── pages/                     # Route-level page components
│   │   ├── auth/                  # Authentication pages (Login, Register, ForgotPassword)
│   │   ├── work-package-a/        # Work Package A pages
│   │   ├── work-package-b/        # Work Package B pages
│   │   ├── global/                # Shared/global pages
│   │   ├── Index.jsx              # Staff main dashboard
│   │   ├── Analytics.jsx          # Analytics & reporting
│   │   ├── AuditLogs.jsx          # System audit logs
│   │   ├── ApproveKpi.jsx         # KPI data review & approval
│   │   ├── ApproveStakeholderActivity.jsx  # Stakeholder activity review
│   │   ├── KpiCreation.jsx        # KPI definition creation
│   │   ├── KpiDefinitionReview.jsx # KPI definition review workflow
│   │   ├── kpi-scorecard.jsx      # KPI scorecard view
│   │   ├── DGscoreCard.jsx        # Director-General scorecard
│   │   ├── Srap.jsx               # SRAP management
│   │   ├── SrapCreation.jsx       # SRAP creation
│   │   ├── SrapLandingPage.jsx    # Public SRAP landing page
│   │   ├── Pillar1.jsx            # Strategic pillar detail view
│   │   ├── Pillars.jsx            # Pillars listing
│   │   ├── StakeHoldersDashboard.jsx      # Stakeholder-facing dashboard
│   │   ├── StakeholderActivityDataEntry.jsx # Stakeholder data submission
│   │   ├── PublicDashboard.jsx    # Public-facing dashboard
│   │   ├── Users.jsx              # User management
│   │   ├── Roles.jsx              # Role management
│   │   ├── Department.jsx         # Department management
│   │   ├── Settings.jsx           # Application settings
│   │   └── ...                    # Additional CRUD pages
│   │
│   ├── components/                # Reusable UI components
│   │   └── layout/
│   │       └── DashboardLayout.jsx # Main authenticated layout with sidebar
│   │
│   ├── Slices/                    # Redux state slices
│   │   ├── authSlice.js           # Authentication state
│   │   ├── kpiSlice.js            # KPI data state
│   │   ├── srapSlice.js           # SRAP state
│   │   ├── pillarSlice.js         # Pillar state
│   │   ├── userSlice.js           # User management state
│   │   ├── departmentSlice.js     # Department state
│   │   ├── roleSlice.js           # Role state
│   │   ├── stakeholderActivitiesSlice.js  # Stakeholder activities state
│   │   ├── stakeholderObjectivesSlice.js  # Stakeholder objectives state
│   │   ├── versionSlice.js        # Version management state
│   │   ├── yearSlice.js           # Year management state
│   │   └── Utils/                 # Axios instances, API utilities
│   │
│   ├── hooks/                     # Custom React hooks
│   ├── context/                   # React context providers (TourContext)
│   ├── lib/                       # Utility functions (roleLabels, etc.)
│   └── services/                  # External service integrations
│
├── .env                           # Environment variables (not committed)
├── vite.config.ts                 # Vite configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── components.json                # shadcn/ui component configuration
├── tsconfig.json                  # TypeScript configuration
└── package.json                   # Dependencies and scripts
```

---

## Features

### 🏠 Staff Dashboard
- Overview of key performance indicators, strategic plans, and departmental metrics.
- Interactive charts and summaries using Recharts.

### 📊 Analytics
- Visualize KPI trends, performance over time, and departmental comparisons.

### 📋 KPI Management
- **KPI Creation** — Define KPIs with targets, units, pillars, and responsible departments.
- **KPI Data Review** (`/dashboard/kpi-data`) — View all submitted KPI data.
- **KPI Approval** (`/dashboard/kpi-review`) — Review and approve submitted KPI values.
- **KPI Definition Review** (`/dashboard/kpi-definition-review`) — Review and verify KPI definitions before activation.
- **KPI Scorecard** — Individual and DG-level scorecards.

### 🗂️ SRAP (Strategic & Research Action Plan)
- Full CRUD operations for SRAPs, SRAP Initiatives, and SRAP Objectives.
- Link objectives to pillars, KPIs, and departments.
- Public-facing SRAP landing page.

### 🎯 Strategic Pillars
- Manage strategic pillars and view individual pillar performance.

### 👥 Stakeholder Management
- **Stakeholder Dashboard** — Role-restricted view for external stakeholders.
- **Activity Data Entry** — Stakeholders submit their activity data.
- **Activity Review** (`/dashboard/stakeholder-activity-review`) — Internal staff review and approve stakeholder-submitted data.

### 🏢 Administration
- **User Management** — Create, edit, and manage system users.
- **Role Management** — Define custom roles with specific permissions.
- **Department Management** — Manage NITDA's organisational departments.
- **Year & Version Management** — Control reporting years and data versions.
- **Objectives Management** — Manage strategic objectives.

### 🔍 Audit Logs
- Searchable, filterable audit trail with date-range filtering.

### ⚙️ Settings
- Application-level settings and user preferences.

### 🌍 Public Access
- **Public Dashboard** (`/public-dashboard`) — View aggregate performance data without authentication.
- **SRAP Landing Page** (`/srap-landing`) — Public SRAP information.

### 🔐 Authentication
- Login, Registration, and Forgot Password flows.
- JWT-based authentication persisted via Redux.
- Role-based route guarding (`ProtectedRoute`, `StakeholderRoute`).

---

## Application Routes

### Public Routes

| Path | Component | Description |
|---|---|---|
| `/login` | `Login` | User authentication |
| `/register` | `Register` | New user registration |
| `/forgot-password` | `ForgotPassword` | Password reset flow |
| `/srap-landing` | `SrapLandingPage` | Public SRAP information page |
| `/public-dashboard` | `PublicDashboard` | Public-facing performance dashboard |

### Protected Routes (Staff — `/dashboard/*`)

| Path | Component | Description |
|---|---|---|
| `/dashboard` | `Index` | Main staff dashboard |
| `/dashboard/analytics` | `Analytics` | Analytics & reporting |
| `/dashboard/audit-logs` | `AuditLogs` | System audit trail |
| `/dashboard/kpi-data` | `KPIVisualization` | KPI data source view |
| `/dashboard/create-kpi` | `KpiCreation` | Create new KPI definitions |
| `/dashboard/kpi-review` | `ApproveKpi` | Review & approve KPI submissions |
| `/dashboard/kpi-definition-review` | `KpiDefinitionReview` | Review KPI definitions |
| `/dashboard/stakeholder-activity-review` | `ApproveStakeholderActivity` | Review stakeholder activity data |
| `/dashboard/kpi-scorecard` | `KpiScorecard` | KPI scorecard report |
| `/dashboard/dg-kpi-scorecard` | `DGKpiScorecard` | Director-General scorecard |
| `/dashboard/pillar` | `PillarManagement` | Manage strategic pillars |
| `/dashboard/pillar/:id` | `Pillar1` | Pillar detail view |
| `/dashboard/create-pillar` | `PillarCreation` | Create new pillar |
| `/dashboard/pillar/:id/edit` | `EditPillarForm` | Edit pillar |
| `/dashboard/srap` | `SrapManagement` | View all SRAPs |
| `/dashboard/create-srap` | `SrapCreation` | Create new SRAP |
| `/dashboard/srap/:id/edit` | `EditSrap` | Edit existing SRAP |
| `/dashboard/srap-initiatives` | `SrapInitiativesManagement` | Manage SRAP initiatives |
| `/dashboard/create-srap-initiative` | `SrapInitiativeCreation` | Create SRAP initiative |
| `/dashboard/objectives` | `ObjectiveManagement` | Manage objectives |
| `/dashboard/create-objective` | `SrapObjectiveCreation` | Create new objective |
| `/dashboard/users` | `UserManagement` | User management |
| `/dashboard/create-user` | `UserCreation` | Create new user |
| `/dashboard/user/edit/:id` | `UserEdit` | Edit user |
| `/dashboard/roles` | `RolesManagement` | Role management |
| `/dashboard/create-role` | `RoleCreation` | Create new role |
| `/dashboard/departments` | `DepartmentManagement` | Department management |
| `/dashboard/create-department` | `DepartmentCreation` | Create department |
| `/dashboard/settings` | `Settings` | Application settings |
| `/dashboard/stakeholder-activities-data` | `StakeholderActivityDataEntry` | Stakeholder data entry |
| `/dashboard/work-package-a/project-initiation` | `ProjectInitiation` | Work Package A — Project Initiation |
| `/dashboard/work-package-a/data-source-validation` | `DataSourceValidation` | Data Source Validation |
| `/dashboard/work-package-a/compliance-scalability` | `ComplianceScalability` | Compliance & Scalability |
| `/dashboard/work-package-b/data-model-architecture` | `DataModelArchitecture` | Work Package B — Data Model Architecture |
| `/dashboard/work-package-b/wireframes-prototypes` | `WireframesPrototypes` | Wireframes & Prototypes |
| `/dashboard/work-package-b/dashboard-ui-ux` | `DashboardUIUX` | Dashboard UI/UX |
| `/dashboard/work-package-b/data-entry` | `DataEntry` | Data Entry |
| `/dashboard/work-package-b/projects` | `ProjectsList` | Projects list |
| `/dashboard/work-package-b/projects/:id` | `ProjectDetail` | Project detail |

### Stakeholder Route

| Path | Component | Description |
|---|---|---|
| `/dashboard/stakeholder-dashboard` | `StakeHoldersDashboard` | Restricted to stakeholder role only |

---

## State Management

The application uses **Redux Toolkit** for global client state and **TanStack React Query** for server state (API data fetching, caching, and synchronisation).

### Redux Slices

| Slice | Responsibility |
|---|---|
| `authSlice` | Authentication state — user, token, `isAuthenticated` flag |
| `kpiSlice` | KPI definitions, values, and filtering |
| `srapSlice` | SRAP records and management |
| `pillarSlice` | Strategic pillars |
| `objectiveSlice` | SRAP objectives |
| `userSlice` | User records and management |
| `departmentSlice` | Department data |
| `roleSlice` | Roles and permissions |
| `stakeholderActivitiesSlice` | Stakeholder activity submissions |
| `stakeholderObjectivesSlice` | Stakeholder objectives |
| `stakeholderSrapSlice` | Stakeholder SRAP data |
| `scoreCardSlice` | Scorecard data |
| `scoreCardConfigSlice` | Scorecard configuration |
| `versionSlice` | Reporting version management |
| `yearSlice` | Reporting year management |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) v18 or later
- [npm](https://www.npmjs.com) (or [bun](https://bun.sh))

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd nitda-dtd-fe

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your API base URL

# 4. Start the development server
npm run dev
```

The application will be available at **http://localhost:5173** (or the next available port).

---

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Production API base URL
VITE_BASE_URL_PROD=https://your-api-domain.com/api/v1

# QA / Test API base URL
VITE_TEST_URL_PROD=https://your-qa-api-domain.com/api/v1
```

> **Note:** All environment variables must be prefixed with `VITE_` to be accessible in the browser via `import.meta.env`.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server with hot reload |
| `npm run build` | Build the production bundle |
| `npm run build:dev` | Build the development bundle |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint for code quality checks |

---

## Contributing

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes and commit with a descriptive message.
3. Push the branch and open a pull request against `main`.
4. Ensure linting passes before submitting:
   ```bash
   npm run lint
   ```

---

*Built and maintained by the NITDA DTD development team.*
