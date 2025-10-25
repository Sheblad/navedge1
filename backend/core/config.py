"""
Configuration settings for NavEdge Phase 2
"""

from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost/navedge"
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    
    # Authentication
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Redis (for background jobs)
    REDIS_URL: str = "redis://localhost:6379"
    
    # WhatsApp Integration
    WHATSAPP_TOKEN: Optional[str] = None
    WHATSAPP_PHONE_ID: Optional[str] = None
    WHATSAPP_WEBHOOK_VERIFY_TOKEN: Optional[str] = None
    
    # Email Settings
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    
    # AI Services
    TESSERACT_PATH: str = "/usr/bin/tesseract"  # Linux path
    OPENAI_API_KEY: Optional[str] = None
    
    # Dubai Police Integration
    DUBAI_POLICE_BASE_URL: str = "https://www.dubaipolice.gov.ae"
    
    # File Storage
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    
    # S3 Storage
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: str = "us-east-1"
    S3_BUCKET_NAME: str = "navedge-damage-ai"
    
    # AI Models
    YOLO_MODEL_PATH: str = "yolov8n-seg.pt"
    LPIPS_MODEL_PATH: str = "alex"
    
    # Damage AI Settings
    DAMAGE_CONFIDENCE_THRESHOLD: float = 0.3
    ACTIVE_LEARNING_THRESHOLD: float = 0.6
    MAX_UPLOAD_SIZE_MB: int = 50
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create settings instance
settings = Settings()

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
