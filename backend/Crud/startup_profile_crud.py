from sqlalchemy.orm import Session
from backend.Models.Startup_profile_models import StartupProfile, Founder, StartupRevenueMetrics, FundUsage
from backend.schemas.startup_profile_schemas import StartupProfileCreate, StartupProfileUpdate
from fastapi import HTTPException, status

def create_startup_profile(db: Session, user_id: int, profile_data: StartupProfileCreate, pitch_deck_file_info: dict):
    # Create StartupProfile
    startup_profile = StartupProfile(
        user_id=user_id,
        company_name=profile_data.company_name,
        website_link=profile_data.website_link,
        industry=profile_data.industry,
        company_description=profile_data.company_description,
        founding_date=profile_data.founding_date,
        team_size=profile_data.team_size,
        district=profile_data.district,
        state=profile_data.state,
        social_media_1=profile_data.social_media_1,
        social_media_2=profile_data.social_media_2,
        business_model_description=profile_data.business_model_description,
        total_paying_customers=profile_data.total_paying_customers,
        monthly_customer_growth_rate=profile_data.monthly_customer_growth_rate,
        customer_acquisition_cost=profile_data.customer_acquisition_cost,
        customer_lifetime_value=profile_data.customer_lifetime_value,
        competitive_advantage=profile_data.competitive_advantage,
        pitch_deck_filename=pitch_deck_file_info['filename'],
        pitch_deck_file_path=pitch_deck_file_info['file_path'],
        pitch_deck_file_size=pitch_deck_file_info['file_size'],
        pitch_deck_content_type=pitch_deck_file_info['content_type'],
        product_demo_video_link=profile_data.product_demo_video_link,
        pre_money_valuation=profile_data.pre_money_valuation,
        amount_seeking=profile_data.amount_seeking,
        investment_type=profile_data.investment_type,
        max_equity_percentage=profile_data.max_equity_percentage,
        funding_stage=profile_data.funding_stage,
        total_funding_raised=profile_data.total_funding_raised,
        last_round_amount=profile_data.last_round_amount,
        last_round_date=profile_data.last_round_date,
        key_previous_investors=profile_data.key_previous_investors
    )
    db.add(startup_profile)
    db.commit()
    db.refresh(startup_profile)

    # Add founders
    for founder_data in profile_data.founders:
        founder = Founder(
            startup_profile_id=startup_profile.id,
            name=founder_data.name,
            educational_qualification=founder_data.educational_qualification,
            previous_work_experience=founder_data.previous_work_experience,
            linkedin_profile=founder_data.linkedin_profile,
            photo_url=founder_data.photo_url
        )
        db.add(founder)

    # Add revenue metrics
    rev = profile_data.revenue_metrics
    revenue_metrics = StartupRevenueMetrics(
        startup_profile_id=startup_profile.id,
        monthly_recurring_revenue=rev.monthly_recurring_revenue,
        annual_recurring_revenue=rev.annual_recurring_revenue,
        revenue_growth_rate=rev.revenue_growth_rate,
        monthly_burn_rate=rev.monthly_burn_rate,
        current_cash_runway=rev.current_cash_runway,
        projected_revenue_12_months=rev.projected_revenue_12_months,
        profitability_timeline=rev.profitability_timeline,
        investment_timeline=rev.investment_timeline
    )
    db.add(revenue_metrics)

    # Add fund usage
    fund = profile_data.fund_usage
    fund_usage = FundUsage(
        startup_profile_id=startup_profile.id,
        product_development_percentage=fund.product_development_percentage,
        marketing_percentage=fund.marketing_percentage,
        team_expansion_percentage=fund.team_expansion_percentage,
        operations_percentage=fund.operations_percentage
    )
    db.add(fund_usage)

    db.commit()
    db.refresh(startup_profile)
    return startup_profile

def get_startup_profile_by_user_id(db: Session, user_id: int):
    profile = db.query(StartupProfile).filter(StartupProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Startup profile not found")
    return profile

def update_startup_profile(db: Session, user_id: int, update_data: StartupProfileUpdate):
    profile = db.query(StartupProfile).filter(StartupProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Startup profile not found")
    for field, value in update_data.dict(exclude_unset=True).items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile

def delete_startup_profile(db: Session, user_id: int):
    profile = db.query(StartupProfile).filter(StartupProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Startup profile not found")
    db.delete(profile)
    db.commit()
    return {"detail": "Startup profile deleted"}

def list_startup_profiles_by_user(db: Session, user_id: int):
    profiles = db.query(StartupProfile).filter(StartupProfile.user_id == user_id).all()
    return profiles

def get_all_startup_profiles(db: Session):
    """Get all startup profiles for investors to browse"""
    profiles = db.query(StartupProfile).all()
    return profiles
