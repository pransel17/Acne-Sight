import os
from dotenv import load_dotenv

load_dotenv()

# Database Configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://user:password@localhost:5432/acne_sight"
)

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "your-super-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

# CORS Configuration
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
]

# YOLOv8 Configuration
YOLO_MODEL_PATH = os.getenv("YOLO_MODEL_PATH", "yolov8m.pt")
YOLO_CONFIDENCE_THRESHOLD = 0.5
YOLO_IOU_THRESHOLD = 0.45

# File Upload Configuration
MAX_UPLOAD_SIZE = 50 * 1024 * 1024  # 50MB
ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"]
UPLOAD_DIR = "uploads"

# Lesion Detection Classes
LESION_CLASSES = {
    0: "comedone_open",
    1: "comedone_closed",
    2: "papule",
    3: "pustule",
    4: "nodule",
    5: "cyst",
    6: "pih_mark"
}

# Severity Thresholds
SEVERITY_THRESHOLDS = {
    "clear": (0, 10),
    "almost_clear": (11, 15),
    "mild": (16, 25),
    "moderate": (26, 40),
    "severe": (41, 100),
    "very_severe": (101, 999)
}
