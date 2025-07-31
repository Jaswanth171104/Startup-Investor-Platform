#!/usr/bin/env python3
"""
Database initialization script for the Startup Investor Platform.
Run this script from the project root to create all necessary database tables.
"""

import sys
import os

# Add backend directory to Python path
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
sys.path.insert(0, backend_dir)

from create_tables import create_tables

if __name__ == "__main__":
    print("Initializing database for Startup Investor Platform...")
    print(f"Working directory: {os.getcwd()}")
    create_tables()
    print("Database initialization complete!") 