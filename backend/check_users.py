from Database.db import get_db
from Models.Auth_models import User

def check_users():
    db = next(get_db())
    users = db.query(User).all()
    print('Users in database:')
    for user in users:
        print(f'ID: {user.id}, Email: {user.email}, Role: {user.role}')

if __name__ == "__main__":
    check_users() 