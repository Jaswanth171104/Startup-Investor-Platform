from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os

# Get DATABASE_URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

# If DATABASE_URL is not set, use a default SQLite database for development
if not DATABASE_URL:
    # Use absolute path to ensure consistent database location
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(os.path.dirname(current_dir))
    db_path = os.path.join(project_root, "startup_investor.db")
    DATABASE_URL = f"sqlite:///{db_path}"
    print("Warning: DATABASE_URL not set, using SQLite database")

# For Render, if DATABASE_URL starts with 'postgres://', convert to 'postgresql://'
if DATABASE_URL and DATABASE_URL.startswith('postgres://'):
    DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)

print(f"Using DATABASE_URL: {DATABASE_URL}")

# Configure engine with SSL for production PostgreSQL
if DATABASE_URL and 'postgresql' in DATABASE_URL:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300,
        connect_args={
            "sslmode": "require" if os.getenv("ENVIRONMENT") == "production" else "prefer"
        }
    )
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
