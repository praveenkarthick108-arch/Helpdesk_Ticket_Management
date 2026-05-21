"""Run once to populate the database with sample tickets for demonstration."""
from database import SessionLocal, engine, Base
from models import Ticket
from datetime import datetime, timedelta
import random

Base.metadata.create_all(bind=engine)

SAMPLE_TICKETS = [
    {
        "employee_name": "Alice Johnson",
        "department": "Engineering",
        "issue_category": "VPN Issue",
        "description": "Unable to connect to the company VPN since this morning. Getting 'authentication failed' error repeatedly. Have tried restarting but no luck.",
        "priority": "High",
        "status": "Open",
        "resolution_notes": None,
    },
    {
        "employee_name": "Bob Martinez",
        "department": "Sales",
        "issue_category": "Password Reset",
        "description": "Locked out of my Salesforce account after too many failed login attempts. Need urgent access for client meeting at 3pm today.",
        "priority": "Critical",
        "status": "In Progress",
        "resolution_notes": "Contacted Salesforce admin. Resetting credentials now.",
    },
    {
        "employee_name": "Carol White",
        "department": "Marketing",
        "issue_category": "Software Installation",
        "description": "Need Adobe Creative Cloud installed on my work laptop for the new campaign project starting next week.",
        "priority": "Medium",
        "status": "Open",
        "resolution_notes": None,
    },
    {
        "employee_name": "David Kim",
        "department": "Finance",
        "issue_category": "Laptop Issue",
        "description": "My laptop screen keeps flickering randomly. It gets worse when connected to the external monitor. Started happening 3 days ago.",
        "priority": "High",
        "status": "In Progress",
        "resolution_notes": "Hardware team scheduled to inspect on Friday.",
    },
    {
        "employee_name": "Emma Davis",
        "department": "HR",
        "issue_category": "Email Access",
        "description": "Cannot access my company email on my phone. The Outlook app keeps crashing on startup after the recent phone OS update.",
        "priority": "Medium",
        "status": "Resolved",
        "resolution_notes": "Reinstalled Outlook app and reconfigured account settings. Issue resolved.",
    },
    {
        "employee_name": "Frank Lee",
        "department": "Operations",
        "issue_category": "Network Connectivity",
        "description": "Experiencing very slow internet speeds at my workstation in the 3rd floor east wing. Downloads maxing at 1Mbps instead of usual 100Mbps.",
        "priority": "Medium",
        "status": "Open",
        "resolution_notes": None,
    },
    {
        "employee_name": "Grace Wilson",
        "department": "Product",
        "issue_category": "Hardware Request",
        "description": "Requesting a second monitor for my workstation to improve productivity during development sprints. Current single monitor setup is limiting workflow.",
        "priority": "Low",
        "status": "Open",
        "resolution_notes": None,
    },
    {
        "employee_name": "Henry Brown",
        "department": "IT",
        "issue_category": "Software Installation",
        "description": "Need Docker Desktop installed on the new developer machine assigned to the backend team. Required for local environment setup.",
        "priority": "High",
        "status": "Resolved",
        "resolution_notes": "Docker Desktop 4.x installed and verified working. User confirmed setup complete.",
    },
    {
        "employee_name": "Iris Chen",
        "department": "Legal",
        "issue_category": "VPN Issue",
        "description": "VPN disconnects every 30 minutes while working from home. Very disruptive during video calls and document reviews.",
        "priority": "Medium",
        "status": "Closed",
        "resolution_notes": "Updated VPN client to latest version and configured keepalive settings. Stable for 3 days now.",
    },
    {
        "employee_name": "Jack Thompson",
        "department": "Customer Support",
        "issue_category": "Password Reset",
        "description": "New employee onboarding - need initial credentials set up for Zendesk, Slack, and internal Wiki access.",
        "priority": "High",
        "status": "Resolved",
        "resolution_notes": "All accounts created and credentials sent to employee's personal email for first login.",
    },
]

def seed():
    db = SessionLocal()
    count = db.query(Ticket).count()
    if count > 0:
        print(f"Database already has {count} tickets. Skipping seed.")
        db.close()
        return

    base_time = datetime.utcnow() - timedelta(days=14)
    for i, t in enumerate(SAMPLE_TICKETS):
        ticket = Ticket(
            **t,
            created_at=base_time + timedelta(days=i, hours=random.randint(0, 8)),
        )
        db.add(ticket)

    db.commit()
    print(f"Seeded {len(SAMPLE_TICKETS)} sample tickets successfully.")
    db.close()

if __name__ == "__main__":
    seed()
