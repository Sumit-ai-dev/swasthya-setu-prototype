import uuid
import json
import boto3
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.schemas.triage import TriageRequest, TriageResponse
from app.core.config import settings
from app.db.database import get_db
from app.db.models import Consultation

router = APIRouter()


def _build_triage_prompt(symptoms: list, language: str) -> str:
    symptom_str = ", ".join(symptoms)
    lang_instruction = "Respond in Hindi." if language == "hi" else "Respond in English."

    return f"""You are a professional clinical triage assistant for rural India healthcare workers, following WHO ETAT (Emergency Triage Assessment and Treatment) and IMAI standards.

Patient symptoms: {symptom_str}

CRITICAL TRIAGE RULES:
1. RED (EMERGENCY): Look for Airway, Breathing, Circulation, or Disability emergencies (e.g., chest pain, severe bleeding, difficulty breathing, unconsciousness).
2. YELLOW (PRIORITY): Look for serious but stable conditions (e.g., persistent fever > 2 weeks, severe persistent pain, jaundice).
3. GREEN (NON-URGENT): Mild, self-limiting symptoms only. 
4. CANCER/MALIGNANCY: Any mention of "Cancer", "Tumor", or "New Lumps" MUST be RED.

WARNING: Any symptoms suggestive of Cancer, Tumor, or suspected Malignancy MUST be classified as RED.

{lang_instruction}

Return a JSON object exactly like this:
{{
  "triage_level": "GREEN" | "YELLOW" | "RED",
  "confidence": 0.0 to 1.0,
  "advice": "clear actionable advice in 2-3 sentences, specifying if an emergency or priority sign was detected"
}}

Return ONLY the JSON. No explanation outside the JSON."""


@router.post("/triage", response_model=TriageResponse)
def symptom_triage(payload: TriageRequest, db: Session = Depends(get_db)):
    """
    Accepts symptoms and returns a triage classification (GREEN/YELLOW/RED)
    using Amazon Bedrock (Claude 3 Haiku).

    Falls back to rule-based classification when Bedrock is unavailable (local dev).
    """
    prompt = _build_triage_prompt(payload.symptoms, payload.language)

    try:
        client = boto3.client(
            "bedrock-runtime",
            region_name=settings.AWS_REGION,
        )
        body = json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 256,
            "temperature": 0.1,
            "messages": [{"role": "user", "content": prompt}]
        })
        response = client.invoke_model(
            modelId=settings.TRIAGE_MODEL_ID,
            body=body,
            contentType="application/json",
            accept="application/json",
        )
        result = json.loads(response["body"].read())
        text = result["content"][0]["text"]
        parsed = json.loads(text)

        consultation_id = str(uuid.uuid4())
        
        # Log to Database
        db_consultation = Consultation(
            id=uuid.UUID(consultation_id),
            session_id=consultation_id, # Link session to ID for now
            type="TRIAGE",
            triage_level=parsed["triage_level"],
            query=", ".join(payload.symptoms),
            response=parsed["advice"],
            language=payload.language
        )
        db.add(db_consultation)
        db.commit()

        return TriageResponse(
            triage_level=parsed["triage_level"],
            confidence=parsed["confidence"],
            advice=parsed["advice"],
            language=payload.language,
            consultation_id=consultation_id,
        )

    except Exception:
        # --- Local dev fallback (WHO-based rules) ---
        symptoms_lower = [s.lower() for s in payload.symptoms]
        
        # WHO Emergency Signs (RED)
        emergency_signs = [
            "chest pain", "difficulty breathing", "unconscious", "seizure", 
            "stroke", "severe bleeding", "poisoning", "trauma", "choking",
            "cancer", "lump", "mass", "tumor"
        ]
        
        # WHO Priority Signs (YELLOW) - Including Oncology/Chronic indicators
        priority_signs = [
            "weight loss", "persistent fever", 
            "severe pain", "diabetes", "heart disease", "vision loss", 
            "persistent cough", "tb", "tuberculosis", "hiv", "jaundice"
        ]

        if any(f in s for f in emergency_signs for s in symptoms_lower):
            level, confidence, advice = (
                "RED", 0.95,
                "EMERGENCY: Serious symptoms detected. Go to the nearest hospital immediately. Do not wait."
                if payload.language == "en" else
                "आपातकालीन: गंभीर लक्षण। तुरंत निकटतम अस्पताल जाएं।"
            )
        elif any(f in s for f in priority_signs for s in symptoms_lower):
            level, confidence, advice = (
                "YELLOW", 0.88,
                "PRIORITY: Potential serious condition detected (e.g., chronic illness or oncology risk). Visit a clinic for clinical assessment soon."
                if payload.language == "en" else
                "प्राथमिकता: संभावित गंभीर स्थिति। शीघ्र जांच के लिए क्लिनिक जाएं।"
            )
        else:
            level, confidence, advice = (
                "GREEN", 0.85,
                "Non-urgent symptoms. Rest, stay hydrated, and monitor. Consult a doctor if they weaken or persist."
                if payload.language == "en" else
                "लक्षण हल्के हैं। आराम करें। यदि बदतर हों तो डॉक्टर से मिलें।"
            )

        consultation_id = str(uuid.uuid4())
        
        # Log to Database
        db_consultation = Consultation(
            id=uuid.UUID(consultation_id),
            session_id=consultation_id,
            type="TRIAGE",
            triage_level=level,
            query=", ".join(payload.symptoms),
            response=advice,
            language=payload.language
        )
        db.add(db_consultation)
        db.commit()

        return TriageResponse(
            triage_level=level,
            confidence=confidence,
            advice=advice,
            language=payload.language,
            consultation_id=consultation_id,
        )
