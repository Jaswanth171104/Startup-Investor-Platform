from Database.db import get_db
from Models.Application_models import Application
from sqlalchemy.orm import Session

def check_applications():
    db = next(get_db())
    apps = db.query(Application).all()
    print('Applications:')
    for app in apps:
        print(f'ID: {app.id}, Startup: {app.startup_id}, Investor: {app.investor_id}, File: {app.pitch_deck_filename}, Path: {app.pitch_deck_file_path}')
    
    # Check if application ID 2 exists
    app_2 = db.query(Application).filter(Application.id == 2).first()
    if app_2:
        print(f'\nApplication 2 found:')
        print(f'File path: {app_2.pitch_deck_file_path}')
        print(f'File exists: {app_2.pitch_deck_file_path is not None}')
    else:
        print('\nApplication 2 not found')

if __name__ == "__main__":
    check_applications() 