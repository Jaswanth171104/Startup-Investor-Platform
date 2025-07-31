from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, index=True, nullable=False)
    password = Column(String, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    profile_completed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Use string references to avoid circular imports
    startup_profile = relationship("StartupProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    investor_profile = relationship("InvestorProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    

class OTP(Base):
    __tablename__ = "otps"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True, nullable=False)
    otp = Column(String, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())