"""
Reports and analytics routes
"""

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import pandas as pd
import io

from core.database import get_db, User, Contract, Fine, Car, Organization, get_current_owner
from services.report_service import ReportService

router = APIRouter()

# Pydantic models
class DashboardStats(BaseModel):
    total_contracts: int
    active_contracts: int
    total_revenue: float
    pending_fines: int
    total_fines_amount: float
    cars_available: int
    cars_rented: int

class ReportRequest(BaseModel):
    start_date: datetime
    end_date: datetime
    report_type: str  # financial, performance, fines, contracts
    format: str = "json"  # json, csv, pdf

@router.get("/dashboard")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_owner),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics"""
    
    # Get organization
    organization = db.query(Organization).filter(
        Organization.owner_id == current_user.id
    ).first()
    
    if not organization:
        return DashboardStats(
            total_contracts=0,
            active_contracts=0,
            total_revenue=0.0,
            pending_fines=0,
            total_fines_amount=0.0,
            cars_available=0,
            cars_rented=0
        )
    
    # Get contracts
    contracts = db.query(Contract).filter(
        Contract.organization_id == organization.id
    ).all()
    
    active_contracts = [c for c in contracts if c.status == "active"]
    total_revenue = sum(float(c.monthly_rent) for c in contracts)
    
    # Get fines
    contract_ids = [str(c.id) for c in contracts]
    fines = db.query(Fine).filter(Fine.contract_id.in_(contract_ids)).all()
    
    pending_fines = [f for f in fines if f.status == "pending"]
    total_fines_amount = sum(float(f.amount) for f in fines)
    
    # Get cars
    cars = db.query(Car).filter(Car.organization_id == organization.id).all()
    cars_available = [c for c in cars if c.status == "available"]
    cars_rented = [c for c in cars if c.status == "rented"]
    
    return DashboardStats(
        total_contracts=len(contracts),
        active_contracts=len(active_contracts),
        total_revenue=total_revenue,
        pending_fines=len(pending_fines),
        total_fines_amount=total_fines_amount,
        cars_available=len(cars_available),
        cars_rented=len(cars_rented)
    )

@router.get("/financial/summary")
async def get_financial_summary(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user: User = Depends(get_current_owner),
    db: Session = Depends(get_db)
):
    """Get financial summary report"""
    
    # Get organization
    organization = db.query(Organization).filter(
        Organization.owner_id == current_user.id
    ).first()
    
    if not organization:
        return {"error": "Organization not found"}
    
    # Get contracts
    contracts_query = db.query(Contract).filter(
        Contract.organization_id == organization.id
    )
    
    if start_date:
        contracts_query = contracts_query.filter(Contract.start_date >= start_date)
    if end_date:
        contracts_query = contracts_query.filter(Contract.end_date <= end_date)
    
    contracts = contracts_query.all()
    
    # Calculate financial metrics
    total_revenue = sum(float(c.monthly_rent) for c in contracts)
    total_deposits = sum(float(c.deposit_amount) for c in contracts)
    
    # Get fines
    contract_ids = [str(c.id) for c in contracts]
    fines = db.query(Fine).filter(Fine.contract_id.in_(contract_ids)).all()
    
    total_fines = sum(float(f.amount) for f in fines)
    net_revenue = total_revenue - total_fines
    
    return {
        "period": {
            "start_date": start_date.isoformat() if start_date else None,
            "end_date": end_date.isoformat() if end_date else None
        },
        "revenue": {
            "total_revenue": total_revenue,
            "total_deposits": total_deposits,
            "net_revenue": net_revenue
        },
        "fines": {
            "total_fines": total_fines,
            "fines_count": len(fines),
            "pending_fines": len([f for f in fines if f.status == "pending"])
        },
        "contracts": {
            "total_contracts": len(contracts),
            "active_contracts": len([c for c in contracts if c.status == "active"]),
            "completed_contracts": len([c for c in contracts if c.status == "expired"])
        }
    }

@router.get("/export-pdf")
async def export_pdf_report(
    start_date: datetime,
    end_date: datetime,
    report_type: str,
    current_user: User = Depends(get_current_owner),
    db: Session = Depends(get_db)
):
    """Export report as PDF"""
    
    report_service = ReportService()
    pdf_path = report_service.generate_pdf_report(
        start_date, end_date, report_type, current_user, db
    )
    
    return {"pdf_path": pdf_path}

@router.get("/export-csv")
async def export_csv_report(
    start_date: datetime,
    end_date: datetime,
    report_type: str,
    current_user: User = Depends(get_current_owner),
    db: Session = Depends(get_db)
):
    """Export report as CSV"""
    
    report_service = ReportService()
    csv_data = report_service.generate_csv_report(
        start_date, end_date, report_type, current_user, db
    )
    
    # Return CSV as downloadable file
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=report_{report_type}_{start_date.date()}.csv"}
    )

@router.get("/scheduled")
async def get_scheduled_reports(
    current_user: User = Depends(get_current_owner),
    db: Session = Depends(get_db)
):
    """Get scheduled reports"""
    
    # This would return scheduled reports configuration
    # For now, return empty list
    return []

@router.post("/schedule")
async def schedule_report(
    report_type: str,
    frequency: str,  # daily, weekly, monthly
    email: str,
    current_user: User = Depends(get_current_owner),
    db: Session = Depends(get_db)
):
    """Schedule automated reports"""
    
    # This would create a scheduled report
    # For now, return success message
    return {"message": f"Scheduled {frequency} {report_type} reports to {email}"}
