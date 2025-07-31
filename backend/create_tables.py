#!/usr/bin/env python3

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import all models explicitly
from Models.base import Base
from Models.Auth_models import User, OTP
from Models.Startup_profile_models import StartupProfile, Founder, StartupRevenueMetrics, FundUsage
from Models.Investor_profile_models import InvestorProfile
from Models.Application_models import Application, ApplicationLog, InterestStatus

from Database.db import engine

def create_tables():
    """Create all database tables"""
    try:
        print("🧪 Creating database tables...")
        
        # Import all models to ensure they're registered
        print("Importing models...")
        print(f"✅ User model: {User}")
        print(f"✅ OTP model: {OTP}")
        print(f"✅ StartupProfile model: {StartupProfile}")
        print(f"✅ InvestorProfile model: {InvestorProfile}")
        print(f"✅ Application model: {Application}")
        
        # Drop all tables first
        print("Dropping existing tables...")
        Base.metadata.drop_all(bind=engine)
        
        # Create all tables
        print("Creating new tables...")
        Base.metadata.create_all(bind=engine)
        
        print("✅ Database tables created successfully!")
        
        # Verify tables were created
        from sqlalchemy import text
        with engine.connect() as conn:
            result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"))
            tables = [row[0] for row in result]
            print(f"✅ Created tables: {tables}")
            
            if not tables:
                print("❌ No tables were created!")
                # Let's check what's in the metadata
                print(f"Tables in metadata: {list(Base.metadata.tables.keys())}")
            else:
                print(f"✅ Successfully created {len(tables)} tables")
                
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    create_tables() 