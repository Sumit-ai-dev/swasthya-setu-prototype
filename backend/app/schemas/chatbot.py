from pydantic import BaseModel
from typing import List, Optional


class ChatMessage(BaseModel):
    message: str
    language: str = "en"
    session_id: Optional[str] = None   # For conversation context
    consultation_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    sources: List[str] = []
    session_id: Optional[str] = None
