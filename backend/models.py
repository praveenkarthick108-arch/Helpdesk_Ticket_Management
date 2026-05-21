from datetime import datetime, UTC
from sqlalchemy import Column, Float, Integer, String, Text, DateTime
from database import Base


def _utcnow():
    return datetime.now(UTC).replace(tzinfo=None)


class Ticket(Base):
    __tablename__ = "tickets"

    ticket_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    employee_name = Column(String(100), nullable=False)
    department = Column(String(100), nullable=False)
    issue_category = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(String(20), nullable=False, default="Medium")
    status = Column(String(20), nullable=False, default="Open")
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=_utcnow)


class AnalyticsTicket(Base):
    __tablename__ = "analytics_tickets"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    source_ticket_id = Column(Integer, nullable=True)
    employee_name = Column(String(100), nullable=False)
    department = Column(String(100), nullable=False)
    issue_category = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(String(20), nullable=False)
    status = Column(String(20), nullable=False)
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False)
    resolved_at = Column(DateTime, nullable=True)
    resolution_time_hrs = Column(Float, nullable=True)
    month_year = Column(String(7), nullable=False, index=True)
    etl_batch_id = Column(String(36), nullable=False, index=True)
    loaded_at = Column(DateTime, nullable=False, default=_utcnow)


class EtlJobLog(Base):
    __tablename__ = "etl_job_log"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    batch_id = Column(String(36), nullable=False, unique=True)
    status = Column(String(20), nullable=False)
    csv_filename = Column(String(255), nullable=True)
    rows_extracted = Column(Integer, nullable=True)
    rows_loaded = Column(Integer, nullable=True)
    rows_skipped = Column(Integer, nullable=True)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime, nullable=False, default=_utcnow)
    finished_at = Column(DateTime, nullable=True)
