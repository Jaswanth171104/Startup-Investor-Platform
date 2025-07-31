# Startup Investor Platform - Backend

This is the FastAPI backend for the Startup Investor Platform.

## Setup Instructions

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Initialize Database
Before running the application, you need to create the database tables:

```bash
python3 create_tables.py
```

Or use the simplified init script:
```bash
python3 init_db.py
```

### 3. Run the Server
```bash
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## API Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check
- `GET /test` - Test endpoint
- `GET /debug` - Debug information

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login

### Investor Profile
- `POST /investor-profile/create` - Create investor profile
- `GET /investor-profile/list` - List investor profiles
- `PUT /investor-profile/edit/{id}` - Edit investor profile

### Startup Profile
- `POST /startup-profile/create` - Create startup profile
- `GET /startup-profile/list` - List startup profiles
- `PUT /startup-profile/edit/{id}` - Edit startup profile

### Applications
- `POST /applications/apply` - Submit application
- `GET /applications/list` - List applications

## Database

The application uses SQLite by default for development. The database file is `startup_investor.db`.

To use a different database, set the `DATABASE_URL` environment variable:
```bash
export DATABASE_URL="postgresql://user:password@localhost/dbname"
```

## Troubleshooting

If you encounter the error "no such table: users", run the database initialization script:
```bash
python3 create_tables.py
```

This will create all necessary tables in the database. 