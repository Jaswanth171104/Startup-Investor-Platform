#!/usr/bin/env python3
"""
Database migration script for production environments.
This script safely creates tables without dropping existing data.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text, inspect
from Database.db import engine, Base
from Models.Auth_models import User, OTP
from Models.Startup_profile_models import StartupProfile, Founder, StartupRevenueMetrics, FundUsage
from Models.Investor_profile_models import InvestorProfile
from Models.Application_models import Application, ApplicationLog, InterestStatus

def migrate_database():
    """Safely migrate database by creating missing tables"""
    try:
        print("Starting database migration...")
        
        # Get existing tables
        inspector = inspect(engine)
        existing_tables = inspector.get_table_names()
        print(f"Existing tables: {existing_tables}")
        
        # Get all required tables from metadata
        required_tables = list(Base.metadata.tables.keys())
        print(f"Required tables: {required_tables}")
        
        # Find missing tables
        missing_tables = [table for table in required_tables if table not in existing_tables]
        
        if missing_tables:
            print(f"Missing tables: {missing_tables}")
            print("Creating missing tables...")
            
            # Create only missing tables
            for table_name in missing_tables:
                table = Base.metadata.tables[table_name]
                table.create(engine)
                print(f"Created table: {table_name}")
        else:
            print("All tables already exist!")
        
        print("Database migration completed successfully!")
        
        # Verify all tables exist
        inspector = inspect(engine)
        final_tables = inspector.get_table_names()
        print(f"Final tables: {final_tables}")
        
    except Exception as e:
        print(f"Error during migration: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    migrate_database() 