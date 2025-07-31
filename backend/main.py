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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,  # Set to False when using "*"
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
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


