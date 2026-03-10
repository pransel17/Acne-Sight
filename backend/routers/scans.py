from fastapi import APIRouter, HTTPException, UploadFile, File, Query
from pydantic import BaseModel
from database import db
from datetime import datetime
import uuid
import os
from PIL import Image
import io

router = APIRouter()

class LesionDetection(BaseModel):
    lesion_type: str
    confidence: float
    bbox_x: float
    bbox_y: float
    bbox_width: float
    bbox_height: float
    facial_zone: str | None = None

class ScanCreate(BaseModel):
    patient_id: str
    performed_by: str
    confidence_threshold: float = 0.75

class ScanResponse(BaseModel):
    id: str
    patient_id: str
    scan_number: str
    severity_score: float | None
    severity_level: str | None
    total_lesions: int
    inflammatory_count: int
    non_inflammatory_count: int
    created_at: str

@router.post("/", response_model=ScanResponse)
async def create_scan(
    patient_id: str,
    performed_by: str,
    file: UploadFile = File(...)
):
    """Upload scan image and process with YOLOv8"""
    try:
        # Validate file
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Create scan record
        scan_id = str(uuid.uuid4())
        scan_number = f"SC-{uuid.uuid4().hex[:8].upper()}"
        
        # Save image to uploads directory
        os.makedirs("uploads", exist_ok=True)
        image_path = f"uploads/{scan_id}.jpg"
        image.save(image_path, "JPEG")
        
        # Create scan in database
        await db.execute(
            """INSERT INTO scans 
            (id, patient_id, performed_by, scan_number, image_url, 
             original_filename, status, confidence_threshold)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)""",
            scan_id, patient_id, performed_by, scan_number, image_path,
            file.filename, 'pending', 0.75
        )
        
        # TODO: Process with YOLOv8 model
        # For now, return mock data
        await db.execute(
            """UPDATE scans SET 
            status = $1, severity_score = $2, severity_level = $3,
            total_lesions = $4, inflammatory_count = $5, non_inflammatory_count = $6
            WHERE id = $7""",
            'completed', 34.5, 'moderate', 28, 18, 10, scan_id
        )
        
        scan = await db.fetchrow(
            """SELECT id, patient_id, scan_number, severity_score, severity_level,
            total_lesions, inflammatory_count, non_inflammatory_count, created_at
            FROM scans WHERE id = $1""",
            scan_id
        )
        
        return scan
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=list[ScanResponse])
async def list_scans(
    patient_id: str | None = Query(None),
    skip: int = Query(0),
    limit: int = Query(50)
):
    """List scans with optional patient filter"""
    if patient_id:
        scans = await db.fetch(
            """SELECT id, patient_id, scan_number, severity_score, severity_level,
            total_lesions, inflammatory_count, non_inflammatory_count, created_at
            FROM scans WHERE patient_id = $1 
            ORDER BY created_at DESC LIMIT $2 OFFSET $3""",
            patient_id, limit, skip
        )
    else:
        scans = await db.fetch(
            """SELECT id, patient_id, scan_number, severity_score, severity_level,
            total_lesions, inflammatory_count, non_inflammatory_count, created_at
            FROM scans ORDER BY created_at DESC LIMIT $1 OFFSET $2""",
            limit, skip
        )
    
    return scans

@router.get("/{scan_id}", response_model=ScanResponse)
async def get_scan(scan_id: str):
    """Get scan details"""
    scan = await db.fetchrow(
        """SELECT id, patient_id, scan_number, severity_score, severity_level,
        total_lesions, inflammatory_count, non_inflammatory_count, created_at
        FROM scans WHERE id = $1""",
        scan_id
    )
    
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    return scan

@router.get("/{scan_id}/lesions")
async def get_scan_lesions(scan_id: str):
    """Get lesion detections for a scan"""
    lesions = await db.fetch(
        """SELECT id, lesion_type, confidence, bbox_x, bbox_y, 
        bbox_width, bbox_height, facial_zone, created_at
        FROM lesion_detections WHERE scan_id = $1
        ORDER BY confidence DESC""",
        scan_id
    )
    
    if not lesions:
        raise HTTPException(status_code=404, detail="No lesions found for scan")
    
    return lesions
