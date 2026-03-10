from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from database import db
from datetime import date
import uuid

router = APIRouter()

class TreatmentItemCreate(BaseModel):
    treatment_type: str
    medication_name: str
    dosage: str | None = None
    frequency: str | None = None
    duration: str | None = None
    evidence_grade: str | None = None
    is_primary: bool = False

class TreatmentPlanCreate(BaseModel):
    patient_id: str
    created_by: str
    plan_name: str
    severity_at_creation: str
    start_date: date
    end_date: date | None = None
    follow_up_interval_days: int = 30
    items: list[TreatmentItemCreate] = []

class TreatmentPlanResponse(BaseModel):
    id: str
    patient_id: str
    plan_name: str
    severity_at_creation: str
    start_date: date
    is_active: bool
    created_at: str

@router.post("/plans", response_model=TreatmentPlanResponse)
async def create_treatment_plan(plan: TreatmentPlanCreate):
    """Create treatment plan with items"""
    plan_id = str(uuid.uuid4())
    
    # Create plan
    await db.execute(
        """INSERT INTO treatment_plans 
        (id, patient_id, created_by, plan_name, severity_at_creation, 
         start_date, end_date, follow_up_interval_days)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)""",
        plan_id, plan.patient_id, plan.created_by, plan.plan_name,
        plan.severity_at_creation, plan.start_date, plan.end_date,
        plan.follow_up_interval_days
    )
    
    # Add treatment items
    for item in plan.items:
        item_id = str(uuid.uuid4())
        await db.execute(
            """INSERT INTO treatment_items 
            (id, treatment_plan_id, treatment_type, medication_name, 
             dosage, frequency, duration, evidence_grade, is_primary)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)""",
            item_id, plan_id, item.treatment_type, item.medication_name,
            item.dosage, item.frequency, item.duration, item.evidence_grade,
            item.is_primary
        )
    
    created_plan = await db.fetchrow(
        """SELECT id, patient_id, plan_name, severity_at_creation, 
        start_date, is_active, created_at FROM treatment_plans WHERE id = $1""",
        plan_id
    )
    
    return created_plan

@router.get("/plans", response_model=list[TreatmentPlanResponse])
async def list_treatment_plans(
    patient_id: str | None = Query(None),
    skip: int = Query(0),
    limit: int = Query(50)
):
    """List treatment plans"""
    if patient_id:
        plans = await db.fetch(
            """SELECT id, patient_id, plan_name, severity_at_creation, 
            start_date, is_active, created_at FROM treatment_plans
            WHERE patient_id = $1 ORDER BY created_at DESC 
            LIMIT $2 OFFSET $3""",
            patient_id, limit, skip
        )
    else:
        plans = await db.fetch(
            """SELECT id, patient_id, plan_name, severity_at_creation, 
            start_date, is_active, created_at FROM treatment_plans
            ORDER BY created_at DESC LIMIT $1 OFFSET $2""",
            limit, skip
        )
    
    return plans

@router.get("/plans/{plan_id}")
async def get_treatment_plan(plan_id: str):
    """Get treatment plan with items"""
    plan = await db.fetchrow(
        """SELECT id, patient_id, plan_name, severity_at_creation, 
        start_date, end_date, is_active, special_instructions, created_at
        FROM treatment_plans WHERE id = $1""",
        plan_id
    )
    
    if not plan:
        raise HTTPException(status_code=404, detail="Treatment plan not found")
    
    items = await db.fetch(
        """SELECT id, treatment_type, medication_name, dosage, frequency, 
        duration, evidence_grade, is_primary FROM treatment_items
        WHERE treatment_plan_id = $1""",
        plan_id
    )
    
    return {
        **dict(plan),
        "items": items
    }

@router.put("/plans/{plan_id}")
async def update_treatment_plan(plan_id: str, plan: TreatmentPlanCreate):
    """Update treatment plan"""
    await db.execute(
        """UPDATE treatment_plans SET plan_name = $1, end_date = $2
        WHERE id = $3""",
        plan.plan_name, plan.end_date, plan_id
    )
    
    updated_plan = await db.fetchrow(
        """SELECT id, patient_id, plan_name, severity_at_creation, 
        start_date, is_active, created_at FROM treatment_plans WHERE id = $1""",
        plan_id
    )
    
    return updated_plan
