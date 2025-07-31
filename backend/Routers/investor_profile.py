from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from Database.db import get_db
from Models.Auth_models import User
from Models.Investor_profile_models import InvestorProfile
from schemas.investor_profile_schemas import InvestorProfileCreate, InvestorProfile as InvestorProfileSchema
from utils import get_current_user
import os
import shutil
from typing import List
import json
import re

router = APIRouter()

@router.post("/", response_model=InvestorProfileSchema)
def create_investor_profile(
    profile_data: InvestorProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create investor profile"""
    if current_user.role != "investor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only investors can create investor profiles"
        )
    
    # Check if profile already exists
    existing_profile = db.query(InvestorProfile).filter(InvestorProfile.user_id == current_user.id).first()
    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile already exists for this user"
        )
    
    # Convert array fields to JSON strings
    profile_dict = profile_data.dict()
    array_fields = ['professional_background', 'investment_stages', 'geographic_focus', 'industry_focus', 'areas_of_expertise']
    
    for field in array_fields:
        if field in profile_dict and isinstance(profile_dict[field], list):
            profile_dict[field] = json.dumps(profile_dict[field])
    
    # Create profile
    new_profile = InvestorProfile(
        user_id=current_user.id,
        **profile_dict
    )
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    
    # Return the profile with proper serialization
    try:
        # Create a response dict that matches the schema exactly
        response_data = {
            "id": new_profile.id,
            "user_id": new_profile.user_id,
            "full_name": new_profile.full_name,
            "email": new_profile.email,
            "phone_number": new_profile.phone_number,
            "country": new_profile.country,
            "state": new_profile.state,
            "district": new_profile.district,
            "linkedin_profile": new_profile.linkedin_profile,
            "investor_type": new_profile.investor_type,
            "firm_name": new_profile.firm_name,
            "investment_experience": new_profile.investment_experience,
            "years_of_investment_experience": new_profile.years_of_investment_experience,
            "professional_background": json.loads(new_profile.professional_background) if new_profile.professional_background else [],
            "previous_experience": new_profile.previous_experience,
            "investment_stages": json.loads(new_profile.investment_stages) if new_profile.investment_stages else [],
            "check_size_range": new_profile.check_size_range,
            "geographic_focus": json.loads(new_profile.geographic_focus) if new_profile.geographic_focus else [],
            "industry_focus": json.loads(new_profile.industry_focus) if new_profile.industry_focus else [],
            "investment_philosophy": new_profile.investment_philosophy,
            "decision_timeline": new_profile.decision_timeline,
            "number_of_portfolio_companies": new_profile.number_of_portfolio_companies,
            "notable_investments": new_profile.notable_investments,
            "successful_exits": new_profile.successful_exits,
            "post_investment_involvement": new_profile.post_investment_involvement,
            "areas_of_expertise": json.loads(new_profile.areas_of_expertise) if new_profile.areas_of_expertise else [],
            "investment_thesis": new_profile.investment_thesis,
            "additional_info": new_profile.additional_info,
            "profile_visibility": new_profile.profile_visibility,
            "contact_permissions": new_profile.contact_permissions,
            "profile_photo_filename": new_profile.profile_photo_filename,
            "profile_photo_file_path": new_profile.profile_photo_file_path,
            "profile_photo_file_size": new_profile.profile_photo_file_size,
            "profile_photo_content_type": new_profile.profile_photo_content_type,
            "created_at": new_profile.created_at,
            "updated_at": new_profile.updated_at
        }
        
        return response_data
        
    except Exception as e:
        print(f"Error serializing investor profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to serialize profile response"
        )

@router.get("/all", response_model=List[InvestorProfileSchema])
def get_all_investor_profiles(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all investor profiles"""
    profiles = db.query(InvestorProfile).all()
    
    # Return the profiles with proper serialization
    try:
        response_data = []
        for profile in profiles:
            profile_data = {
                "id": profile.id,
                "user_id": profile.user_id,
                "full_name": profile.full_name,
                "email": profile.email,
                "phone_number": profile.phone_number,
                "country": profile.country,
                "state": profile.state,
                "district": profile.district,
                "linkedin_profile": profile.linkedin_profile,
                "investor_type": profile.investor_type,
                "firm_name": profile.firm_name,
                "investment_experience": profile.investment_experience,
                "years_of_investment_experience": profile.years_of_investment_experience,
                "professional_background": json.loads(profile.professional_background) if profile.professional_background else [],
                "previous_experience": profile.previous_experience,
                "investment_stages": json.loads(profile.investment_stages) if profile.investment_stages else [],
                "check_size_range": profile.check_size_range,
                "geographic_focus": json.loads(profile.geographic_focus) if profile.geographic_focus else [],
                "industry_focus": json.loads(profile.industry_focus) if profile.industry_focus else [],
                "investment_philosophy": profile.investment_philosophy,
                "decision_timeline": profile.decision_timeline,
                "number_of_portfolio_companies": profile.number_of_portfolio_companies,
                "notable_investments": profile.notable_investments,
                "successful_exits": profile.successful_exits,
                "post_investment_involvement": profile.post_investment_involvement,
                "areas_of_expertise": json.loads(profile.areas_of_expertise) if profile.areas_of_expertise else [],
                "investment_thesis": profile.investment_thesis,
                "additional_info": profile.additional_info,
                "profile_visibility": profile.profile_visibility,
                "contact_permissions": profile.contact_permissions,
                "profile_photo_filename": profile.profile_photo_filename,
                "profile_photo_file_path": profile.profile_photo_file_path,
                "profile_photo_file_size": profile.profile_photo_file_size,
                "profile_photo_content_type": profile.profile_photo_content_type,
                "created_at": profile.created_at,
                "updated_at": profile.updated_at
            }
            response_data.append(profile_data)
        
        return response_data
        
    except Exception as e:
        print(f"Error serializing investor profiles: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to serialize profiles response"
        )

@router.get("/{user_id}", response_model=InvestorProfileSchema)
def get_investor_profile(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get investor profile by user ID"""
    profile = db.query(InvestorProfile).filter(InvestorProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Investor profile not found"
        )
    
    # Return the profile with proper serialization
    try:
        # Create a response dict that matches the schema exactly
        response_data = {
            "id": profile.id,
            "user_id": profile.user_id,
            "full_name": profile.full_name,
            "email": profile.email,
            "phone_number": profile.phone_number,
            "country": profile.country,
            "state": profile.state,
            "district": profile.district,
            "linkedin_profile": profile.linkedin_profile,
            "investor_type": profile.investor_type,
            "firm_name": profile.firm_name,
            "investment_experience": profile.investment_experience,
            "years_of_investment_experience": profile.years_of_investment_experience,
            "professional_background": json.loads(profile.professional_background) if profile.professional_background else [],
            "previous_experience": profile.previous_experience,
            "investment_stages": json.loads(profile.investment_stages) if profile.investment_stages else [],
            "check_size_range": profile.check_size_range,
            "geographic_focus": json.loads(profile.geographic_focus) if profile.geographic_focus else [],
            "industry_focus": json.loads(profile.industry_focus) if profile.industry_focus else [],
            "investment_philosophy": profile.investment_philosophy,
            "decision_timeline": profile.decision_timeline,
            "number_of_portfolio_companies": profile.number_of_portfolio_companies,
            "notable_investments": profile.notable_investments,
            "successful_exits": profile.successful_exits,
            "post_investment_involvement": profile.post_investment_involvement,
            "areas_of_expertise": json.loads(profile.areas_of_expertise) if profile.areas_of_expertise else [],
            "investment_thesis": profile.investment_thesis,
            "additional_info": profile.additional_info,
            "profile_visibility": profile.profile_visibility,
            "contact_permissions": profile.contact_permissions,
            "profile_photo_filename": profile.profile_photo_filename,
            "profile_photo_file_path": profile.profile_photo_file_path,
            "profile_photo_file_size": profile.profile_photo_file_size,
            "profile_photo_content_type": profile.profile_photo_content_type,
            "created_at": profile.created_at,
            "updated_at": profile.updated_at
        }
        
        return response_data
        
    except Exception as e:
        print(f"Error serializing investor profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to serialize profile response"
        )

@router.get("/user/{user_id}", response_model=InvestorProfileSchema)
def get_investor_profile_by_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get investor profile by user ID (for profile editing)"""
    # Check if user is requesting their own profile
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only view your own profile"
        )
    
    profile = db.query(InvestorProfile).filter(InvestorProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Investor profile not found"
        )
    
    # Convert to dict and back to ensure proper serialization
    try:
        # Helper function to safely parse JSON strings
        def safe_json_loads(json_str, field_name):
            if not json_str:
                return []
            try:
                return json.loads(json_str)
            except json.JSONDecodeError as e:
                print(f"Error parsing {field_name}: {json_str}, Error: {e}")
                # Try to fix common issues
                try:
                    # Handle single quotes and unquoted strings
                    fixed_str = json_str.replace("'", '"')
                    # Handle unquoted strings in arrays
                    import re
                    fixed_str = re.sub(r'([a-zA-Z\s]+)', r'"\1"', fixed_str)
                    return json.loads(fixed_str)
                except:
                    print(f"Failed to fix {field_name}, returning empty list")
                    return []
        
        # Create a response dict that matches the schema exactly
        response_data = {
            "id": profile.id,
            "user_id": profile.user_id,
            "full_name": profile.full_name,
            "email": profile.email,
            "phone_number": profile.phone_number,
            "country": profile.country,
            "state": profile.state,
            "district": profile.district,
            "linkedin_profile": profile.linkedin_profile,
            "investor_type": profile.investor_type,
            "firm_name": profile.firm_name,
            "investment_experience": profile.investment_experience,
            "years_of_investment_experience": profile.years_of_investment_experience,
            "professional_background": safe_json_loads(profile.professional_background, "professional_background"),
            "previous_experience": profile.previous_experience,
            "investment_stages": safe_json_loads(profile.investment_stages, "investment_stages"),
            "check_size_range": profile.check_size_range,
            "geographic_focus": safe_json_loads(profile.geographic_focus, "geographic_focus"),
            "industry_focus": safe_json_loads(profile.industry_focus, "industry_focus"),
            "investment_philosophy": profile.investment_philosophy,
            "decision_timeline": profile.decision_timeline,
            "number_of_portfolio_companies": profile.number_of_portfolio_companies,
            "notable_investments": profile.notable_investments,
            "successful_exits": profile.successful_exits,
            "post_investment_involvement": profile.post_investment_involvement,
            "areas_of_expertise": safe_json_loads(profile.areas_of_expertise, "areas_of_expertise"),
            "investment_thesis": profile.investment_thesis,
            "additional_info": profile.additional_info,
            "profile_visibility": profile.profile_visibility,
            "contact_permissions": profile.contact_permissions,
            "profile_photo_filename": profile.profile_photo_filename,
            "profile_photo_file_path": profile.profile_photo_file_path,
            "profile_photo_file_size": profile.profile_photo_file_size,
            "profile_photo_content_type": profile.profile_photo_content_type,
            "created_at": profile.created_at,
            "updated_at": profile.updated_at
        }
        
        return response_data
        
    except Exception as e:
        print(f"Error serializing investor profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to serialize profile response"
        )

@router.put("/{user_id}", response_model=InvestorProfileSchema)
def update_investor_profile(
    user_id: int,
    profile_data: InvestorProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update investor profile"""
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only update your own profile"
        )
    
    profile = db.query(InvestorProfile).filter(InvestorProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Investor profile not found"
        )
    
    # Convert array fields to JSON strings before updating
    profile_dict = profile_data.dict()
    array_fields = ['professional_background', 'investment_stages', 'geographic_focus', 'industry_focus', 'areas_of_expertise']
    
    for field in array_fields:
        if field in profile_dict and isinstance(profile_dict[field], list):
            profile_dict[field] = json.dumps(profile_dict[field])
    
    # Update profile fields
    for field, value in profile_dict.items():
        setattr(profile, field, value)
    
    db.commit()
    db.refresh(profile)
    
    # Return the profile with proper serialization
    try:
        # Create a response dict that matches the schema exactly
        response_data = {
            "id": profile.id,
            "user_id": profile.user_id,
            "full_name": profile.full_name,
            "email": profile.email,
            "phone_number": profile.phone_number,
            "country": profile.country,
            "state": profile.state,
            "district": profile.district,
            "linkedin_profile": profile.linkedin_profile,
            "investor_type": profile.investor_type,
            "firm_name": profile.firm_name,
            "investment_experience": profile.investment_experience,
            "years_of_investment_experience": profile.years_of_investment_experience,
            "professional_background": json.loads(profile.professional_background) if profile.professional_background else [],
            "previous_experience": profile.previous_experience,
            "investment_stages": json.loads(profile.investment_stages) if profile.investment_stages else [],
            "check_size_range": profile.check_size_range,
            "geographic_focus": json.loads(profile.geographic_focus) if profile.geographic_focus else [],
            "industry_focus": json.loads(profile.industry_focus) if profile.industry_focus else [],
            "investment_philosophy": profile.investment_philosophy,
            "decision_timeline": profile.decision_timeline,
            "number_of_portfolio_companies": profile.number_of_portfolio_companies,
            "notable_investments": profile.notable_investments,
            "successful_exits": profile.successful_exits,
            "post_investment_involvement": profile.post_investment_involvement,
            "areas_of_expertise": json.loads(profile.areas_of_expertise) if profile.areas_of_expertise else [],
            "investment_thesis": profile.investment_thesis,
            "additional_info": profile.additional_info,
            "profile_visibility": profile.profile_visibility,
            "contact_permissions": profile.contact_permissions,
            "profile_photo_filename": profile.profile_photo_filename,
            "profile_photo_file_path": profile.profile_photo_file_path,
            "profile_photo_file_size": profile.profile_photo_file_size,
            "profile_photo_content_type": profile.profile_photo_content_type,
            "created_at": profile.created_at,
            "updated_at": profile.updated_at
        }
        
        return response_data
        
    except Exception as e:
        print(f"Error serializing investor profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to serialize profile response"
        )

@router.post("/upload-photo")
async def upload_profile_photo(
    photo: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload investor profile photo"""
    if current_user.role != "investor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only investors can upload profile photos"
        )
    
    # Validate file type
    if not photo.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    # Create uploads directory if it doesn't exist
    upload_dir = "uploads/profile_photos"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Save file
    filename = f"{current_user.id}.{photo.filename.split('.')[-1]}"
    file_path = os.path.join(upload_dir, filename)
    
    try:
        with open(file_path, "wb") as buffer:
            content = await photo.read()
            buffer.write(content)
        
        # Update profile with photo info
        profile = db.query(InvestorProfile).filter(InvestorProfile.user_id == current_user.id).first()
        if profile:
            profile.profile_photo_filename = filename
            profile.profile_photo_file_path = f"/uploads/profile_photos/{filename}"
            db.commit()
        
        return {"message": "Photo uploaded successfully", "filename": filename}
    except Exception as e:
        # Clean up file if it was created
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except:
                pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload photo: {str(e)}"
        ) 