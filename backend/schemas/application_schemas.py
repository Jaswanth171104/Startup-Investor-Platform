from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class SendPitchDeckRequest(BaseModel):
    investor_id: int

class ApplicationBase(BaseModel):
    startup_id: int
    investor_id: int
    pitch_deck_filename: str
    pitch_deck_file_path: str
    status: str
    log: Optional[str] = None

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    message: Optional[str] = None

class ApplicationSchema(ApplicationBase):
    id: int
    log: Optional[str] = None
    sent_at: datetime
    updated_at: datetime
    startup_name: Optional[str] = None
    investor_name: Optional[str] = None
    
    class Config:
        from_attributes = True

class InterestStatusBase(BaseModel):
    startup_id: int
    investor_id: int
    status: str  # interested, not_interested

class InterestStatusCreate(InterestStatusBase):
    pass

class InterestStatusUpdate(BaseModel):
    startup_id: int
    status: str

class InterestStatusSchema(BaseModel):
    id: int
    startup_id: int
    investor_id: int
    status: str
    created_at: datetime
    startup_name: Optional[str] = None
    investor_name: Optional[str] = None
    
    class Config:
        from_attributes = True

class ApplicationLogBase(BaseModel):
    application_id: int
    action: str
    actor_id: int
    details: Optional[str] = None

class ApplicationLogCreate(ApplicationLogBase):
    pass

class ApplicationLog(ApplicationLogBase):
    id: int
    timestamp: datetime
    
    class Config:
        from_attributes = True 