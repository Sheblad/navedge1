"""
Damage AI Nightly Training Scheduler
Implements automated model training and active learning
"""

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime, timedelta
import asyncio
import logging
from typing import Dict, Any, List

from core.database import supabase
from services.damage_ai_service import damage_ai_service
from core.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DamageAIScheduler:
    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self._setup_jobs()
    
    def _setup_jobs(self):
        """Setup scheduled jobs for damage AI"""
        
        # Nightly training at 2 AM UTC (6 AM UAE time)
        self.scheduler.add_job(
            self.nightly_training_job,
            CronTrigger(hour=2, minute=0, timezone='UTC'),
            id='nightly_damage_training',
            replace_existing=True,
            max_instances=1,
            misfire_grace_time=1800  # 30 minutes grace time
        )
        
        # Active learning review every 4 hours
        self.scheduler.add_job(
            self.active_learning_review_job,
            CronTrigger(hour='*/4', minute=0, timezone='UTC'),
            id='active_learning_review',
            replace_existing=True,
            max_instances=1
        )
        
        # Model performance monitoring every 6 hours
        self.scheduler.add_job(
            self.model_performance_monitoring_job,
            CronTrigger(hour='*/6', minute=0, timezone='UTC'),
            id='model_performance_monitoring',
            replace_existing=True,
            max_instances=1
        )
        
        # Cleanup old data weekly (Sunday 3 AM UTC)
        self.scheduler.add_job(
            self.cleanup_old_data_job,
            CronTrigger(day_of_week=6, hour=3, minute=0, timezone='UTC'),
            id='cleanup_old_data',
            replace_existing=True,
            max_instances=1
        )
    
    def start(self):
        """Start the scheduler"""
        self.scheduler.start()
        logger.info("Damage AI Scheduler started")
    
    def stop(self):
        """Stop the scheduler"""
        self.scheduler.shutdown()
        logger.info("Damage AI Scheduler stopped")
    
    def nightly_training_job(self):
        """Nightly model training and fine-tuning"""
        logger.info("Starting nightly damage AI training job...")
        
        try:
            # Check if there are new labels for active learning
            new_labels_count = self._get_new_labels_count()
            
            if new_labels_count < 10:
                logger.info(f"Not enough new labels ({new_labels_count}) for training. Skipping.")
                return
            
            # Get training data
            training_data = self._get_training_data()
            
            if not training_data:
                logger.info("No training data available. Skipping training.")
                return
            
            # Create training job
            training_job_id = self._create_training_job(training_data)
            
            # Run training
            training_results = damage_ai_service.train_model(training_data, {
                'epochs': 50,
                'batch_size': 16,
                'learning_rate': 0.001,
                'use_active_learning': True
            })
            
            # Update training job status
            self._update_training_job(training_job_id, training_results)
            
            # Update model metrics
            self._update_model_metrics(training_results)
            
            logger.info(f"Nightly training completed successfully. Job ID: {training_job_id}")
            
        except Exception as e:
            logger.error(f"Nightly training job failed: {e}")
            self._log_training_error(str(e))
    
    def active_learning_review_job(self):
        """Review detections that need human labeling"""
        logger.info("Starting active learning review job...")
        
        try:
            # Get high-uncertainty detections
            uncertain_detections = self._get_uncertain_detections()
            
            if not uncertain_detections:
                logger.info("No uncertain detections found for review.")
                return
            
            # Prioritize by uncertainty score
            prioritized_detections = sorted(
                uncertain_detections, 
                key=lambda x: x.get('uncertainty_score', 0), 
                reverse=True
            )
            
            # Update review status
            for detection in prioritized_detections[:20]:  # Top 20 most uncertain
                self._mark_for_review(detection['id'])
            
            logger.info(f"Marked {len(prioritized_detections[:20])} detections for human review")
            
        except Exception as e:
            logger.error(f"Active learning review job failed: {e}")
    
    def model_performance_monitoring_job(self):
        """Monitor model performance and trigger retraining if needed"""
        logger.info("Starting model performance monitoring job...")
        
        try:
            # Get recent model performance
            recent_metrics = self._get_recent_model_metrics()
            
            if not recent_metrics:
                logger.info("No recent metrics available.")
                return
            
            # Check if performance has degraded
            current_accuracy = recent_metrics.get('accuracy', 0)
            baseline_accuracy = 0.85  # Baseline accuracy threshold
            
            if current_accuracy < baseline_accuracy:
                logger.warning(f"Model accuracy ({current_accuracy}) below baseline ({baseline_accuracy})")
                
                # Trigger emergency retraining
                self._trigger_emergency_retraining()
            else:
                logger.info(f"Model performance is good. Accuracy: {current_accuracy}")
            
        except Exception as e:
            logger.error(f"Model performance monitoring job failed: {e}")
    
    def cleanup_old_data_job(self):
        """Cleanup old data and temporary files"""
        logger.info("Starting cleanup job...")
        
        try:
            # Cleanup old detections (older than 90 days)
            cutoff_date = datetime.utcnow() - timedelta(days=90)
            
            response = supabase.from('damage_detections').delete().lt('created_at', cutoff_date.isoformat()).execute()
            
            if response.data:
                logger.info(f"Cleaned up {len(response.data)} old detections")
            
            # Cleanup old training jobs (older than 30 days)
            training_cutoff = datetime.utcnow() - timedelta(days=30)
            
            response = supabase.from('damage_training_jobs').delete().lt('created_at', training_cutoff.isoformat()).execute()
            
            if response.data:
                logger.info(f"Cleaned up {len(response.data)} old training jobs")
            
            logger.info("Cleanup job completed successfully")
            
        except Exception as e:
            logger.error(f"Cleanup job failed: {e}")
    
    def _get_new_labels_count(self) -> int:
        """Get count of new labels since last training"""
        try:
            # Get last training date
            response = supabase.from('damage_training_jobs').select('completed_at').eq('status', 'completed').order('completed_at', desc=True).limit(1).execute()
            
            if not response.data:
                # No previous training, count all labels
                response = supabase.from('damage_labels').select('count').execute()
                return response.data[0]['count'] if response.data else 0
            
            last_training = response.data[0]['completed_at']
            
            # Count labels since last training
            response = supabase.from('damage_labels').select('count').gt('created_at', last_training).execute()
            return response.data[0]['count'] if response.data else 0
            
        except Exception as e:
            logger.error(f"Error getting new labels count: {e}")
            return 0
    
    def _get_training_data(self) -> List[Dict[str, Any]]:
        """Get training data for model training"""
        try:
            # Get labeled detections
            response = supabase.from('damage_detections').select('*, damage_labels(*)').eq('status', 'reviewed').execute()
            
            training_data = []
            for detection in response.data:
                if detection.get('damage_labels'):
                    training_data.append({
                        'detection_id': detection['id'],
                        'before_image_path': detection['before_image_path'],
                        'after_image_path': detection['after_image_path'],
                        'labels': detection['damage_labels']
                    })
            
            return training_data
            
        except Exception as e:
            logger.error(f"Error getting training data: {e}")
            return []
    
    def _create_training_job(self, training_data: List[Dict[str, Any]]) -> str:
        """Create a new training job record"""
        try:
            import uuid
            
            job_id = str(uuid.uuid4())
            
            # Get active model
            model_response = supabase.from('damage_models').select('id').eq('is_active', True).single().execute()
            model_id = model_response.data['id'] if model_response.data else None
            
            job_data = {
                'id': job_id,
                'model_id': model_id,
                'job_type': 'nightly_training',
                'training_config': {
                    'dataset_size': len(training_data),
                    'use_active_learning': True
                },
                'training_samples': len(training_data),
                'status': 'running',
                'started_at': datetime.utcnow().isoformat()
            }
            
            response = supabase.from('damage_training_jobs').insert([job_data]).execute()
            
            if response.data:
                return job_id
            else:
                raise Exception("Failed to create training job")
                
        except Exception as e:
            logger.error(f"Error creating training job: {e}")
            raise
    
    def _update_training_job(self, job_id: str, results: Dict[str, Any]):
        """Update training job with results"""
        try:
            update_data = {
                'status': 'completed',
                'completed_at': datetime.utcnow().isoformat(),
                'final_metrics': results,
                'progress_percentage': 100.0
            }
            
            supabase.from('damage_training_jobs').update(update_data).eq('id', job_id).execute()
            
        except Exception as e:
            logger.error(f"Error updating training job: {e}")
    
    def _update_model_metrics(self, metrics: Dict[str, Any]):
        """Update model performance metrics"""
        try:
            # Get active model
            model_response = supabase.from('damage_models').select('id').eq('is_active', True).single().execute()
            
            if not model_response.data:
                return
            
            model_id = model_response.data['id']
            
            # Insert new metrics
            metrics_data = []
            for metric_type, value in metrics.items():
                if metric_type in ['accuracy', 'precision', 'recall', 'f1_score', 'mAP']:
                    metrics_data.append({
                        'model_id': model_id,
                        'metric_type': metric_type,
                        'metric_value': value,
                        'evaluation_date': datetime.utcnow().isoformat()
                    })
            
            if metrics_data:
                supabase.from('damage_metrics').insert(metrics_data).execute()
            
        except Exception as e:
            logger.error(f"Error updating model metrics: {e}")
    
    def _get_uncertain_detections(self) -> List[Dict[str, Any]]:
        """Get detections with high uncertainty scores"""
        try:
            response = supabase.from('damage_detections').select('*').eq('needs_human_review', True).gte('uncertainty_score', settings.ACTIVE_LEARNING_THRESHOLD).execute()
            return response.data or []
            
        except Exception as e:
            logger.error(f"Error getting uncertain detections: {e}")
            return []
    
    def _mark_for_review(self, detection_id: str):
        """Mark detection for human review"""
        try:
            supabase.from('damage_detections').update({
                'needs_human_review': True,
                'status': 'pending_review'
            }).eq('id', detection_id).execute()
            
        except Exception as e:
            logger.error(f"Error marking detection for review: {e}")
    
    def _get_recent_model_metrics(self) -> Dict[str, Any]:
        """Get recent model performance metrics"""
        try:
            # Get latest metrics for active model
            response = supabase.from('damage_metrics').select('*').eq('model_id', 
                supabase.from('damage_models').select('id').eq('is_active', True).single().execute().data['id']
            ).order('evaluation_date', desc=True).limit(10).execute()
            
            if not response.data:
                return {}
            
            # Aggregate latest metrics
            latest_metrics = {}
            for metric in response.data:
                metric_type = metric['metric_type']
                if metric_type not in latest_metrics:
                    latest_metrics[metric_type] = metric['metric_value']
            
            return latest_metrics
            
        except Exception as e:
            logger.error(f"Error getting recent model metrics: {e}")
            return {}
    
    def _trigger_emergency_retraining(self):
        """Trigger emergency model retraining"""
        try:
            logger.warning("Triggering emergency model retraining...")
            
            # Create emergency training job
            training_data = self._get_training_data()
            job_id = self._create_training_job(training_data)
            
            # Run training with more aggressive parameters
            training_results = damage_ai_service.train_model(training_data, {
                'epochs': 100,
                'batch_size': 8,
                'learning_rate': 0.0005,
                'use_active_learning': True,
                'emergency_retraining': True
            })
            
            self._update_training_job(job_id, training_results)
            self._update_model_metrics(training_results)
            
            logger.info("Emergency retraining completed")
            
        except Exception as e:
            logger.error(f"Emergency retraining failed: {e}")
    
    def _log_training_error(self, error_message: str):
        """Log training error to database"""
        try:
            error_data = {
                'error_type': 'training_failure',
                'error_message': error_message,
                'timestamp': datetime.utcnow().isoformat(),
                'job_type': 'nightly_training'
            }
            
            # You could create an error_logs table for this
            logger.error(f"Training error logged: {error_message}")
            
        except Exception as e:
            logger.error(f"Error logging training error: {e}")

# Global scheduler instance
damage_ai_scheduler = DamageAIScheduler()
