from sqlalchemy import Column, Integer, String, Date, Float, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base

class StartupProfile(Base):
    __tablename__ = "startup_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    
    # Company Information
    company_name = Column(String, nullable=False, index=True)
    website_link = Column(String)
    industry = Column(String, nullable=False, index=True)
    company_description = Column(Text, nullable=False)
    founding_date = Column(Date, nullable=False)
    team_size = Column(Integer, nullable=False)
    district = Column(String, nullable=False)
    state = Column(String, nullable=False)
    social_media_1 = Column(String)
    social_media_2 = Column(String)
    
    # Business Details
    business_model_description = Column(Text, nullable=False)
    total_paying_customers = Column(Integer, nullable=False)
    monthly_customer_growth_rate = Column(Float)
    customer_acquisition_cost = Column(Float)
    customer_lifetime_value = Column(Float)
    competitive_advantage = Column(Text, nullable=False)
    
    # Files
    pitch_deck_filename = Column(String, nullable=True)  # Original filename
    pitch_deck_file_path = Column(String, nullable=True)  # Server file path
    pitch_deck_file_size = Column(Integer, nullable=True)  # File size in bytes
    pitch_deck_content_type = Column(String, nullable=True)  # MIME type
    product_demo_video_link = Column(String, nullable=False)  # YouTube/Vimeo link
    
    # Funding Status - Basic
    pre_money_valuation = Column(Integer, nullable=False)
    amount_seeking = Column(Integer, nullable=False)
    investment_type = Column(String, nullable=False)  # Equity, Convertible, Debt
    max_equity_percentage = Column(Float, nullable=False)
    funding_stage = Column(String, nullable=False, index=True)
    total_funding_raised = Column(Integer, nullable=False)
    last_round_amount = Column(Integer, nullable=False)
    last_round_date = Column(Date, nullable=False)
    key_previous_investors = Column(Text, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="startup_profile")
    founders = relationship("Founder", back_populates="startup_profile")
    revenue_metrics = relationship("StartupRevenueMetrics", back_populates="startup_profile", uselist=False)
    fund_usage = relationship("FundUsage", back_populates="startup_profile", uselist=False)
    
class Founder(Base):
    __tablename__ = "founders"
    
    id = Column(Integer, primary_key=True, index=True)
    startup_profile_id = Column(Integer, ForeignKey("startup_profiles.id"))
    
    name = Column(String, nullable=False)
    educational_qualification = Column(String, nullable=False)
    previous_work_experience = Column(Text, nullable=False)
    linkedin_profile = Column(String, nullable=False)
    photo_url = Column(String, nullable=False)
    
    startup_profile = relationship("StartupProfile", back_populates="founders")
    
class StartupRevenueMetrics(Base):
    __tablename__ = "startup_revenue_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    startup_profile_id = Column(Integer, ForeignKey("startup_profiles.id"), unique=True)
    
    monthly_recurring_revenue = Column(Integer, nullable=False)
    annual_recurring_revenue = Column(Integer, nullable=False)
    revenue_growth_rate = Column(Float)
    monthly_burn_rate = Column(Integer)
    current_cash_runway = Column(Integer)
    projected_revenue_12_months = Column(Integer)
    profitability_timeline = Column(String, nullable=False)
    investment_timeline = Column(String, nullable=False)
    
    startup_profile = relationship("StartupProfile", back_populates="revenue_metrics")
    
    
class FundUsage(Base):
    __tablename__ = "fund_usage"
    
    id = Column(Integer, primary_key=True, index=True)
    startup_profile_id = Column(Integer, ForeignKey("startup_profiles.id"), unique=True)
    
    product_development_percentage = Column(Float, nullable=False)
    marketing_percentage = Column(Float, nullable=False)
    team_expansion_percentage = Column(Float, nullable=False)
    operations_percentage = Column(Float, nullable=False)
    
    startup_profile = relationship("StartupProfile", back_populates="fund_usage")
    
