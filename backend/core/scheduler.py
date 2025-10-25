"""
Background job scheduler for NavEdge Phase 2
"""

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime
import asyncio
from typing import Optional

from services.dubai_police_service import DubaiPoliceService
from services.notification_service import NotificationService
from core.database import SessionLocal, Contract, Car, Fine, Organization

# Global scheduler instance
scheduler: Optional[AsyncIOScheduler] = None

def start_scheduler():
    """Start the background job scheduler"""
    global scheduler
    
    if scheduler is None:
        scheduler = AsyncIOScheduler()
        
        # Schedule daily Dubai Police fine checking at 9 AM UAE time
        scheduler.add_job(
            check_dubai_police_fines,
            CronTrigger(hour=9, minute=0, timezone='Asia/Dubai'),
            id='daily_fine_check',
            name='Daily Dubai Police Fine Check',
            replace_existing=True
        )
        
        # Schedule contract expiration reminders at 8 AM UAE time
        scheduler.add_job(
            check_expiring_contracts,
            CronTrigger(hour=8, minute=0, timezone='Asia/Dubai'),
            id='contract_expiry_check',
            name='Contract Expiry Check',
            replace_existing=True
        )
        
        # Schedule daily reports at 6 PM UAE time
        scheduler.add_job(
            generate_daily_reports,
            CronTrigger(hour=18, minute=0, timezone='Asia/Dubai'),
            id='daily_reports',
            name='Daily Reports Generation',
            replace_existing=True
        )
        
        scheduler.start()
        print("✅ Background job scheduler started")

def stop_scheduler():
    """Stop the background job scheduler"""
    global scheduler
    
    if scheduler:
        scheduler.shutdown()
        scheduler = None
        print("🛑 Background job scheduler stopped")

async def check_dubai_police_fines():
    """Daily job to check Dubai Police for fines"""
    print("🔍 Starting daily Dubai Police fine check...")
    
    try:
        db = SessionLocal()
        police_service = DubaiPoliceService()
        notification_service = NotificationService()
        
        # Get all active contracts
        contracts = db.query(Contract).filter(Contract.status == "active").all()
        
        for contract in contracts:
            # Get car for this contract
            car = db.query(Car).filter(Car.id == contract.car_id).first()
            if not car:
                continue
            
            # Check for fines
            fines_result = await police_service.check_fines(car.license_plate)
            
            if fines_result['success'] and fines_result['fines']:
                # Process new fines
                for fine_data in fines_result['fines']:
                    # Check if fine already exists
                    existing_fine = db.query(Fine).filter(
                        Fine.contract_id == contract.id,
                        Fine.violation == fine_data['violation'],
                        Fine.date == fine_data['date']
                    ).first()
                    
                    if not existing_fine:
                        # Create new fine
                        fine = Fine(
                            contract_id=contract.id,
                            violation=fine_data['violation'],
                            amount=fine_data['amount'],
                            date=fine_data['date'],
                            location=fine_data.get('location'),
                            source="dubai_police"
                        )
                        db.add(fine)
                        
                        # Send notification to owner
                        organization = db.query(Organization).filter(
                            Organization.id == contract.organization_id
                        ).first()
                        
                        if organization and organization.owner_id:
                            owner = db.query(User).filter(User.id == organization.owner_id).first()
                            if owner and owner.phone:
                                await notification_service.send_whatsapp_notification(
                                    owner.phone,
                                    f"New fine detected for {car.license_plate}: {fine_data['violation']} - AED {fine_data['amount']}"
                                )
        
        db.commit()
        print(f"✅ Dubai Police fine check completed for {len(contracts)} contracts")
        
    except Exception as e:
        print(f"❌ Error in Dubai Police fine check: {e}")
    finally:
        db.close()

async def check_expiring_contracts():
    """Daily job to check for expiring contracts"""
    print("⏰ Checking for expiring contracts...")
    
    try:
        db = SessionLocal()
        notification_service = NotificationService()
        
        # Get contracts expiring in the next 7 days
        from datetime import timedelta
        expiry_date = datetime.utcnow() + timedelta(days=7)
        
        expiring_contracts = db.query(Contract).filter(
            Contract.status == "active",
            Contract.end_date <= expiry_date
        ).all()
        
        for contract in expiring_contracts:
            # Get car and organization
            car = db.query(Car).filter(Car.id == contract.car_id).first()
            organization = db.query(Organization).filter(
                Organization.id == contract.organization_id
            ).first()
            
            if car and organization:
                # Send reminder to owner
                owner = db.query(User).filter(User.id == organization.owner_id).first()
                if owner and owner.phone:
                    days_left = (contract.end_date - datetime.utcnow()).days
                    await notification_service.send_whatsapp_notification(
                        owner.phone,
                        f"Contract for {car.make} {car.model} (Plate: {car.license_plate}) expires in {days_left} days"
                    )
        
        print(f"✅ Expiry check completed for {len(expiring_contracts)} contracts")
        
    except Exception as e:
        print(f"❌ Error in contract expiry check: {e}")
    finally:
        db.close()

async def generate_daily_reports():
    """Daily job to generate reports"""
    print("📊 Generating daily reports...")
    
    try:
        # This would generate daily reports for all organizations
        # For now, just log the job
        print("✅ Daily reports generation completed")
        
    except Exception as e:
        print(f"❌ Error in daily reports generation: {e}")
