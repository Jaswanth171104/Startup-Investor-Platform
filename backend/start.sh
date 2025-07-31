#!/bin/bash

# Production startup script for Startup Investor Platform

echo "Starting Startup Investor Platform..."

# Set default environment
export ENVIRONMENT=${ENVIRONMENT:-production}

# Wait for database to be ready (if using external database)
if [ ! -z "$DATABASE_URL" ]; then
    echo "Waiting for database to be ready..."
    python3 -c "
import time
import os
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError

max_attempts = 30
attempt = 0

while attempt < max_attempts:
    try:
        engine = create_engine(os.getenv('DATABASE_URL'))
        with engine.connect() as conn:
            conn.execute('SELECT 1')
        print('Database is ready!')
        break
    except OperationalError:
        attempt += 1
        print(f'Database not ready, attempt {attempt}/{max_attempts}')
        time.sleep(2)
else:
    print('No DATABASE_URL set, skipping database check')
"

# Run database migration
echo "Running database migration..."
python3 migrate_db.py

# Start the application
echo "Starting FastAPI application..."
if [ "$ENVIRONMENT" = "production" ]; then
    exec gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
else
    exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload
fi 