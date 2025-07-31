#!/usr/bin/env python3

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from Database.db import engine, Base
from Models.Auth_models import User, OTP
from Models.Startup_profile_models import StartupProfile, Founder, StartupRevenueMetrics, FundUsage
from Models.Investor_profile_models import InvestorProfile
from Models.Application_models import Application, ApplicationLog, InterestStatus

def init_db():
    """Initialize database tables"""
    try:
        print("Creating database tables...")
        
        # Drop all tables first to ensure clean slate
        print("Dropping existing tables...")
        Base.metadata.drop_all(bind=engine)
        
        # Create all tables
        print("Creating new tables...")
        Base.metadata.create_all(bind=engine)
        
        print("✅ Database tables created successfully!")
        
        # Verify tables were created
        from sqlalchemy import text
        with engine.connect() as conn:
            result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
            tables = [row[0] for row in result]
            print(f"✅ Created tables: {tables}")
            
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    init_db() 