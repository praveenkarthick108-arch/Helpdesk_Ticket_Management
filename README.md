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

## Future Enhancements (Phase 2)

- Authentication & role-based access (Employee vs Support Admin)
- Email notifications on ticket updates
- AI-powered semantic search
- RAG-based support assistant
- Analytics dashboards with trend charts
- Data engineering pipelines
- Cloud deployment (AWS / Azure)
