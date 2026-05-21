import math
from typing import Optional
from fastapi import Depends, FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import crud
from database import Base, engine, get_db
from routers.tickets import router as tickets_router
from routers.analytics import router as analytics_router
from schemas import IssueCategory, Priority, Status, TicketListResponse

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Helpdesk Ticket Management API",
    description="REST API for managing internal IT support tickets",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tickets_router)
app.include_router(analytics_router)


@app.get("/", tags=["health"])
def health_check():
    return {"status": "ok", "message": "Helpdesk Ticket Management API is running"}


@app.get("/search", response_model=TicketListResponse, tags=["search"])
def search_tickets(
    keyword: str = Query("", description="Search keyword"),
    status: Optional[Status] = None,
    category: Optional[IssueCategory] = None,
    priority: Optional[Priority] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    tickets, total = crud.search_tickets(
        db,
        keyword=keyword,
        status=status,
        category=category,
        priority=priority,
        page=page,
        page_size=page_size,
    )
    return TicketListResponse(
        tickets=tickets,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=max(1, math.ceil(total / page_size)),
    )
