from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import asyncio
from contextlib import asynccontextmanager

# Import configurations and database
from app.config import settings
from app.database import connect_to_mongo, close_mongo_connection, init_sample_data

# Import route modules
from routes.auth import router as auth_router
from routes.reports import router as reports_router
from routes.stats import router as stats_router
from routes.users import router as users_router

# Application lifespan management
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    await init_sample_data()  # Initialize sample data for development
    yield
    # Shutdown
    await close_mongo_connection()

# Create FastAPI application
app = FastAPI(
    title="SAARTHI Backend API",
    description="""
    Backend API for SAARTHI - Civic Issue Reporting and Resolution System
    
    This API provides endpoints for:
    - Employee authentication and authorization
    - Civic issue report management
    - Statistics and analytics
    - User management and profiles
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Middleware - Configure for your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Trusted Host Middleware for production security
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=["localhost", "127.0.0.1", "*.saarthi.gov.in"]
)

# Include routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(reports_router, prefix="/api/v1")
app.include_router(stats_router, prefix="/api/v1") 
app.include_router(users_router, prefix="/api/v1")

# Root endpoint
@app.get("/")
async def root():
    """
    Root endpoint - API health check
    """
    return {
        "message": "SAARTHI Backend API is running!",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "healthy"
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring
    """
    try:
        from database import get_database
        db = await get_database()
        # Test database connection
        await db.command("ping")
        
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": "2025-09-12T14:33:00Z"
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database connection failed: {str(e)}")

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Global exception handler for unhandled errors
    """
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "error": str(exc),
            "path": str(request.url)
        }
    )

# 404 handler
@app.exception_handler(404)
async def not_found_handler(request: Request, exc: HTTPException):
    """
    Custom 404 handler
    """
    return JSONResponse(
        status_code=404,
        content={
            "detail": "Endpoint not found",
            "path": str(request.url),
            "method": request.method
        }
    )

# Utility endpoints for frontend integration
@app.get("/api/v1/config/cities")
async def get_cities_config():
    """
    Get city coordinates configuration for frontend map
    """
    return {
        "cities": [
            {"name": city, "coordinates": coords}
            for city, coords in settings.CITY_COORDINATES.items()
        ]
    }

@app.get("/api/v1/config/departments")
async def get_departments_config():
    """
    Get available departments list
    """
    return {"departments": settings.DEPARTMENTS}

@app.get("/api/v1/config/status")
async def get_status_config():
    """
    Get report status options
    """
    return {"status_options": settings.REPORT_STATUS}

# Run the application
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Set to False in production
        log_level="info"
    )
