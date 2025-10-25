"""
Document upload and OCR processing routes
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional
import os
import uuid
from datetime import datetime

from core.database import get_db, User, DocumentUpload, get_current_user
from services.ocr_service import OCRService
from core.config import settings

router = APIRouter()

@router.post("/upload-id")
async def upload_emirates_id(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload Emirates ID for OCR processing"""
    
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Generate unique filename
    file_extension = file.filename.split('.')[-1]
    unique_filename = f"emirates_id_{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Process with OCR
    ocr_service = OCRService()
    extracted_data = ocr_service.extract_emirates_id(file_path)
    
    # Save document record
    document = DocumentUpload(
        user_id=current_user.id,
        document_type="emirates_id",
        file_path=file_path,
        extracted_text=extracted_data
    )
    db.add(document)
    db.commit()
    
    return {
        "message": "Emirates ID uploaded and processed successfully",
        "extracted_data": extracted_data,
        "file_path": file_path
    }

@router.post("/upload-license")
async def upload_driver_license(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload driver license for OCR processing"""
    
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Generate unique filename
    file_extension = file.filename.split('.')[-1]
    unique_filename = f"license_{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Process with OCR
    ocr_service = OCRService()
    extracted_data = ocr_service.extract_driver_license(file_path)
    
    # Save document record
    document = DocumentUpload(
        user_id=current_user.id,
        document_type="license",
        file_path=file_path,
        extracted_text=extracted_data
    )
    db.add(document)
    db.commit()
    
    return {
        "message": "Driver license uploaded and processed successfully",
        "extracted_data": extracted_data,
        "file_path": file_path
    }

@router.get("/extract-text/{document_id}")
async def get_extracted_text(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get extracted text from a document"""
    
    document = db.query(DocumentUpload).filter(
        DocumentUpload.id == document_id,
        DocumentUpload.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return {
        "document_id": str(document.id),
        "document_type": document.document_type,
        "extracted_text": document.extracted_text,
        "created_at": document.created_at
    }

@router.get("/my-documents")
async def get_my_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all documents for current user"""
    
    documents = db.query(DocumentUpload).filter(
        DocumentUpload.user_id == current_user.id
    ).all()
    
    return [
        {
            "id": str(doc.id),
            "document_type": doc.document_type,
            "file_path": doc.file_path,
            "extracted_text": doc.extracted_text,
            "created_at": doc.created_at
        }
        for doc in documents
    ]
