"""
Frontend Hooks for Damage AI v1.1
Provides endpoints for frontend integration with overlays and label submission
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

from core.middleware import SupabaseAuthMiddleware
from core.database import supabase
from services.s3_storage import s3_service

router = APIRouter()

class DamageOverlayRequest(BaseModel):
    detection_id: str
    overlay_type: str  # ssim, lpips, yolo, combined

class DamageOverlayResponse(BaseModel):
    detection_id: str
    overlay_url: str
    overlay_type: str
    presigned_url: str
    expires_at: datetime

class LabelSubmissionRequest(BaseModel):
    detection_id: str
    is_damage: bool
    damage_type: Optional[str] = None
    severity: Optional[str] = None
    confidence: Optional[float] = None
    bounding_boxes: Optional[List[List[float]]] = None
    polygon_annotations: Optional[List[List[List[float]]]] = None
    notes: Optional[str] = None

class LabelSubmissionResponse(BaseModel):
    label_id: str
    detection_id: str
    success: bool
    message: str

@router.get("/damage-detections")
async def get_damage_detections(
    contract_id: Optional[str] = Query(None),
    car_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(20, le=100),
    offset: int = Query(0, ge=0),
    user_id: str = Depends(SupabaseAuthMiddleware)
):
    """
    Get damage detections for frontend display
    """
    try:
        query = supabase.from('damage_detections').select('*')
        
        if contract_id:
            query = query.eq('contract_id', contract_id)
        if car_id:
            query = query.eq('car_id', car_id)
        if status:
            query = query.eq('status', status)
        
        query = query.order('created_at', desc=True).range(offset, offset + limit - 1)
        response = query.execute()
        
        detections = response.data or []
        
        # Generate presigned URLs for images
        for detection in detections:
            detection['presigned_urls'] = {}
            
            # Generate presigned URLs for all image paths
            for key, url in [
                ('before_image', detection.get('before_image_path')),
                ('after_image', detection.get('after_image_path')),
                ('ssim_heatmap', detection.get('ssim_heatmap_path')),
                ('lpips_heatmap', detection.get('lpips_heatmap_path')),
                ('damage_overlay', detection.get('damage_overlay_path')),
                ('annotated_image', detection.get('annotated_image_path'))
            ]:
                if url:
                    presigned_url = s3_service.generate_presigned_url(url, expiration=3600)
                    if presigned_url:
                        detection['presigned_urls'][key] = presigned_url
        
        return {
            'detections': detections,
            'total': len(detections),
            'limit': limit,
            'offset': offset
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get damage detections: {str(e)}"
        )

@router.get("/damage-detections/{detection_id}")
async def get_damage_detection_detail(
    detection_id: str,
    user_id: str = Depends(SupabaseAuthMiddleware)
):
    """
    Get detailed damage detection with all overlays and heatmaps
    """
    try:
        response = supabase.from('damage_detections').select('*').eq('id', detection_id).single().execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Damage detection not found"
            )
        
        detection = response.data
        
        # Generate presigned URLs for all images
        presigned_urls = {}
        for key, url in [
            ('before_image', detection.get('before_image_path')),
            ('after_image', detection.get('after_image_path')),
            ('ssim_heatmap', detection.get('ssim_heatmap_path')),
            ('lpips_heatmap', detection.get('lpips_heatmap_path')),
            ('damage_overlay', detection.get('damage_overlay_path')),
            ('annotated_image', detection.get('annotated_image_path'))
        ]:
            if url:
                presigned_url = s3_service.generate_presigned_url(url, expiration=3600)
                if presigned_url:
                    presigned_urls[key] = presigned_url
        
        # Get labels for this detection
        labels_response = supabase.from('damage_labels').select('*').eq('detection_id', detection_id).execute()
        labels = labels_response.data or []
        
        return {
            **detection,
            'presigned_urls': presigned_urls,
            'labels': labels
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get damage detection: {str(e)}"
        )

@router.post("/damage-overlays", response_model=DamageOverlayResponse)
async def get_damage_overlay(
    overlay_request: DamageOverlayRequest,
    user_id: str = Depends(SupabaseAuthMiddleware)
):
    """
    Get damage overlay image with presigned URL
    """
    try:
        # Get detection
        response = supabase.from('damage_detections').select('*').eq('id', overlay_request.detection_id).single().execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Damage detection not found"
            )
        
        detection = response.data
        
        # Get overlay URL based on type
        overlay_url = None
        if overlay_request.overlay_type == 'ssim':
            overlay_url = detection.get('ssim_heatmap_path')
        elif overlay_request.overlay_type == 'lpips':
            overlay_url = detection.get('lpips_heatmap_path')
        elif overlay_request.overlay_type == 'yolo':
            overlay_url = detection.get('damage_overlay_path')
        elif overlay_request.overlay_type == 'combined':
            overlay_url = detection.get('damage_overlay_path')
        
        if not overlay_url:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Overlay type '{overlay_request.overlay_type}' not found"
            )
        
        # Generate presigned URL
        presigned_url = s3_service.generate_presigned_url(overlay_url, expiration=3600)
        
        if not presigned_url:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate presigned URL"
            )
        
        return DamageOverlayResponse(
            detection_id=overlay_request.detection_id,
            overlay_url=overlay_url,
            overlay_type=overlay_request.overlay_type,
            presigned_url=presigned_url,
            expires_at=datetime.utcnow()
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get damage overlay: {str(e)}"
        )

@router.post("/submit-label", response_model=LabelSubmissionResponse)
async def submit_damage_label(
    label_request: LabelSubmissionRequest,
    user_id: str = Depends(SupabaseAuthMiddleware)
):
    """
    Submit human label for damage detection (frontend integration)
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
        import uuid
        label_id = str(uuid.uuid4())
        
        label_data = {
            'id': label_id,
            'detection_id': label_request.detection_id,
            'user_id': user_id,
            'is_damage': label_request.is_damage,
            'damage_type': label_request.damage_type,
            'severity': label_request.severity,
            'confidence': label_request.confidence,
            'bounding_boxes': label_request.bounding_boxes,
            'polygon_annotations': label_request.polygon_annotations,
            'notes': label_request.notes,
            'label_source': 'human',
            'labeling_time_seconds': None  # Could be calculated on frontend
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
            'status': 'reviewed',
            'needs_human_review': False
        }).eq('id', label_request.detection_id).execute()
        
        return LabelSubmissionResponse(
            label_id=label_id,
            detection_id=label_request.detection_id,
            success=True,
            message="Label submitted successfully"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit label: {str(e)}"
        )

@router.get("/pending-reviews")
async def get_pending_reviews(
    limit: int = Query(10, le=50),
    user_id: str = Depends(SupabaseAuthMiddleware)
):
    """
    Get detections that need human review (for active learning)
    """
    try:
        response = supabase.from('damage_detections').select('*').eq('needs_human_review', True).order('uncertainty_score', desc=True).limit(limit).execute()
        
        detections = response.data or []
        
        # Generate presigned URLs for images
        for detection in detections:
            detection['presigned_urls'] = {}
            
            for key, url in [
                ('before_image', detection.get('before_image_path')),
                ('after_image', detection.get('after_image_path')),
                ('ssim_heatmap', detection.get('ssim_heatmap_path')),
                ('lpips_heatmap', detection.get('lpips_heatmap_path')),
                ('damage_overlay', detection.get('damage_overlay_path'))
            ]:
                if url:
                    presigned_url = s3_service.generate_presigned_url(url, expiration=3600)
                    if presigned_url:
                        detection['presigned_urls'][key] = presigned_url
        
        return {
            'pending_reviews': detections,
            'count': len(detections)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get pending reviews: {str(e)}"
        )

@router.get("/model-metrics")
async def get_model_metrics(
    user_id: str = Depends(SupabaseAuthMiddleware)
):
    """
    Get current model performance metrics for frontend display
    """
    try:
        # Get latest metrics for active model
        response = supabase.from('damage_metrics').select('*').order('evaluation_date', desc=True).limit(20).execute()
        
        metrics = response.data or []
        
        # Group metrics by model and date
        metrics_by_date = {}
        for metric in metrics:
            date = metric['evaluation_date'][:10]  # Get date part
            if date not in metrics_by_date:
                metrics_by_date[date] = {}
            metrics_by_date[date][metric['metric_type']] = metric['metric_value']
        
        # Get latest overall metrics
        latest_metrics = {}
        if metrics:
            latest_date = max(metrics_by_date.keys())
            latest_metrics = metrics_by_date[latest_date]
        
        return {
            'latest_metrics': latest_metrics,
            'metrics_history': metrics_by_date,
            'last_updated': metrics[0]['evaluation_date'] if metrics else None
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get model metrics: {str(e)}"
        )

@router.get("/training-status")
async def get_training_status(
    user_id: str = Depends(SupabaseAuthMiddleware)
):
    """
    Get current training job status
    """
    try:
        # Get latest training job
        response = supabase.from('damage_training_jobs').select('*').order('created_at', desc=True).limit(1).execute()
        
        if not response.data:
            return {
                'status': 'no_training_jobs',
                'message': 'No training jobs found'
            }
        
        job = response.data[0]
        
        return {
            'job_id': job['id'],
            'status': job['status'],
            'progress_percentage': job.get('progress_percentage', 0),
            'started_at': job.get('started_at'),
            'completed_at': job.get('completed_at'),
            'estimated_completion': job.get('estimated_completion'),
            'final_metrics': job.get('final_metrics'),
            'error_message': job.get('error_message')
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get training status: {str(e)}"
        )

@router.post("/trigger-training")
async def trigger_manual_training(
    user_id: str = Depends(SupabaseAuthMiddleware)
):
    """
    Manually trigger model training (admin function)
    """
    try:
        # Check if there's already a running training job
        running_jobs = supabase.from('damage_training_jobs').select('id').in_('status', ['pending', 'running']).execute()
        
        if running_jobs.data:
            return {
                'success': False,
                'message': 'Training job already in progress',
                'job_id': running_jobs.data[0]['id']
            }
        
        # Create new training job
        import uuid
        job_id = str(uuid.uuid4())
        
        job_data = {
            'id': job_id,
            'job_type': 'manual_training',
            'status': 'pending',
            'training_config': {
                'triggered_by': user_id,
                'manual_trigger': True
            }
        }
        
        response = supabase.from('damage_training_jobs').insert([job_data]).execute()
        
        if response.data:
            return {
                'success': True,
                'message': 'Training job created successfully',
                'job_id': job_id
            }
        else:
            raise Exception("Failed to create training job")
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to trigger training: {str(e)}"
        )
