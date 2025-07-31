#!/bin/bash
python3 -m pip install --upgrade pip
pip install -r requirements.txt
python3 init_db.py
uvicorn main:app --host 0.0.0.0 --port $PORT 