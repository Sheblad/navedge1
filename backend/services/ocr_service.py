"""
OCR Service for document text extraction
"""

import pytesseract
from PIL import Image
import cv2
import numpy as np
import re
from typing import Dict, Any
import os

class OCRService:
    def __init__(self):
        # Configure tesseract path
        if os.path.exists("/usr/bin/tesseract"):
            pytesseract.pytesseract.tesseract_cmd = "/usr/bin/tesseract"
    
    def extract_emirates_id(self, image_path: str) -> Dict[str, Any]:
        """Extract text from Emirates ID"""
        try:
            # Load and preprocess image
            image = cv2.imread(image_path)
            processed_image = self._preprocess_image(image)
            
            # Extract text
            text = pytesseract.image_to_string(processed_image, lang='eng+ara')
            
            # Parse Emirates ID specific fields
            extracted_data = self._parse_emirates_id(text)
            
            return {
                "success": True,
                "raw_text": text,
                "parsed_data": extracted_data
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "raw_text": "",
                "parsed_data": {}
            }
    
    def extract_driver_license(self, image_path: str) -> Dict[str, Any]:
        """Extract text from driver license"""
        try:
            # Load and preprocess image
            image = cv2.imread(image_path)
            processed_image = self._preprocess_image(image)
            
            # Extract text
            text = pytesseract.image_to_string(processed_image, lang='eng+ara')
            
            # Parse driver license specific fields
            extracted_data = self._parse_driver_license(text)
            
            return {
                "success": True,
                "raw_text": text,
                "parsed_data": extracted_data
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "raw_text": "",
                "parsed_data": {}
            }
    
    def _preprocess_image(self, image):
        """Preprocess image for better OCR results"""
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply Gaussian blur
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Apply threshold
        _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Morphological operations
        kernel = np.ones((2, 2), np.uint8)
        processed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
        
        return processed
    
    def _parse_emirates_id(self, text: str) -> Dict[str, Any]:
        """Parse Emirates ID specific fields"""
        data = {}
        
        # Extract Emirates ID number (usually starts with 784)
        emirates_id_match = re.search(r'784\d{12}', text)
        if emirates_id_match:
            data['emirates_id'] = emirates_id_match.group()
        
        # Extract name (usually in Arabic and English)
        name_patterns = [
            r'Name[:\s]+([A-Za-z\s]+)',
            r'الاسم[:\s]+([أ-ي\s]+)',
        ]
        
        for pattern in name_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                data['name'] = match.group(1).strip()
                break
        
        # Extract date of birth
        dob_patterns = [
            r'(\d{1,2}[/-]\d{1,2}[/-]\d{4})',
            r'(\d{4}[/-]\d{1,2}[/-]\d{1,2})',
        ]
        
        for pattern in dob_patterns:
            match = re.search(pattern, text)
            if match:
                data['date_of_birth'] = match.group(1)
                break
        
        # Extract nationality
        nationality_match = re.search(r'Nationality[:\s]+([A-Za-z\s]+)', text, re.IGNORECASE)
        if nationality_match:
            data['nationality'] = nationality_match.group(1).strip()
        
        return data
    
    def _parse_driver_license(self, text: str) -> Dict[str, Any]:
        """Parse driver license specific fields"""
        data = {}
        
        # Extract license number
        license_patterns = [
            r'License[:\s]+([A-Z0-9]+)',
            r'رقم[:\s]+([A-Z0-9]+)',
        ]
        
        for pattern in license_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                data['license_number'] = match.group(1).strip()
                break
        
        # Extract name
        name_patterns = [
            r'Name[:\s]+([A-Za-z\s]+)',
            r'الاسم[:\s]+([أ-ي\s]+)',
        ]
        
        for pattern in name_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                data['name'] = match.group(1).strip()
                break
        
        # Extract date of birth
        dob_patterns = [
            r'(\d{1,2}[/-]\d{1,2}[/-]\d{4})',
            r'(\d{4}[/-]\d{1,2}[/-]\d{1,2})',
        ]
        
        for pattern in dob_patterns:
            match = re.search(pattern, text)
            if match:
                data['date_of_birth'] = match.group(1)
                break
        
        # Extract expiry date
        expiry_patterns = [
            r'Expiry[:\s]+(\d{1,2}[/-]\d{1,2}[/-]\d{4})',
            r'انتهاء[:\s]+(\d{1,2}[/-]\d{1,2}[/-]\d{4})',
        ]
        
        for pattern in expiry_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                data['expiry_date'] = match.group(1)
                break
        
        return data
