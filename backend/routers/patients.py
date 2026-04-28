from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from database import db
from datetime import date, datetime
import uuid

router = APIRouter()

class PatientCreate(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: date
    gender: str | None = None
    email: str | None = None
    phone: str | None = None
    skin_type: str | None = None

class PatientUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    email: str | None = None
    phone: str | None = None
    skin_type: str | None = None
    notes: str | None = None

class PatientResponse(BaseModel):
    id: uuid.UUID
    patient_number: str
    first_name: str
    last_name: str
    date_of_birth: date
    email: str | None
    phone: str | None
    skin_type: str | None
    created_at: datetime   

@router.get("/", response_model=list[PatientResponse])
async def list_patients(skip: int = Query(0), limit: int = Query(50)):
    """List all patients"""
    patients = await db.fetch(
        """SELECT id, patient_number, first_name, last_name, date_of_birth, 
        email, phone, skin_type, created_at FROM patients 
        WHERE is_active = true ORDER BY created_at DESC LIMIT $1 OFFSET $2""",
        limit, skip
    )
    
    return [dict(p) for p in patients]

@router.post("/", response_model=PatientResponse)
async def create_patient(patient: PatientCreate):
    """Create new patient"""
    patient_id = uuid.uuid4()
    patient_number = f"PT-{uuid.uuid4().hex[:8].upper()}"
    
    await db.execute(
        """INSERT INTO patients 
        (id, patient_number, first_name, last_name, date_of_birth, gender, 
         email, phone, skin_type, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)""",
        patient_id, patient_number, patient.first_name, patient.last_name,
        patient.date_of_birth, patient.gender, patient.email, patient.phone,
        patient.skin_type
    )
    
    new_patient = await db.fetchrow(
        """SELECT id, patient_number, first_name, last_name, date_of_birth, 
        email, phone, skin_type, created_at FROM patients WHERE id = $1""",
        patient_id  
    )
    
 
    return dict(new_patient)

@router.get("/{patient_id}", response_model=PatientResponse)
async def get_patient(patient_id: uuid.UUID):
    """Get patient by ID"""
    patient = await db.fetchrow(
        """SELECT id, patient_number, first_name, last_name, date_of_birth, 
        email, phone, skin_type, created_at FROM patients WHERE id = $1""",
        patient_id
    )
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    
    return dict(patient)

@router.put("/{patient_id}", response_model=PatientResponse)
async def update_patient(patient_id: str, patient: PatientUpdate):
    """Update patient"""
    updates = []
    values = []
    param_count = 1
    
    if patient.first_name is not None:
        updates.append(f"first_name = ${param_count}")
        values.append(patient.first_name)
        param_count += 1
    if patient.last_name is not None:
        updates.append(f"last_name = ${param_count}")
        values.append(patient.last_name)
        param_count += 1
    if patient.email is not None:
        updates.append(f"email = ${param_count}")
        values.append(patient.email)
        param_count += 1
    if patient.phone is not None:
        updates.append(f"phone = ${param_count}")
        values.append(patient.phone)
        param_count += 1
    if patient.skin_type is not None:
        updates.append(f"skin_type = ${param_count}")
        values.append(patient.skin_type)
        param_count += 1
    if patient.notes is not None:
        updates.append(f"notes = ${param_count}")
        values.append(patient.notes)
        param_count += 1
    
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    values.append(patient_id)
    query = f"UPDATE patients SET {', '.join(updates)} WHERE id = ${param_count} RETURNING id, patient_number, first_name, last_name, date_of_birth, email, phone, skin_type, created_at"
    
    updated_patient = await db.fetchrow(query, *values)
    
    if not updated_patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    return dict(updated_patient)

@router.delete("/{patient_id}")
async def delete_patient(patient_id: str):
    """Delete patient (soft delete)"""
    result = await db.execute(
        "UPDATE patients SET is_active = false WHERE id = $1",
        patient_id
    )
    
    if result == "UPDATE 0":
        raise HTTPException(status_code=404, detail="Patient not found")
    
    return {"message": "Patient deleted"}