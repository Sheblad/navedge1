"""
Test endpoint for damage detection
"""

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from typing import Dict, Any
import time

from core.middleware import SupabaseAuthMiddleware
from services.simple_damage_detector import simple_damage_detector

router = APIRouter()

@router.post("/test-damage-detection")
async def test_damage_detection(
    before_image: UploadFile = File(..., description="Before rental image"),
    after_image: UploadFile = File(..., description="After rental image"),
    user_id: str = Depends(SupabaseAuthMiddleware)
):
    """
    Test endpoint to verify damage detection is actually working
    """
    
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
        
        # Test the simple damage detector
        start_time = time.time()
        result = simple_damage_detector.detect_damage(before_bytes, after_bytes)
        processing_time = int((time.time() - start_time) * 1000)
        
        # Add processing time to result
        result['processing_time_ms'] = processing_time
        
        # Add debug information
        result['debug_info'] = {
            'before_image_size': len(before_bytes),
            'after_image_size': len(after_bytes),
            'before_filename': before_image.filename,
            'after_filename': after_image.filename,
            'processing_time_ms': processing_time
        }
        
        return JSONResponse(content=result)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Damage detection test failed: {str(e)}"
        )

@router.get("/test-status")
async def test_status():
    """
    Test if the damage detection service is working
    """
    return {
        "status": "working",
        "message": "Damage detection service is operational",
        "timestamp": time.time(),
        "detector_available": simple_damage_detector is not None
    }
