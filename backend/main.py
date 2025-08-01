import os
import sys

# Add the current directory to Python path to ensure local imports work
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Import all models to ensure they are registered
from Models.Auth_models import User
from Models.Startup_profile_models import StartupProfile, Founder, StartupRevenueMetrics, FundUsage
from Models.Investor_profile_models import InvestorProfile
from Models.Application_models import Application

from Routers import Signup, investor_profile, startup_profile, application

app = FastAPI(title="Startup Investor Platform API", version="1.0.0")

# Environment variables
import os
import secrets

# Set a default SECRET_KEY if not provided
if not os.getenv("SECRET_KEY"):
    os.environ["SECRET_KEY"] = "your-super-secret-key-here-make-it-long-and-random-123456789"

# CORS middleware
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
if allowed_origins == ["*"]:
    allow_credentials = False
else:
    allow_credentials = True

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files from project root
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
uploads_dir = os.path.join(project_root, "uploads")
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Include routers with prefixes
app.include_router(Signup.router, prefix="/auth", tags=["Authentication"])
app.include_router(investor_profile.router, prefix="/investor-profile", tags=["Investor Profile"])
app.include_router(startup_profile.router, prefix="/startup-profile", tags=["Startup Profile"])
app.include_router(application.router, prefix="/applications", tags=["Applications"])

@app.get("/")
def read_root():
    return {"message": "Startup Investor Platform API", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "API is running"}

@app.get("/test")
def test_endpoint():
    return {"message": "Test endpoint working"}

@app.get("/debug")
def debug_info():
    import os
    return {
        "database_url": os.getenv("DATABASE_URL", "Not set"),
        "secret_key": "Set" if os.getenv("SECRET_KEY") else "Not set",
        "environment": os.getenv("ENVIRONMENT", "development")
    }

@app.get("/db-check")
def check_database():
    """Check database tables and status"""
    try:
        from sqlalchemy import text
        from Database.db import engine
        
        with engine.connect() as conn:
            # Get all tables
            result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"))
            tables = [row[0] for row in result]
            
            # Check if users table exists and count users
            user_count = 0
            if 'users' in tables:
                result = conn.execute(text("SELECT COUNT(*) FROM users"))
                user_count = result.fetchone()[0]
            
            # Check startup profiles
            startup_count = 0
            if 'startup_profiles' in tables:
                result = conn.execute(text("SELECT COUNT(*) FROM startup_profiles"))
                startup_count = result.fetchone()[0]
            
            return {
                "status": "connected",
                "tables": tables,
                "table_count": len(tables),
                "users_count": user_count,
                "startup_profiles_count": startup_count,
                "users_table_exists": 'users' in tables,
                "startup_profiles_table_exists": 'startup_profiles' in tables
            }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "tables": [],
            "table_count": 0,
            "users_count": 0,
            "startup_profiles_count": 0,
            "users_table_exists": False,
            "startup_profiles_table_exists": False
        }


