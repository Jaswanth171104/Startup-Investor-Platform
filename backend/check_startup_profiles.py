from Database.db import get_db
from Models.Startup_profile_models import StartupProfile

def check_startup_profiles():
    db = next(get_db())
    profiles = db.query(StartupProfile).all()
    print('Startup profiles in database:')
    for profile in profiles:
        print(f'User ID: {profile.user_id}')
        print(f'  Company Name: {profile.company_name}')
        print(f'  Pitch Deck Filename: {profile.pitch_deck_filename}')
        print(f'  Pitch Deck File Path: {profile.pitch_deck_file_path}')
        print('---')

if __name__ == "__main__":
    check_startup_profiles() 