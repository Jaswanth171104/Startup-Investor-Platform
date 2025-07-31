#!/bin/bash
set -e

# Check if we're in the backend directory, if not, change to it
if [ ! -f "requirements.txt" ]; then
    if [ -d "backend" ]; then
        cd backend
    else
        echo "Error: requirements.txt not found and backend directory not found"
        exit 1
    fi
fi

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