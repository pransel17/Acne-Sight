from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from database import db
from dotenv import load_dotenv
from datetime import datetime, timedelta
import jwt
import uuid

# Load environment variables
load_dotenv()

app = FastAPI(
    title="ACNE SIGHT API",
    description="Clinical Acne Detection System Backend",
    version="1.0.0"
)

@app.on_event("startup")
async def startup_event():
    print("Connecting to database...")
    await db.connect()

@app.on_event("shutdown")
async def shutdown_event():
    print("Disconnecting from database...")
    await db.disconnect()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routers
from routers import auth, patients, scans, treatments, reports

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(patients.router, prefix="/api/patients", tags=["Patients"])
app.include_router(scans.router, prefix="/api/scans", tags=["Scans"])
app.include_router(treatments.router, prefix="/api/treatments", tags=["Treatments"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])

@app.get("/")
async def root():
    return {
        "message": "ACNE SIGHT API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
