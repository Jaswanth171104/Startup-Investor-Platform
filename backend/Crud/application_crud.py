from sqlalchemy.orm import Session
from backend.Models.Application_models import Application, ApplicationLog
from backend.schemas.application_schemas import ApplicationCreate, ApplicationUpdate, ApplicationLogCreate
from fastapi import HTTPException

def create_application(db: Session, app_data: ApplicationCreate):
    # Prevent duplicate application
    existing = db.query(Application).filter(
        Application.startup_id == app_data.startup_id,
        Application.investor_id == app_data.investor_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Application already exists for this startup and investor.")
    application = Application(**app_data.dict())
    db.add(application)
    db.commit()
    db.refresh(application)
    return application

def get_application(db: Session, application_id: int):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return app

def list_applications_by_startup(db: Session, startup_id: int):
    return db.query(Application).filter(Application.startup_id == startup_id).all()

def list_applications_by_investor(db: Session, investor_id: int):
    return db.query(Application).filter(Application.investor_id == investor_id).all()

def update_application(db: Session, application_id: int, update_data: ApplicationUpdate):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    for field, value in update_data.dict(exclude_unset=True).items():
        setattr(app, field, value)
    db.commit()
    db.refresh(app)
    return app

def delete_application(db: Session, application_id: int):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    db.delete(app)
    db.commit()
    return {"detail": "Application deleted"}

def create_application_log(db: Session, log_data: ApplicationLogCreate):
    log = ApplicationLog(**log_data.dict())
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

def list_logs_by_application(db: Session, application_id: int):
    return db.query(ApplicationLog).filter(ApplicationLog.application_id == application_id).all() 