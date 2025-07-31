import json
from sqlalchemy.orm import Session
from backend.Models.Investor_profile_models import InvestorProfile
from backend.schemas.investor_profile_schemas import InvestorProfileCreate, InvestorProfileUpdate
from fastapi import HTTPException, status

def create_investor_profile(db: Session, user_id: int, profile_data: InvestorProfileCreate, profile_photo_file_info: dict):
    # Create InvestorProfile
    investor_profile = InvestorProfile(
        user_id=user_id,
        full_name=profile_data.full_name,
        email=profile_data.email,
        phone_number=profile_data.phone_number,
        country=profile_data.country,
        state=profile_data.state,
        district=profile_data.district,
        linkedin_profile=profile_data.linkedin_profile,
        investor_type=profile_data.investor_type,
        firm_name=profile_data.firm_name,
        investment_experience=profile_data.investment_experience,
        years_of_investment_experience=profile_data.years_of_investment_experience,
        professional_background=json.dumps(profile_data.professional_background),
        previous_experience=profile_data.previous_experience,
        investment_stages=json.dumps(profile_data.investment_stages),
        check_size_range=profile_data.check_size_range,
        geographic_focus=json.dumps(profile_data.geographic_focus),
        industry_focus=json.dumps(profile_data.industry_focus),
        investment_philosophy=profile_data.investment_philosophy,
        decision_timeline=profile_data.decision_timeline,
        number_of_portfolio_companies=profile_data.number_of_portfolio_companies,
        notable_investments=profile_data.notable_investments,
        successful_exits=profile_data.successful_exits,
        post_investment_involvement=profile_data.post_investment_involvement,
        areas_of_expertise=json.dumps(profile_data.areas_of_expertise),
        investment_thesis=profile_data.investment_thesis,
        additional_info=profile_data.additional_info,
        profile_visibility=profile_data.profile_visibility,
        contact_permissions=profile_data.contact_permissions,
        profile_photo_filename=profile_photo_file_info['filename'],
        profile_photo_file_path=profile_photo_file_info['file_path'],
        profile_photo_file_size=profile_photo_file_info['file_size'],
        profile_photo_content_type=profile_photo_file_info['content_type']
    )
    
    db.add(investor_profile)
    db.commit()
    db.refresh(investor_profile)
    return investor_profile

def get_investor_profile_by_user_id(db: Session, user_id: int):
    profile = db.query(InvestorProfile).filter(InvestorProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Investor profile not found")
    return profile

def update_investor_profile(db: Session, user_id: int, update_data: InvestorProfileUpdate):
    profile = db.query(InvestorProfile).filter(InvestorProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Investor profile not found")
    
    update_dict = update_data.dict(exclude_unset=True)
    
    # Handle multi-select fields that need JSON conversion
    multi_select_fields = ['professional_background', 'investment_stages', 'geographic_focus', 'industry_focus', 'areas_of_expertise']
    
    for field, value in update_dict.items():
        if field in multi_select_fields and value is not None:
            setattr(profile, field, json.dumps(value))
        else:
            setattr(profile, field, value)
    
    db.commit()
    db.refresh(profile)
    return profile

def delete_investor_profile(db: Session, user_id: int):
    profile = db.query(InvestorProfile).filter(InvestorProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Investor profile not found")
    
    db.delete(profile)
    db.commit()
    return {"detail": "Investor profile deleted"}

def list_investor_profiles_by_user(db: Session, user_id: int):
    profiles = db.query(InvestorProfile).filter(InvestorProfile.user_id == user_id).all()
    return profiles

def get_all_investor_profiles(db: Session):
    """Get all investor profiles for startups to browse"""
    profiles = db.query(InvestorProfile).all()
    return profiles 