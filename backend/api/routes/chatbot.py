"""
Renter chatbot routes for simple queries
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta

from core.database import get_db, User, Contract, Fine, get_current_user

router = APIRouter()

# Pydantic models
class ChatMessage(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    intent: str
    data: Optional[dict] = None

class ChatIntent(BaseModel):
    name: str
    description: str
    examples: List[str]

@router.post("/message", response_model=ChatResponse)
async def process_chat_message(
    message_data: ChatMessage,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Process renter chatbot message"""
    
    # Only renters can use chatbot
    if current_user.role != "renter":
        raise HTTPException(status_code=403, detail="Chatbot is only available for renters")
    
    message = message_data.message.lower().strip()
    
    # Intent detection
    intent = detect_intent(message)
    
    # Generate response based on intent
    if intent == "time_left":
        response_data = get_time_left_info(current_user, db)
        response = f"You have {response_data['days_left']} days left in your rental."
        
    elif intent == "fines":
        response_data = get_fines_info(current_user, db)
        if response_data['fines_count'] > 0:
            response = f"You have {response_data['fines_count']} fines totaling AED {response_data['total_amount']:.2f}."
        else:
            response = "You have no fines at this time."
            
    elif intent == "km_left":
        response_data = get_km_info(current_user, db)
        if response_data['km_remaining'] > 0:
            response = f"You have {response_data['km_remaining']} km remaining in your current rental period."
        else:
            response = "You have exceeded your daily km limit."
            
    else:
        response = "I can help you with information about your rental time, fines, and km limits. What would you like to know?"
        response_data = None
    
    return ChatResponse(
        response=response,
        intent=intent,
        data=response_data
    )

@router.get("/intents")
async def get_available_intents():
    """Get available chatbot intents"""
    
    intents = [
        ChatIntent(
            name="time_left",
            description="Check how much time is left in rental",
            examples=["How long do I have left?", "When does my rental end?", "Time remaining"]
        ),
        ChatIntent(
            name="fines",
            description="Check for fines",
            examples=["Do I have fines?", "Check my fines", "Any violations?"]
        ),
        ChatIntent(
            name="km_left",
            description="Check remaining kilometers",
            examples=["How many km left?", "Kilometers remaining", "Daily limit"]
        )
    ]
    
    return intents

def detect_intent(message: str) -> str:
    """Detect user intent from message"""
    
    # Time left keywords
    time_keywords = ["time", "left", "remaining", "end", "expire", "finish", "duration"]
    if any(keyword in message for keyword in time_keywords):
        return "time_left"
    
    # Fines keywords
    fines_keywords = ["fine", "violation", "penalty", "ticket", "charge"]
    if any(keyword in message for keyword in fines_keywords):
        return "fines"
    
    # KM keywords
    km_keywords = ["km", "kilometer", "distance", "limit", "mileage"]
    if any(keyword in message for keyword in km_keywords):
        return "km_left"
    
    return "unknown"

def get_time_left_info(user: User, db: Session) -> dict:
    """Get time left information for user"""
    
    # Get active contract
    contract = db.query(Contract).filter(
        Contract.renter_id == user.id,
        Contract.status == "active"
    ).first()
    
    if not contract:
        return {"days_left": 0, "end_date": None}
    
    days_left = (contract.end_date - datetime.utcnow()).days
    return {
        "days_left": max(0, days_left),
        "end_date": contract.end_date.isoformat()
    }

def get_fines_info(user: User, db: Session) -> dict:
    """Get fines information for user"""
    
    # Get user's contracts
    contracts = db.query(Contract).filter(Contract.renter_id == user.id).all()
    contract_ids = [str(contract.id) for contract in contracts]
    
    # Get fines for these contracts
    fines = db.query(Fine).filter(Fine.contract_id.in_(contract_ids)).all()
    
    total_amount = sum(float(fine.amount) for fine in fines)
    
    return {
        "fines_count": len(fines),
        "total_amount": total_amount,
        "fines": [
            {
                "violation": fine.violation,
                "amount": float(fine.amount),
                "date": fine.date.isoformat(),
                "status": fine.status
            }
            for fine in fines
        ]
    }

def get_km_info(user: User, db: Session) -> dict:
    """Get km information for user"""
    
    # Get active contract
    contract = db.query(Contract).filter(
        Contract.renter_id == user.id,
        Contract.status == "active"
    ).first()
    
    if not contract:
        return {"km_remaining": 0, "daily_limit": 0}
    
    # This would need to be calculated based on actual usage
    # For now, return the daily limit
    return {
        "km_remaining": contract.daily_km_limit,
        "daily_limit": contract.daily_km_limit
    }
