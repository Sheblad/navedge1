"""
Damage detection and AI comparison routes
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
import os
from datetime import datetime

from core.database import get_db, User, Contract, Car, DamageReport, get_current_user
from services.damage_ai_service import DamageAIService

router = APIRouter()

@router.post("/upload-before")
async def upload_before_photos(
    contract_id: str = Form(...),
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload before rental photos"""
    
    # Verify contract exists and user has access
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    # Check permissions
    if current_user.role == "renter" and contract.renter_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Save photos
    photo_paths = []
    for file in files:
        if not file.content_type.startswith('image/'):
            continue
        
        file_extension = file.filename.split('.')[-1]
        unique_filename = f"before_{uuid.uuid4()}.{file_extension}"
        file_path = os.path.join("uploads", "damage", "before", unique_filename)
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        # Save file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        photo_paths.append(file_path)
    
    # Create or update damage report
    damage_report = db.query(DamageReport).filter(
        DamageReport.contract_id == contract_id
    ).first()
    
    if not damage_report:
        damage_report = DamageReport(
            contract_id=contract_id,
            car_id=contract.car_id,
            before_photos=photo_paths
        )
        db.add(damage_report)
    else:
        damage_report.before_photos = photo_paths
    
    db.commit()
    
    return {
        "message": "Before photos uploaded successfully",
        "photo_count": len(photo_paths),
        "photo_paths": photo_paths
    }

@router.post("/upload-after")
async def upload_after_photos(
    contract_id: str = Form(...),
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload after rental photos"""
    
    # Verify contract exists and user has access
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    # Check permissions
    if current_user.role == "renter" and contract.renter_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Save photos
    photo_paths = []
    for file in files:
        if not file.content_type.startswith('image/'):
            continue
        
        file_extension = file.filename.split('.')[-1]
        unique_filename = f"after_{uuid.uuid4()}.{file_extension}"
        file_path = os.path.join("uploads", "damage", "after", unique_filename)
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        # Save file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        photo_paths.append(file_path)
    
    # Update damage report
    damage_report = db.query(DamageReport).filter(
        DamageReport.contract_id == contract_id
    ).first()
    
    if not damage_report:
        raise HTTPException(status_code=404, detail="Before photos must be uploaded first")
    
    damage_report.after_photos = photo_paths
    db.commit()
    
    return {
        "message": "After photos uploaded successfully",
        "photo_count": len(photo_paths),
        "photo_paths": photo_paths
    }

@router.post("/compare/{contract_id}")
async def compare_photos(
    contract_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Compare before and after photos using AI"""
    
    # Get damage report
    damage_report = db.query(DamageReport).filter(
        DamageReport.contract_id == contract_id
    ).first()
    
    if not damage_report:
        raise HTTPException(status_code=404, detail="Damage report not found")
    
    if not damage_report.before_photos or not damage_report.after_photos:
        raise HTTPException(status_code=400, detail="Both before and after photos are required")
    
    # Initialize AI service
    ai_service = DamageAIService()
    
    # Compare photos
    comparison_result = ai_service.compare_photos(
        damage_report.before_photos,
        damage_report.after_photos
    )
    
    # Update damage report with AI results
    damage_report.damage_detected = comparison_result['damage_detected']
    damage_report.damage_details = comparison_result['damage_details']
    damage_report.ai_confidence = comparison_result['confidence']
    
    db.commit()
    
    return {
        "message": "Photo comparison completed",
        "damage_detected": damage_report.damage_detected,
        "damage_details": damage_report.damage_details,
        "confidence": float(damage_report.ai_confidence) if damage_report.ai_confidence else 0.0
    }

@router.get("/report/{contract_id}")
async def get_damage_report(
    contract_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get damage report for a contract"""
    
    damage_report = db.query(DamageReport).filter(
        DamageReport.contract_id == contract_id
    ).first()
    
    if not damage_report:
        raise HTTPException(status_code=404, detail="Damage report not found")
    
    # Check permissions
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if current_user.role == "renter" and contract.renter_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return {
        "id": str(damage_report.id),
        "contract_id": str(damage_report.contract_id),
        "car_id": str(damage_report.car_id),
        "before_photos": damage_report.before_photos or [],
        "after_photos": damage_report.after_photos or [],
        "damage_detected": damage_report.damage_detected,
        "damage_details": damage_report.damage_details,
        "ai_confidence": float(damage_report.ai_confidence) if damage_report.ai_confidence else None,
        "manual_assessment": damage_report.manual_assessment,
        "estimated_cost": float(damage_report.estimated_cost) if damage_report.estimated_cost else None,
        "created_at": damage_report.created_at
    }
