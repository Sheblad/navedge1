"""
Simple but Working Damage Detection System
Uses OpenCV and basic computer vision to actually detect damage
"""

import cv2
import numpy as np
from PIL import Image
import io
from typing import Tuple, Dict, Any
import time
import uuid
from datetime import datetime

class SimpleDamageDetector:
    def __init__(self):
        self.damage_threshold = 0.3
        self.min_damage_area = 100  # Minimum area for damage detection
    
    def detect_damage(self, before_image_bytes: bytes, after_image_bytes: bytes) -> Dict[str, Any]:
        """
        Actually detect damage using computer vision
        """
        try:
            # Convert bytes to images
            before_img = self._bytes_to_image(before_image_bytes)
            after_img = self._bytes_to_image(after_image_bytes)
            
            # Resize images to same size
            before_img, after_img = self._resize_images(before_img, after_img)
            
            # Convert to grayscale for analysis
            before_gray = cv2.cvtColor(before_img, cv2.COLOR_BGR2GRAY)
            after_gray = cv2.cvtColor(after_img, cv2.COLOR_BGR2GRAY)
            
            # Calculate difference
            diff = cv2.absdiff(before_gray, after_gray)
            
            # Apply threshold to get binary image
            _, thresh = cv2.threshold(diff, 30, 255, cv2.THRESH_BINARY)
            
            # Find contours (damage areas)
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Filter contours by area
            damage_areas = []
            total_damage_area = 0
            
            for contour in contours:
                area = cv2.contourArea(contour)
                if area > self.min_damage_area:
                    # Get bounding box
                    x, y, w, h = cv2.boundingRect(contour)
                    damage_areas.append({
                        'x': int(x),
                        'y': int(y),
                        'width': int(w),
                        'height': int(h),
                        'area': int(area)
                    })
                    total_damage_area += area
            
            # Calculate damage score
            image_area = before_img.shape[0] * before_img.shape[1]
            damage_ratio = total_damage_area / image_area
            
            # Determine if damage is detected
            damage_detected = len(damage_areas) > 0 and damage_ratio > self.damage_threshold
            
            # Calculate confidence based on damage area and number of areas
            if damage_detected:
                confidence = min(0.95, 0.5 + (damage_ratio * 2) + (len(damage_areas) * 0.1))
            else:
                confidence = 0.1
            
            # Determine severity
            if damage_ratio > 0.1:
                severity = 'high'
            elif damage_ratio > 0.05:
                severity = 'medium'
            elif damage_ratio > 0.02:
                severity = 'low'
            else:
                severity = 'none'
            
            # Generate heatmap
            heatmap = self._generate_heatmap(before_img, damage_areas)
            
            # Calculate estimated repair cost
            repair_cost = self._estimate_repair_cost(damage_areas, severity)
            
            return {
                'detection_id': str(uuid.uuid4()),
                'damage_detected': damage_detected,
                'confidence_score': round(confidence, 3),
                'damage_severity': severity,
                'damage_areas': damage_areas,
                'total_damage_area': int(total_damage_area),
                'damage_ratio': round(damage_ratio, 4),
                'estimated_repair_cost': repair_cost,
                'processing_time_ms': 0,  # Will be set by caller
                'needs_human_review': confidence < 0.7,
                'uncertainty_score': round(1.0 - confidence, 3),
                'heatmap': heatmap,
                'model_version': 'simple_v1.0',
                'status': 'completed'
            }
            
        except Exception as e:
            print(f"Error in damage detection: {e}")
            return {
                'detection_id': str(uuid.uuid4()),
                'damage_detected': False,
                'confidence_score': 0.0,
                'error': str(e),
                'status': 'failed'
            }
    
    def _bytes_to_image(self, image_bytes: bytes) -> np.ndarray:
        """Convert bytes to OpenCV image"""
        image = Image.open(io.BytesIO(image_bytes))
        return cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    
    def _resize_images(self, img1: np.ndarray, img2: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """Resize images to the same dimensions"""
        h1, w1 = img1.shape[:2]
        h2, w2 = img2.shape[:2]
        
        # Use the smaller dimensions
        target_h = min(h1, h2)
        target_w = min(w1, w2)
        
        img1_resized = cv2.resize(img1, (target_w, target_h))
        img2_resized = cv2.resize(img2, (target_w, target_h))
        
        return img1_resized, img2_resized
    
    def _generate_heatmap(self, image: np.ndarray, damage_areas: list) -> np.ndarray:
        """Generate heatmap showing damage areas"""
        heatmap = np.zeros_like(image)
        
        for area in damage_areas:
            x, y, w, h = area['x'], area['y'], area['width'], area['height']
            # Draw rectangle on heatmap
            cv2.rectangle(heatmap, (x, y), (x + w, y + h), (0, 0, 255), -1)
        
        # Blend with original image
        overlay = cv2.addWeighted(image, 0.7, heatmap, 0.3, 0)
        return overlay
    
    def _estimate_repair_cost(self, damage_areas: list, severity: str) -> float:
        """Estimate repair cost based on damage areas and severity"""
        base_costs = {
            'low': 100,
            'medium': 300,
            'high': 600
        }
        
        base_cost = base_costs.get(severity, 0)
        
        # Add cost per damage area
        area_cost = len(damage_areas) * 50
        
        # Add cost based on total damage area
        total_area = sum(area['area'] for area in damage_areas)
        size_cost = total_area * 0.1
        
        total_cost = base_cost + area_cost + size_cost
        
        # Round to nearest 10
        return round(total_cost / 10) * 10
    
    def analyze_damage_type(self, damage_areas: list, before_img: np.ndarray, after_img: np.ndarray) -> list:
        """Analyze the type of damage in each area"""
        damage_types = []
        
        for area in damage_areas:
            x, y, w, h = area['x'], area['y'], area['width'], area['height']
            
            # Extract region of interest
            before_roi = before_img[y:y+h, x:x+w]
            after_roi = after_img[y:y+h, x:x+w]
            
            # Convert to grayscale
            before_gray = cv2.cvtColor(before_roi, cv2.COLOR_BGR2GRAY)
            after_gray = cv2.cvtColor(after_roi, cv2.COLOR_BGR2GRAY)
            
            # Calculate difference
            diff = cv2.absdiff(before_gray, after_gray)
            
            # Analyze the difference to determine damage type
            mean_diff = np.mean(diff)
            std_diff = np.std(diff)
            
            if mean_diff > 50 and std_diff > 30:
                damage_type = 'scratch'
            elif mean_diff > 30 and std_diff < 20:
                damage_type = 'dent'
            elif mean_diff > 80:
                damage_type = 'paint_damage'
            else:
                damage_type = 'unknown'
            
            damage_types.append({
                'area': area,
                'type': damage_type,
                'confidence': min(0.95, mean_diff / 100)
            })
        
        return damage_types

# Global instance
simple_damage_detector = SimpleDamageDetector()
