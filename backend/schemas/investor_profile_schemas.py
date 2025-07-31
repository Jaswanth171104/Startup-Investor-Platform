from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import json

class InvestorProfileBase(BaseModel):
    full_name: str
    email: str
    phone_number: Optional[str] = None
    country: str
    state: str
    district: str
    linkedin_profile: str
    investor_type: str
    firm_name: Optional[str] = None
    investment_experience: str
    years_of_investment_experience: str
    professional_background: List[str]
    previous_experience: Optional[str] = None
    investment_stages: List[str]
    check_size_range: str
    geographic_focus: List[str]
    industry_focus: List[str]
    investment_philosophy: str
    decision_timeline: str
    number_of_portfolio_companies: Optional[str] = None
    notable_investments: Optional[str] = None
    successful_exits: Optional[str] = None
    post_investment_involvement: str
    areas_of_expertise: List[str]
    investment_thesis: Optional[str] = None
    additional_info: Optional[str] = None
    profile_visibility: str
    contact_permissions: str
    # Photo fields (optional for creation, will be set by upload endpoint)
    profile_photo_filename: Optional[str] = None
    profile_photo_file_path: Optional[str] = None
    profile_photo_file_size: Optional[int] = None
    profile_photo_content_type: Optional[str] = None

class InvestorProfileCreate(InvestorProfileBase):
    pass

class InvestorProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    country: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    linkedin_profile: Optional[str] = None
    investor_type: Optional[str] = None
    firm_name: Optional[str] = None
    investment_experience: Optional[str] = None
    years_of_investment_experience: Optional[str] = None
    professional_background: Optional[List[str]] = None
    previous_experience: Optional[str] = None
    investment_stages: Optional[List[str]] = None
    check_size_range: Optional[str] = None
    geographic_focus: Optional[List[str]] = None
    industry_focus: Optional[List[str]] = None
    investment_philosophy: Optional[str] = None
    decision_timeline: Optional[str] = None
    number_of_portfolio_companies: Optional[str] = None
    notable_investments: Optional[str] = None
    successful_exits: Optional[str] = None
    post_investment_involvement: Optional[str] = None
    areas_of_expertise: Optional[List[str]] = None
    investment_thesis: Optional[str] = None
    additional_info: Optional[str] = None
    profile_visibility: Optional[str] = None
    contact_permissions: Optional[str] = None

class InvestorProfileResponse(BaseModel):
    id: Optional[int] = None
    user_id: Optional[int] = None
    full_name: Optional[str] = ''
    email: Optional[str] = ''
    phone_number: Optional[str] = ''
    country: Optional[str] = ''
    state: Optional[str] = ''
    district: Optional[str] = ''
    linkedin_profile: Optional[str] = ''
    investor_type: Optional[str] = ''
    firm_name: Optional[str] = ''
    investment_experience: Optional[str] = ''
    years_of_investment_experience: Optional[str] = ''
    professional_background: Optional[list] = []
    previous_experience: Optional[str] = ''
    investment_stages: Optional[list] = []
    check_size_range: Optional[str] = ''
    geographic_focus: Optional[list] = []
    industry_focus: Optional[list] = []
    investment_philosophy: Optional[str] = ''
    decision_timeline: Optional[str] = ''
    number_of_portfolio_companies: Optional[str] = ''
    notable_investments: Optional[str] = ''
    successful_exits: Optional[str] = ''
    post_investment_involvement: Optional[str] = ''
    areas_of_expertise: Optional[list] = []
    investment_thesis: Optional[str] = ''
    additional_info: Optional[str] = ''
    profile_visibility: Optional[str] = ''
    contact_permissions: Optional[str] = ''
    profile_photo_filename: Optional[str] = ''
    profile_photo_file_path: Optional[str] = ''
    profile_photo_file_size: Optional[int] = 0
    profile_photo_content_type: Optional[str] = ''
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    @classmethod
    def from_orm(cls, obj):
        def safe_json_loads(val):
            if isinstance(val, str):
                try:
                    return json.loads(val)
                except (json.JSONDecodeError, TypeError):
                    return []
            elif isinstance(val, list):
                return val
            else:
                return []

        def safe_getattr(obj, attr, default=''):
            try:
                val = getattr(obj, attr, default)
                if val is None:
                    return default
                return val
            except Exception:
                return default

        return cls(
            id=safe_getattr(obj, 'id'),
            user_id=safe_getattr(obj, 'user_id'),
            full_name=safe_getattr(obj, 'full_name'),
            email=safe_getattr(obj, 'email'),
            phone_number=safe_getattr(obj, 'phone_number'),
            country=safe_getattr(obj, 'country'),
            state=safe_getattr(obj, 'state'),
            district=safe_getattr(obj, 'district'),
            linkedin_profile=safe_getattr(obj, 'linkedin_profile'),
            investor_type=safe_getattr(obj, 'investor_type'),
            firm_name=safe_getattr(obj, 'firm_name'),
            investment_experience=safe_getattr(obj, 'investment_experience'),
            years_of_investment_experience=safe_getattr(obj, 'years_of_investment_experience'),
            professional_background=safe_json_loads(safe_getattr(obj, 'professional_background')),
            previous_experience=safe_getattr(obj, 'previous_experience'),
            investment_stages=safe_json_loads(safe_getattr(obj, 'investment_stages')),
            check_size_range=safe_getattr(obj, 'check_size_range'),
            geographic_focus=safe_json_loads(safe_getattr(obj, 'geographic_focus')),
            industry_focus=safe_json_loads(safe_getattr(obj, 'industry_focus')),
            investment_philosophy=safe_getattr(obj, 'investment_philosophy'),
            decision_timeline=safe_getattr(obj, 'decision_timeline'),
            number_of_portfolio_companies=safe_getattr(obj, 'number_of_portfolio_companies'),
            notable_investments=safe_getattr(obj, 'notable_investments'),
            successful_exits=safe_getattr(obj, 'successful_exits'),
            post_investment_involvement=safe_getattr(obj, 'post_investment_involvement'),
            areas_of_expertise=safe_json_loads(safe_getattr(obj, 'areas_of_expertise')),
            investment_thesis=safe_getattr(obj, 'investment_thesis'),
            additional_info=safe_getattr(obj, 'additional_info'),
            profile_visibility=safe_getattr(obj, 'profile_visibility'),
            contact_permissions=safe_getattr(obj, 'contact_permissions'),
            profile_photo_filename=safe_getattr(obj, 'profile_photo_filename'),
            profile_photo_file_path=safe_getattr(obj, 'profile_photo_file_path'),
            profile_photo_file_size=safe_getattr(obj, 'profile_photo_file_size'),
            profile_photo_content_type=safe_getattr(obj, 'profile_photo_content_type'),
            created_at=safe_getattr(obj, 'created_at'),
            updated_at=safe_getattr(obj, 'updated_at')
        )

class InvestorProfile(InvestorProfileBase):
    id: int
    user_id: int
    profile_photo_filename: Optional[str] = None
    profile_photo_file_path: Optional[str] = None
    profile_photo_file_size: Optional[int] = None
    profile_photo_content_type: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ProfilePhotoUploadResponse(BaseModel):
    filename: str
    file_path: str
    file_size: int
    content_type: str
    upload_successful: bool 