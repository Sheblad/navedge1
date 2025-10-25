"""
Advanced Image Preprocessing for Damage Detection
Reduces false positives by normalizing images before analysis
"""

import cv2
import numpy as np
from PIL import Image, ImageEnhance
from typing import Tuple
import logging

logger = logging.getLogger(__name__)

class ImagePreprocessor:
    def __init__(self):
        self.target_size = (1024, 768)  # Standard size for consistent analysis
    
    def preprocess_image_pair(self, before_img: np.ndarray, after_img: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Preprocess both images to reduce false positives from lighting/angle differences
        """
        try:
            # Step 1: Resize to standard size
            before_resized = cv2.resize(before_img, self.target_size)
            after_resized = cv2.resize(after_img, self.target_size)
            
            # Step 2: Normalize lighting
            before_normalized = self._normalize_lighting(before_resized)
            after_normalized = self._normalize_lighting(after_resized)
            
            # Step 3: Align images (compensate for slight camera movement)
            before_aligned, after_aligned = self._align_images(before_normalized, after_normalized)
            
            # Step 4: Remove reflections and shadows
            before_cleaned = self._remove_reflections(before_aligned)
            after_cleaned = self._remove_reflections(after_aligned)
            
            return before_cleaned, after_cleaned
            
        except Exception as e:
            logger.error(f"Image preprocessing failed: {e}")
            return before_img, after_img
    
    def _normalize_lighting(self, image: np.ndarray) -> np.ndarray:
        """Normalize lighting to reduce false positives from shadows/lighting changes"""
        try:
            # Convert to LAB color space for better lighting normalization
            lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab)
            
            # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            l = clahe.apply(l)
            
            # Merge channels and convert back to BGR
            lab = cv2.merge([l, a, b])
            normalized = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)
            
            return normalized
            
        except Exception as e:
            logger.error(f"Lighting normalization failed: {e}")
            return image
    
    def _align_images(self, img1: np.ndarray, img2: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """Align images to compensate for slight camera movement"""
        try:
            # Convert to grayscale for feature detection
            gray1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
            gray2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)
            
            # Detect keypoints and descriptors
            orb = cv2.ORB_create()
            kp1, des1 = orb.detectAndCompute(gray1, None)
            kp2, des2 = orb.detectAndCompute(gray2, None)
            
            if des1 is None or des2 is None:
                return img1, img2
            
            # Match features
            bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
            matches = bf.match(des1, des2)
            matches = sorted(matches, key=lambda x: x.distance)
            
            # Use top matches for alignment
            if len(matches) > 10:
                src_pts = np.float32([kp1[m.queryIdx].pt for m in matches[:20]]).reshape(-1, 1, 2)
                dst_pts = np.float32([kp2[m.trainIdx].pt for m in matches[:20]]).reshape(-1, 1, 2)
                
                # Find homography matrix
                M, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)
                
                if M is not None:
                    # Apply transformation to align img2 to img1
                    h, w = img1.shape[:2]
                    img2_aligned = cv2.warpPerspective(img2, M, (w, h))
                    return img1, img2_aligned
            
            return img1, img2
            
        except Exception as e:
            logger.error(f"Image alignment failed: {e}")
            return img1, img2
    
    def _remove_reflections(self, image: np.ndarray) -> np.ndarray:
        """Remove reflections and shadows that can cause false positives"""
        try:
            # Convert to HSV for better reflection detection
            hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
            h, s, v = cv2.split(hsv)
            
            # Create mask for bright reflections
            reflection_mask = cv2.inRange(v, 200, 255)
            
            # Dilate mask to cover reflection areas
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
            reflection_mask = cv2.dilate(reflection_mask, kernel, iterations=2)
            
            # Inpaint reflections (fill with surrounding colors)
            result = cv2.inpaint(image, reflection_mask, 3, cv2.INPAINT_TELEA)
            
            return result
            
        except Exception as e:
            logger.error(f"Reflection removal failed: {e}")
            return image
    
    def enhance_damage_visibility(self, image: np.ndarray) -> np.ndarray:
        """Enhance image to make damage more visible"""
        try:
            # Convert to PIL for enhancement
            pil_image = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
            
            # Enhance contrast
            enhancer = ImageEnhance.Contrast(pil_image)
            pil_image = enhancer.enhance(1.2)
            
            # Enhance sharpness
            enhancer = ImageEnhance.Sharpness(pil_image)
            pil_image = enhancer.enhance(1.1)
            
            # Convert back to OpenCV format
            enhanced = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
            
            return enhanced
            
        except Exception as e:
            logger.error(f"Image enhancement failed: {e}")
            return image
