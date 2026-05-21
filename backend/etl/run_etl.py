"""
CLI entry point for the ETL pipeline.

Usage (from project root):
    python backend/etl/run_etl.py
    python backend/etl/run_etl.py --csv datasets/historical_tickets.csv

Usage (from backend/ directory):
    python etl/run_etl.py
    python etl/run_etl.py --csv ../datasets/historical_tickets.csv
"""
import argparse
import json
import sys
from pathlib import Path

# Ensure backend/ is on sys.path regardless of where this script is invoked from
_here = Path(__file__).resolve().parent.parent  # backend/
if str(_here) not in sys.path:
    sys.path.insert(0, str(_here))

from database import SessionLocal, Base, engine
import models  # noqa: F401 — registers all ORM models with Base
from etl.pipeline import run_etl


def main():
    parser = argparse.ArgumentParser(description="Run the Helpdesk ETL pipeline")
    parser.add_argument(
        "--csv",
        default=str(Path(_here).parent / "datasets" / "historical_tickets.csv"),
        help="Path to the CSV file to load (default: datasets/historical_tickets.csv)",
    )
    args = parser.parse_args()

    csv_path = Path(args.csv)
    if not csv_path.exists():
        print(f"ERROR: CSV file not found: {csv_path}", file=sys.stderr)
        sys.exit(1)

    # Ensure all tables exist (safe to run even if already created)
    Base.metadata.create_all(bind=engine)

    print(f"Starting ETL pipeline...")
    print(f"  CSV: {csv_path}")

    db = SessionLocal()
    try:
        result = run_etl(str(csv_path), db)
        print("\nETL completed successfully:")
        print(json.dumps(result, indent=2))
        sys.exit(0)
    except Exception as exc:
        print(f"\nETL failed: {exc}", file=sys.stderr)
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
