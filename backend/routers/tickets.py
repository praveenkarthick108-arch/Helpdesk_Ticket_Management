import math
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

import crud
from database import get_db
from schemas import (
    IssueCategory, Priority, Status,
    TicketCreate, TicketListResponse, TicketResponse, TicketUpdate, StatsResponse,
)

router = APIRouter(prefix="/tickets", tags=["tickets"])


@router.get("/", response_model=TicketListResponse)
def list_tickets(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    status: Optional[Status] = None,
    category: Optional[IssueCategory] = None,
    priority: Optional[Priority] = None,
    sort_by: str = Query("created_at", pattern="^(created_at|priority|status|employee_name|ticket_id)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
):
    tickets, total = crud.get_tickets(
        db, page=page, page_size=page_size,
        status=status, category=category, priority=priority,
        sort_by=sort_by, sort_order=sort_order,
    )
    return TicketListResponse(
        tickets=tickets,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=max(1, math.ceil(total / page_size)),
    )


@router.get("/stats", response_model=StatsResponse)
def get_ticket_stats(db: Session = Depends(get_db)):
    return crud.get_stats(db)


@router.get("/{ticket_id}", response_model=TicketResponse)
def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    ticket = crud.get_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found")
    return ticket


@router.post("/", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
def create_ticket(ticket: TicketCreate, db: Session = Depends(get_db)):
    return crud.create_ticket(db, ticket)


@router.put("/{ticket_id}", response_model=TicketResponse)
def update_ticket(ticket_id: int, ticket_update: TicketUpdate, db: Session = Depends(get_db)):
    updated = crud.update_ticket(db, ticket_id, ticket_update)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found")
    return updated


@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ticket(ticket_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_ticket(db, ticket_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found")
