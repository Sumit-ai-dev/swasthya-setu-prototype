from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Patient as PatientModel, Consultation as ConsultationModel
from app.schemas.patient import Patient, PatientCreate, PatientDetail

router = APIRouter()

@router.get("/", response_model=List[Patient])
def list_patients(db: Session = Depends(get_db)):
    """Retrieve all registered patients."""
    return db.query(PatientModel).order_by(PatientModel.created_at.desc()).all()

@router.post("/", response_model=Patient)
def create_patient(payload: PatientCreate, db: Session = Depends(get_db)):
    """Register a new patient."""
    db_patient = PatientModel(
        name=payload.name,
        age=payload.age,
        gender=payload.gender,
        is_pregnant=payload.is_pregnant
    )
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

@router.get("/{patient_id}", response_model=PatientDetail)
def get_patient_detail(patient_id: UUID, db: Session = Depends(get_db)):
    """Get full details and history for a specific patient."""
    patient = db.query(PatientModel).filter(PatientModel.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # history is auto-populated via relationship
    return patient
