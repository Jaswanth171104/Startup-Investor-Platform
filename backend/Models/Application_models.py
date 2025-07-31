from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base

class Application(Base):
    __tablename__ = "applications"
    id = Column(Integer, primary_key=True, index=True)
    startup_id = Column(Integer, ForeignKey("users.id"))
    investor_id = Column(Integer, ForeignKey("users.id"))
    pitch_deck_filename = Column(String, nullable=False)
    pitch_deck_file_path = Column(String, nullable=False)
    status = Column(String, default="sent")  # sent, viewed, interested, rejected, etc.
    sent_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    log = Column(Text)

    # Relationships
    startup = relationship("User", foreign_keys=[startup_id])
    investor = relationship("User", foreign_keys=[investor_id])
    logs = relationship("ApplicationLog", back_populates="application")

class InterestStatus(Base):
    __tablename__ = "interest_status"
    id = Column(Integer, primary_key=True, index=True)
    startup_id = Column(Integer, ForeignKey("users.id"))
    investor_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, nullable=False)  # interested, not_interested
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    startup = relationship("User", foreign_keys=[startup_id])
    investor = relationship("User", foreign_keys=[investor_id])

class ApplicationLog(Base):
    __tablename__ = "application_logs"
    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"))
    action = Column(String, nullable=False)  # sent, viewed, interested, etc.
    actor_id = Column(Integer, ForeignKey("users.id"))
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    details = Column(Text)

    application = relationship("Application", back_populates="logs")
    actor = relationship("User") 