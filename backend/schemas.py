from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel, ConfigDict, field_validator


class IssueCategory(str, Enum):
    VPN_ISSUE = "VPN Issue"
    PASSWORD_RESET = "Password Reset"
    SOFTWARE_INSTALLATION = "Software Installation"
    LAPTOP_ISSUE = "Laptop Issue"
    EMAIL_ACCESS = "Email Access"
    NETWORK_CONNECTIVITY = "Network Connectivity"
    HARDWARE_REQUEST = "Hardware Request"


class Priority(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


class Status(str, Enum):
    OPEN = "Open"
    IN_PROGRESS = "In Progress"
    RESOLVED = "Resolved"
    CLOSED = "Closed"


class TicketBase(BaseModel):
    employee_name: str
    department: str
    issue_category: IssueCategory
    description: str
    priority: Priority
    status: Status = Status.OPEN
    resolution_notes: Optional[str] = None

    @field_validator("employee_name")
    @classmethod
    def name_must_not_be_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Employee name cannot be empty")
        return v.strip()

    @field_validator("description")
    @classmethod
    def description_min_length(cls, v: str) -> str:
        if len(v.strip()) < 10:
            raise ValueError("Description must be at least 10 characters")
        return v.strip()


class TicketCreate(TicketBase):
    pass


class TicketUpdate(BaseModel):
    employee_name: Optional[str] = None
    department: Optional[str] = None
    issue_category: Optional[IssueCategory] = None
    description: Optional[str] = None
    priority: Optional[Priority] = None
    status: Optional[Status] = None
    resolution_notes: Optional[str] = None


class TicketResponse(TicketBase):
    model_config = ConfigDict(from_attributes=True)

    ticket_id: int
    created_at: datetime


class TicketListResponse(BaseModel):
    tickets: List[TicketResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class StatsResponse(BaseModel):
    total_tickets: int
    open_tickets: int
    in_progress_tickets: int
    resolved_tickets: int
    closed_tickets: int
    by_priority: Dict[str, int]
    by_category: Dict[str, int]
    recent_tickets: List[TicketResponse]
