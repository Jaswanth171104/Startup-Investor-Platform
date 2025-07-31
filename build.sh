#!/bin/bash
set -e

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Initialize database
python init_db.py

# Start the application
uvicorn main:app --host 0.0.0.0 --port $PORT 