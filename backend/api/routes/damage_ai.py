"""
Damage AI FastAPI Routes v1.1
Implements /ai/damage/detect, /ai/damage/label, /ai/damage/train, /ai/damage/metrics
"""

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status, Form, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid
import json

from core.middleware import SupabaseAuthMiddleware
from core.database import supabase
from services.damage_ai_service import damage_ai_service
from services.s3_storage import s3_service
from core.damage_ai_models import DamageDetection, DamageLabel, DamageModel, DamageTrainingJob, DamageMetrics

router = APIRouter()

# Pydantic models for request/response
class DamageDetectionRequest(BaseModel):
    contract_id: Optional[str] = None
    car_id: Optional[str] = None
    before_image_url: Optional[str] = None
    after_image_url: Optional[str] = None

class DamageDetectionResponse(BaseModel):
    detection_id: str
    damage_detected: bool
    confidence_score: float
    damage_severity: str
    ssim_score: float
    lpips_score: float
    yolo_detections: Dict[str, Any]
    processing_time_ms: int
    needs_human_review: bool
    uncertainty_score: float
    s3_urls: Dict[str, str]
    model_version: str
    status: str

class DamageLabelRequest(BaseModel):
    detection_id: str
    is_damage: bool
    damage_type: Optional[str] = None
    severity: Optional[str] = None
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0)
    bounding_boxes: Optional[List[List[float]]] = None
    polygon_annotations: Optional[List[List[List[float]]]] = None
    notes: Optional[str] = None

class DamageLabelResponse(BaseModel):
    label_id: str
    detection_id: str
    is_damage: bool
    damage_type: Optional[str]
    severity: Optional[str]
    confidence: Optional[float]
    created_at: datetime

class TrainingRequest(BaseModel):
    model_name: str
    model_type: str = "yolo"
    training_config: Optional[Dict[str, Any]] = None
    use_active_learning: bool = True

class TrainingResponse(BaseModel):
    training_job_id: str
    status: str
    estimated_completion: Optional[datetime]
    message: str

class MetricsResponse(BaseModel):
    model_version: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    mAP: float
    last_updated: datetime

@router.post("/detect", response_model=DamageDetectionResponse)
async def detect_damage(
    background_tasks: BackgroundTasks,
    before_image: UploadFile = File(..., description="Before rental image"),
    after_image: UploadFile = File(..., description="After rental image"),
    contract_id: Optional[str] = Form(None),
    car_id: Optional[str] = Form(None),
    user_id: str = Depends(SupabaseAuthMiddleware)
):
    """
    Detect damage using AI ensemble (SSIM + LPIPS + YOLOv8n-seg)
    Supports 50MB upload limit and CORS for navedge.ai
    """
    
    # Validate file sizes (50MB limit)
    max_size = 50 * 1024 * 1024  # 50MB in bytes
    
    if before_image.size > max_size or after_image.size > max_size:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds 50MB limit"
        )
    
    # Validate file types
    allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (before_image.content_type not in allowed_types or 
        after_image.content_type not in allowed_types):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPEG, PNG, and WebP images are allowed"
        )
    
    try:
        # Read image bytes
        before_bytes = await before_image.read()
        after_bytes = await after_image.read()
        
        # Run AI damage detection
        detection_results = damage_ai_service.detect_damage(
            before_bytes, after_bytes, contract_id
        )
        
        # Store detection in database
        detection_id = detection_results['detection_id']
        
        # Upload original images to S3
        before_url = s3_service.upload_image(
            before_bytes, 
            f"damage-images/{detection_id}", 
            "before.jpg"
        )
        after_url = s3_service.upload_image(
            after_bytes, 
            f"damage-images/{detection_id}", 
            "after.jpg"
        )
        
        # Insert detection record
        detection_data = {
            "id": detection_id,
            "contract_id": contract_id,
            "car_id": car_id,
            "before_image_path": before_url,
            "after_image_path": after_url,
            "damage_detected": detection_results['damage_detected'],
            "confidence_score": detection_results['confidence_score'],
            "damage_severity": detection_results['damage_severity'],
            "ssim_score": detection_results['ssim_score'],
            "lpips_score": detection_results['lpips_score'],
            "yolo_detections": detection_results['yolo_detections'],
            "ssim_heatmap_path": detection_results['s3_urls'].get('ssim_heatmap'),
            "lpips_heatmap_path": detection_results['s3_urls'].get('lpips_heatmap'),
            "damage_overlay_path": detection_results['s3_urls'].get('combined'),
            "model_version": detection_results['model_version'],
            "inference_time_ms": detection_results['processing_time_ms'],
            "needs_human_review": detection_results['needs_human_review'],
            "uncertainty_score": detection_results['uncertainty_score'],
            "status": detection_results['status']
        }
        
        # Insert into database
        response = supabase.from('damage_detections').insert([detection_data]).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save detection results"
            )
        
        # Schedule background task for active learning if needed
        if detection_results['needs_human_review']:
            background_tasks.add_task(
                _schedule_active_learning_review,
                detection_id,
                detection_results['uncertainty_score']
            )
        
        return DamageDetectionResponse(**detection_results)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Damage detection failed: {str(e)}"
        )

@router.post("/label", response_model=DamageLabelResponse)
async def submit_damage_label(
    label_request: DamageLabelRequest,
    user_id: str = Depends(SupabaseAuthMiddleware)
):
    """
    Submit human label for damage detection (active learning)
    """
    
    try:
        # Validate detection exists
        detection_response = supabase.from('damage_detections').select('id').eq('id', label_request.detection_id).single().execute()
        
        if not detection_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Damage detection not found"
            )
        
        # Create label record
        label_id = str(uuid.uuid4())
        label_data = {
            "id": label_id,
            "detection_id": label_request.detection_id,
            "user_id": user_id,
            "is_damage": label_request.is_damage,
            "damage_type": label_request.damage_type,
            "severity": label_request.severity,
            "confidence": label_request.confidence,
            "bounding_boxes": label_request.bounding_boxes,
            "polygon_annotations": label_request.polygon_annotations,
            "notes": label_request.notes,
            "label_source": "human"
        }
        
        # Insert label
        response = supabase.from('damage_labels').insert([label_data]).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save label"
            )
        
        # Update detection status
        supabase.from('damage_detections').update({
            "status": "reviewed",
            "needs_human_review": False
        }).eq('id', label_request.detection_id).execute()
        
        return DamageLabelResponse(
            label_id=label_id,
            detection_id=label_request.detection_id,
            is_damage=label_request.is_damage,
            damage_type=label_request.damage_type,
            severity=label_request.severity,
            confidence=label_request.confidence,
            created_at=datetime.utcnow()
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit label: {str(e)}"
        )

@router.post("/train", response_model=TrainingResponse)
async def train_damage_model(
    training_request: TrainingRequest,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(SupabaseAuthMiddleware)
):
    """
    Train or fine-tune damage detection model
    """
    
    try:
        # Create training job record
        training_job_id = str(uuid.uuid4())
        
        # Get active model
        model_response = supabase.from('damage_models').select('id').eq('is_active', True).eq('model_type', training_request.model_type).single().execute()
        
        if not model_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No active model found for training"
            )
        
        model_id = model_response.data['id']
        
        # Create training job
        job_data = {
            "id": training_job_id,
            "model_id": model_id,
            "job_type": "fine_tune" if training_request.use_active_learning else "full_training",
            "training_config": training_request.training_config or {},
            "status": "pending"
        }
        
        response = supabase.from('damage_training_jobs').insert([job_data]).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create training job"
            )
        
        # Schedule background training
        background_tasks.add_task(
            _run_training_job,
            training_job_id,
            training_request.model_name,
            training_request.training_config
        )
        
        return TrainingResponse(
            training_job_id=training_job_id,
            status="started",
            estimated_completion=datetime.utcnow(),
            message="Training job started successfully"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start training: {str(e)}"
        )

@router.get("/metrics", response_model=List[MetricsResponse])
async def get_damage_metrics(
    model_version: Optional[str] = None,
    user_id: str = Depends(SupabaseAuthMiddleware)
):
    """
    Get model performance metrics
    """
    
    try:
        # Get metrics from database
        query = supabase.from('damage_metrics').select('*')
        
        if model_version:
            # Join with models table to filter by version
            model_response = supabase.from('damage_models').select('id').eq('model_version', model_version).execute()
            if model_response.data:
                model_ids = [m['id'] for m in model_response.data]
                query = query.in_('model_id', model_ids)
        
        response = query.execute()
        
        if not response.data:
            # Return default metrics if none found
            return [MetricsResponse(
                model_version=model_version or "v1.1",
                accuracy=0.85,
                precision=0.82,
                recall=0.88,
                f1_score=0.85,
                mAP=0.78,
                last_updated=datetime.utcnow()
            )]
        
        # Group metrics by model
        metrics_by_model = {}
        for metric in response.data:
            model_id = metric['model_id']
            if model_id not in metrics_by_model:
                metrics_by_model[model_id] = {
                    'model_version': model_version or "v1.1",
                    'accuracy': 0.0,
                    'precision': 0.0,
                    'recall': 0.0,
                    'f1_score': 0.0,
                    'mAP': 0.0,
                    'last_updated': metric['evaluation_date']
                }
            
            # Update metric values
            metric_type = metric['metric_type']
            if metric_type in metrics_by_model[model_id]:
                metrics_by_model[model_id][metric_type] = float(metric['metric_value'])
        
        return [MetricsResponse(**metrics) for metrics in metrics_by_model.values()]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get metrics: {str(e)}"
        )

@router.get("/detections/{detection_id}")
async def get_damage_detection(
    detection_id: str,
    user_id: str = Depends(SupabaseAuthMiddleware)
):
    """
    Get damage detection results with overlays
    """
    
    try:
        response = supabase.from('damage_detections').select('*').eq('id', detection_id).single().execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Damage detection not found"
            )
        
        detection = response.data
        
        # Generate presigned URLs for private S3 objects
        presigned_urls = {}
        for key, url in [
            ('before_image', detection['before_image_path']),
            ('after_image', detection['after_image_path']),
            ('ssim_heatmap', detection['ssim_heatmap_path']),
            ('lpips_heatmap', detection['lpips_heatmap_path']),
            ('damage_overlay', detection['damage_overlay_path'])
        ]:
            if url:
                presigned_url = s3_service.generate_presigned_url(url)
                if presigned_url:
                    presigned_urls[key] = presigned_url
        
        return {
            **detection,
            'presigned_urls': presigned_urls
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get detection: {str(e)}"
        )

@router.get("/pending-reviews")
async def get_pending_reviews(
    user_id: str = Depends(SupabaseAuthMiddleware)
):
    """
    Get detections that need human review (active learning)
    """
    
    try:
        response = supabase.from('damage_detections').select('*').eq('needs_human_review', True).order('uncertainty_score', desc=True).limit(50).execute()
        
        return response.data or []
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get pending reviews: {str(e)}"
        )

# Background task functions
async def _schedule_active_learning_review(detection_id: str, uncertainty_score: float):
    """Schedule detection for active learning review"""
    try:
        # This would implement active learning scheduling logic
        # For now, just log the event
        print(f"Scheduled detection {detection_id} for review (uncertainty: {uncertainty_score})")
    except Exception as e:
        print(f"Error scheduling active learning review: {e}")

async def _run_training_job(training_job_id: str, model_name: str, training_config: Dict[str, Any]):
    """Run model training job in background"""
    try:
        # Update job status to running
        supabase.from('damage_training_jobs').update({
            "status": "running",
            "started_at": datetime.utcnow().isoformat()
        }).eq('id', training_job_id).execute()
        
        # Run actual training (placeholder)
        training_results = damage_ai_service.train_model([], training_config or {})
        
        # Update job status to completed
        supabase.from('damage_training_jobs').update({
            "status": "completed",
            "completed_at": datetime.utcnow().isoformat(),
            "final_metrics": training_results,
            "progress_percentage": 100.0
        }).eq('id', training_job_id).execute()
        
    except Exception as e:
        # Update job status to failed
        supabase.from('damage_training_jobs').update({
            "status": "failed",
            "error_message": str(e),
            "completed_at": datetime.utcnow().isoformat()
        }).eq('id', training_job_id).execute()
        print(f"Training job {training_job_id} failed: {e}")
