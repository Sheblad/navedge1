"""
Fines management and Dubai Police integration routes
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import uuid

from core.database import get_db, User, Contract, Fine, Car, get_current_user, get_current_owner
from services.dubai_police_service import DubaiPoliceService
from services.notification_service import NotificationService

router = APIRouter()

# Pydantic models
class FineCreate(BaseModel):
    contract_id: str
    violation: str
    amount: float
    date: datetime
    location: Optional[str] = None

class FineResponse(BaseModel):
    id: str
    contract_id: str
    violation: str
    amount: float
    date: datetime
    status: str
    location: Optional[str] = None
    source: str
    created_at: datetime

@router.post("/check-dubai-police")
async def check_dubai_police_fines(
    license_plate: str,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_owner),
    db: Session = Depends(get_db)
):
    """Check Dubai Police for fines for a specific license plate"""
    
    # Initialize Dubai Police service
    police_service = DubaiPoliceService()
    
    # Check for fines
    fines_data = police_service.check_fines(license_plate)
    
    if fines_data['success']:
        # Process found fines
        for fine_data in fines_data['fines']:
            # Find contract for this car
            car = db.query(Car).filter(Car.license_plate == license_plate).first()
            if car:
                contract = db.query(Contract).filter(
                    Contract.car_id == car.id,
                    Contract.status == "active"
                ).first()
                
                if contract:
                    # Create fine record
                    fine = Fine(
                        contract_id=contract.id,
                        violation=fine_data['violation'],
                        amount=fine_data['amount'],
                        date=fine_data['date'],
                        location=fine_data.get('location'),
                        source="dubai_police"
                    )
                    db.add(fine)
                    
                    # Send notification
                    notification_service = NotificationService()
                    background_tasks.add_task(
                        notification_service.send_whatsapp_notification,
                        current_user.phone,
                        f"New fine detected for {license_plate}: {fine_data['violation']} - AED {fine_data['amount']}"
                    )
        
        db.commit()
        
        return {
            "message": "Dubai Police check completed",
            "fines_found": len(fines_data['fines']),
            "fines": fines_data['fines']
        }
    else:
        return {
            "message": "Dubai Police check failed",
            "error": fines_data['error'],
            "fines_found": 0
        }

@router.post("/manual-add")
async def add_manual_fine(
    fine_data: FineCreate,
    current_user: User = Depends(get_current_owner),
    db: Session = Depends(get_db)
):
    """Manually add a fine"""
    
    # Verify contract exists
    contract = db.query(Contract).filter(Contract.id == fine_data.contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    # Create fine
    fine = Fine(
        contract_id=fine_data.contract_id,
        violation=fine_data.violation,
        amount=fine_data.amount,
        date=fine_data.date,
        location=fine_data.location,
        source="manual"
    )
    
    db.add(fine)
    db.commit()
    db.refresh(fine)
    
    return FineResponse(
        id=str(fine.id),
        contract_id=str(fine.contract_id),
        violation=fine.violation,
        amount=float(fine.amount),
        date=fine.date,
        status=fine.status,
        location=fine.location,
        source=fine.source,
        created_at=fine.created_at
    )

@router.get("/by-renter/{renter_id}")
async def get_fines_by_renter(
    renter_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get fines for a specific renter"""
    
    # Check permissions
    if current_user.role == "renter" and current_user.id != renter_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get renter's contracts
    contracts = db.query(Contract).filter(Contract.renter_id == renter_id).all()
    contract_ids = [str(contract.id) for contract in contracts]
    
    # Get fines for these contracts
    fines = db.query(Fine).filter(Fine.contract_id.in_(contract_ids)).all()
    
    return [
        FineResponse(
            id=str(fine.id),
            contract_id=str(fine.contract_id),
            violation=fine.violation,
            amount=float(fine.amount),
            date=fine.date,
            status=fine.status,
            location=fine.location,
            source=fine.source,
            created_at=fine.created_at
        )
        for fine in fines
    ]

@router.get("/my-fines")
async def get_my_fines(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get fines for current user"""
    
    if current_user.role == "renter":
        # Get renter's contracts
        contracts = db.query(Contract).filter(Contract.renter_id == current_user.id).all()
        contract_ids = [str(contract.id) for contract in contracts]
        
        # Get fines for these contracts
        fines = db.query(Fine).filter(Fine.contract_id.in_(contract_ids)).all()
    else:
        # Get all fines for owner's organization
        # This would require organization relationship
        fines = []
    
    return [
        FineResponse(
            id=str(fine.id),
            contract_id=str(fine.contract_id),
            violation=fine.violation,
            amount=float(fine.amount),
            date=fine.date,
            status=fine.status,
            location=fine.location,
            source=fine.source,
            created_at=fine.created_at
        )
        for fine in fines
    ]

@router.put("/{fine_id}/status")
async def update_fine_status(
    fine_id: str,
    status: str,
    current_user: User = Depends(get_current_owner),
    db: Session = Depends(get_db)
):
    """Update fine status"""
    
    fine = db.query(Fine).filter(Fine.id == fine_id).first()
    if not fine:
        raise HTTPException(status_code=404, detail="Fine not found")
    
    fine.status = status
    db.commit()
    
    return {"message": "Fine status updated successfully"}
