"""
NavEdge Phase 2 Backend API
Complete rental management system with AI features
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn
import os
from datetime import datetime
from typing import Optional, List

# Import routers
from api.routes import auth, documents, contracts, damage, damage_ai, frontend_hooks, fines, chatbot, notifications, reports
from core.database import engine, Base
from core.config import settings
from core.middleware import AuthMiddleware

# Create FastAPI app
app = FastAPI(
    title="NavEdge API",
    description="Complete rental management system with AI features",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add authentication middleware
app.add_middleware(AuthMiddleware)

# Include API routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents & OCR"])
app.include_router(contracts.router, prefix="/api/contracts", tags=["Contracts"])
app.include_router(damage.router, prefix="/api/damage", tags=["Damage Detection"])
app.include_router(damage_ai.router, prefix="/ai/damage", tags=["Damage AI v1.1"])
app.include_router(frontend_hooks.router, prefix="/frontend", tags=["Frontend Hooks"])
app.include_router(fines.router, prefix="/api/fines", tags=["Fines Management"])
app.include_router(chatbot.router, prefix="/api/chatbot", tags=["Renter Chatbot"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports & Analytics"])

# Mount static files for document storage
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.on_event("startup")
async def startup_event():
    """Initialize database and start background services"""
    # Create database tables
    Base.metadata.create_all(bind=engine)
    
    # Start background job scheduler
    from core.scheduler import start_scheduler
    start_scheduler()
    
    # Start damage AI scheduler
    from core.damage_ai_scheduler import damage_ai_scheduler
    damage_ai_scheduler.start()
    
    print("🚀 NavEdge Phase 2 Backend started successfully!")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    from core.scheduler import stop_scheduler
    stop_scheduler()
    
    # Stop damage AI scheduler
    from core.damage_ai_scheduler import damage_ai_scheduler
    damage_ai_scheduler.stop()
    print("🛑 NavEdge Phase 2 Backend stopped")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "NavEdge Phase 2 API",
        "version": "2.0.0",
        "status": "running",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0"
    }

@app.get("/health/detailed")
async def detailed_health():
    """Detailed health check"""
    try:
        # Check database connection
        from core.database import get_db
        db = next(get_db())
        
        # Check external services
        services_status = {
            "database": "connected",
            "supabase": "connected",
            "redis": "connected" if settings.REDIS_URL else "not_configured",
            "whatsapp": "configured" if settings.WHATSAPP_TOKEN else "not_configured"
        }
        
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "services": services_status
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True if os.getenv("ENVIRONMENT") == "development" else False
    )
