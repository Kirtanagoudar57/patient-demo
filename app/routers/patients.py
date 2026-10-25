from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from app import crud, schemas
from app.database import get_db
from typing import Optional
from app.auth import get_current_user

router = APIRouter(
    prefix="/patients",
    tags=["patients"],
    dependencies=[Depends(get_current_user)]
)

@router.post("", response_model=schemas.PatientSchema, status_code=201)
def create_patient(patient: schemas.PatientSchema, db: Session = Depends(get_db)):
    # Check if a patient with the same ID already exists in the PostgreSQL database
    existing_patient = crud.get_patient(db, patient_id=patient.id)
    if existing_patient:
        raise HTTPException(status_code=409, detail="Patient with this ID already exists")
    
    crud.create_patient(db, patient=patient)
    
    return patient

@router.get("", response_model=list[schemas.PatientSchema], status_code=200)
def get_all_patients(
    name: Optional[str] = None,
    gender: Optional[str] = None,
    age: Optional[int] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    db_patients = crud.get_patients(
        db, name=name, gender=gender, age=age, skip=skip, limit=limit
    )
    
    result = []
    for p in db_patients:
        patient_data = schemas.PatientSchema(
            id=p.id,
            name=p.name,
            age=p.age,
            gender=p.gender,
            disease=p.disease,
            guardian_name=p.guardian_name,
            address={"city": "Unknown", "state": "Unknown"} # Placeholder to satisfy Pydantic
        )
        result.append(patient_data)
        
    return result

@router.get("/{id}", response_model=schemas.PatientSchema, status_code=200)
def get_patient(id: int, db: Session = Depends(get_db)):
    patient = crud.get_patient(db, patient_id=id)
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    return schemas.PatientSchema(
        id=patient.id,
        name=patient.name,
        age=patient.age,
        gender=patient.gender,
        disease=patient.disease,
        guardian_name=patient.guardian_name,
        address={"city": "Unknown", "state": "Unknown"} # Placeholder to satisfy Pydantic
    )

@router.put("/{id}", response_model=schemas.PatientSchema, status_code=200)
def update_patient(id: int, updated_patient: schemas.PatientSchema, db: Session = Depends(get_db)):
    patient = crud.get_patient(db, patient_id=id)
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    patient = crud.update_patient(db, patient_id=id, updated_patient=updated_patient)
    
    return schemas.PatientSchema(
        id=patient.id,
        name=patient.name,
        age=patient.age,
        gender=patient.gender,
        disease=patient.disease,
        guardian_name=patient.guardian_name,
        address={"city": "Unknown", "state": "Unknown"} # Placeholder to satisfy Pydantic
    )

@router.delete("/{id}", status_code=200)
def delete_patient(id: int, db: Session = Depends(get_db)):
    patient = crud.get_patient(db, patient_id=id)
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    crud.delete_patient(db, patient_id=id)
    
    return {"message": "Patient deleted successfully"}
