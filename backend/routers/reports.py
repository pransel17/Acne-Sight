from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from database import db
import uuid
import json

router = APIRouter()

class ReportCreate(BaseModel):
    patient_id: str
    scan_id: str | None = None
    generated_by: str
    report_type: str
    title: str
    content: dict | None = None

class ReportResponse(BaseModel):
    id: str
    patient_id: str
    report_number: str
    title: str
    report_type: str
    is_finalized: bool
    created_at: str

@router.post("/", response_model=ReportResponse)
async def create_report(report: ReportCreate):
    """Create clinical report"""
    report_id = str(uuid.uuid4())
    report_number = f"REP-{uuid.uuid4().hex[:8].upper()}"
    
    await db.execute(
        """INSERT INTO reports 
        (id, patient_id, scan_id, generated_by, report_type, 
         report_number, title, content)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)""",
        report_id, report.patient_id, report.scan_id, report.generated_by,
        report.report_type, report_number, report.title,
        json.dumps(report.content) if report.content else None
    )
    
    created_report = await db.fetchrow(
        """SELECT id, patient_id, report_number, title, report_type, 
        is_finalized, created_at FROM reports WHERE id = $1""",
        report_id
    )
    
    return created_report

@router.get("/", response_model=list[ReportResponse])
async def list_reports(
    patient_id: str | None = Query(None),
    skip: int = Query(0),
    limit: int = Query(50)
):
    """List reports"""
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
    
    return reports

@router.get("/{report_id}")
async def get_report(report_id: str):
    """Get report details"""
    report = await db.fetchrow(
        """SELECT id, patient_id, report_number, title, report_type, 
        content, is_finalized, created_at FROM reports WHERE id = $1""",
        report_id
    )
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Parse JSON content
    report_dict = dict(report)
    if report_dict.get('content'):
        report_dict['content'] = json.loads(report_dict['content'])
    
    return report_dict

@router.put("/{report_id}/finalize")
async def finalize_report(report_id: str):
    """Finalize report (lock for editing)"""
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
    
    return updated_report
