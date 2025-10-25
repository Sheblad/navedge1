"""
Contract management routes for NavEdge Phase 2
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
import uuid

from core.database import get_db, User, Contract, Car, Organization, get_current_user, get_current_owner
from services.pdf_service import PDFService

router = APIRouter()

# Pydantic models
class ContractCreate(BaseModel):
    renter_id: str
    car_id: str
    start_date: datetime
    end_date: datetime
    deposit_amount: float
    daily_km_limit: int = 300
    monthly_rent: float
    terms: Optional[List[str]] = None

class ContractResponse(BaseModel):
    id: str
    renter_id: str
    car_id: str
    start_date: datetime
    end_date: datetime
    deposit_amount: float
    daily_km_limit: int
    monthly_rent: float
    status: str
    contract_pdf_path: Optional[str] = None
    created_at: datetime

@router.post("/create", response_model=ContractResponse)
async def create_contract(
    contract_data: ContractCreate,
    current_user: User = Depends(get_current_owner),
    db: Session = Depends(get_db)
):
    """Create a new rental contract"""
    
    # Verify renter exists
    renter = db.query(User).filter(
        User.id == contract_data.renter_id,
        User.role == "renter"
    ).first()
    if not renter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Renter not found"
        )
    
    # Verify car exists and is available
    car = db.query(Car).filter(Car.id == contract_data.car_id).first()
    if not car:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Car not found"
        )
    
    if car.status != "available":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Car is not available for rental"
        )
    
    # Get organization
    organization = db.query(Organization).filter(
        Organization.owner_id == current_user.id
    ).first()
    if not organization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )
    
    # Create contract
    contract = Contract(
        renter_id=contract_data.renter_id,
        car_id=contract_data.car_id,
        organization_id=organization.id,
        start_date=contract_data.start_date,
        end_date=contract_data.end_date,
        deposit_amount=contract_data.deposit_amount,
        daily_km_limit=contract_data.daily_km_limit,
        monthly_rent=contract_data.monthly_rent,
        terms=contract_data.terms or [
            "Driver must maintain valid UAE driving license",
            "Vehicle must be returned in same condition",
            "Fines will be deducted from deposit",
            "Monthly rent due by 1st of each month"
        ]
    )
    
    db.add(contract)
    db.commit()
    db.refresh(contract)
    
    # Update car status
    car.status = "rented"
    db.commit()
    
    # Generate PDF contract
    pdf_service = PDFService()
    pdf_path = pdf_service.generate_contract_pdf(contract, renter, car, organization)
    
    # Update contract with PDF path
    contract.contract_pdf_path = pdf_path
    db.commit()
    
    return ContractResponse(
        id=str(contract.id),
        renter_id=str(contract.renter_id),
        car_id=str(contract.car_id),
        start_date=contract.start_date,
        end_date=contract.end_date,
        deposit_amount=float(contract.deposit_amount),
        daily_km_limit=contract.daily_km_limit,
        monthly_rent=float(contract.monthly_rent),
        status=contract.status,
        contract_pdf_path=contract.contract_pdf_path,
        created_at=contract.created_at
    )

@router.get("/my-contracts")
async def get_my_contracts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get contracts for current user"""
    
    if current_user.role == "owner":
        # Get all contracts for owner's organization
        organization = db.query(Organization).filter(
            Organization.owner_id == current_user.id
        ).first()
        
        if not organization:
            return []
        
        contracts = db.query(Contract).filter(
            Contract.organization_id == organization.id
        ).all()
    else:
        # Get only renter's contracts
        contracts = db.query(Contract).filter(
            Contract.renter_id == current_user.id
        ).all()
    
    return [
        {
            "id": str(contract.id),
            "renter_id": str(contract.renter_id),
            "car_id": str(contract.car_id),
            "start_date": contract.start_date,
            "end_date": contract.end_date,
            "deposit_amount": float(contract.deposit_amount),
            "daily_km_limit": contract.daily_km_limit,
            "monthly_rent": float(contract.monthly_rent),
            "status": contract.status,
            "contract_pdf_path": contract.contract_pdf_path,
            "created_at": contract.created_at
        }
        for contract in contracts
    ]

@router.get("/expiring")
async def get_expiring_contracts(
    days: int = 7,
    current_user: User = Depends(get_current_owner),
    db: Session = Depends(get_db)
):
    """Get contracts expiring within specified days"""
    
    organization = db.query(Organization).filter(
        Organization.owner_id == current_user.id
    ).first()
    
    if not organization:
        return []
    
    expiry_date = datetime.utcnow() + timedelta(days=days)
    
    contracts = db.query(Contract).filter(
        Contract.organization_id == organization.id,
        Contract.end_date <= expiry_date,
        Contract.status == "active"
    ).all()
    
    return [
        {
            "id": str(contract.id),
            "renter_id": str(contract.renter_id),
            "car_id": str(contract.car_id),
            "end_date": contract.end_date,
            "days_remaining": (contract.end_date - datetime.utcnow()).days
        }
        for contract in contracts
    ]

@router.get("/{contract_id}/pdf")
async def download_contract_pdf(
    contract_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download contract PDF"""
    
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contract not found"
        )
    
    # Check permissions
    if current_user.role == "renter" and contract.renter_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this contract"
        )
    
    if not contract.contract_pdf_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contract PDF not found"
        )
    
    return {"pdf_path": contract.contract_pdf_path}
