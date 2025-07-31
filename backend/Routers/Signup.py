from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from Database.db import get_db
from Models.Auth_models import User, OTP
from schemas.Auth_Schema import OTPRequest, OTPVerify, OTPVerifyAndSignup, UserLogin, LoginResponse, UserResponse, OTPResponse
from utils import generate_otp, send_otp_email, create_access_token, get_current_user
import bcrypt
from datetime import datetime, timedelta

router = APIRouter()

@router.post("/send-otp", response_model=OTPResponse)
def send_otp(request: OTPRequest, db: Session = Depends(get_db)):
    """Send OTP to user's email"""
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == request.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        
        # Generate OTP
        otp = generate_otp()
        
        # Delete any existing OTP for this email
        try:
            db.query(OTP).filter(OTP.email == request.email).delete()
            db.commit()
        except Exception as e:
            print(f"Warning: Could not delete existing OTP: {e}")
            db.rollback()
        
        # Create new OTP
        try:
            otp_record = OTP(
                email=request.email,
                otp=otp,
                expires_at=datetime.utcnow() + timedelta(seconds=120)
            )
            db.add(otp_record)
            db.commit()
            db.refresh(otp_record)
        except Exception as e:
            print(f"Error creating OTP record: {e}")
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create OTP record"
            )
        
        # Send email
        email_sent = send_otp_email(request.email, otp)
        
        if email_sent:
            return {"message": "OTP sent successfully", "email": request.email}
        else:
            # If email fails, still return success but log the issue
            print(f"⚠️ Email failed to send to {request.email}, but OTP was generated")
            return {
                "message": "OTP generated successfully", 
                "email": request.email,
                "warning": "Email delivery may have failed. Please check your email or try again."
            }
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in send_otp: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send OTP"
        )

@router.post("/verify-otp-and-signup", response_model=LoginResponse)
def verify_otp_and_signup(request: OTPVerifyAndSignup, db: Session = Depends(get_db)):
    
    try:
        # Verify OTP
        otp_record = db.query(OTP).filter(
            OTP.email == request.email,
            OTP.otp == request.otp,
            OTP.expires_at > datetime.utcnow()
        ).first()
        
        if not otp_record:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired OTP"
            )
        
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == request.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        
        # Hash password
        hashed_password = bcrypt.hashpw(request.password.encode('utf-8'), bcrypt.gensalt())
        
        # Create user
        new_user = User(
            email=request.email,
            password=hashed_password.decode('utf-8'),
            role=request.role,
            is_verified=True,
            profile_completed=False
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Delete OTP record
        db.delete(otp_record)
        db.commit()
        
        # Create access token with user_id
        access_token = create_access_token(
            data={"sub": str(new_user.id), "email": new_user.email, "role": new_user.role}
        )
        
        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            user_id=new_user.id,
            role=new_user.role,
            email=new_user.email
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in verify_otp_and_signup: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create account"
        )

@router.post("/login", response_model=LoginResponse)
def login(request: UserLogin, db: Session = Depends(get_db)):
    """Login user and return JWT token"""
    try:
        # Find user
        user = db.query(User).filter(User.email == request.email).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Verify password
        if not bcrypt.checkpw(request.password.encode('utf-8'), user.password.encode('utf-8')):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Create access token with user_id and role
        access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email, "role": user.role}
        )
        
        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            user_id=user.id,
            role=user.role,
            email=user.email
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )



@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user

