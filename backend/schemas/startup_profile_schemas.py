from pydantic import BaseModel, validator, Field
from typing import Optional, List
from datetime import date, datetime
from fastapi import UploadFile

# Founder Schemas
class FounderBase(BaseModel):
    name: str
    educational_qualification: str
    previous_work_experience: str
    linkedin_profile: str
    photo_url: str

class FounderCreate(FounderBase):
    pass

class FounderUpdate(BaseModel):
    name: Optional[str] = None
    educational_qualification: Optional[str] = None
    previous_work_experience: Optional[str] = None
    linkedin_profile: Optional[str] = None
    photo_url: Optional[str] = None

class Founder(FounderBase):
    id: int
    startup_profile_id: int
    class Config:
        from_attributes = True

# Revenue Metrics Schemas
class StartupRevenueMetricsBase(BaseModel):
    monthly_recurring_revenue: int
    annual_recurring_revenue: int
    revenue_growth_rate: Optional[float] = None
    monthly_burn_rate: Optional[int] = None
    current_cash_runway: Optional[int] = None
    projected_revenue_12_months: Optional[int] = None
    profitability_timeline: str
    investment_timeline: str

class StartupRevenueMetricsCreate(StartupRevenueMetricsBase):
    pass

class StartupRevenueMetricsUpdate(BaseModel):
    monthly_recurring_revenue: Optional[int] = None
    annual_recurring_revenue: Optional[int] = None
    revenue_growth_rate: Optional[float] = None
    monthly_burn_rate: Optional[int] = None
    current_cash_runway: Optional[int] = None
    projected_revenue_12_months: Optional[int] = None
    profitability_timeline: Optional[str] = None
    investment_timeline: Optional[str] = None

class StartupRevenueMetrics(StartupRevenueMetricsBase):
    id: int
    startup_profile_id: int
    class Config:
        from_attributes = True

# Fund Usage Schemas
class FundUsageBase(BaseModel):
    product_development_percentage: float
    marketing_percentage: float
    team_expansion_percentage: float
    operations_percentage: float

    @validator('operations_percentage')
    def validate_total_percentage(cls, v, values):
        total = v + values.get('product_development_percentage', 0) + \
                values.get('marketing_percentage', 0) + values.get('team_expansion_percentage', 0)
        if abs(total - 100) > 0.01:
            raise ValueError('Total percentage must equal 100%')
        return v

class FundUsageCreate(FundUsageBase):
    pass

class FundUsageUpdate(BaseModel):
    product_development_percentage: Optional[float] = Field(None, ge=0, le=100)
    marketing_percentage: Optional[float] = Field(None, ge=0, le=100)
    team_expansion_percentage: Optional[float] = Field(None, ge=0, le=100)
    operations_percentage: Optional[float] = Field(None, ge=0, le=100)

class FundUsage(FundUsageBase):
    id: int
    startup_profile_id: int
    
    class Config:
        from_attributes = True

# Startup Profile Schemas
class StartupProfileBase(BaseModel):
    company_name: str
    website_link: Optional[str] = None
    industry: str
    company_description: str
    founding_date: date
    team_size: int
    district: str
    state: str
    social_media_1: Optional[str] = None
    social_media_2: Optional[str] = None
    business_model_description: str
    total_paying_customers: int
    monthly_customer_growth_rate: Optional[float] = None
    customer_acquisition_cost: Optional[float] = None
    customer_lifetime_value: Optional[float] = None
    competitive_advantage: str
    product_demo_video_link: str
    pre_money_valuation: int
    amount_seeking: int
    investment_type: str
    max_equity_percentage: float
    funding_stage: str
    total_funding_raised: int
    last_round_amount: int
    last_round_date: date
    key_previous_investors: str

class StartupProfileCreate(StartupProfileBase):
    founders: List[FounderCreate]
    revenue_metrics: StartupRevenueMetricsCreate
    fund_usage: FundUsageCreate

class StartupProfileUpdate(BaseModel):
    company_name: Optional[str] = None
    website_link: Optional[str] = None
    industry: Optional[str] = None
    company_description: Optional[str] = None
    founding_date: Optional[date] = None
    team_size: Optional[int] = None
    district: Optional[str] = None
    state: Optional[str] = None
    social_media_1: Optional[str] = None
    social_media_2: Optional[str] = None
    business_model_description: Optional[str] = None
    total_paying_customers: Optional[int] = None
    monthly_customer_growth_rate: Optional[float] = None
    customer_acquisition_cost: Optional[float] = None
    customer_lifetime_value: Optional[float] = None
    competitive_advantage: Optional[str] = None
    product_demo_video_link: Optional[str] = None
    pre_money_valuation: Optional[int] = None
    amount_seeking: Optional[int] = None
    investment_type: Optional[str] = None
    max_equity_percentage: Optional[float] = None
    funding_stage: Optional[str] = None
    total_funding_raised: Optional[int] = None
    last_round_amount: Optional[int] = None
    last_round_date: Optional[date] = None
    key_previous_investors: Optional[str] = None

class StartupProfile(StartupProfileBase):
    id: int
    user_id: int
    pitch_deck_filename: Optional[str] = None
    pitch_deck_file_path: Optional[str] = None
    pitch_deck_file_size: Optional[int] = None
    pitch_deck_content_type: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    founders: List[Founder] = []
    revenue_metrics: Optional[StartupRevenueMetrics] = None
    fund_usage: Optional[FundUsage] = None
    
    class Config:
        from_attributes = True

class PitchDeckUploadResponse(BaseModel):
    filename: str
    file_path: str
    file_size: int
    content_type: str
    upload_successful: bool