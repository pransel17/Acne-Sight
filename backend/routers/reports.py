from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from uuid import UUID
from datetime import datetime
import uuid
import json

from database import db

router = APIRouter()

# ==========================================
# 1. PYDANTIC SCHEMAS
# ==========================================
class ReportCreate(BaseModel):
    patient_id: UUID
    scan_id: Optional[UUID] = None
    generated_by: UUID
    report_type: str
    title: str
    content: Optional[Dict[str, Any]] = None

# Used for the List View (Lighter, no content)
class ReportResponse(BaseModel):
    id: UUID
    patient_id: UUID
    report_number: str
    title: str
    report_type: str
    is_finalized: bool
    created_at: datetime

# Used for the Single Detail View (Includes content)
class ReportDetailResponse(ReportResponse):
    content: Optional[Dict[str, Any]] = None

# ==========================================
# 2. API ROUTES
# ==========================================

@router.post("/", response_model=ReportResponse)
async def create_report(report: ReportCreate):
    """Create clinical report"""
    report_id = str(uuid.uuid4())
    report_number = f"REP-{uuid.uuid4().hex[:8].upper()}"
    
    # Ensure content is a JSON string before inserting
    content_json = json.dumps(report.content) if report.content else None
    
    try:
        await db.execute(
            """INSERT INTO reports 
            (id, patient_id, scan_id, generated_by, report_type, 
             report_number, title, content)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)""",
            report_id, report.patient_id, report.scan_id, report.generated_by,
            report.report_type, report_number, report.title,
            content_json
        )
        
        created_report = await db.fetchrow(
            """SELECT id, patient_id, report_number, title, report_type, 
            is_finalized, created_at FROM reports WHERE id = $1""",
            report_id
        )
        return dict(created_report)

    except Exception as e:
        print(f"DATABASE ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/", response_model=List[ReportResponse])
async def list_reports(
    patient_id: Optional[UUID] = Query(None),
    skip: int = Query(0),
    limit: int = Query(50)
):
    """List reports"""
    try:
        if patient_id:
            reports = await db.fetch(
                """SELECT id, patient_id, report_number, title, report_type, 
                is_finalized, created_at FROM reports
                WHERE patient_id = $1 ORDER BY created_at DESC 
                LIMIT $2 OFFSET $3""",
                patient_id, limit, skip
            )
        else:
            reports = await db.fetch(
                """SELECT id, patient_id, report_number, title, report_type, 
                is_finalized, created_at FROM reports
                ORDER BY created_at DESC LIMIT $1 OFFSET $2""",
                limit, skip
            )
        return [dict(report) for report in reports]
        
    except Exception as e:
        print(f"DATABASE ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/{report_id}", response_model=ReportDetailResponse)
async def get_report(report_id: UUID):
    """Get report details"""
    try:
        report = await db.fetchrow(
            """SELECT id, patient_id, report_number, title, report_type, 
            content, is_finalized, created_at FROM reports WHERE id = $1""",
            report_id
        )
        
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        # Safely handle the JSONB content
        report_dict = dict(report)
        if report_dict.get('content') and isinstance(report_dict['content'], str):
            # Only parse if the database driver returned a string
            report_dict['content'] = json.loads(report_dict['content'])
            
        return report_dict
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        print(f"DATABASE ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.put("/{report_id}/finalize", response_model=ReportResponse)
async def finalize_report(report_id: UUID):
    """Finalize report (lock for editing)"""
    try:
        await db.execute(
            """UPDATE reports SET is_finalized = true, finalized_at = NOW()
            WHERE id = $1""",
            report_id
        )
        
        updated_report = await db.fetchrow(
            """SELECT id, patient_id, report_number, title, report_type, 
            is_finalized, created_at FROM reports WHERE id = $1""",
            report_id
        )
        
        if not updated_report:
            raise HTTPException(status_code=404, detail="Report not found")
            
        return updated_report
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        print(f"DATABASE ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")