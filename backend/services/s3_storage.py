"""
S3 Storage Service for Damage AI Images and Models
"""

import boto3
import os
from botocore.exceptions import ClientError, NoCredentialsError
from typing import Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
from core.config import settings

class S3StorageService:
    def __init__(self):
        self.s3_client = None
        self.bucket_name = settings.S3_BUCKET_NAME
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize S3 client with credentials"""
        try:
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_REGION
            )
            # Test connection
            self.s3_client.head_bucket(Bucket=self.bucket_name)
        except (NoCredentialsError, ClientError) as e:
            print(f"S3 initialization failed: {e}")
            self.s3_client = None
    
    def upload_image(self, image_data: bytes, folder: str, filename: str = None) -> Optional[str]:
        """
        Upload image to S3 and return the URL
        
        Args:
            image_data: Image bytes
            folder: S3 folder (e.g., 'damage-images', 'models', 'heatmaps')
            filename: Optional filename, will generate UUID if not provided
            
        Returns:
            S3 URL if successful, None if failed
        """
        if not self.s3_client:
            return None
        
        if not filename:
            filename = f"{uuid.uuid4()}.jpg"
        
        # Ensure folder structure
        key = f"{folder}/{filename}"
        
        try:
            # Upload with appropriate content type
            content_type = "image/jpeg"
            if filename.lower().endswith('.png'):
                content_type = "image/png"
            elif filename.lower().endswith('.webp'):
                content_type = "image/webp"
            
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=key,
                Body=image_data,
                ContentType=content_type,
                ACL='private'  # Private by default for security
            )
            
            # Return the S3 URL
            return f"https://{self.bucket_name}.s3.{settings.AWS_REGION}.amazonaws.com/{key}"
            
        except ClientError as e:
            print(f"Error uploading to S3: {e}")
            return None
    
    def upload_model(self, model_data: bytes, model_name: str, version: str, file_type: str) -> Optional[str]:
        """
        Upload AI model file to S3
        
        Args:
            model_data: Model file bytes
            model_name: Name of the model
            version: Model version
            file_type: Type of file (weights, config, metadata)
            
        Returns:
            S3 URL if successful, None if failed
        """
        if not self.s3_client:
            return None
        
        filename = f"{model_name}_{version}.{file_type}"
        key = f"models/{model_name}/{version}/{filename}"
        
        try:
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=key,
                Body=model_data,
                ContentType="application/octet-stream",
                ACL='private'
            )
            
            return f"https://{self.bucket_name}.s3.{settings.AWS_REGION}.amazonaws.com/{key}"
            
        except ClientError as e:
            print(f"Error uploading model to S3: {e}")
            return None
    
    def download_file(self, s3_url: str) -> Optional[bytes]:
        """
        Download file from S3 URL
        
        Args:
            s3_url: Full S3 URL
            
        Returns:
            File bytes if successful, None if failed
        """
        if not self.s3_client:
            return None
        
        try:
            # Extract key from URL
            key = s3_url.split(f"{self.bucket_name}.s3.{settings.AWS_REGION}.amazonaws.com/")[-1]
            
            response = self.s3_client.get_object(Bucket=self.bucket_name, Key=key)
            return response['Body'].read()
            
        except ClientError as e:
            print(f"Error downloading from S3: {e}")
            return None
    
    def generate_presigned_url(self, s3_url: str, expiration: int = 3600) -> Optional[str]:
        """
        Generate presigned URL for private S3 objects
        
        Args:
            s3_url: Full S3 URL
            expiration: URL expiration time in seconds (default 1 hour)
            
        Returns:
            Presigned URL if successful, None if failed
        """
        if not self.s3_client:
            return None
        
        try:
            # Extract key from URL
            key = s3_url.split(f"{self.bucket_name}.s3.{settings.AWS_REGION}.amazonaws.com/")[-1]
            
            presigned_url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': key},
                ExpiresIn=expiration
            )
            
            return presigned_url
            
        except ClientError as e:
            print(f"Error generating presigned URL: {e}")
            return None
    
    def delete_file(self, s3_url: str) -> bool:
        """
        Delete file from S3
        
        Args:
            s3_url: Full S3 URL
            
        Returns:
            True if successful, False if failed
        """
        if not self.s3_client:
            return False
        
        try:
            # Extract key from URL
            key = s3_url.split(f"{self.bucket_name}.s3.{settings.AWS_REGION}.amazonaws.com/")[-1]
            
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=key)
            return True
            
        except ClientError as e:
            print(f"Error deleting from S3: {e}")
            return False
    
    def list_files(self, folder: str, prefix: str = "") -> list:
        """
        List files in S3 folder
        
        Args:
            folder: S3 folder
            prefix: Optional prefix filter
            
        Returns:
            List of file URLs
        """
        if not self.s3_client:
            return []
        
        try:
            key_prefix = f"{folder}/{prefix}" if prefix else folder
            
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=key_prefix
            )
            
            files = []
            if 'Contents' in response:
                for obj in response['Contents']:
                    file_url = f"https://{self.bucket_name}.s3.{settings.AWS_REGION}.amazonaws.com/{obj['Key']}"
                    files.append(file_url)
            
            return files
            
        except ClientError as e:
            print(f"Error listing S3 files: {e}")
            return []
    
    def get_file_metadata(self, s3_url: str) -> Optional[Dict[str, Any]]:
        """
        Get file metadata from S3
        
        Args:
            s3_url: Full S3 URL
            
        Returns:
            File metadata dict if successful, None if failed
        """
        if not self.s3_client:
            return None
        
        try:
            # Extract key from URL
            key = s3_url.split(f"{self.bucket_name}.s3.{settings.AWS_REGION}.amazonaws.com/")[-1]
            
            response = self.s3_client.head_object(Bucket=self.bucket_name, Key=key)
            
            return {
                'size': response['ContentLength'],
                'last_modified': response['LastModified'],
                'content_type': response.get('ContentType', 'unknown'),
                'etag': response['ETag']
            }
            
        except ClientError as e:
            print(f"Error getting file metadata: {e}")
            return None

# Global S3 service instance
s3_service = S3StorageService()
