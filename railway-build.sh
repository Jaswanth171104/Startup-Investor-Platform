#!/bin/bash
set -e

echo "Current directory: $(pwd)"
echo "Listing files:"
ls -la

# Navigate to backend directory
if [ -d "backend" ]; then
    echo "Found backend directory, changing to it..."
    cd backend
    echo "Now in: $(pwd)"
    echo "Files in backend:"
    ls -la
else
    echo "Backend directory not found!"
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Initialize database
echo "Initializing database..."
python init_db.py

# Start the application
echo "Starting application..."
uvicorn main:app --host 0.0.0.0 --port $PORT 