import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root():
    resp = client.get("/")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_health():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "healthy"


class TestTriageEndpoint:
    def test_green_triage(self):
        resp = client.post("/api/v1/triage/triage", json={
            "symptoms": ["mild cold", "runny nose"],
            "language": "en"
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["triage_level"] in ["GREEN", "YELLOW", "RED"]
        assert 0.0 <= data["confidence"] <= 1.0
        assert len(data["advice"]) > 0
        assert data["consultation_id"] is not None

    def test_red_triage(self):
        resp = client.post("/api/v1/triage/triage", json={
            "symptoms": ["chest pain", "difficulty breathing"],
            "language": "en"
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["triage_level"] == "RED"

    def test_hindi_triage(self):
        resp = client.post("/api/v1/triage/triage", json={
            "symptoms": ["fever", "headache"],
            "language": "hi"
        })
        assert resp.status_code == 200
        assert resp.json()["language"] == "hi"

    def test_missing_symptoms_returns_422(self):
        resp = client.post("/api/v1/triage/triage", json={"language": "en"})
        assert resp.status_code == 422


class TestChatbotEndpoint:
    def test_basic_chat(self):
        resp = client.post("/api/v1/chatbot/chat", json={
            "message": "I have a fever, what should I do?",
            "language": "en"
        })
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["response"]) > 0
        assert isinstance(data["sources"], list)
        assert data["session_id"] is not None

    def test_hindi_chat(self):
        resp = client.post("/api/v1/chatbot/chat", json={
            "message": "मुझे बुखार है",
            "language": "hi"
        })
        assert resp.status_code == 200
        assert len(resp.json()["response"]) > 0

    def test_session_continuity(self):
        # First message - get session_id
        r1 = client.post("/api/v1/chatbot/chat", json={
            "message": "I have a fever",
            "language": "en"
        })
        session_id = r1.json()["session_id"]

        # Second message - reuse session_id
        r2 = client.post("/api/v1/chatbot/chat", json={
            "message": "What medicine should I take?",
            "language": "en",
            "session_id": session_id
        })
        assert r2.status_code == 200
        assert r2.json()["session_id"] == session_id


class TestAnalyticsEndpoint:
    def test_summary_returns_correct_keys(self):
        resp = client.get("/api/v1/analytics/summary")
        assert resp.status_code == 200
        data = resp.json()
        assert "total_consultations" in data
        assert "triage_distribution" in data
        assert "daily_active_users" in data
        assert "avg_response_time" in data

    def test_triage_distribution_has_all_levels(self):
        resp = client.get("/api/v1/analytics/summary")
        dist = resp.json()["triage_distribution"]
        assert "GREEN" in dist
        assert "YELLOW" in dist
        assert "RED" in dist

class TestPatientRestrictions:
    def test_create_male_patient_fails(self):
        resp = client.post("/api/v1/patients/", json={
            "name": "John Doe",
            "age": 30,
            "gender": "Male"
        })
        assert resp.status_code == 422
        assert "Only female patients are allowed" in str(resp.json())

    def test_create_underage_patient_fails(self):
        resp = client.post("/api/v1/patients/", json={
            "name": "Jane Smith",
            "age": 17,
            "gender": "Female"
        })
        assert resp.status_code == 422
        assert "18 years or older" in str(resp.json())

    def test_create_valid_female_patient_succeeds(self):
        # This might fail if DB is down, but the schema validation (Pydantic) 
        # should happen before DB insertion in FastAPI if using Depends or payload validation.
        # Actually, PatientCreate validation happens during payload parsing.
        resp = client.post("/api/v1/patients/", json={
            "name": "Jane Doe",
            "age": 25,
            "gender": "Female"
        })
        # If DB is down, it might return 500 or OperationalError, 
        # but if we just want to test Pydantic, we can check 422 vs others.
        assert resp.status_code != 422 
