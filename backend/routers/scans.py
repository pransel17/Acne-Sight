from fastapi import APIRouter, HTTPException, UploadFile, File, Query, Form, Depends
from pydantic import BaseModel
from database import db
import uuid, os, json, io
from PIL import Image
from typing import List, Optional
from datetime import datetime

router = APIRouter()


class ScanResponse(BaseModel):
    id: uuid.UUID
    patient_id: uuid.UUID
    scan_number: str
    severity_score: Optional[float]
    severity_level: Optional[str]
    total_lesions: int
    inflammatory_count: Optional[int] = 0
    non_inflammatory_count: Optional[int] = 0
    created_at: datetime


async def verify_patient(patient_id: str):
    if not patient_id:
        raise HTTPException(status_code=400, detail="Patient ID is required")
        
    exists = await db.fetchval("SELECT EXISTS(SELECT 1 FROM patients WHERE id = $1)", patient_id)
    if not exists:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient_id


@router.post("/", status_code=201)
async def create_scan(
    file: UploadFile = File(...),
    metadata: str = Form(...)
):
    try:
         
        pi_data = json.loads(metadata)
        patient_id = pi_data.get("patient_id")
        performed_by = pi_data.get("performed_by")
        ai_results = pi_data.get("ai_results", {})

         
        await verify_patient(patient_id)

       
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        scan_id = str(uuid.uuid4())
        scan_number = f"SC-{uuid.uuid4().hex[:8].upper()}"
        
        os.makedirs("uploads", exist_ok=True)
        image_path = f"uploads/{scan_id}.jpg"
        image.save(image_path, "JPEG")

      
        async with db.transaction():
            severity = ai_results.get("severity_level", "clear").lower().replace(" ", "_")
            
            
            await db.execute(
                """INSERT INTO scans (id, patient_id, performed_by, scan_number, image_url, 
                   status, severity_score, severity_level, total_lesions, confidence_threshold)
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)""",
                scan_id, patient_id, performed_by, scan_number, image_path,
                'completed', ai_results.get("severity_score", 0), severity, 
                ai_results.get("total_lesions", 0), 0.250
            )

            
            lesions = ai_results.get("lesions", [])
            for lesion in lesions:
                await db.execute(
                    """INSERT INTO lesion_detections (scan_id, lesion_type, confidence, 
                       bbox_x, bbox_y, bbox_width, bbox_height)
                       VALUES ($1, $2, $3, $4, $5, $6, $7)""",
                    scan_id, lesion["lesion_type"].lower().replace(" ", "_"),
                    lesion["confidence"], int(lesion["bbox_x"]), int(lesion["bbox_y"]),
                    int(lesion["bbox_width"]), int(lesion["bbox_height"])
                )

        return {"status": "success", "scan_id": scan_id, "scan_number": scan_number}

    except Exception as e:
        print(f"Error in create_scan: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/patient/{patient_id}", response_model=List[ScanResponse])
async def get_patient_history(patient_id: str):
    """
    Kunin ang lahat ng scans ng isang specific na pasyente
    """
    await verify_patient(patient_id)
    
    rows = await db.fetch(
        """SELECT id, patient_id, scan_number, severity_score, severity_level, 
           total_lesions, inflammatory_count, non_inflammatory_count, created_at 
           FROM scans WHERE patient_id = $1 ORDER BY created_at DESC""", 
        patient_id
    )
    return [dict(row) for row in rows]