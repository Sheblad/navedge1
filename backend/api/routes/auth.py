"""
Authentication routes for NavEdge Phase 2
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import timedelta

from core.database import get_db, User, Organization, create_access_token
from core.middleware import get_current_user, get_current_owner
from core.config import settings

router = APIRouter()

# Pydantic models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = None
    role: str  # owner or renter

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class OrganizationCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None

@router.post("/register", response_model=Token)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user = User(
        email=user_data.email,
        name=user_data.name,
        phone=user_data.phone,
        role=user_data.role
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # If owner, create organization
    if user_data.role == "owner":
        organization = Organization(
            name=user_data.name + "'s Fleet",
            email=user_data.email,
            phone=user_data.phone,
            owner_id=user.id
        )
        db.add(organization)
        db.commit()
    
    # Create access token
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
            "role": user.role
        }
    }

@router.post("/login", response_model=Token)
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """Login user"""
    # In a real app, you'd verify the password hash
    # For now, we'll just check if user exists
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
            "role": user.role
        }
    }

@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user info"""
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "name": current_user.name,
        "role": current_user.role,
        "phone": current_user.phone
    }

@router.post("/organization")
async def create_organization(
    org_data: OrganizationCreate,
    current_user: User = Depends(get_current_owner),
    db: Session = Depends(get_db)
):
    """Create organization (owners only)"""
    organization = Organization(
        name=org_data.name,
        email=org_data.email,
        phone=org_data.phone,
        address=org_data.address,
        owner_id=current_user.id
    )
    
    db.add(organization)
    db.commit()
    db.refresh(organization)
    
    return {
        "id": str(organization.id),
        "name": organization.name,
        "email": organization.email,
        "phone": organization.phone,
        "address": organization.address
    }
