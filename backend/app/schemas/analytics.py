from pydantic import BaseModel
from typing import Dict


class AnalyticsSummary(BaseModel):
    total_consultations: int
    triage_distribution: Dict[str, int]   # {"GREEN": x, "YELLOW": y, "RED": z}
    daily_active_users: int
    avg_response_time: str
    pregnant_patients_count: int
