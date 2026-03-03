import uuid
import json
import boto3
from fastapi import APIRouter
from app.schemas.chatbot import ChatMessage, ChatResponse
from app.core.config import settings

router = APIRouter()

# Simple in-memory session store (replace with Redis/DB in production)
_sessions: dict = {}


def _get_rag_context(question: str) -> tuple[str, list[str]]:
    """
    Retrieves relevant medical guideline context for the question.
    In production: queries pgvector for top-k relevant document chunks.
    For MVP: returns hardcoded context based on keywords.
    """
    q = question.lower()
    if any(w in q for w in ["fever", "temperature", "बुखार"]):
        return (
            "WHO Guideline: For fever, use paracetamol/acetaminophen. "
            "Keep the patient hydrated with ORS or clean water. "
            "A fever above 39°C in children requires immediate medical attention.",
            ["WHO Fever Management Guidelines 2023", "Ayushman Bharat ASHA Worker Handbook"]
        )
    if any(w in q for w in ["diarrhea", "loose motion", "दस्त"]):
        return (
            "ORS (Oral Rehydration Solution) is the first-line treatment for diarrhea. "
            "Zinc supplementation for 10-14 days reduces duration in children under 5. "
            "Seek medical care if blood in stool or fever exceeds 38.5°C.",
            ["WHO Diarrhea Treatment Guidelines", "IMNCI Protocol India"]
        )
    if any(w in q for w in ["baby", "child", "infant", "बच्चा"]):
        return (
            "For infants under 2 months showing any danger signs "
            "(poor feeding, high temperature, seizures), refer immediately to hospital. "
            "Follow IMNCI guidelines for treatment.",
            ["IMNCI Protocol India", "Ayushman Bharat Child Health Guidelines"]
        )
    return (
        "Consult a qualified healthcare worker for personalized advice. "
        "Use the Ayushman Bharat scheme for free treatment at empanelled hospitals.",
        ["Ayushman Bharat PM-JAY Guidelines"]
    )


def _build_chat_prompt(message: str, language: str, context: str, history: list) -> str:
    lang_instruction = "Respond in Hindi in simple language." if language == "hi" else "Respond in simple English."

    history_text = ""
    if history:
        history_text = "\n".join([f"User: {h['user']}\nAssistant: {h['bot']}" for h in history[-3:]])
        history_text = f"\nPrevious conversation:\n{history_text}\n"

    return f"""You are Swasthya-Setu, a helpful rural health assistant for India.
Use the medical guidelines below to answer the user's health question.
Be concise, accurate, and always recommend seeing a doctor for serious concerns.

Medical Guidelines Context:
{context}
{history_text}
User question: {message}

{lang_instruction}
Answer in 3-4 sentences maximum."""


@router.post("/chat", response_model=ChatResponse)
def health_chatbot(payload: ChatMessage):
    """
    RAG-based health chatbot endpoint.
    Retrieves relevant guideline context then generates a response via Bedrock (Llama 3).
    Falls back to context-only response in local dev.
    """
    session_id = payload.session_id or str(uuid.uuid4())
    history = _sessions.get(session_id, [])

    context, sources = _get_rag_context(payload.message)
    prompt = _build_chat_prompt(payload.message, payload.language, context, history)

    response_text = None

    try:
        client = boto3.client("bedrock-runtime", region_name=settings.AWS_REGION)
        body = json.dumps({
            "prompt": f"<|begin_of_text|><|start_header_id|>user<|end_header_id|>\n{prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>",
            "max_gen_len": 300,
            "temperature": 0.2,
        })
        resp = client.invoke_model(
            modelId=settings.CHATBOT_MODEL_ID,
            body=body,
            contentType="application/json",
            accept="application/json",
        )
        result = json.loads(resp["body"].read())
        response_text = result.get("generation", "").strip()

    except Exception:
        # Local dev fallback — return context-based answer
        response_text = (
            f"{context} "
            "For trusted advice, always consult an ASHA worker or visit your nearest primary health centre."
        )

    # Save to session history
    history.append({"user": payload.message, "bot": response_text})
    _sessions[session_id] = history

    return ChatResponse(
        response=response_text,
        sources=sources,
        session_id=session_id,
    )
