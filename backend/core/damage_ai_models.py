"""
Damage AI Database Models for v1.1
"""

from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, JSON, ForeignKey, DECIMAL, LargeBinary
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from core.database import Base

class DamageDetection(Base):
    __tablename__ = "damage_detections"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    contract_id = Column(UUID(as_uuid=True), ForeignKey("contracts.id"))
    car_id = Column(UUID(as_uuid=True), ForeignKey("cars.id"))
    
    # Image paths (S3 URLs)
    before_image_path = Column(String, nullable=False)
    after_image_path = Column(String, nullable=False)
    
    # AI Analysis Results
    damage_detected = Column(Boolean, default=False)
    confidence_score = Column(DECIMAL(5, 4), nullable=True)  # 0.0000 to 1.0000
    damage_severity = Column(String, nullable=True)  # low, medium, high, critical
    
    # SSIM and LPIPS scores
    ssim_score = Column(DECIMAL(5, 4), nullable=True)
    lpips_score = Column(DECIMAL(5, 4), nullable=True)
    
    # YOLOv8 Detection Results
    yolo_detections = Column(JSON, nullable=True)  # Bounding boxes, classes, confidences
    segmentation_mask_path = Column(String, nullable=True)  # S3 path to segmentation mask
    
    # Heatmap paths
    ssim_heatmap_path = Column(String, nullable=True)
    lpips_heatmap_path = Column(String, nullable=True)
    combined_heatmap_path = Column(String, nullable=True)
    
    # Overlay images
    damage_overlay_path = Column(String, nullable=True)
    annotated_image_path = Column(String, nullable=True)
    
    # Model information
    model_version = Column(String, nullable=True)
    inference_time_ms = Column(Integer, nullable=True)
    
    # Active learning
    needs_human_review = Column(Boolean, default=False)
    uncertainty_score = Column(DECIMAL(5, 4), nullable=True)
    
    # Status tracking
    status = Column(String, default="processing")  # processing, completed, failed, reviewed
    processing_stage = Column(String, nullable=True)  # ssim, lpips, yolo, overlay, completed
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    contract = relationship("Contract", back_populates="damage_detections")
    car = relationship("Car", back_populates="damage_detections")
    labels = relationship("DamageLabel", back_populates="detection")

class DamageLabel(Base):
    __tablename__ = "damage_labels"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    detection_id = Column(UUID(as_uuid=True), ForeignKey("damage_detections.id"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    
    # Label data
    is_damage = Column(Boolean, nullable=False)  # True if damage exists, False if no damage
    damage_type = Column(String, nullable=True)  # scratch, dent, crack, paint_damage, etc.
    severity = Column(String, nullable=True)  # low, medium, high, critical
    confidence = Column(DECIMAL(5, 4), nullable=True)  # Human confidence in label
    
    # Bounding box annotations (if damage exists)
    bounding_boxes = Column(JSON, nullable=True)  # Array of [x, y, width, height] boxes
    polygon_annotations = Column(JSON, nullable=True)  # Array of polygon points
    
    # Additional metadata
    notes = Column(Text, nullable=True)
    label_source = Column(String, default="human")  # human, ai, consensus
    
    # Quality metrics
    labeling_time_seconds = Column(Integer, nullable=True)
    inter_annotator_agreement = Column(DECIMAL(5, 4), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    detection = relationship("DamageDetection", back_populates="labels")
    user = relationship("User")

class DamageModel(Base):
    __tablename__ = "damage_models"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Model metadata
    model_name = Column(String, nullable=False)
    model_version = Column(String, nullable=False)
    model_type = Column(String, nullable=False)  # yolo, ssim, lpips, ensemble
    
    # Model files (S3 paths)
    model_weights_path = Column(String, nullable=True)
    model_config_path = Column(String, nullable=True)
    model_metadata_path = Column(String, nullable=True)
    
    # Training information
    training_dataset_size = Column(Integer, nullable=True)
    validation_dataset_size = Column(Integer, nullable=True)
    training_epochs = Column(Integer, nullable=True)
    learning_rate = Column(DECIMAL(10, 8), nullable=True)
    
    # Performance metrics
    accuracy = Column(DECIMAL(5, 4), nullable=True)
    precision = Column(DECIMAL(5, 4), nullable=True)
    recall = Column(DECIMAL(5, 4), nullable=True)
    f1_score = Column(DECIMAL(5, 4), nullable=True)
    mAP = Column(DECIMAL(5, 4), nullable=True)  # Mean Average Precision
    
    # Model status
    status = Column(String, default="training")  # training, trained, deployed, deprecated
    is_active = Column(Boolean, default=False)
    
    # Training metadata
    training_started_at = Column(DateTime, nullable=True)
    training_completed_at = Column(DateTime, nullable=True)
    last_trained_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class DamageTrainingJob(Base):
    __tablename__ = "damage_training_jobs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    model_id = Column(UUID(as_uuid=True), ForeignKey("damage_models.id"))
    
    # Job configuration
    job_type = Column(String, nullable=False)  # full_training, fine_tune, active_learning
    training_config = Column(JSON, nullable=True)
    
    # Dataset information
    training_samples = Column(Integer, nullable=True)
    validation_samples = Column(Integer, nullable=True)
    new_labels_count = Column(Integer, default=0)
    
    # Job status
    status = Column(String, default="pending")  # pending, running, completed, failed
    progress_percentage = Column(DECIMAL(5, 2), default=0.00)
    
    # Results
    final_metrics = Column(JSON, nullable=True)
    error_message = Column(Text, nullable=True)
    
    # Timing
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    estimated_completion = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    model = relationship("DamageModel")

class DamageMetrics(Base):
    __tablename__ = "damage_metrics"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    model_id = Column(UUID(as_uuid=True), ForeignKey("damage_models.id"))
    
    # Metrics data
    metric_type = Column(String, nullable=False)  # accuracy, precision, recall, f1, mAP
    metric_value = Column(DECIMAL(10, 6), nullable=False)
    metric_threshold = Column(DECIMAL(10, 6), nullable=True)
    
    # Context
    dataset_split = Column(String, nullable=True)  # train, validation, test
    damage_type = Column(String, nullable=True)  # specific damage type or "overall"
    
    # Metadata
    evaluation_date = Column(DateTime, default=datetime.utcnow)
    sample_size = Column(Integer, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    model = relationship("DamageModel")

# Update existing models to include relationships
from core.database import Contract, Car

# Add relationships to existing models
if not hasattr(Contract, 'damage_detections'):
    Contract.damage_detections = relationship("DamageDetection", back_populates="contract")

if not hasattr(Car, 'damage_detections'):
    Car.damage_detections = relationship("DamageDetection", back_populates="car")
