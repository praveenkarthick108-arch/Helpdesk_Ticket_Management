import uuid
from datetime import datetime, UTC
from pathlib import Path
from typing import Optional

import pandas as pd
from sqlalchemy.orm import Session

from models import AnalyticsTicket, EtlJobLog

# ── Canonical value maps ─────────────────────────────────────────────────────

CATEGORY_MAP = {
    "vpn issue": "VPN Issue", "vpn": "VPN Issue",
    "password reset": "Password Reset", "pwd reset": "Password Reset",
    "software installation": "Software Installation",
    "software install": "Software Installation",
    "sw installation": "Software Installation",
    "laptop issue": "Laptop Issue", "laptop": "Laptop Issue",
    "email access": "Email Access", "email": "Email Access",
    "network connectivity": "Network Connectivity",
    "network": "Network Connectivity",
    "hardware request": "Hardware Request", "hardware": "Hardware Request",
}

PRIORITY_MAP = {
    "critical": "Critical", "high": "High",
    "medium": "Medium", "med": "Medium",
    "low": "Low",
}

STATUS_MAP = {
    "open": "Open",
    "in progress": "In Progress",
    "in-progress": "In Progress",
    "inprogress": "In Progress",
    "resolved": "Resolved", "resolve": "Resolved", "done": "Resolved",
    "closed": "Closed", "close": "Closed",
}

VALID_CATEGORIES = set(CATEGORY_MAP.values())
VALID_PRIORITIES = set(PRIORITY_MAP.values())
VALID_STATUSES = set(STATUS_MAP.values())


def extract(csv_path: str) -> pd.DataFrame:
    return pd.read_csv(csv_path, encoding="utf-8", on_bad_lines="skip", quotechar='"')


def transform(df: pd.DataFrame) -> tuple[pd.DataFrame, int]:
    initial_count = len(df)

    # 1. Drop exact duplicate rows
    df = df.drop_duplicates()

    # 2. Strip whitespace from all string columns
    str_cols = df.select_dtypes(include="object").columns
    for col in str_cols:
        df[col] = df[col].astype(str).str.strip()
        df[col] = df[col].replace("nan", None)

    # 3–5. Normalize enum fields
    df["issue_category"] = (
        df["issue_category"]
        .str.lower()
        .map(CATEGORY_MAP)
    )
    df["priority"] = (
        df["priority"]
        .str.lower()
        .map(PRIORITY_MAP)
    )
    df["status"] = (
        df["status"]
        .str.lower()
        .map(STATUS_MAP)
    )

    # 6. Parse datetimes
    df["created_at"] = pd.to_datetime(df["created_at"], errors="coerce")
    df["resolved_at"] = pd.to_datetime(df.get("resolved_at", None), errors="coerce")

    # 7. Drop rows with unparseable required fields
    before_drop = len(df)
    df = df[
        df["created_at"].notna()
        & df["priority"].isin(VALID_PRIORITIES)
        & df["status"].isin(VALID_STATUSES)
        & df["issue_category"].isin(VALID_CATEGORIES)
        & df["employee_name"].notna()
        & df["department"].notna()
    ].copy()
    skipped = initial_count - len(df)

    # 8. Calculate resolution_time_hrs
    df["resolution_time_hrs"] = None
    resolved_mask = (
        df["status"].isin(["Resolved", "Closed"])
        & df["resolved_at"].notna()
    )
    if resolved_mask.any():
        delta = (
            df.loc[resolved_mask, "resolved_at"] - df.loc[resolved_mask, "created_at"]
        ).dt.total_seconds() / 3600
        df.loc[resolved_mask, "resolution_time_hrs"] = delta
        # Clamp negative times to None (data error)
        neg = df["resolution_time_hrs"].notna() & (df["resolution_time_hrs"] < 0)
        df.loc[neg, "resolution_time_hrs"] = None

    # 9. Derive month_year
    df["month_year"] = df["created_at"].dt.strftime("%Y-%m")

    # 10. Fill NaN text fields with None
    for col in ["resolution_notes", "description"]:
        if col in df.columns:
            df[col] = df[col].where(df[col].notna() & (df[col] != "None"), None)

    return df, skipped


def load(df: pd.DataFrame, db: Session, batch_id: str) -> int:
    # Full-truncate-and-reload: clear existing analytics data
    db.query(AnalyticsTicket).delete()

    loaded_at = datetime.now(UTC).replace(tzinfo=None)
    records = df.to_dict(orient="records")
    for row in records:
        res_notes = row.get("resolution_notes")
        description = row.get("description")
        obj = AnalyticsTicket(
            source_ticket_id=_int_or_none(row.get("ticket_id")),
            employee_name=str(row["employee_name"]),
            department=str(row["department"]),
            issue_category=str(row["issue_category"]),
            description=None if _is_na(description) else str(description),
            priority=str(row["priority"]),
            status=str(row["status"]),
            resolution_notes=None if _is_na(res_notes) else str(res_notes),
            created_at=_dt_or_none(row.get("created_at")),
            resolved_at=_dt_or_none(row.get("resolved_at")),
            resolution_time_hrs=_float_or_none(row.get("resolution_time_hrs")),
            month_year=str(row["month_year"]),
            etl_batch_id=batch_id,
            loaded_at=loaded_at,
        )
        db.add(obj)
    db.commit()
    return len(records)


def run_etl(csv_path: str, db: Session) -> dict:
    batch_id = str(uuid.uuid4())
    csv_filename = Path(csv_path).name
    started_at = datetime.now(UTC).replace(tzinfo=None)

    # Create job log entry
    job = EtlJobLog(
        batch_id=batch_id,
        status="running",
        csv_filename=csv_filename,
        started_at=started_at,
    )
    db.add(job)
    db.commit()

    try:
        raw_df = extract(csv_path)
        rows_extracted = len(raw_df)

        clean_df, rows_skipped = transform(raw_df)
        rows_loaded = load(clean_df, db, batch_id)

        finished_at = datetime.now(UTC).replace(tzinfo=None)
        job.status = "success"
        job.rows_extracted = rows_extracted
        job.rows_loaded = rows_loaded
        job.rows_skipped = rows_skipped
        job.finished_at = finished_at
        db.commit()

        return {
            "batch_id": batch_id,
            "status": "success",
            "csv_filename": csv_filename,
            "rows_extracted": rows_extracted,
            "rows_loaded": rows_loaded,
            "rows_skipped": rows_skipped,
            "started_at": started_at.isoformat(),
            "finished_at": finished_at.isoformat(),
        }

    except Exception as exc:
        finished_at = datetime.now(UTC).replace(tzinfo=None)
        job.status = "failed"
        job.error_message = str(exc)
        job.finished_at = finished_at
        db.commit()
        raise


# ── Helpers ──────────────────────────────────────────────────────────────────

def _is_na(val) -> bool:
    """True for None, Python NaN, numpy NaN, pandas NaT."""
    if val is None:
        return True
    try:
        return pd.isna(val)
    except (TypeError, ValueError):
        return False


def _int_or_none(val) -> Optional[int]:
    if _is_na(val):
        return None
    try:
        return int(val)
    except (ValueError, TypeError):
        return None


def _float_or_none(val) -> Optional[float]:
    if _is_na(val):
        return None
    try:
        return float(val)
    except (ValueError, TypeError):
        return None


def _dt_or_none(val) -> Optional[datetime]:
    if _is_na(val):
        return None
    if isinstance(val, datetime):
        return val.replace(tzinfo=None)
    if hasattr(val, "to_pydatetime"):
        dt = val.to_pydatetime()
        return dt.replace(tzinfo=None) if dt else None
    return None
