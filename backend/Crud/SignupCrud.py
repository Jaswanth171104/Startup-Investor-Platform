from sqlalchemy.orm import Session
from backend.schemas.Auth_Schema import UserCreate, VerifyOTPAndCreateUser
from backend.Models.Auth_models import User, OTP
from fastapi import HTTPException, status
import bcrypt
from datetime import datetime, timedelta

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

def check_if_email_exists(db: Session, email: str) -> bool:
    """Check if email already exists in database"""
    existing_user = db.query(User).filter(User.email == email).first()
    return existing_user is not None

def authenticate_user(db: Session, email: str, password: str):
    """Authenticate user with email and password"""
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not verify_password(password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account not verified. Please verify your email first."
        )
    
    return user

def store_otp(db: Session, email: str, otp: str):
    """Store OTP for email verification"""
    try:
        # Remove any existing OTPs for this email
        db.query(OTP).filter(OTP.email == email).delete()
        db.commit()
        
        # Create new OTP record
        otp_record = OTP(
            email=email,
            otp=otp,
            expires_at=datetime.utcnow() + timedelta(seconds=120)  # 120 second expiry
        )
        
        db.add(otp_record)
        db.commit()
        print(f"OTP stored successfully for {email}")
        
    except Exception as e:
        db.rollback()
        print(f"Error storing OTP: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to store OTP"
        )

def verify_otp_and_create_user(db: Session, user_data: VerifyOTPAndCreateUser):
    """Verify OTP and create user if OTP is valid"""
    
    # 1. Check if email already has a user (double-check)
    if check_if_email_exists(db, user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
        )
    
    # 2. Validate passwords match
    if user_data.password != user_data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )
    
    # 3. Validate role
    if user_data.role not in ["startup", "investor"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Must be 'startup' or 'investor'"
        )
    
    # 4. Check if OTP exists and is valid
    otp_record = db.query(OTP).filter(
        OTP.email == user_data.email,
        OTP.otp == user_data.otp,
        OTP.expires_at > datetime.utcnow()
    ).first()
    
    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP"
        )
    
    # 5. Create user with verified status
    try:
        hashed_password = hash_password(user_data.password)
        
        db_user = User(
            email=user_data.email,
            password=hashed_password,
            role=user_data.role,
            is_verified=True,
            profile_completed=False
        )
        
        db.add(db_user)
        
        # 6. Remove the used OTP
        db.delete(otp_record)
        
        # 7. Commit all changes
        db.commit()
        db.refresh(db_user)
        
        print(f"User created successfully: {db_user.email} with role: {db_user.role}")
        return db_user
        
    except Exception as e:
        db.rollback()
        print(f"Error creating user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )

def cleanup_expired_otps(db: Session):
    """Clean up expired OTPs (call this periodically)"""
    try:
        expired_count = db.query(OTP).filter(OTP.expires_at <= datetime.utcnow()).delete()
        db.commit()
        print(f"Cleaned up {expired_count} expired OTPs")
    except Exception as e:
        db.rollback()
        print(f"Error cleaning up OTPs: {str(e)}")