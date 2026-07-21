# NMDC Iron Ore — Rake Dispatch Management System (Frontend)

Web application for managing iron-ore rake dispatch operations at NMDC: planning rakes, load management, delay tracking, railway approvals, e-demand/e-permit workflows, operational reports, and master data administration.

Built with **React 19**, **Vite 8**, **Redux Toolkit**, **React Router 7**, and **Tailwind CSS 4**.

---

## Table of contents

- [Overview](#overview)
- [Key features](#key-features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Demo logins](#demo-logins)
- [Roles and access](#roles-and-access)
- [Operational workflow](#operational-workflow)
- [Reports](#reports)
- [Project structure](#project-structure)
- [Architecture](#architecture)
- [Scripts](#scripts)
- [Testing](#testing)
- [Build and deployment](#build-and-deployment)
- [Git and secrets](#git-and-secrets)

---

## Overview

This frontend supports the full dispatch lifecycle for iron-ore rakes:

1. **Plan & offer rakes** — draft upcoming rakes and promote them to the offered list.
2. **Load management** — capture siding placement, tonnage, stockpile, wagon health, and completion/clearance times.
3. **Delay management** — register manual delays and view system-derived delays across the rake journey.
4. **Railway approvals** — multi-department wagon inspection and approval workflow after loading completes.
5. **E-Demand / E-Permit** — manage customer demand and permit records tied to dispatch.
6. **Reports** — operational, performance, and compliance reports driven from persisted user inputs.
7. **Master data** — sidings, wagon types, ore categories, customers, destinations, routes, stockpiles, delay categories.

The app supports **multiple user roles** (admin, operator, superadmin, railway departments) with route guards and role-specific landing pages.

---

## Key features

### Dashboard
- Real-time dispatch grid with hourly placement/load/clearance visibility.
- Hover tooltips for cell-level dispatch detail.
- KPI cards and rake monitoring summaries.

### Rake management
- Offered rakes table with inline add/edit/adjust flows.
- **Plan Upcoming Rakes** workspace: multi-row planner with wagon type, route, customer, wagon count, and placement time.
- Auto-saved upcoming drafts in local storage; ready rows move to the offered list with generated rake IDs.

### Load management
- Rake-linked loading records (placement, tonnage, stockpile, FTP, sick wagons, overloaded wagons).
- Manual loading track (R3/R4) for incentive reporting.
- Completion triggers railway approval workflow.

### Delay management
- **Delay Register** tab for manual delay entry.
- **Rake Journey** tab with end-to-end process timeline (loading milestones, system delays, railway approval stages).
- Links to railway approvals and loading records.

### Railway approvals
- Department-specific approval queues (Operations / Station Master, Commercial, C&W Inspector).
- Wagon manifest inspection UI and approval tracker.
- Audit trail usable in compliance reports.

### E-Demand & E-Permit
- Manage e-demand records and e-permit status.
- Data persists in the operational store and feeds e-demand summary reports.

### Reports hub
- Unified report registry with date presets, filters, export, and **data lineage** panel (“Where does this data come from?”).
- Reports include: Transaction, RT, E-Demand Summary, Daily, Siding Performance, Load Adjustment, Sick Wagon, Demurrage, Rake Incentive, Delay Analysis, Railway Approval Audit.

### Master data
- CRUD for rail sidings, wagon types, ore categories, customers, destinations, routes, stockpiles, and delay categories.
- Dev mock layer available when backend master-data APIs are unavailable.

### Superadmin
- Role and user management with privilege groups (separate layout under `/superadmin`).

### Admin tools
- Utility pages such as delete offered rakes and edit rake timing.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| UI | React 19, Tailwind CSS 4, Lucide icons |
| Routing | React Router DOM 7 (URL-based routes + legacy route ID bridge) |
| State | Redux Toolkit (rakes, loading, delays, approvals) |
| HTTP | Axios with JWT refresh interceptor |
| Build | Vite 8, React Compiler (Babel plugin) |
| Testing | Vitest, Testing Library, jsdom |

---

## Getting started

### Prerequisites

- **Node.js** 18+ (20+ recommended)
- **npm** 9+

### Install

```bash
npm install
```

### Configure environment

Copy the example env file and adjust for your environment:

```bash
cp .env.example .env.development
```

See [Environment variables](#environment-variables) below.

### Run development server

```bash
npm run dev
```

The dev server runs at **http://localhost:5184** (`strictPort: true` in Vite config).

### Production preview

```bash
npm run build
npm run preview
```

Preview also uses port **5184**.

---

## Environment variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend REST API base URL | `https://iron-ore-rdms.onrender.com/api` |
| `VITE_APP_ENV` | App environment label | `development` / `production` |
| `VITE_USE_MOCK_AUTH` | When `true`, login uses local mock tokens without hitting `/token/` | `true` |

**Template:** commit `.env.example` only.

**Do not commit:** `.env.development`, `.env.production`, or any file containing secrets.

---

## Demo logins

When `VITE_USE_MOCK_AUTH=true`, these accounts work locally (password for all: **`admin123`**):

| Role | Email | Landing route |
|------|-------|---------------|
| Admin | `admin@nmdc.local` | `/admin/dashboard` |
| Super Admin | `superadmin@nmdc.local` | `/superadmin/roles` |
| Operator | `operator@nmdc.local` | `/operator` |
| Station Master (Operations) | `station@nmdc.local` | `/railway/approvals?dept=operations` |
| Commercial | `commercial@nmdc.local` | `/railway/approvals?dept=commercial` |
| C&W Inspector | `cw@nmdc.local` | `/railway/approvals?dept=cw` |

The login page includes quick-login buttons for Admin, Super Admin, and railway roles.

Role can also be inferred from email keywords when using ad-hoc credentials in mock mode (e.g. `operator@…`, `commercial@…`).

---

## Roles and access

| Role | Access |
|------|--------|
| `admin` | Full admin panel: dashboard, e-demand, rake, loading, delay, reports, master data, railway approvals, admin tools |
| `operator` | Operator hub (`/operator`) |
| `superadmin` | Superadmin layout: roles and users |
| `station_master`, `commercial`, `cw_inspector` | Railway approvals (`/railway/approvals`) with department context |

Route guards live in `src/routes/guards.jsx`. Canonical paths are defined in `src/constants/routes.js`.

### Main admin routes

| Module | Path |
|--------|------|
| Dashboard | `/admin/dashboard` |
| E-Demand | `/admin/e-demand/manage`, `/admin/e-demand/permit` |
| Rake management | `/admin/rake` |
| Upcoming rakes | `/admin/rake/upcoming` |
| Load management | `/admin/loading` |
| Delay management | `/admin/delay` |
| Railway approvals | `/admin/railway/approvals` |
| Reports | `/admin/reports/*` |
| Master data | `/admin/master-data/*` |
| Admin users | `/admin/users` |
| Admin tools | `/admin/tools/*` |

---

## Operational workflow

```
Upcoming Rakes  →  Offered Rakes  →  Load Management  →  Railway Approvals
                         ↓                    ↓                      ↓
                   Rake reports        Delay register          Audit reports
                   E-demand/permit     Journey timeline        Wagon manifest
```

### Data persistence (development / demo)

Operational entities are stored in **browser localStorage** via `src/services/operational/operationalRepository.js`:

- Offered rakes
- Loading records
- Delay records
- Railway approval requests
- E-demand and e-permit records
- Upcoming rake drafts

Redux slices (`src/store/slices/`) sync UI state with this repository. When the backend API is wired, services in `src/services/operational/index.js` are the integration boundary.

Seed data version is tracked (`OPERATIONAL_STORE_VERSION`); bumping it resets demo data in localStorage.

---

## Reports

Reports are configured in `src/pages/admin/reports/reportRegistry.js` and rendered through a shared `ReportTablePage` with:

- Category filters (Operations, Performance, Compliance)
- Date range presets
- CSV/export utilities
- **Data lineage** documentation per report (`reportDataLineage.js`)

Report rows are built by `reportDataEngine.js` from operational store data (rakes, loading, delays, approvals, e-demand/e-permit) rather than hardcoded seeds.

| Report | Primary data sources |
|--------|---------------------|
| Transaction | Loading completion, rake offer/placement times |
| RT | Loading clearance and route timing |
| Daily | Aggregated dispatch and delay counts |
| Demurrage | Delay register reasons and durations |
| Rake Incentive | Manual loading track (R3/R4), placement/clearance |
| Delay Analysis | Manual + system delays from journey timeline |
| Railway Approval Audit | Approval decisions and timestamps |
| E-Demand Summary | E-demand and e-permit records |

---

## Project structure

```
src/
├── api/                    # Axios client, API error parsing
├── app/                    # App shell, providers (Router, Redux, Auth)
├── components/
│   ├── common/             # LoadingState, ErrorBoundary, ApprovalTracker, …
│   ├── delay/              # Delay process timeline UI
│   ├── layout/             # Sidebar, Header, Layout, Breadcrumb
│   ├── railway/            # Wagon inspection components
│   └── shared/             # UniformUi, SearchBar, ThemedSelect, Modal, …
├── constants/              # routes, roles, approval, storage keys
├── context/                # AuthContext, RouterContext (legacy bridge)
├── features/               # Feature modules (pages, routes, hooks)
│   ├── auth/
│   ├── dashboard/
│   ├── delay/
│   ├── edemand/
│   ├── loading/
│   ├── rake/
│   ├── railway/
│   ├── reports/
│   ├── master-data/
│   ├── operator/
│   ├── superadmin/
│   ├── admin-tools/
│   └── users/
├── hooks/                  # useCrud, useFilters, usePagination, useSorting, …
├── layouts/                # AdminLayout, SuperadminLayout
├── pages/                  # Legacy page implementations (wired by feature routes)
├── routes/                 # AppRoutes, ProtectedRoute, GuestRoute
├── services/
│   ├── auth/               # Login, token refresh
│   ├── operational/        # Rake, loading, delay, approval, e-demand services
│   ├── railway/
│   └── masterData/         # Dev mock for master-data APIs
├── store/                  # Redux store and slices
├── types/                  # Domain models and API transforms
├── utils/                  # Dates, export, approval/delay helpers
└── tests/                  # Vitest setup and unit tests
```

Path alias: `@/` → `src/` (configured in `vite.config.js`).

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Login → AuthContext → ProtectedRoute → Feature Page    │
└──────────────────────────┬──────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
   Redux slices    operationalRepository   axiosClient
   (UI state)      (localStorage demo)      (REST API)
         │                 │                 │
         └─────────────────┴─────────────────┘
                           │
                    Reports / Dashboard
                    (reportDataEngine)
```

- **Feature modules** under `src/features/` own route entry points; many delegate to established pages under `src/pages/admin/`.
- **RouterContext** maps legacy sidebar route IDs to URL paths for backward compatibility.
- **Auth** supports remember-me (localStorage) vs session-only (sessionStorage).
- **Mock auth** issues `mock_access_*` tokens; API calls skip refresh when mock session is detected.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server on port 5184 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve production build locally |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest once |
| `npm run test:watch` | Run Vitest in watch mode |

---

## Testing

Tests use **Vitest** with **jsdom** and setup in `src/tests/setup.js`.

```bash
npm run test
```

Example coverage: transform utilities in `src/tests/transforms.test.js`.

---

## Build and deployment

1. Set production environment variables on the host/CI (do not commit `.env.production`).
2. Build:

   ```bash
   npm run build
   ```

3. Deploy the `dist/` folder to your static host (Netlify, Vercel, S3, nginx, etc.).
4. Configure the host to serve `index.html` for client-side routes (SPA fallback).

Default API fallback if `VITE_API_BASE_URL` is unset: `https://iron-ore-rdms.onrender.com/api`.

---

## Git and secrets

**Commit:**
- Application source under `src/`
- `package.json`, `package-lock.json`, `vite.config.js`, `index.html`
- `.env.example`

**Do not commit:**
- `.env.development`, `.env.production`
- `node_modules/`, `dist/`
- Local editor/OS files (`.DS_Store`, etc.)

Recommended `.gitignore` entries:

```gitignore
.env
.env.*
!.env.example
```

---

## Backend API

The frontend expects a REST API compatible with:

- `POST /token/` — login (email + password)
- `POST /token/refresh/` — JWT refresh
- Master-data and operational endpoints (integration in progress; demo mode uses localStorage)

Base URL is controlled by `VITE_API_BASE_URL`.

---

## License

Private — NMDC / ThinkersCave internal project.
