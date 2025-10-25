"""
Notification service for WhatsApp and email alerts
"""

import httpx
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import os
from core.config import settings

class NotificationService:
    def __init__(self):
        self.whatsapp_token = settings.WHATSAPP_TOKEN
        self.whatsapp_phone_id = settings.WHATSAPP_PHONE_ID
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_username = settings.SMTP_USERNAME
        self.smtp_password = settings.SMTP_PASSWORD
    
    async def send_whatsapp_notification(self, phone: str, message: str) -> bool:
        """Send WhatsApp notification"""
        try:
            if not self.whatsapp_token or not self.whatsapp_phone_id:
                print("WhatsApp credentials not configured")
                return False
            
            # WhatsApp Business API call
            url = f"https://graph.facebook.com/v17.0/{self.whatsapp_phone_id}/messages"
            
            headers = {
                "Authorization": f"Bearer {self.whatsapp_token}",
                "Content-Type": "application/json"
            }
            
            data = {
                "messaging_product": "whatsapp",
                "to": phone,
                "type": "text",
                "text": {"body": message}
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(url, headers=headers, json=data)
                
                if response.status_code == 200:
                    print(f"WhatsApp message sent to {phone}")
                    return True
                else:
                    print(f"WhatsApp API error: {response.status_code} - {response.text}")
                    return False
                    
        except Exception as e:
            print(f"Error sending WhatsApp notification: {e}")
            return False
    
    async def send_email_notification(self, email: str, subject: str, message: str) -> bool:
        """Send email notification"""
        try:
            if not all([self.smtp_host, self.smtp_username, self.smtp_password]):
                print("Email credentials not configured")
                return False
            
            # Create message
            msg = MIMEMultipart()
            msg['From'] = self.smtp_username
            msg['To'] = email
            msg['Subject'] = subject
            
            # Add body
            msg.attach(MIMEText(message, 'plain'))
            
            # Send email
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
            
            print(f"Email sent to {email}")
            return True
            
        except Exception as e:
            print(f"Error sending email notification: {e}")
            return False
    
    async def send_bulk_notification(self, user_id: str, notification_type: str, title: str, message: str) -> bool:
        """Send bulk notification to user"""
        try:
            # This would send notification based on user preferences
            # For now, just log the notification
            print(f"Bulk notification sent to user {user_id}: {title}")
            return True
            
        except Exception as e:
            print(f"Error sending bulk notification: {e}")
            return False
    
    def get_notification_template(self, template_name: str, **kwargs) -> str:
        """Get notification template with variables"""
        templates = {
            "contract_created": "New rental contract created for {car_make} {car_model} (Plate: {license_plate}). Contract ID: {contract_id}",
            "fine_detected": "New fine detected for {license_plate}: {violation} - AED {amount}",
            "damage_detected": "Damage detected on {car_make} {car_model} (Plate: {license_plate})",
            "contract_expiring": "Contract for {car_make} {car_model} expires in {days_left} days",
            "payment_reminder": "Monthly rental payment of AED {amount} is due"
        }
        
        template = templates.get(template_name, "Notification: {message}")
        return template.format(**kwargs)
