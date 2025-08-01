#!/usr/bin/env python3
"""
Database initialization script for the Startup Investor Platform.
Run this script to create all necessary database tables.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from create_tables import create_tables

if __name__ == "__main__":
    print("Initializing database for Startup Investor Platform...")
    create_tables()
    print("Database initialization complete!") 