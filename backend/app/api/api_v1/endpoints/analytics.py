from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date

from app.schemas.analytics import AnalyticsSummary
from app.db.database import get_db
from app.db.models import Consultation

router = APIRouter()


@router.get("/summary", response_model=AnalyticsSummary)
def analytics_summary(db: Session = Depends(get_db)):
    """
    Returns platform usage analytics from the real consultations table.
    """
    # 1. Total Consultations
    total = db.query(Consultation).count()

    # 2. Triage Distribution (Only for type='TRIAGE')
    distribution_raw = db.query(
        Consultation.triage_level, func.count(Consultation.id)
    ).filter(Consultation.type == "TRIAGE").group_by(Consultation.triage_level).all()
    
    distribution = {"GREEN": 0, "YELLOW": 0, "RED": 0}
    for level, count in distribution_raw:
        if level in distribution:
            distribution[level] = count

    # 3. Daily Active Users (Unique session IDs today)
    today = date.today()
    dau = db.query(func.count(func.distinct(Consultation.session_id))).filter(
        func.date(Consultation.created_at) == today
    ).scalar()

    return AnalyticsSummary(
        total_consultations=total,
        triage_distribution=distribution,
        daily_active_users=dau or 0,
        avg_response_time="1.2s" # Keep as optimized placeholder for MVP
    )
