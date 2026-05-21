# Helpdesk Ticket Management System

A full-stack web application for managing internal IT support tickets, built with **React** (frontend), **FastAPI** (backend), and **SQLite** (database).

## Tech Stack

| Layer     | Technology                             |
|-----------|----------------------------------------|
| Frontend  | React 18 + Vite + Tailwind CSS         |
| Backend   | Python FastAPI + SQLAlchemy (ORM)      |
| Database  | SQLite                                 |
| HTTP      | Axios + React Hot Toast                |
| Routing   | React Router v6                        |

## Features

- **Create tickets** with employee name, department, category, description, and priority
- **View all tickets** in a responsive card grid with real-time filters
- **Search** by keyword across employee name, description, category, and department
- **Filter** by category, status, and priority simultaneously
- **Sort** tickets by date, priority, or employee name
- **Ticket details** page with full information and inline editing
- **Update tickets** — change status, add resolution notes, modify any field
- **Delete tickets** with confirmation modal
- **Dashboard** with live statistics: total, open, in-progress, resolved/closed counts, priority breakdown, and category breakdown
- **Pagination** on ticket listing (9 per page)
- **Toast notifications** for all create/update/delete actions
- **Responsive design** — works on mobile, tablet, and desktop

## Prerequisites

- **Python 3.10+** with `pip`
- **Node.js 18+** with `npm`

## Setup & Running

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

Interactive API docs (Swagger UI): `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

## API Endpoints

| Method | Endpoint           | Description                         |
|--------|--------------------|-------------------------------------|
| GET    | `/`                | Health check                        |
| GET    | `/tickets`         | List tickets (pagination + filters) |
| GET    | `/tickets/stats`   | Dashboard statistics                |
| GET    | `/tickets/{id}`    | Get ticket by ID                    |
| POST   | `/tickets`         | Create new ticket (201)             |
| PUT    | `/tickets/{id}`    | Update ticket                       |
| DELETE | `/tickets/{id}`    | Delete ticket (204)                 |
| GET    | `/search`          | Search tickets by keyword + filters |

### Query Parameters for `GET /tickets`

| Parameter  | Type    | Default      | Description                                      |
|------------|---------|--------------|--------------------------------------------------|
| page       | int     | 1            | Page number                                      |
| page_size  | int     | 10           | Results per page (max 100)                       |
| status     | string  | —            | Filter: Open, In Progress, Resolved, Closed      |
| category   | string  | —            | Filter by issue category                         |
| priority   | string  | —            | Filter: Low, Medium, High, Critical              |
| sort_by    | string  | created_at   | Sort field                                       |
| sort_order | string  | desc         | asc or desc                                      |

### `POST /tickets` — Request Body

```json
{
  "employee_name": "John Smith",
  "department": "Engineering",
  "issue_category": "VPN Issue",
  "description": "Cannot connect to VPN since this morning.",
  "priority": "High",
  "status": "Open",
  "resolution_notes": null
}
```

## Database Schema

```
tickets
├── ticket_id        INTEGER  PRIMARY KEY AUTOINCREMENT
├── employee_name    VARCHAR(100) NOT NULL
├── department       VARCHAR(100) NOT NULL
├── issue_category   VARCHAR(50)  NOT NULL
├── description      TEXT         NOT NULL
├── priority         VARCHAR(20)  NOT NULL  DEFAULT 'Medium'
├── status           VARCHAR(20)  NOT NULL  DEFAULT 'Open'
├── resolution_notes TEXT         NULLABLE
└── created_at       DATETIME     DEFAULT (utcnow)
```

## Project Structure

```
Helpdesk_Ticket_Management/
├── backend/
│   ├── main.py           # FastAPI app, CORS, search endpoint
│   ├── database.py       # SQLAlchemy engine + session
│   ├── models.py         # ORM Ticket model
│   ├── schemas.py        # Pydantic models + enums
│   ├── crud.py           # Database operations
│   ├── routers/
│   │   └── tickets.py    # CRUD routes
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── App.jsx              # Router + Toaster
│       ├── constants/index.js   # Enums + color maps
│       ├── services/api.js      # Axios service layer
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Badge.jsx        # Priority + Status badges
│       │   ├── StatsCard.jsx
│       │   ├── TicketCard.jsx
│       │   ├── TicketTable.jsx
│       │   ├── TicketForm.jsx   # Shared create/edit form
│       │   ├── FilterBar.jsx
│       │   ├── Pagination.jsx
│       │   ├── ConfirmModal.jsx
│       │   ├── LoadingSpinner.jsx
│       │   └── EmptyState.jsx
│       └── pages/
│           ├── Dashboard.jsx    # Stats + recent tickets
│           ├── TicketList.jsx   # Filterable ticket grid
│           ├── TicketDetail.jsx # View + edit + delete
│           └── CreateTicket.jsx # New ticket form
└── README.md
```

## Issue Categories

- VPN Issue
- Password Reset
- Software Installation
- Laptop Issue
- Email Access
- Network Connectivity
- Hardware Request

## Ticket Priorities

| Priority | Color  |
|----------|--------|
| Low      | Blue   |
| Medium   | Yellow |
| High     | Orange |
| Critical | Red    |

## Ticket Statuses

| Status      | Color  |
|-------------|--------|
| Open        | Gray   |
| In Progress | Purple |
| Resolved    | Green  |
| Closed      | Slate  |

---

## Phase 2 — ETL Pipeline & Analytics Dashboard

Phase 2 extends the system with a **Pandas-based ETL pipeline** that ingests a 220+ row historical ticket dataset, cleans and transforms it, loads it into a dedicated analytics table, and exposes rich metrics through new API endpoints and an interactive React analytics dashboard.

### What's New in Phase 2

| Area | Addition |
|------|---------|
| ETL Pipeline | Python + Pandas Extract → Transform → Load script |
| Dataset | 220+ historical tickets CSV (`datasets/historical_tickets.csv`) |
| Analytics DB | Two new SQLite tables: `analytics_tickets`, `etl_job_log` |
| Analytics API | 7 new FastAPI endpoints under `/analytics` |
| Analytics UI | New React dashboard page with 5 Recharts charts |
| Navigation | "Analytics" link added to top navbar |

### New Tech Stack Additions

| Addition | Purpose |
|----------|---------|
| **Pandas 2.2+** | ETL data processing (extract, transform, load) |
| **Recharts 2.x** | React charting library for analytics visualizations |

### Installing Phase 2 Dependencies

**Backend** (pandas is now in `requirements.txt`):
```bash
cd backend
pip install -r requirements.txt
```

**Frontend** (recharts is now in `package.json`):
```bash
cd frontend
npm install
```

### Running the ETL Pipeline

**Option A — From the UI (recommended):**
1. Start the backend and frontend
2. Click **Analytics** in the navbar
3. Click **Run ETL Pipeline** — data loads in seconds, charts populate automatically

**Option B — From the command line:**
```bash
# From project root:
python backend/etl/run_etl.py

# With a custom CSV path:
python backend/etl/run_etl.py --csv datasets/historical_tickets.csv
```

Example CLI output:
```
Starting ETL pipeline...
  CSV: datasets/historical_tickets.csv

ETL completed successfully:
{
  "status": "success",
  "rows_extracted": 225,
  "rows_loaded": 206,
  "rows_skipped": 19,
  ...
}
```

### ETL Workflow

```
datasets/historical_tickets.csv
        │
        ▼  EXTRACT
   pandas.read_csv()
        │
        ▼  TRANSFORM
   1. Drop exact duplicate rows
   2. Strip whitespace from all string columns
   3. Normalize issue_category  (e.g. "vpn" → "VPN Issue")
   4. Normalize priority        (e.g. "CRITICAL", "med" → canonical values)
   5. Normalize status          (e.g. "in-progress", "resolve" → canonical)
   6. Parse created_at / resolved_at (drop rows with invalid dates)
   7. Compute resolution_time_hrs = (resolved_at - created_at) / 3600
   8. Derive month_year for time-series grouping
        │
        ▼  LOAD
   SQLite analytics_tickets table (full truncate-and-reload)
   ETL job metadata saved to etl_job_log
```

### New Analytics API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/category-distribution` | Ticket count & % per issue category |
| GET | `/analytics/priority-distribution` | Ticket count & % per priority level |
| GET | `/analytics/department-breakdown` | Per-department open/in-progress/resolved/closed counts |
| GET | `/analytics/monthly-trends` | Monthly ticket volume across all statuses |
| GET | `/analytics/resolution-time` | Avg/min/max resolution time per month |
| GET | `/analytics/etl-status` | Last ETL job metadata + total analytics records |
| POST | `/analytics/run-etl` | Trigger ETL pipeline (body: `{"csv_filename": "historical_tickets.csv"}`) |

### Analytics Dashboard

The **Analytics** page (`/analytics`) includes:

- **ETL Control Panel** — shows last run metadata (rows extracted/loaded/skipped, status, timestamp) with a "Run ETL Pipeline" button
- **KPI Cards** — Total Records, Avg Resolution Time, Top Category, Resolution Rate
- **Category Bar Chart** — horizontal bars ranked by ticket volume
- **Priority Donut Chart** — color-coded by Critical/High/Medium/Low
- **Monthly Trend Line Chart** — 12-month view of total, open, in-progress, and resolved tickets
- **Resolution Time Bar Chart** — avg hours to resolve per month with an overall average reference line
- **Department Stacked Bar Chart** — per-department breakdown by status

All charts gracefully show a "Run ETL pipeline first" placeholder before data is loaded.

### New Database Tables (Phase 2)

```
analytics_tickets
├── id                  INTEGER  PRIMARY KEY
├── source_ticket_id    INTEGER  NULLABLE
├── employee_name       VARCHAR(100)
├── department          VARCHAR(100)
├── issue_category      VARCHAR(50)
├── description         TEXT
├── priority            VARCHAR(20)
├── status              VARCHAR(20)
├── resolution_notes    TEXT
├── created_at          DATETIME
├── resolved_at         DATETIME
├── resolution_time_hrs FLOAT       (computed by ETL)
├── month_year          VARCHAR(7)  (e.g. "2024-03")
├── etl_batch_id        VARCHAR(36) (UUID per ETL run)
└── loaded_at           DATETIME

etl_job_log
├── id              INTEGER  PRIMARY KEY
├── batch_id        VARCHAR(36) UNIQUE
├── status          VARCHAR(20)  (running | success | failed)
├── csv_filename    VARCHAR(255)
├── rows_extracted  INTEGER
├── rows_loaded     INTEGER
├── rows_skipped    INTEGER
├── error_message   TEXT
├── started_at      DATETIME
└── finished_at     DATETIME
```

### Updated Project Structure (Phase 2)

```
Helpdesk_Ticket_Management/
├── datasets/
│   └── historical_tickets.csv        ← 220+ row historical dataset
├── backend/
│   ├── etl/
│   │   ├── __init__.py
│   │   ├── pipeline.py               ← Core ETL: extract/transform/load
│   │   └── run_etl.py                ← CLI entry point
│   ├── routers/
│   │   ├── tickets.py                (Phase 1 — unchanged)
│   │   └── analytics.py              ← 7 analytics endpoints (Phase 2)
│   ├── main.py                       (analytics router added)
│   ├── models.py                     (AnalyticsTicket + EtlJobLog added)
│   ├── schemas.py                    (analytics schemas added)
│   └── requirements.txt              (pandas added)
└── frontend/
    └── src/
        ├── components/
        │   ├── analytics/             ← Phase 2 chart components
        │   │   ├── EtlPanel.jsx
        │   │   ├── CategoryBarChart.jsx
        │   │   ├── PriorityPieChart.jsx
        │   │   ├── MonthlyTrendChart.jsx
        │   │   ├── ResolutionTimeChart.jsx
        │   │   └── DepartmentChart.jsx
        │   └── … (Phase 1 components — unchanged)
        ├── pages/
        │   ├── Analytics.jsx          ← Phase 2 analytics dashboard
        │   └── … (Phase 1 pages — unchanged)
        └── services/
            └── api.js                 (analyticsService added)
```
