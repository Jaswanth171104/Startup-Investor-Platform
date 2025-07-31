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
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./startup_investor.db")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
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
    return {"status": "healthy"}
