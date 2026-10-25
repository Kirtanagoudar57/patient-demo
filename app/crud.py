from sqlalchemy.orm import Session
from app.models import PatientDB
from app.schemas import PatientSchema

from typing import Optional

def get_patient(db: Session, patient_id: int):
    """
    Fetch a single patient from the database by their ID.
    """
    return db.query(PatientDB).filter(PatientDB.id == patient_id).first()

def get_patients(
    db: Session, 
    name: Optional[str] = None, 
    gender: Optional[str] = None, 
    age: Optional[int] = None, 
    skip: int = 0, 
    limit: int = 10
):
    """
    Fetch patients from the database with optional filtering and pagination.
    """
    query = db.query(PatientDB)
    
    if name is not None:
        query = query.filter(PatientDB.name.ilike(f"%{name}%"))
    if gender is not None:
        query = query.filter(PatientDB.gender == gender)
    if age is not None:
        query = query.filter(PatientDB.age == age)
        
    return query.offset(skip).limit(limit).all()

def create_patient(db: Session, patient: PatientSchema):
    """
    Create a new patient in the database.
    """
    db_patient = PatientDB(
        id=patient.id,
        name=patient.name,
        age=patient.age,
        gender=patient.gender,
        disease=patient.disease,
        guardian_name=patient.guardian_name
    )
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

def update_patient(db: Session, patient_id: int, updated_patient: PatientSchema):
    """
    Update an existing patient in the database.
    """
    db_patient = get_patient(db, patient_id)
    if db_patient:
        db_patient.name = updated_patient.name
        db_patient.age = updated_patient.age
        db_patient.gender = updated_patient.gender
        db_patient.disease = updated_patient.disease
        db_patient.guardian_name = updated_patient.guardian_name
        
        db.commit()
        db.refresh(db_patient)
    return db_patient

def delete_patient(db: Session, patient_id: int):
    """
    Delete a patient from the database.
    """
    db_patient = get_patient(db, patient_id)
    if db_patient:
        db.delete(db_patient)
        db.commit()
    return db_patient
