"""
Database configuration and models for NavEdge Phase 2
"""

from sqlalchemy import create_engine, Column, String, Integer, DateTime, Boolean, Text, JSON, ForeignKey, DECIMAL
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from typing import Generator
from core.config import settings

# Database engine
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database dependency
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# User Roles
class UserRole:
    OWNER = "owner"
    RENTER = "renter"

# Database Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # owner or renter
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    organization = relationship("Organization", back_populates="owner")
    contracts = relationship("Contract", back_populates="renter")

class Organization(Base):
    __tablename__ = "organizations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", back_populates="organization")
    cars = relationship("Car", back_populates="organization")
    contracts = relationship("Contract", back_populates="organization")

class Car(Base):
    __tablename__ = "cars"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    make = Column(String, nullable=False)
    model = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    color = Column(String, nullable=True)
    license_plate = Column(String, unique=True, nullable=False)
    vin = Column(String, unique=True, nullable=True)
    status = Column(String, default="available")  # available, rented, maintenance
    mileage = Column(Integer, default=0)
    fuel_type = Column(String, default="petrol")
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    organization = relationship("Organization", back_populates="cars")
    contracts = relationship("Contract", back_populates="car")
    damage_reports = relationship("DamageReport", back_populates="car")

class Contract(Base):
    __tablename__ = "contracts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    renter_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    car_id = Column(UUID(as_uuid=True), ForeignKey("cars.id"))
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"))
    
    # Contract details
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    deposit_amount = Column(DECIMAL(10, 2), nullable=False)
    daily_km_limit = Column(Integer, default=300)
    monthly_rent = Column(DECIMAL(10, 2), nullable=False)
    status = Column(String, default="active")  # active, expired, terminated
    
    # Contract terms
    terms = Column(JSON, nullable=True)
    
    # Document paths
    contract_pdf_path = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    renter = relationship("User", back_populates="contracts")
    car = relationship("Car", back_populates="contracts")
    organization = relationship("Organization", back_populates="contracts")
    fines = relationship("Fine", back_populates="contract")
    damage_reports = relationship("DamageReport", back_populates="contract")

class Fine(Base):
    __tablename__ = "fines"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    contract_id = Column(UUID(as_uuid=True), ForeignKey("contracts.id"))
    violation = Column(String, nullable=False)
    amount = Column(DECIMAL(10, 2), nullable=False)
    date = Column(DateTime, nullable=False)
    status = Column(String, default="pending")  # pending, paid, deducted
    location = Column(String, nullable=True)
    source = Column(String, default="dubai_police")  # dubai_police, manual
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    contract = relationship("Contract", back_populates="fines")

class DamageReport(Base):
    __tablename__ = "damage_reports"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    contract_id = Column(UUID(as_uuid=True), ForeignKey("contracts.id"))
    car_id = Column(UUID(as_uuid=True), ForeignKey("cars.id"))
    
    # Photos
    before_photos = Column(JSON, nullable=True)  # Array of photo paths
    after_photos = Column(JSON, nullable=True)   # Array of photo paths
    
    # AI Analysis
    damage_detected = Column(Boolean, default=False)
    damage_details = Column(JSON, nullable=True)  # AI analysis results
    ai_confidence = Column(DECIMAL(3, 2), nullable=True)
    
    # Manual assessment
    manual_assessment = Column(Text, nullable=True)
    estimated_cost = Column(DECIMAL(10, 2), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    contract = relationship("Contract", back_populates="damage_reports")
    car = relationship("Car", back_populates="damage_reports")

class DocumentUpload(Base):
    __tablename__ = "document_uploads"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    document_type = Column(String, nullable=False)  # emirates_id, license, contract
    file_path = Column(String, nullable=False)
    extracted_text = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    type = Column(String, nullable=False)  # whatsapp, email, in_app
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String, default="pending")  # pending, sent, failed
    sent_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
