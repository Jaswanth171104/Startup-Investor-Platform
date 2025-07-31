from Database.db import get_db
from Models.Application_models import Application

def debug_applications():
    db = next(get_db())
    apps = db.query(Application).all()
    print('Applications:')
    for app in apps:
        print(f'ID: {app.id}')
        print(f'  Startup: {app.startup_id}')
        print(f'  Investor: {app.investor_id}')
        print(f'  File: {app.pitch_deck_filename}')
        print(f'  Path: {app.pitch_deck_file_path}')
        print('---')

if __name__ == "__main__":
    debug_applications() 