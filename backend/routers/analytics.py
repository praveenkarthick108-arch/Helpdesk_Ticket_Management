from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, case
from sqlalchemy.orm import Session

from database import get_db
from models import AnalyticsTicket, EtlJobLog
from schemas import (
    CategoryDistributionResponse, CategoryDistributionItem,
    PriorityDistributionResponse, PriorityDistributionItem,
    DepartmentBreakdownResponse, DepartmentBreakdownItem,
    MonthlyTrendResponse, MonthlyTrendItem,
    ResolutionTimeResponse, ResolutionTimeItem,
    EtlStatusResponse, EtlJobStatus,
    EtlTriggerRequest,
)

router = APIRouter(prefix="/analytics", tags=["analytics"])

# Resolve datasets directory relative to this file (backend/routers/ → project root/datasets/)
_DATASETS_DIR = Path(__file__).resolve().parent.parent.parent / "datasets"


@router.get("/category-distribution", response_model=CategoryDistributionResponse)
def category_distribution(db: Session = Depends(get_db)):
    rows = (
        db.query(AnalyticsTicket.issue_category, func.count().label("count"))
        .group_by(AnalyticsTicket.issue_category)
        .order_by(func.count().desc())
        .all()
    )
    total = sum(r.count for r in rows)
    data = [
        CategoryDistributionItem(
            category=r.issue_category,
            count=r.count,
            percentage=round(r.count / total * 100, 1) if total else 0.0,
        )
        for r in rows
    ]
    return CategoryDistributionResponse(data=data, total=total)


@router.get("/priority-distribution", response_model=PriorityDistributionResponse)
def priority_distribution(db: Session = Depends(get_db)):
    order = ["Critical", "High", "Medium", "Low"]
    rows = (
        db.query(AnalyticsTicket.priority, func.count().label("count"))
        .group_by(AnalyticsTicket.priority)
        .all()
    )
    total = sum(r.count for r in rows)
    rows_sorted = sorted(rows, key=lambda r: order.index(r.priority) if r.priority in order else 99)
    data = [
        PriorityDistributionItem(
            priority=r.priority,
            count=r.count,
            percentage=round(r.count / total * 100, 1) if total else 0.0,
        )
        for r in rows_sorted
    ]
    return PriorityDistributionResponse(data=data, total=total)


@router.get("/department-breakdown", response_model=DepartmentBreakdownResponse)
def department_breakdown(db: Session = Depends(get_db)):
    rows = (
        db.query(
            AnalyticsTicket.department,
            func.count().label("total"),
            func.sum(case((AnalyticsTicket.status == "Open", 1), else_=0)).label("open"),
            func.sum(case((AnalyticsTicket.status == "In Progress", 1), else_=0)).label("in_progress"),
            func.sum(case((AnalyticsTicket.status == "Resolved", 1), else_=0)).label("resolved"),
            func.sum(case((AnalyticsTicket.status == "Closed", 1), else_=0)).label("closed"),
        )
        .group_by(AnalyticsTicket.department)
        .order_by(func.count().desc())
        .all()
    )
    data = [
        DepartmentBreakdownItem(
            department=r.department,
            total=r.total,
            open=r.open or 0,
            in_progress=r.in_progress or 0,
            resolved=r.resolved or 0,
            closed=r.closed or 0,
        )
        for r in rows
    ]
    return DepartmentBreakdownResponse(data=data)


@router.get("/monthly-trends", response_model=MonthlyTrendResponse)
def monthly_trends(db: Session = Depends(get_db)):
    rows = (
        db.query(
            AnalyticsTicket.month_year,
            func.count().label("total"),
            func.sum(case((AnalyticsTicket.status == "Open", 1), else_=0)).label("open"),
            func.sum(case((AnalyticsTicket.status == "In Progress", 1), else_=0)).label("in_progress"),
            func.sum(case((AnalyticsTicket.status == "Resolved", 1), else_=0)).label("resolved"),
            func.sum(case((AnalyticsTicket.status == "Closed", 1), else_=0)).label("closed"),
        )
        .group_by(AnalyticsTicket.month_year)
        .order_by(AnalyticsTicket.month_year)
        .all()
    )
    data = [
        MonthlyTrendItem(
            month=r.month_year,
            total=r.total,
            open=r.open or 0,
            in_progress=r.in_progress or 0,
            resolved=r.resolved or 0,
            closed=r.closed or 0,
        )
        for r in rows
    ]
    return MonthlyTrendResponse(data=data)


@router.get("/resolution-time", response_model=ResolutionTimeResponse)
def resolution_time(db: Session = Depends(get_db)):
    rows = (
        db.query(
            AnalyticsTicket.month_year,
            func.avg(AnalyticsTicket.resolution_time_hrs).label("avg_hours"),
            func.min(AnalyticsTicket.resolution_time_hrs).label("min_hours"),
            func.max(AnalyticsTicket.resolution_time_hrs).label("max_hours"),
            func.count().label("ticket_count"),
        )
        .filter(AnalyticsTicket.resolution_time_hrs.isnot(None))
        .group_by(AnalyticsTicket.month_year)
        .order_by(AnalyticsTicket.month_year)
        .all()
    )

    overall = (
        db.query(func.avg(AnalyticsTicket.resolution_time_hrs))
        .filter(AnalyticsTicket.resolution_time_hrs.isnot(None))
        .scalar()
    )

    data = [
        ResolutionTimeItem(
            month=r.month_year,
            avg_hours=round(r.avg_hours or 0, 1),
            min_hours=round(r.min_hours or 0, 1),
            max_hours=round(r.max_hours or 0, 1),
            ticket_count=r.ticket_count,
        )
        for r in rows
    ]
    return ResolutionTimeResponse(
        data=data,
        overall_avg_hours=round(overall, 1) if overall else None,
    )


@router.get("/etl-status", response_model=EtlStatusResponse)
def etl_status(db: Session = Depends(get_db)):
    latest = (
        db.query(EtlJobLog)
        .order_by(EtlJobLog.started_at.desc())
        .first()
    )
    total = db.query(func.count()).select_from(AnalyticsTicket).scalar() or 0
    return EtlStatusResponse(
        latest_job=EtlJobStatus.model_validate(latest) if latest else None,
        total_analytics_records=total,
    )


@router.post("/run-etl")
def trigger_etl(payload: EtlTriggerRequest, db: Session = Depends(get_db)):
    from etl.pipeline import run_etl

    csv_path = _DATASETS_DIR / payload.csv_filename
    if not csv_path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"CSV file not found: {payload.csv_filename}. "
                   f"Place it in the datasets/ folder.",
        )
    result = run_etl(str(csv_path), db)
    return result
