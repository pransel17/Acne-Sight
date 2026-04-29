from fastapi import APIRouter, HTTPException, UploadFile, File, Query, Form
from pydantic import BaseModel
from database import db
import uuid
import os
import json
from PIL import Image
import io
from typing import List, Optional

router = APIRouter()

# ==========================================
# 1. PYDANTIC MODELS (For GET requests)
# ==========================================
class LesionDetection(BaseModel):
    lesion_type: str
    confidence: float
    bbox_x: float
    bbox_y: float
    bbox_width: float
    bbox_height: float
    facial_zone: Optional[str] = None

class ScanResponse(BaseModel):
    id: str
    patient_id: str
    scan_number: str
    severity_score: Optional[float]
    severity_level: Optional[str]
    total_lesions: int
    inflammatory_count: int
    non_inflammatory_count: int
    created_at: str

# ==========================================
# 2. POST ROUTE (Receiving data from the Pi)
# ==========================================
@router.post("/", response_model=dict)
async def create_scan(
    file: UploadFile = File(...),
    metadata: str = Form(...) 
):
    """Receive pre-processed image and AI results from Raspberry Pi"""
    try:
        # 1. Parse the JSON the Pi sent us
        try:
            pi_data = json.loads(metadata)
            patient_id = pi_data.get("patient_id")
            performed_by = pi_data.get("device_id", "System")
            ai_results = pi_data.get("ai_results", {})
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid metadata format")

        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # 2. Save the image to the laptop's hard drive
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        scan_id = str(uuid.uuid4())
        scan_number = f"SC-{uuid.uuid4().hex[:8].upper()}"
        
        os.makedirs("uploads", exist_ok=True)
        image_path = f"uploads/{scan_id}.jpg"
        image.save(image_path, "JPEG")
        
        # 3. Save the main scan record
        # (Status is immediately 'completed' since the Pi already did the AI work!)
        await db.execute(
            """INSERT INTO scans 
            (id, patient_id, performed_by, scan_number, image_url, 
             original_filename, status, confidence_threshold,
             severity_score, severity_level, total_lesions, 
             inflammatory_count, non_inflammatory_count)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)""",
            scan_id, patient_id, performed_by, scan_number, image_path,
            file.filename, 'completed', 0.25,
            ai_results.get("severity_score", 0),
            ai_results.get("severity_level", "unknown"),
            ai_results.get("total_lesions", 0),
            ai_results.get("inflammatory_count", 0),
            ai_results.get("non_inflammatory_count", 0)
        )
        
        # 4. Save every single bounding box the Pi sent us
        lesions = ai_results.get("lesions", [])
        for lesion in lesions:
            await db.execute(
                """INSERT INTO lesion_detections 
                (scan_id, lesion_type, confidence, bbox_x, bbox_y, bbox_width, bbox_height)
                VALUES ($1, $2, $3, $4, $5, $6, $7)""",
                scan_id, 
                lesion["lesion_type"], 
                lesion["confidence"], 
                lesion["bbox_x"], 
                lesion["bbox_y"], 
                lesion["bbox_width"], 
                lesion["bbox_height"]
            )

        # 5. Tell the Pi we saved it successfully
        return {
            "message": "Scan and AI data saved successfully",
            "scan_id": scan_id,
            "saved_lesions": len(lesions)
        }
        
    except Exception as e:
        print(f"Error processing scan from Pi: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# 3. GET ROUTES (For your Next.js Dashboard)
# ==========================================
@router.get("/", response_model=List[ScanResponse])
async def list_scans(
    patient_id: Optional[str] = Query(None),
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