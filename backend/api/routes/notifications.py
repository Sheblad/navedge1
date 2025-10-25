"""
Notification routes for WhatsApp and email alerts
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from core.database import get_db, User, Notification, get_current_user, get_current_owner
from services.notification_service import NotificationService

router = APIRouter()

# Pydantic models
class NotificationCreate(BaseModel):
    user_id: str
    type: str  # whatsapp, email, in_app
    title: str
    message: str

class NotificationResponse(BaseModel):
    id: str
    user_id: str
    type: str
    title: str
    message: str
    status: str
    sent_at: Optional[datetime] = None
    created_at: datetime

@router.post("/whatsapp/send")
async def send_whatsapp_notification(
    phone: str,
    message: str,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_owner),
    db: Session = Depends(get_db)
):
    """Send WhatsApp notification"""
    
    notification_service = NotificationService()
    
    # Send notification in background
    background_tasks.add_task(
        notification_service.send_whatsapp_notification,
        phone,
        message
    )
    
    # Log notification
    notification = Notification(
        user_id=current_user.id,
        type="whatsapp",
        title="WhatsApp Notification",
        message=message,
        status="pending"
    )
    db.add(notification)
    db.commit()
    
    return {"message": "WhatsApp notification queued for sending"}

@router.post("/email/send")
async def send_email_notification(
    email: str,
    subject: str,
    message: str,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_owner),
    db: Session = Depends(get_db)
):
    """Send email notification"""
    
    notification_service = NotificationService()
    
    # Send notification in background
    background_tasks.add_task(
        notification_service.send_email_notification,
        email,
        subject,
        message
    )
    
    # Log notification
    notification = Notification(
        user_id=current_user.id,
        type="email",
        title=subject,
        message=message,
        status="pending"
    )
    db.add(notification)
    db.commit()
    
    return {"message": "Email notification queued for sending"}

@router.get("/templates")
async def get_notification_templates():
    """Get available notification templates"""
    
    templates = {
        "contract_created": {
            "title": "New Rental Contract Created",
            "message": "A new rental contract has been created for {car_make} {car_model} (Plate: {license_plate}). Contract ID: {contract_id}"
        },
        "fine_detected": {
            "title": "New Fine Detected",
            "message": "A new fine has been detected for {license_plate}: {violation} - AED {amount}. Please check your dashboard for details."
        },
        "damage_detected": {
            "title": "Damage Detected",
            "message": "Damage has been detected on {car_make} {car_model} (Plate: {license_plate}). Please review the damage report."
        },
        "contract_expiring": {
            "title": "Contract Expiring Soon",
            "message": "Your rental contract for {car_make} {car_model} expires in {days_left} days. Please prepare for vehicle return."
        },
        "payment_reminder": {
            "title": "Payment Reminder",
            "message": "Your monthly rental payment of AED {amount} is due. Please make payment to avoid late fees."
        }
    }
    
    return templates

@router.get("/my-notifications")
async def get_my_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get notifications for current user"""
    
    notifications = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).all()
    
    return [
        NotificationResponse(
            id=str(notification.id),
            user_id=str(notification.user_id),
            type=notification.type,
            title=notification.title,
            message=notification.message,
            status=notification.status,
            sent_at=notification.sent_at,
            created_at=notification.created_at
        )
        for notification in notifications
    ]

@router.post("/bulk")
async def send_bulk_notifications(
    user_ids: List[str],
    notification_type: str,
    title: str,
    message: str,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_owner),
    db: Session = Depends(get_db)
):
    """Send bulk notifications to multiple users"""
    
    notification_service = NotificationService()
    
    # Send notifications in background
    for user_id in user_ids:
        background_tasks.add_task(
            notification_service.send_bulk_notification,
            user_id,
            notification_type,
            title,
            message
        )
        
        # Log notification
        notification = Notification(
            user_id=user_id,
            type=notification_type,
            title=title,
            message=message,
            status="pending"
        )
        db.add(notification)
    
    db.commit()
    
    return {"message": f"Bulk notifications queued for {len(user_ids)} users"}
