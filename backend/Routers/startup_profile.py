from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session, joinedload
from Database.db import get_db
from Models.Auth_models import User
from Models.Startup_profile_models import StartupProfile, Founder, StartupRevenueMetrics, FundUsage
from schemas.startup_profile_schemas import StartupProfileCreate, StartupProfileUpdate, StartupProfile as StartupProfileSchema
from utils import get_current_user
import os
import shutil
from typing import List, Optional
import json
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=StartupProfileSchema)
def create_startup_profile(
    profile_data: StartupProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create startup profile"""
    if current_user.role != "startup":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only startups can create startup profiles"
        )
    
    # Check if profile already exists
    existing_profile = db.query(StartupProfile).filter(StartupProfile.user_id == current_user.id).first()
    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile already exists for this user"
        )
    
    # Extract founders and related data
    founders_data = profile_data.founders
    revenue_metrics_data = profile_data.revenue_metrics
    fund_usage_data = profile_data.fund_usage
    
    # Create profile without founders first
    profile_dict = profile_data.dict()
    profile_dict.pop('founders', None)
    profile_dict.pop('revenue_metrics', None)
    profile_dict.pop('fund_usage', None)
    
    new_profile = StartupProfile(
        user_id=current_user.id,
        **profile_dict
    )
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    
    # Now add founders
    from Models.Startup_profile_models import Founder
    for founder_data in founders_data:
        founder = Founder(
            startup_profile_id=new_profile.id,
            **founder_data.dict()
        )
        db.add(founder)
    
    # Add revenue metrics
    from Models.Startup_profile_models import StartupRevenueMetrics
    revenue_metrics = StartupRevenueMetrics(
        startup_profile_id=new_profile.id,
        **revenue_metrics_data.dict()
    )
    db.add(revenue_metrics)
    
    # Add fund usage
    from Models.Startup_profile_models import FundUsage
    fund_usage = FundUsage(
        startup_profile_id=new_profile.id,
        **fund_usage_data.dict()
    )
    db.add(fund_usage)
    
    db.commit()
    db.refresh(new_profile)
    
    # Return the profile with all related data
    # We need to manually construct the response to match the schema
    from schemas.startup_profile_schemas import StartupProfile as StartupProfileResponse
    
    # Get the profile with all relationships loaded
    profile_with_relations = db.query(StartupProfile).options(
        joinedload(StartupProfile.founders),
        joinedload(StartupProfile.revenue_metrics),
        joinedload(StartupProfile.fund_usage)
    ).filter(StartupProfile.id == new_profile.id).first()
    
    if not profile_with_relations:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load created profile"
        )
    
    # Convert to dict and back to ensure proper serialization
    try:
        # Create a response dict that matches the schema exactly
        response_data = {
            "id": profile_with_relations.id,
            "user_id": profile_with_relations.user_id,
            "company_name": profile_with_relations.company_name,
            "website_link": profile_with_relations.website_link,
            "industry": profile_with_relations.industry,
            "company_description": profile_with_relations.company_description,
            "founding_date": profile_with_relations.founding_date,
            "team_size": profile_with_relations.team_size,
            "district": profile_with_relations.district,
            "state": profile_with_relations.state,
            "social_media_1": profile_with_relations.social_media_1,
            "social_media_2": profile_with_relations.social_media_2,
            "business_model_description": profile_with_relations.business_model_description,
            "total_paying_customers": profile_with_relations.total_paying_customers,
            "monthly_customer_growth_rate": profile_with_relations.monthly_customer_growth_rate,
            "customer_acquisition_cost": profile_with_relations.customer_acquisition_cost,
            "customer_lifetime_value": profile_with_relations.customer_lifetime_value,
            "competitive_advantage": profile_with_relations.competitive_advantage,
            "product_demo_video_link": profile_with_relations.product_demo_video_link,
            "pre_money_valuation": profile_with_relations.pre_money_valuation,
            "amount_seeking": profile_with_relations.amount_seeking,
            "investment_type": profile_with_relations.investment_type,
            "max_equity_percentage": profile_with_relations.max_equity_percentage,
            "funding_stage": profile_with_relations.funding_stage,
            "total_funding_raised": profile_with_relations.total_funding_raised,
            "last_round_amount": profile_with_relations.last_round_amount,
            "last_round_date": profile_with_relations.last_round_date,
            "key_previous_investors": profile_with_relations.key_previous_investors,
            "pitch_deck_filename": profile_with_relations.pitch_deck_filename,
            "pitch_deck_file_path": profile_with_relations.pitch_deck_file_path,
            "pitch_deck_file_size": profile_with_relations.pitch_deck_file_size,
            "pitch_deck_content_type": profile_with_relations.pitch_deck_content_type,
            "created_at": profile_with_relations.created_at,
            "updated_at": profile_with_relations.updated_at,
            "founders": [
                {
                    "id": founder.id,
                    "startup_profile_id": founder.startup_profile_id,
                    "name": founder.name,
                    "educational_qualification": founder.educational_qualification,
                    "previous_work_experience": founder.previous_work_experience,
                    "linkedin_profile": founder.linkedin_profile,
                    "photo_url": founder.photo_url
                } for founder in profile_with_relations.founders
            ],
            "revenue_metrics": {
                "id": profile_with_relations.revenue_metrics.id,
                "startup_profile_id": profile_with_relations.revenue_metrics.startup_profile_id,
                "monthly_recurring_revenue": profile_with_relations.revenue_metrics.monthly_recurring_revenue,
                "annual_recurring_revenue": profile_with_relations.revenue_metrics.annual_recurring_revenue,
                "revenue_growth_rate": profile_with_relations.revenue_metrics.revenue_growth_rate,
                "monthly_burn_rate": profile_with_relations.revenue_metrics.monthly_burn_rate,
                "current_cash_runway": profile_with_relations.revenue_metrics.current_cash_runway,
                "projected_revenue_12_months": profile_with_relations.revenue_metrics.projected_revenue_12_months,
                "profitability_timeline": profile_with_relations.revenue_metrics.profitability_timeline,
                "investment_timeline": profile_with_relations.revenue_metrics.investment_timeline
            } if profile_with_relations.revenue_metrics else None,
            "fund_usage": {
                "id": profile_with_relations.fund_usage.id,
                "startup_profile_id": profile_with_relations.fund_usage.startup_profile_id,
                "product_development_percentage": profile_with_relations.fund_usage.product_development_percentage,
                "marketing_percentage": profile_with_relations.fund_usage.marketing_percentage,
                "team_expansion_percentage": profile_with_relations.fund_usage.team_expansion_percentage,
                "operations_percentage": profile_with_relations.fund_usage.operations_percentage
            } if profile_with_relations.fund_usage else None
        }
        
        return response_data
        
    except Exception as e:
        print(f"Error serializing profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to serialize profile response"
        )

@router.get("/all", response_model=List[StartupProfileSchema])
def get_all_startup_profiles(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all startup profiles"""
    profiles = db.query(StartupProfile).options(
        joinedload(StartupProfile.founders),
        joinedload(StartupProfile.revenue_metrics),
        joinedload(StartupProfile.fund_usage)
    ).all()
    
    # Convert to dict and back to ensure proper serialization
    try:
        response_data = []
        for profile in profiles:
            profile_data = {
                "id": profile.id,
                "user_id": profile.user_id,
                "company_name": profile.company_name,
                "website_link": profile.website_link,
                "industry": profile.industry,
                "company_description": profile.company_description,
                "founding_date": profile.founding_date,
                "team_size": profile.team_size,
                "district": profile.district,
                "state": profile.state,
                "social_media_1": profile.social_media_1,
                "social_media_2": profile.social_media_2,
                "business_model_description": profile.business_model_description,
                "total_paying_customers": profile.total_paying_customers,
                "monthly_customer_growth_rate": profile.monthly_customer_growth_rate,
                "customer_acquisition_cost": profile.customer_acquisition_cost,
                "customer_lifetime_value": profile.customer_lifetime_value,
                "competitive_advantage": profile.competitive_advantage,
                "product_demo_video_link": profile.product_demo_video_link,
                "pre_money_valuation": profile.pre_money_valuation,
                "amount_seeking": profile.amount_seeking,
                "investment_type": profile.investment_type,
                "max_equity_percentage": profile.max_equity_percentage,
                "funding_stage": profile.funding_stage,
                "total_funding_raised": profile.total_funding_raised,
                "last_round_amount": profile.last_round_amount,
                "last_round_date": profile.last_round_date,
                "key_previous_investors": profile.key_previous_investors,
                "pitch_deck_filename": profile.pitch_deck_filename,
                "pitch_deck_file_path": profile.pitch_deck_file_path,
                "pitch_deck_file_size": profile.pitch_deck_file_size,
                "pitch_deck_content_type": profile.pitch_deck_content_type,
                "created_at": profile.created_at,
                "updated_at": profile.updated_at,
                "founders": [
                    {
                        "id": founder.id,
                        "startup_profile_id": founder.startup_profile_id,
                        "name": founder.name,
                        "educational_qualification": founder.educational_qualification,
                        "previous_work_experience": founder.previous_work_experience,
                        "linkedin_profile": founder.linkedin_profile,
                        "photo_url": founder.photo_url
                    } for founder in profile.founders
                ],
                "revenue_metrics": {
                    "id": profile.revenue_metrics.id,
                    "startup_profile_id": profile.revenue_metrics.startup_profile_id,
                    "monthly_recurring_revenue": profile.revenue_metrics.monthly_recurring_revenue,
                    "annual_recurring_revenue": profile.revenue_metrics.annual_recurring_revenue,
                    "revenue_growth_rate": profile.revenue_metrics.revenue_growth_rate,
                    "monthly_burn_rate": profile.revenue_metrics.monthly_burn_rate,
                    "current_cash_runway": profile.revenue_metrics.current_cash_runway,
                    "projected_revenue_12_months": profile.revenue_metrics.projected_revenue_12_months,
                    "profitability_timeline": profile.revenue_metrics.profitability_timeline,
                    "investment_timeline": profile.revenue_metrics.investment_timeline
                } if profile.revenue_metrics else None,
                "fund_usage": {
                    "id": profile.fund_usage.id,
                    "startup_profile_id": profile.fund_usage.startup_profile_id,
                    "product_development_percentage": profile.fund_usage.product_development_percentage,
                    "marketing_percentage": profile.fund_usage.marketing_percentage,
                    "team_expansion_percentage": profile.fund_usage.team_expansion_percentage,
                    "operations_percentage": profile.fund_usage.operations_percentage
                } if profile.fund_usage else None
            }
            response_data.append(profile_data)
        
        return response_data
        
    except Exception as e:
        print(f"Error serializing profiles: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to serialize profiles response"
        )

@router.get("/{user_id}", response_model=StartupProfileSchema)
def get_startup_profile(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get startup profile by user ID"""
    profile = db.query(StartupProfile).options(
        joinedload(StartupProfile.founders),
        joinedload(StartupProfile.revenue_metrics),
        joinedload(StartupProfile.fund_usage)
    ).filter(StartupProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Startup profile not found"
        )
    
    # Convert to dict and back to ensure proper serialization
    try:
        # Create a response dict that matches the schema exactly
        response_data = {
            "id": profile.id,
            "user_id": profile.user_id,
            "company_name": profile.company_name,
            "website_link": profile.website_link,
            "industry": profile.industry,
            "company_description": profile.company_description,
            "founding_date": profile.founding_date,
            "team_size": profile.team_size,
            "district": profile.district,
            "state": profile.state,
            "social_media_1": profile.social_media_1,
            "social_media_2": profile.social_media_2,
            "business_model_description": profile.business_model_description,
            "total_paying_customers": profile.total_paying_customers,
            "monthly_customer_growth_rate": profile.monthly_customer_growth_rate,
            "customer_acquisition_cost": profile.customer_acquisition_cost,
            "customer_lifetime_value": profile.customer_lifetime_value,
            "competitive_advantage": profile.competitive_advantage,
            "product_demo_video_link": profile.product_demo_video_link,
            "pre_money_valuation": profile.pre_money_valuation,
            "amount_seeking": profile.amount_seeking,
            "investment_type": profile.investment_type,
            "max_equity_percentage": profile.max_equity_percentage,
            "funding_stage": profile.funding_stage,
            "total_funding_raised": profile.total_funding_raised,
            "last_round_amount": profile.last_round_amount,
            "last_round_date": profile.last_round_date,
            "key_previous_investors": profile.key_previous_investors,
            "pitch_deck_filename": profile.pitch_deck_filename,
            "pitch_deck_file_path": profile.pitch_deck_file_path,
            "pitch_deck_file_size": profile.pitch_deck_file_size,
            "pitch_deck_content_type": profile.pitch_deck_content_type,
            "created_at": profile.created_at,
            "updated_at": profile.updated_at,
            "founders": [
                {
                    "id": founder.id,
                    "startup_profile_id": founder.startup_profile_id,
                    "name": founder.name,
                    "educational_qualification": founder.educational_qualification,
                    "previous_work_experience": founder.previous_work_experience,
                    "linkedin_profile": founder.linkedin_profile,
                    "photo_url": founder.photo_url
                } for founder in profile.founders
            ],
            "revenue_metrics": {
                "id": profile.revenue_metrics.id,
                "startup_profile_id": profile.revenue_metrics.startup_profile_id,
                "monthly_recurring_revenue": profile.revenue_metrics.monthly_recurring_revenue,
                "annual_recurring_revenue": profile.revenue_metrics.annual_recurring_revenue,
                "revenue_growth_rate": profile.revenue_metrics.revenue_growth_rate,
                "monthly_burn_rate": profile.revenue_metrics.monthly_burn_rate,
                "current_cash_runway": profile.revenue_metrics.current_cash_runway,
                "projected_revenue_12_months": profile.revenue_metrics.projected_revenue_12_months,
                "profitability_timeline": profile.revenue_metrics.profitability_timeline,
                "investment_timeline": profile.revenue_metrics.investment_timeline
            } if profile.revenue_metrics else None,
            "fund_usage": {
                "id": profile.fund_usage.id,
                "startup_profile_id": profile.fund_usage.startup_profile_id,
                "product_development_percentage": profile.fund_usage.product_development_percentage,
                "marketing_percentage": profile.fund_usage.marketing_percentage,
                "team_expansion_percentage": profile.fund_usage.team_expansion_percentage,
                "operations_percentage": profile.fund_usage.operations_percentage
            } if profile.fund_usage else None
        }
        
        return response_data
        
    except Exception as e:
        print(f"Error serializing profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to serialize profile response"
        )

@router.get("/user/{user_id}", response_model=StartupProfileSchema)
def get_startup_profile_by_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get startup profile by user ID (for profile editing)"""
    # Check if user is requesting their own profile
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only view your own profile"
        )
    
    profile = db.query(StartupProfile).options(
        joinedload(StartupProfile.founders),
        joinedload(StartupProfile.revenue_metrics),
        joinedload(StartupProfile.fund_usage)
    ).filter(StartupProfile.user_id == user_id).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Startup profile not found"
        )
    
    # Convert to dict and back to ensure proper serialization
    try:
        # Create a response dict that matches the schema exactly
        response_data = {
            "id": profile.id,
            "user_id": profile.user_id,
            "company_name": profile.company_name,
            "website_link": profile.website_link,
            "industry": profile.industry,
            "company_description": profile.company_description,
            "founding_date": profile.founding_date,
            "team_size": profile.team_size,
            "district": profile.district,
            "state": profile.state,
            "social_media_1": profile.social_media_1,
            "social_media_2": profile.social_media_2,
            "business_model_description": profile.business_model_description,
            "total_paying_customers": profile.total_paying_customers,
            "monthly_customer_growth_rate": profile.monthly_customer_growth_rate,
            "customer_acquisition_cost": profile.customer_acquisition_cost,
            "customer_lifetime_value": profile.customer_lifetime_value,
            "competitive_advantage": profile.competitive_advantage,
            "product_demo_video_link": profile.product_demo_video_link,
            "pre_money_valuation": profile.pre_money_valuation,
            "amount_seeking": profile.amount_seeking,
            "investment_type": profile.investment_type,
            "max_equity_percentage": profile.max_equity_percentage,
            "funding_stage": profile.funding_stage,
            "total_funding_raised": profile.total_funding_raised,
            "last_round_amount": profile.last_round_amount,
            "last_round_date": profile.last_round_date,
            "key_previous_investors": profile.key_previous_investors,
            "pitch_deck_filename": profile.pitch_deck_filename,
            "pitch_deck_file_path": profile.pitch_deck_file_path,
            "pitch_deck_file_size": profile.pitch_deck_file_size,
            "pitch_deck_content_type": profile.pitch_deck_content_type,
            "created_at": profile.created_at,
            "updated_at": profile.updated_at,
            "founders": [
                {
                    "id": founder.id,
                    "startup_profile_id": founder.startup_profile_id,
                    "name": founder.name,
                    "educational_qualification": founder.educational_qualification,
                    "previous_work_experience": founder.previous_work_experience,
                    "linkedin_profile": founder.linkedin_profile,
                    "photo_url": founder.photo_url
                } for founder in profile.founders
            ],
            "revenue_metrics": {
                "id": profile.revenue_metrics.id,
                "startup_profile_id": profile.revenue_metrics.startup_profile_id,
                "monthly_recurring_revenue": profile.revenue_metrics.monthly_recurring_revenue,
                "annual_recurring_revenue": profile.revenue_metrics.annual_recurring_revenue,
                "revenue_growth_rate": profile.revenue_metrics.revenue_growth_rate,
                "monthly_burn_rate": profile.revenue_metrics.monthly_burn_rate,
                "current_cash_runway": profile.revenue_metrics.current_cash_runway,
                "projected_revenue_12_months": profile.revenue_metrics.projected_revenue_12_months,
                "profitability_timeline": profile.revenue_metrics.profitability_timeline,
                "investment_timeline": profile.revenue_metrics.investment_timeline
            } if profile.revenue_metrics else None,
            "fund_usage": {
                "id": profile.fund_usage.id,
                "startup_profile_id": profile.fund_usage.startup_profile_id,
                "product_development_percentage": profile.fund_usage.product_development_percentage,
                "marketing_percentage": profile.fund_usage.marketing_percentage,
                "team_expansion_percentage": profile.fund_usage.team_expansion_percentage,
                "operations_percentage": profile.fund_usage.operations_percentage
            } if profile.fund_usage else None
        }
        
        return response_data
        
    except Exception as e:
        print(f"Error serializing profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to serialize profile response"
        )

@router.put("/update-pitch-deck")
async def update_pitch_deck(
    pitch_deck: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update startup pitch deck"""
    if current_user.role != "startup":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only startups can update pitch decks"
        )
    
    # Validate file type
    allowed_types = ['application/pdf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.ms-powerpoint']
    if pitch_deck.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a PDF or PowerPoint presentation"
        )
    
    # Get existing profile
    profile = db.query(StartupProfile).filter(StartupProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Startup profile not found"
        )
    
    # Create uploads directory if it doesn't exist
    upload_dir = "uploads/pitch_decks"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Remove old file if it exists
    if profile.pitch_deck_file_path and os.path.exists(profile.pitch_deck_file_path):
        try:
            os.remove(profile.pitch_deck_file_path)
        except Exception as e:
            print(f"Warning: Could not remove old pitch deck file: {e}")
    
    # Save new file with original name
    filename = pitch_deck.filename
    file_path = os.path.join(upload_dir, filename)
    
    try:
        # Read file content in chunks to avoid memory issues
        with open(file_path, "wb") as buffer:
            content = await pitch_deck.read()
            buffer.write(content)
        
        # Update profile with new pitch deck info
        profile.pitch_deck_filename = filename
        profile.pitch_deck_file_path = f"uploads/pitch_decks/{filename}"
        profile.pitch_deck_file_size = os.path.getsize(file_path)
        profile.pitch_deck_content_type = pitch_deck.content_type
        db.commit()
        
        return {"message": "Pitch deck updated successfully", "filename": filename}
    except Exception as e:
        # Clean up file if it was created
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except:
                pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update pitch deck: {str(e)}"
        )

@router.put("/{user_id}", response_model=StartupProfileSchema)
def update_startup_profile(
    user_id: int,
    profile_data: StartupProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update startup profile"""
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only update your own profile"
        )
    
    profile = db.query(StartupProfile).options(
        joinedload(StartupProfile.founders),
        joinedload(StartupProfile.revenue_metrics),
        joinedload(StartupProfile.fund_usage)
    ).filter(StartupProfile.user_id == user_id).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Startup profile not found"
        )
    
    # Update basic fields (only if provided)
    profile_dict = profile_data.dict(exclude_unset=True)
    basic_fields = [
        'company_name', 'website_link', 'industry', 'company_description',
        'founding_date', 'team_size', 'district', 'state', 'social_media_1',
        'social_media_2', 'business_model_description', 'total_paying_customers',
        'monthly_customer_growth_rate', 'customer_acquisition_cost',
        'customer_lifetime_value', 'competitive_advantage', 'product_demo_video_link',
        'pre_money_valuation', 'amount_seeking', 'investment_type',
        'max_equity_percentage', 'funding_stage', 'total_funding_raised',
        'last_round_amount', 'last_round_date', 'key_previous_investors'
    ]
    
    for field in basic_fields:
        if field in profile_dict and profile_dict[field] is not None:
            setattr(profile, field, profile_dict[field])
    
    # Handle founders (only if provided)
    if 'founders' in profile_dict and profile_dict['founders'] is not None:
        # Remove existing founders
        db.query(Founder).filter(Founder.startup_profile_id == profile.id).delete()
        
        # Add new founders
        for founder_data in profile_dict['founders']:
            founder = Founder(
                startup_profile_id=profile.id,
                **founder_data
            )
            db.add(founder)
    
    # Handle revenue metrics (only if provided)
    if 'revenue_metrics' in profile_dict and profile_dict['revenue_metrics'] is not None:
        if profile.revenue_metrics:
            # Update existing revenue metrics
            for field, value in profile_dict['revenue_metrics'].items():
                if value is not None:
                    setattr(profile.revenue_metrics, field, value)
        else:
            # Create new revenue metrics
            revenue_metrics = StartupRevenueMetrics(
                startup_profile_id=profile.id,
                **profile_dict['revenue_metrics']
            )
            db.add(revenue_metrics)
    
    # Handle fund usage (only if provided)
    if 'fund_usage' in profile_dict and profile_dict['fund_usage'] is not None:
        if profile.fund_usage:
            # Update existing fund usage
            for field, value in profile_dict['fund_usage'].items():
                if value is not None:
                    setattr(profile.fund_usage, field, value)
        else:
            # Create new fund usage
            fund_usage = FundUsage(
                startup_profile_id=profile.id,
                **profile_dict['fund_usage']
            )
            db.add(fund_usage)
    
    db.commit()
    db.refresh(profile)
    
    # Return properly serialized response
    try:
        # Create a response dict that matches the schema exactly
        response_data = {
            "id": profile.id,
            "user_id": profile.user_id,
            "company_name": profile.company_name,
            "website_link": profile.website_link,
            "industry": profile.industry,
            "company_description": profile.company_description,
            "founding_date": profile.founding_date,
            "team_size": profile.team_size,
            "district": profile.district,
            "state": profile.state,
            "social_media_1": profile.social_media_1,
            "social_media_2": profile.social_media_2,
            "business_model_description": profile.business_model_description,
            "total_paying_customers": profile.total_paying_customers,
            "monthly_customer_growth_rate": profile.monthly_customer_growth_rate,
            "customer_acquisition_cost": profile.customer_acquisition_cost,
            "customer_lifetime_value": profile.customer_lifetime_value,
            "competitive_advantage": profile.competitive_advantage,
            "product_demo_video_link": profile.product_demo_video_link,
            "pre_money_valuation": profile.pre_money_valuation,
            "amount_seeking": profile.amount_seeking,
            "investment_type": profile.investment_type,
            "max_equity_percentage": profile.max_equity_percentage,
            "funding_stage": profile.funding_stage,
            "total_funding_raised": profile.total_funding_raised,
            "last_round_amount": profile.last_round_amount,
            "last_round_date": profile.last_round_date,
            "key_previous_investors": profile.key_previous_investors,
            "pitch_deck_filename": profile.pitch_deck_filename,
            "pitch_deck_file_path": profile.pitch_deck_file_path,
            "pitch_deck_file_size": profile.pitch_deck_file_size,
            "pitch_deck_content_type": profile.pitch_deck_content_type,
            "created_at": profile.created_at,
            "updated_at": profile.updated_at,
            "founders": [
                {
                    "id": founder.id,
                    "startup_profile_id": founder.startup_profile_id,
                    "name": founder.name,
                    "educational_qualification": founder.educational_qualification,
                    "previous_work_experience": founder.previous_work_experience,
                    "linkedin_profile": founder.linkedin_profile,
                    "photo_url": founder.photo_url
                } for founder in profile.founders
            ],
            "revenue_metrics": {
                "id": profile.revenue_metrics.id,
                "startup_profile_id": profile.revenue_metrics.startup_profile_id,
                "monthly_recurring_revenue": profile.revenue_metrics.monthly_recurring_revenue,
                "annual_recurring_revenue": profile.revenue_metrics.annual_recurring_revenue,
                "revenue_growth_rate": profile.revenue_metrics.revenue_growth_rate,
                "monthly_burn_rate": profile.revenue_metrics.monthly_burn_rate,
                "current_cash_runway": profile.revenue_metrics.current_cash_runway,
                "projected_revenue_12_months": profile.revenue_metrics.projected_revenue_12_months,
                "profitability_timeline": profile.revenue_metrics.profitability_timeline,
                "investment_timeline": profile.revenue_metrics.investment_timeline
            } if profile.revenue_metrics else None,
            "fund_usage": {
                "id": profile.fund_usage.id,
                "startup_profile_id": profile.fund_usage.startup_profile_id,
                "product_development_percentage": profile.fund_usage.product_development_percentage,
                "marketing_percentage": profile.fund_usage.marketing_percentage,
                "team_expansion_percentage": profile.fund_usage.team_expansion_percentage,
                "operations_percentage": profile.fund_usage.operations_percentage
            } if profile.fund_usage else None
        }
        
        return response_data
        
    except Exception as e:
        print(f"Error serializing startup profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to serialize profile response"
        )

@router.post("/upload-pitch-deck")
async def upload_pitch_deck(
    pitch_deck: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload startup pitch deck"""
    if current_user.role != "startup":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only startups can upload pitch decks"
        )
    
    # Validate file type
    allowed_types = ['application/pdf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.ms-powerpoint']
    if pitch_deck.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a PDF or PowerPoint presentation"
        )
    
    # Create uploads directory if it doesn't exist
    upload_dir = "uploads/pitch_decks"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Save file with original name
    filename = pitch_deck.filename
    file_path = os.path.join(upload_dir, filename)
    
    try:
        # Read file content in chunks to avoid memory issues
        with open(file_path, "wb") as buffer:
            content = await pitch_deck.read()
            buffer.write(content)
        
        # Update profile with pitch deck info
        profile = db.query(StartupProfile).filter(StartupProfile.user_id == current_user.id).first()
        if profile:
            profile.pitch_deck_filename = filename
            profile.pitch_deck_file_path = f"uploads/pitch_decks/{filename}"
            profile.pitch_deck_file_size = os.path.getsize(file_path)
            profile.pitch_deck_content_type = pitch_deck.content_type
            db.commit()
        
        return {"message": "Pitch deck uploaded successfully", "filename": filename}
    except Exception as e:
        # Clean up file if it was created
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except:
                pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload pitch deck: {str(e)}"
        )

@router.get("/download-pitch-deck/{user_id}")
def download_pitch_deck(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download startup pitch deck by user ID"""
    profile = db.query(StartupProfile).filter(StartupProfile.user_id == user_id).first()

    if not profile or not profile.pitch_deck_file_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pitch deck not found or no file path available"
        )

    # Check if user has permission to download this pitch deck
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only download your own pitch deck"
        )

    file_path = profile.pitch_deck_file_path
    
    # Resolve the file path properly using the same logic as application router
    if not file_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pitch deck file path not found"
        )
    
    # Get the project root directory (parent of backend directory)
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(backend_dir)
    
    # Resolve the file path properly
    if os.path.isabs(file_path):
        full_path = file_path
    else:
        # If it's a relative path, resolve it from the project root directory
        full_path = os.path.join(project_root, file_path)
    
    # Check if file exists
    if not os.path.exists(full_path):
        # Try alternative paths
        alternative_paths = [
            os.path.join(project_root, file_path),  # Project root + file_path
            os.path.join(project_root, "uploads", "pitch_decks", os.path.basename(file_path)),  # Project root + uploads/pitch_decks + filename
            os.path.join(backend_dir, "uploads", "pitch_decks", os.path.basename(file_path)),  # Backend + uploads/pitch_decks + filename
            os.path.join(backend_dir, "uploads", os.path.basename(file_path)),  # Backend + uploads + filename
            file_path  # Try original path as fallback
        ]
        
        for alt_path in alternative_paths:
            if os.path.exists(alt_path):
                full_path = alt_path
                break
        else:
            # File not found in any location
            print(f"File not found in any location:")
            print(f"  Original path: {file_path}")
            print(f"  Resolved path: {full_path}")
            print(f"  Project root: {project_root}")
            print(f"  Backend directory: {backend_dir}")
            print(f"  Alternative paths tried: {alternative_paths}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Pitch deck file not found: {os.path.basename(file_path)}"
            )
    
    # Get filename for download
    filename = profile.pitch_deck_filename or os.path.basename(full_path)
    
    # Determine the correct media type based on file extension
    file_extension = os.path.splitext(filename)[1].lower()
    media_type_map = {
        '.pdf': 'application/pdf',
        '.ppt': 'application/vnd.ms-powerpoint',
        '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    }
    media_type = media_type_map.get(file_extension, 'application/octet-stream')
    
    return FileResponse(
        path=full_path, 
        filename=filename,
        media_type=media_type
    )

@router.post("/create-with-files", response_model=StartupProfileSchema)
async def create_startup_profile_with_files(
    profile_data: str = Form(...),
    pitch_deck: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create startup profile with file uploads"""
    if current_user.role != "startup":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only startups can create startup profiles"
        )
    
    # Check if profile already exists
    existing_profile = db.query(StartupProfile).filter(StartupProfile.user_id == current_user.id).first()
    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile already exists for this user"
        )
    
    try:
        # Parse the profile data
        profile_dict = json.loads(profile_data)
        
        # Extract founders and related data
        founders_data = profile_dict.pop('founders', [])
        revenue_metrics_data = profile_dict.pop('revenue_metrics', {})
        fund_usage_data = profile_dict.pop('fund_usage', {})
        
        # Create profile without founders first
        new_profile = StartupProfile(
            user_id=current_user.id,
            **profile_dict
        )
        db.add(new_profile)
        db.commit()
        db.refresh(new_profile)
        
        # Now add founders
        from Models.Startup_profile_models import Founder
        for founder_data in founders_data:
            founder = Founder(
                startup_profile_id=new_profile.id,
                **founder_data
            )
            db.add(founder)
        
        # Add revenue metrics
        from Models.Startup_profile_models import StartupRevenueMetrics
        revenue_metrics = StartupRevenueMetrics(
            startup_profile_id=new_profile.id,
            **revenue_metrics_data
        )
        db.add(revenue_metrics)
        
        # Add fund usage
        from Models.Startup_profile_models import FundUsage
        fund_usage = FundUsage(
            startup_profile_id=new_profile.id,
            **fund_usage_data
        )
        db.add(fund_usage)
        
        # Handle pitch deck upload
        if pitch_deck:
            # Validate file type
            if not pitch_deck.content_type in ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid file type. Only PDF, PPT, and PPTX files are allowed."
                )
            
            # Create uploads directory if it doesn't exist
            upload_dir = "uploads/pitch_decks"
            os.makedirs(upload_dir, exist_ok=True)
            
            # Save file
            filename = f"{current_user.id}_{pitch_deck.filename}"
            file_path = os.path.join(upload_dir, filename)
            
            with open(file_path, "wb") as buffer:
                content = await pitch_deck.read()
                buffer.write(content)
            
            # Update profile with pitch deck info
            new_profile.pitch_deck_filename = pitch_deck.filename
            new_profile.pitch_deck_file_path = file_path
            new_profile.pitch_deck_file_size = pitch_deck.size
            new_profile.pitch_deck_content_type = pitch_deck.content_type
        
        db.commit()
        db.refresh(new_profile)
        
        # Return the profile with all related data
        profile_with_relations = db.query(StartupProfile).options(
            joinedload(StartupProfile.founders),
            joinedload(StartupProfile.revenue_metrics),
            joinedload(StartupProfile.fund_usage)
        ).filter(StartupProfile.id == new_profile.id).first()
        
        if not profile_with_relations:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to load created profile"
            )
        
        # Convert to dict and back to ensure proper serialization
        try:
            # Create a response dict that matches the schema exactly
            response_data = {
                "id": profile_with_relations.id,
                "user_id": profile_with_relations.user_id,
                "company_name": profile_with_relations.company_name,
                "website_link": profile_with_relations.website_link,
                "industry": profile_with_relations.industry,
                "company_description": profile_with_relations.company_description,
                "founding_date": profile_with_relations.founding_date,
                "team_size": profile_with_relations.team_size,
                "district": profile_with_relations.district,
                "state": profile_with_relations.state,
                "social_media_1": profile_with_relations.social_media_1,
                "social_media_2": profile_with_relations.social_media_2,
                "business_model_description": profile_with_relations.business_model_description,
                "total_paying_customers": profile_with_relations.total_paying_customers,
                "monthly_customer_growth_rate": profile_with_relations.monthly_customer_growth_rate,
                "customer_acquisition_cost": profile_with_relations.customer_acquisition_cost,
                "customer_lifetime_value": profile_with_relations.customer_lifetime_value,
                "competitive_advantage": profile_with_relations.competitive_advantage,
                "product_demo_video_link": profile_with_relations.product_demo_video_link,
                "pre_money_valuation": profile_with_relations.pre_money_valuation,
                "amount_seeking": profile_with_relations.amount_seeking,
                "investment_type": profile_with_relations.investment_type,
                "max_equity_percentage": profile_with_relations.max_equity_percentage,
                "funding_stage": profile_with_relations.funding_stage,
                "total_funding_raised": profile_with_relations.total_funding_raised,
                "last_round_amount": profile_with_relations.last_round_amount,
                "last_round_date": profile_with_relations.last_round_date,
                "key_previous_investors": profile_with_relations.key_previous_investors,
                "pitch_deck_filename": profile_with_relations.pitch_deck_filename,
                "pitch_deck_file_path": profile_with_relations.pitch_deck_file_path,
                "pitch_deck_file_size": profile_with_relations.pitch_deck_file_size,
                "pitch_deck_content_type": profile_with_relations.pitch_deck_content_type,
                "created_at": profile_with_relations.created_at,
                "updated_at": profile_with_relations.updated_at,
                "founders": [
                    {
                        "id": founder.id,
                        "startup_profile_id": founder.startup_profile_id,
                        "name": founder.name,
                        "educational_qualification": founder.educational_qualification,
                        "previous_work_experience": founder.previous_work_experience,
                        "linkedin_profile": founder.linkedin_profile,
                        "photo_url": founder.photo_url
                    } for founder in profile_with_relations.founders
                ],
                "revenue_metrics": {
                    "id": profile_with_relations.revenue_metrics.id,
                    "startup_profile_id": profile_with_relations.revenue_metrics.startup_profile_id,
                    "monthly_recurring_revenue": profile_with_relations.revenue_metrics.monthly_recurring_revenue,
                    "annual_recurring_revenue": profile_with_relations.revenue_metrics.annual_recurring_revenue,
                    "revenue_growth_rate": profile_with_relations.revenue_metrics.revenue_growth_rate,
                    "monthly_burn_rate": profile_with_relations.revenue_metrics.monthly_burn_rate,
                    "current_cash_runway": profile_with_relations.revenue_metrics.current_cash_runway,
                    "projected_revenue_12_months": profile_with_relations.revenue_metrics.projected_revenue_12_months,
                    "profitability_timeline": profile_with_relations.revenue_metrics.profitability_timeline,
                    "investment_timeline": profile_with_relations.revenue_metrics.investment_timeline
                } if profile_with_relations.revenue_metrics else None,
                "fund_usage": {
                    "id": profile_with_relations.fund_usage.id,
                    "startup_profile_id": profile_with_relations.fund_usage.startup_profile_id,
                    "product_development_percentage": profile_with_relations.fund_usage.product_development_percentage,
                    "marketing_percentage": profile_with_relations.fund_usage.marketing_percentage,
                    "team_expansion_percentage": profile_with_relations.fund_usage.team_expansion_percentage,
                    "operations_percentage": profile_with_relations.fund_usage.operations_percentage
                } if profile_with_relations.fund_usage else None
            }
            
            return response_data
            
        except Exception as e:
            print(f"Error serializing profile: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to serialize profile response"
            )
            
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON data"
        )
    except Exception as e:
        print(f"Error creating profile with files: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create profile"
        )
