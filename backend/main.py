from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from database import db
from dotenv import load_dotenv
from datetime import datetime

# Import routers at the top
from routers import auth, patients, scans, treatments, reports

# Load environment variables
load_dotenv()

# --- Lifespan Context Manager ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to database
    print("Connecting to database...")
    await db.connect()
    yield
    # Shutdown: Disconnect from database
    print("Disconnecting from database...")
    await db.disconnect()

app = FastAPI(
    title="ACNE SIGHT API",
    description="Clinical Acne Detection System Backend",
    version="1.0.0",
    lifespan=lifespan # Attach the lifespan here
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"], # Removed "*" for better security with credentials
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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