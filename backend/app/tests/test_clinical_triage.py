import pytest
from app.api.api_v1.endpoints.triage import symptom_triage
from app.schemas.triage import TriageRequest
from unittest.mock import MagicMock

def test_triage_priority_cancer():
    # Simulate a request for a chronic condition like Cancer
    payload = TriageRequest(symptoms=["unexplained lump", "cancer"], language="en")
    
    # We mock the DB session
    db = MagicMock()
    
    # We call the function (it will hit fallback if Bedrock isn't configured in test env)
    response = symptom_triage(payload, db=db)
    
    assert response.triage_level == "RED"
    assert "EMERGENCY" in response.advice

def test_triage_priority_emergency():
    payload = TriageRequest(symptoms=["chest pain", "difficulty breathing"], language="en")
    db = MagicMock()
    response = symptom_triage(payload, db=db)
    
    assert response.triage_level == "RED"
    assert "EMERGENCY" in response.advice

def test_triage_green_case():
    payload = TriageRequest(symptoms=["runny nose"], language="en")
    db = MagicMock()
    response = symptom_triage(payload, db=db)
    
    assert response.triage_level == "GREEN"
