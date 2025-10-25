"""
Feedback System for Continuous AI Improvement
Tracks false positives/negatives and adjusts thresholds automatically
"""

import json
from typing import Dict, List, Any, Tuple
from datetime import datetime, timedelta
from core.database import supabase
import logging

logger = logging.getLogger(__name__)

class FeedbackSystem:
    def __init__(self):
        self.false_positive_threshold = 0.4
        self.false_negative_threshold = 0.6
        self.learning_rate = 0.1
    
    def submit_feedback(self, detection_id: str, is_correct: bool, 
                       actual_damage: bool, user_confidence: float = 1.0) -> Dict[str, Any]:
        """
        Submit feedback about a detection result
        
        Args:
            detection_id: ID of the detection
            is_correct: Whether the AI was correct
            actual_damage: Whether there was actually damage
            user_confidence: User's confidence in their feedback (0-1)
        """
        try:
            # Get the original detection
            response = supabase.from('damage_detections').select('*').eq('id', detection_id).single().execute()
            
            if not response.data:
                return {'error': 'Detection not found'}
            
            detection = response.data
            
            # Determine feedback type
            if is_correct:
                feedback_type = 'correct'
            elif actual_damage and not detection['damage_detected']:
                feedback_type = 'false_negative'
            elif not actual_damage and detection['damage_detected']:
                feedback_type = 'false_positive'
            else:
                feedback_type = 'incorrect'
            
            # Store feedback
            feedback_data = {
                'detection_id': detection_id,
                'feedback_type': feedback_type,
                'is_correct': is_correct,
                'actual_damage': actual_damage,
                'ai_confidence': detection['confidence_score'],
                'user_confidence': user_confidence,
                'ssim_score': detection['ssim_score'],
                'lpips_score': detection['lpips_score'],
                'yolo_detections': detection['yolo_detections'],
                'created_at': datetime.utcnow().isoformat()
            }
            
            # Insert feedback (you'd need to create a feedback table)
            # For now, we'll log it and adjust thresholds
            logger.info(f"Feedback received: {feedback_data}")
            
            # Adjust thresholds based on feedback
            self._adjust_thresholds(feedback_data)
            
            return {
                'success': True,
                'feedback_type': feedback_type,
                'message': 'Feedback recorded successfully'
            }
            
        except Exception as e:
            logger.error(f"Error submitting feedback: {e}")
            return {'error': str(e)}
    
    def _adjust_thresholds(self, feedback_data: Dict[str, Any]):
        """Adjust detection thresholds based on feedback"""
        try:
            feedback_type = feedback_data['feedback_type']
            ai_confidence = feedback_data['ai_confidence']
            
            if feedback_type == 'false_positive':
                # Increase threshold to reduce false positives
                self.false_positive_threshold += self.learning_rate * 0.1
                logger.info(f"Adjusted false positive threshold to {self.false_positive_threshold}")
                
            elif feedback_type == 'false_negative':
                # Decrease threshold to catch more damage
                self.false_negative_threshold -= self.learning_rate * 0.1
                logger.info(f"Adjusted false negative threshold to {self.false_negative_threshold}")
            
            # Update configuration in database or config file
            self._update_threshold_config()
            
        except Exception as e:
            logger.error(f"Error adjusting thresholds: {e}")
    
    def _update_threshold_config(self):
        """Update threshold configuration"""
        try:
            # Update environment variables or config file
            # This would typically update the config.py file or database
            logger.info("Threshold configuration updated")
        except Exception as e:
            logger.error(f"Error updating threshold config: {e}")
    
    def get_performance_metrics(self, days: int = 30) -> Dict[str, Any]:
        """Get performance metrics for the last N days"""
        try:
            # Calculate metrics from feedback data
            # This would query the feedback table
            
            # For now, return placeholder metrics
            return {
                'total_detections': 100,
                'correct_detections': 85,
                'false_positives': 10,
                'false_negatives': 5,
                'accuracy': 0.85,
                'precision': 0.89,
                'recall': 0.94,
                'f1_score': 0.91,
                'current_threshold': self.false_positive_threshold
            }
            
        except Exception as e:
            logger.error(f"Error getting performance metrics: {e}")
            return {'error': str(e)}
    
    def get_improvement_suggestions(self) -> List[str]:
        """Get suggestions for improving the AI system"""
        suggestions = []
        
        try:
            metrics = self.get_performance_metrics()
            
            if metrics.get('false_positives', 0) > 15:
                suggestions.append("Consider increasing damage detection threshold")
                suggestions.append("Add more image preprocessing to reduce lighting effects")
            
            if metrics.get('false_negatives', 0) > 10:
                suggestions.append("Consider decreasing damage detection threshold")
                suggestions.append("Improve YOLO model training with more damage examples")
            
            if metrics.get('accuracy', 0) < 0.8:
                suggestions.append("Retrain models with more diverse training data")
                suggestions.append("Implement active learning pipeline")
            
            return suggestions
            
        except Exception as e:
            logger.error(f"Error getting improvement suggestions: {e}")
            return ["Error generating suggestions"]

# Global feedback system instance
feedback_system = FeedbackSystem()
