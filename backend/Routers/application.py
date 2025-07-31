from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from Database.db import get_db
from Models.Auth_models import User
from Models.Application_models import Application, ApplicationLog, InterestStatus
from Models.Startup_profile_models import StartupProfile
from Models.Investor_profile_models import InvestorProfile
from schemas.application_schemas import ApplicationSchema, InterestStatusSchema, InterestStatusCreate, InterestStatusUpdate, SendPitchDeckRequest
from utils import get_current_user
from datetime import datetime
from typing import List
import os

router = APIRouter()

def validate_and_resolve_file_path(file_path: str, application_id: int) -> tuple:
    """
    Validate and resolve file path for pitch deck download
    Returns: (full_path, filename)
    """
    if not file_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pitch deck file path not found in application"
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
    filename = os.path.basename(full_path)
    
    return full_path, filename

@router.post("/send-pitch-deck", response_model=ApplicationSchema)
def send_pitch_deck(
    request: SendPitchDeckRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send pitch deck to investor"""
    try:
        print(f"Send pitch deck request - Current user: {current_user.id}, Role: {current_user.role}")
        print(f"Investor ID: {request.investor_id}")
        
        if current_user.role != "startup":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only startups can send pitch decks"
            )
        
        # Get startup profile
        startup_profile = db.query(StartupProfile).filter(StartupProfile.user_id == current_user.id).first()
        if not startup_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Startup profile not found"
            )
        
        print(f"Startup profile found: {startup_profile.company_name}")
        print(f"Pitch deck filename: {startup_profile.pitch_deck_filename}")
        
        # Get investor profile
        investor_profile = db.query(InvestorProfile).filter(InvestorProfile.user_id == request.investor_id).first()
        if not investor_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Investor profile not found"
            )
        
        print(f"Investor profile found: {investor_profile.full_name}")
        
        # Check if pitch deck already sent
        existing_application = db.query(Application).filter(
            Application.startup_id == current_user.id,
            Application.investor_id == request.investor_id
        ).first()
        
        if existing_application:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Pitch deck already sent to this investor"
            )
        
        # Create application
        new_application = Application(
            startup_id=current_user.id,
            investor_id=request.investor_id,
            pitch_deck_filename=startup_profile.pitch_deck_filename,
            pitch_deck_file_path=startup_profile.pitch_deck_file_path,
            status="sent"
        )
        db.add(new_application)
        db.commit()
        db.refresh(new_application)
        
        print(f"Pitch deck sent successfully! Application ID: {new_application.id}")
        return new_application
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in send_pitch_deck: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/startup/{startup_id}/sent-pitch-decks", response_model=List[ApplicationSchema])
def get_startup_applications(
    startup_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all pitch decks sent by startup"""
    try:
        if current_user.id != startup_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Can only view your own applications"
            )
        
        applications = db.query(Application).filter(Application.startup_id == startup_id).all()
        
        # Manually construct response to match schema
        response_data = []
        for app in applications:
            investor_profile = db.query(InvestorProfile).filter(InvestorProfile.user_id == app.investor_id).first()
            investor_name = investor_profile.full_name if investor_profile else None
            
            app_data = {
                "id": app.id,
                "startup_id": app.startup_id,
                "investor_id": app.investor_id,
                "pitch_deck_filename": app.pitch_deck_filename,
                "pitch_deck_file_path": app.pitch_deck_file_path,
                "status": app.status,
                "log": app.log,
                "sent_at": app.sent_at,
                "updated_at": app.updated_at,
                "startup_name": None,
                "investor_name": investor_name
            }
            response_data.append(app_data)
        
        return response_data
    except Exception as e:
        print(f"Error in get_startup_applications: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/investor/{investor_id}/received-pitch-decks", response_model=List[ApplicationSchema])
def get_investor_applications(
    investor_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all pitch decks received by investor"""
    try:
        if current_user.id != investor_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Can only view your own received pitch decks"
            )
        
        applications = db.query(Application).filter(Application.investor_id == investor_id).all()
        
        # Manually construct response to match schema
        response_data = []
        for app in applications:
            startup_profile = db.query(StartupProfile).filter(StartupProfile.user_id == app.startup_id).first()
            startup_name = startup_profile.company_name if startup_profile else None
            
            app_data = {
                "id": app.id,
                "startup_id": app.startup_id,
                "investor_id": app.investor_id,
                "pitch_deck_filename": app.pitch_deck_filename,
                "pitch_deck_file_path": app.pitch_deck_file_path,
                "status": app.status,
                "log": app.log,
                "sent_at": app.sent_at,
                "updated_at": app.updated_at,
                "startup_name": startup_name,
                "investor_name": None
            }
            response_data.append(app_data)
        
        return response_data
    except Exception as e:
        print(f"Error in get_investor_applications: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.post("/update-interest", response_model=InterestStatusSchema)
def update_interest_status(
    interest_data: InterestStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update investor interest in startup"""
    try:
        print(f"Update interest status - Current user: {current_user.id}, Role: {current_user.role}")
        print(f"Startup ID: {interest_data.startup_id}, Status: {interest_data.status}")
        
        if current_user.role != "investor":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only investors can update interest status"
            )
        
        # Validate startup exists
        startup_user = db.query(User).filter(User.id == interest_data.startup_id).first()
        if not startup_user or startup_user.role != "startup":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Startup not found"
            )
        
        # Check if interest status already exists
        existing_interest = db.query(InterestStatus).filter(
            InterestStatus.startup_id == interest_data.startup_id,
            InterestStatus.investor_id == current_user.id
        ).first()
        
        if existing_interest:
            print(f"Updating existing interest status: {existing_interest.id}")
            # Update existing interest
            existing_interest.status = interest_data.status
            db.commit()
            db.refresh(existing_interest)
            return existing_interest
        else:
            print(f"Creating new interest status")
            # Create new interest status
            new_interest = InterestStatus(
                startup_id=interest_data.startup_id,
                investor_id=current_user.id,
                status=interest_data.status
            )
            db.add(new_interest)
            db.commit()
            db.refresh(new_interest)
            print(f"New interest status created: {new_interest.id}")
            return new_interest
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in update_interest_status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/interest-status/investor/{investor_id}", response_model=List[InterestStatusSchema])
def get_investor_interest_status(
    investor_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all interest statuses set by investor"""
    try:
        print(f"Getting interest statuses for investor {investor_id}, current user: {current_user.id}")
        
        if current_user.id != investor_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Can only view your own interest statuses"
            )
        
        interest_statuses = db.query(InterestStatus).filter(InterestStatus.investor_id == investor_id).all()
        print(f"Found {len(interest_statuses)} interest statuses")
        
        # Manually construct response to match schema
        response_data = []
        for status in interest_statuses:
            startup_profile = db.query(StartupProfile).filter(StartupProfile.user_id == status.startup_id).first()
            startup_name = startup_profile.company_name if startup_profile else None
            
            status_data = {
                "id": status.id,
                "startup_id": status.startup_id,
                "investor_id": status.investor_id,
                "status": status.status,
                "created_at": status.created_at,
                "startup_name": startup_name,
                "investor_name": None
            }
            response_data.append(status_data)
        
        print(f"Returning {len(response_data)} interest statuses")
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_investor_interest_status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/interest-status/startup/{startup_id}", response_model=List[InterestStatusSchema])
def get_startup_interest_status(
    startup_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all interest statuses from investors for startup"""
    if current_user.id != startup_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only view your own interest statuses"
        )
    
    interest_statuses = db.query(InterestStatus).filter(InterestStatus.startup_id == startup_id).all()
    
    # Manually construct response to include investor names
    response_data = []
    for status in interest_statuses:
        investor_profile = db.query(InvestorProfile).filter(InvestorProfile.user_id == status.investor_id).first()
        investor_name = investor_profile.full_name if investor_profile else None
        
        status_data = {
            "id": status.id,
            "startup_id": status.startup_id,
            "investor_id": status.investor_id,
            "status": status.status,
            "created_at": status.created_at,
            "investor_name": investor_name
        }
        response_data.append(status_data)
    
    return response_data 

@router.get("/download-pitch-deck/{application_id}")
def download_pitch_deck(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download pitch deck from application"""
    try:
        # Get the application
        application = db.query(Application).filter(Application.id == application_id).first()
        
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        # Check if user has permission to download this pitch deck
        if current_user.role == "investor" and application.investor_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only download pitch decks sent to you"
            )
        
        if current_user.role == "startup" and application.startup_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only download your own pitch decks"
            )
        
        # Get the file path
        file_path = application.pitch_deck_file_path
        
        if not file_path:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pitch deck file path not found"
            )
        
        # Resolve the file path properly
        full_path, filename = validate_and_resolve_file_path(file_path, application_id)
        
        print(f"Serving file: {full_path}")
        print(f"Filename: {filename}")
        
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
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in download_pitch_deck: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        ) 

@router.get("/debug/pitch-deck-file/{application_id}")
def debug_pitch_deck_file(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Debug endpoint to check pitch deck file existence"""
    try:
        application = db.query(Application).filter(Application.id == application_id).first()
        
        if not application:
            return {
                "error": "Application not found",
                "application_id": application_id
            }
        
        file_path = application.pitch_deck_file_path
        filename = application.pitch_deck_filename
        
        # Get the project root directory (parent of backend directory)
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(backend_dir)
        
        # Try different path resolutions
        paths_to_check = []
        if file_path:
            if os.path.isabs(file_path):
                paths_to_check.append(file_path)
            else:
                paths_to_check.extend([
                    os.path.join(project_root, file_path),  # Project root + file_path
                    os.path.join(project_root, "uploads", "pitch_decks", os.path.basename(file_path)),  # Project root + uploads/pitch_decks + filename
                    os.path.join(backend_dir, "uploads", "pitch_decks", os.path.basename(file_path)),  # Backend + uploads/pitch_decks + filename
                    os.path.join(backend_dir, "uploads", os.path.basename(file_path)),  # Backend + uploads + filename
                    file_path  # Try original path as fallback
                ])
        
        # Check each path
        file_exists = False
        existing_path = None
        for path in paths_to_check:
            if os.path.exists(path):
                file_exists = True
                existing_path = path
                break
        
        return {
            "application_id": application_id,
            "original_file_path": file_path,
            "original_filename": filename,
            "project_root": project_root,
            "backend_directory": backend_dir,
            "file_exists": file_exists,
            "existing_path": existing_path,
            "paths_checked": paths_to_check,
            "file_size": os.path.getsize(existing_path) if existing_path else None
        }
        
    except Exception as e:
        return {
            "error": str(e),
            "application_id": application_id
        } 