import math
from typing import List, Optional, Tuple
from sqlalchemy import asc, desc, func
from sqlalchemy.orm import Session

from models import Ticket
from schemas import Priority, Status, IssueCategory, TicketCreate, TicketUpdate

SORT_COLUMNS = {
    "created_at": Ticket.created_at,
    "priority": Ticket.priority,
    "status": Ticket.status,
    "employee_name": Ticket.employee_name,
    "ticket_id": Ticket.ticket_id,
}

PRIORITY_ORDER = {"Low": 1, "Medium": 2, "High": 3, "Critical": 4}


def _apply_filters(query, status=None, category=None, priority=None):
    if status:
        query = query.filter(Ticket.status == status)
    if category:
        query = query.filter(Ticket.issue_category == category)
    if priority:
        query = query.filter(Ticket.priority == priority)
    return query


def get_tickets(
    db: Session,
    page: int = 1,
    page_size: int = 10,
    status: Optional[str] = None,
    category: Optional[str] = None,
    priority: Optional[str] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
) -> Tuple[List[Ticket], int]:
    query = db.query(Ticket)
    query = _apply_filters(query, status, category, priority)

    total = query.count()

    sort_col = SORT_COLUMNS.get(sort_by, Ticket.created_at)
    order_fn = desc if sort_order == "desc" else asc
    query = query.order_by(order_fn(sort_col))

    offset = (page - 1) * page_size
    tickets = query.offset(offset).limit(page_size).all()
    return tickets, total


def get_ticket(db: Session, ticket_id: int) -> Optional[Ticket]:
    return db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()


def create_ticket(db: Session, ticket: TicketCreate) -> Ticket:
    db_ticket = Ticket(**ticket.model_dump())
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket


def update_ticket(db: Session, ticket_id: int, ticket_update: TicketUpdate) -> Optional[Ticket]:
    db_ticket = get_ticket(db, ticket_id)
    if not db_ticket:
        return None
    update_data = ticket_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_ticket, field, value)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket


def delete_ticket(db: Session, ticket_id: int) -> bool:
    db_ticket = get_ticket(db, ticket_id)
    if not db_ticket:
        return False
    db.delete(db_ticket)
    db.commit()
    return True


def search_tickets(
    db: Session,
    keyword: str = "",
    status: Optional[str] = None,
    category: Optional[str] = None,
    priority: Optional[str] = None,
    page: int = 1,
    page_size: int = 10,
) -> Tuple[List[Ticket], int]:
    query = db.query(Ticket)

    if keyword:
        kw = f"%{keyword}%"
        query = query.filter(
            Ticket.employee_name.ilike(kw)
            | Ticket.description.ilike(kw)
            | Ticket.issue_category.ilike(kw)
            | Ticket.department.ilike(kw)
        )

    query = _apply_filters(query, status, category, priority)
    total = query.count()
    query = query.order_by(desc(Ticket.created_at))
    offset = (page - 1) * page_size
    tickets = query.offset(offset).limit(page_size).all()
    return tickets, total


def get_stats(db: Session):
    total = db.query(func.count(Ticket.ticket_id)).scalar() or 0

    status_counts = (
        db.query(Ticket.status, func.count(Ticket.ticket_id))
        .group_by(Ticket.status)
        .all()
    )
    status_map = {s: c for s, c in status_counts}

    priority_counts = (
        db.query(Ticket.priority, func.count(Ticket.ticket_id))
        .group_by(Ticket.priority)
        .all()
    )
    by_priority = {p: c for p, c in priority_counts}

    category_counts = (
        db.query(Ticket.issue_category, func.count(Ticket.ticket_id))
        .group_by(Ticket.issue_category)
        .all()
    )
    by_category = {cat: c for cat, c in category_counts}

    recent = (
        db.query(Ticket)
        .order_by(desc(Ticket.created_at))
        .limit(5)
        .all()
    )

    return {
        "total_tickets": total,
        "open_tickets": status_map.get("Open", 0),
        "in_progress_tickets": status_map.get("In Progress", 0),
        "resolved_tickets": status_map.get("Resolved", 0),
        "closed_tickets": status_map.get("Closed", 0),
        "by_priority": by_priority,
        "by_category": by_category,
        "recent_tickets": recent,
    }
