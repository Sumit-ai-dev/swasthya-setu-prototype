from fastapi import APIRouter
from app.schemas.analytics import AnalyticsSummary

router = APIRouter()


@router.get("/summary", response_model=AnalyticsSummary)
def analytics_summary():
    """
    Returns platform usage analytics.
    In production: queries RDS PostgreSQL for real counts.
    For MVP demo: returns realistic mock data.
    """
    # TODO (team): Replace with real DB queries from the `consultations` table
    return AnalyticsSummary(
        total_consultations=1285,
        triage_distribution={"GREEN": 1005, "YELLOW": 218, "RED": 62},
        daily_active_users=342,
        avg_response_time="1.8s"
    )
