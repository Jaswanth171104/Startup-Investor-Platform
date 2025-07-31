from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base

class InvestorProfile(Base):
    __tablename__ = "investor_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    
    # Basic Information
    full_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone_number = Column(String)  # Optional
    country = Column(String, nullable=False)
    state = Column(String, nullable=False)
    district = Column(String, nullable=False)
    linkedin_profile = Column(String, nullable=False)
    
    # Investor Type & Background
    investor_type = Column(String, nullable=False)  # Angel Investor, Venture Capital Partner, etc.
    firm_name = Column(String)  # Optional, only if not Angel Investor
    investment_experience = Column(String, nullable=False)  # First-time investor, Early investor, etc.
    years_of_investment_experience = Column(String, nullable=False)  # Less than 1 year, 1-2 years, etc.
    professional_background = Column(Text, nullable=False)  # Multi-select stored as JSON string
    previous_experience = Column(Text)  # Manually typed role
    
    # Investment Criteria
    investment_stages = Column(Text, nullable=False)  # Multi-select stored as JSON string
    check_size_range = Column(String, nullable=False)  # $10K - $25K, etc.
    geographic_focus = Column(Text, nullable=False)  # Multi-select stored as JSON string
    industry_focus = Column(Text, nullable=False)  # Multi-select stored as JSON string
    
    # Investment Approach
    investment_philosophy = Column(String, nullable=False)  # Founder-first investor, etc.
    decision_timeline = Column(String, nullable=False)  # 1-2 weeks, etc.
    
    # Portfolio & Track Record (Optional)
    number_of_portfolio_companies = Column(String)  # 1-5 companies, etc.
    notable_investments = Column(Text)  # 3-5 most successful investments
    successful_exits = Column(String)  # None yet, 1-2 exits, etc.
    
    # Operational Involvement
    post_investment_involvement = Column(String, nullable=False)  # Hands-off, Quarterly check-ins, etc.
    areas_of_expertise = Column(Text, nullable=False)  # Multi-select stored as JSON string
    investment_thesis = Column(Text)  # Optional long text
    additional_info = Column(Text)  # Optional long text
    profile_visibility = Column(String, nullable=False)  # Public, Private
    contact_permissions = Column(String, nullable=False)  # Open to all, Only pre-qualified, etc.
    
    # Profile Photo
    profile_photo_filename = Column(String, nullable=True)
    profile_photo_file_path = Column(String, nullable=True)
    profile_photo_file_size = Column(Integer, nullable=True)
    profile_photo_content_type = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="investor_profile")


