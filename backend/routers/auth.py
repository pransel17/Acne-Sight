from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
import bcrypt
import jwt
from datetime import datetime, timedelta
from database import db
from config import JWT_SECRET, JWT_ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
import uuid

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

class SignUpRequest(BaseModel):
    email: str
    password: str
    first_name: str
    last_name: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

class UserResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    role: str
    avatar_url: str | None

async def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

async def verify_password(password: str, hash: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hash.encode('utf-8'))

def create_access_token(user_id: str, email: str, role: str) -> str:
    """Create JWT token"""
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(token: str = None):
    """Get current authenticated user"""
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/signup", response_model=TokenResponse)
async def signup(request: SignUpRequest):
    """Register new clinician account"""
    # Check if user exists
    existing_user = await db.fetchrow(
        "SELECT id FROM users WHERE email = $1",
        request.email
    )
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    hashed_password = await hash_password(request.password)
    
    # Create user
    user_id = str(uuid.uuid4())
    await db.execute(
        """INSERT INTO users 
        (id, email, password_hash, first_name, last_name, role, email_verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7)""",
        user_id, request.email, hashed_password, request.first_name, 
        request.last_name, 'dermatologist', True
    )
    
    # Create token
    token = create_access_token(user_id, request.email, 'dermatologist')
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "email": request.email,
            "first_name": request.first_name,
            "last_name": request.last_name,
            "role": "dermatologist"
        }
    }

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """Login with email and password"""
    # Get user
    user = await db.fetchrow(
        "SELECT id, email, password_hash, first_name, last_name, role FROM users WHERE email = $1",
        request.email
    )
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if not await verify_password(request.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create token
    token = create_access_token(str(user['id']), user['email'], user['role'])
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user['id']),
            "email": user['email'],
            "first_name": user['first_name'],
            "last_name": user['last_name'],
            "role": user['role']
        }
    }

@router.get("/me", response_model=UserResponse)
async def get_me(token: str = None):
    """Get current user info"""
    current_user = await get_current_user(token)
    
    user = await db.fetchrow(
        "SELECT id, email, first_name, last_name, role, avatar_url FROM users WHERE id = $1",
        current_user['sub']
    )
    
    return {
        "id": str(user['id']),
        "email": user['email'],
        "first_name": user['first_name'],
        "last_name": user['last_name'],
        "role": user['role'],
        "avatar_url": user['avatar_url']
    }
