import random
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from Database.db import get_db
from Models.Auth_models import User

# JWT Configuration
SECRET_KEY = "your-secret-key-here-make-it-long-and-secure-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

# Security scheme
security = HTTPBearer()

# Email configuration - Use environment variables or defaults
EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_USER = os.getenv("EMAIL_USER", "your-email@gmail.com")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "your-app-password")

def generate_otp():
    """Generate a 6-digit OTP"""
    return str(random.randint(100000, 999999))

def send_email(email: str, otp: str) -> bool:
    """Send OTP email and return True if successful, False if failed"""
    # Use environment variables or fallback to hardcoded values
    sender_email = os.getenv("SENDER_EMAIL", "jaswanthb1711@gmail.com")
    sender_password = os.getenv("SENDER_PASSWORD", "gdlxiisslvafbdvr")

    # Create message
    message = MIMEMultipart()
    message["From"] = sender_email
    message["To"] = email
    message["Subject"] = "Your Verification Code"

    # Email body with better formatting
    body = f"""
    Hello,

    Your verification code is: {otp}

    This code will expire in 2 minutes (120 seconds).
    
    If you didn't request this verification code, please ignore this email.

    Best regards,
    Your App Team
    """
    
    message.attach(MIMEText(body, "plain"))

    try:
        # Create SMTP session
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()  # Enable security
        server.login(sender_email, sender_password)
        
        # Send email
        text = message.as_string()
        server.sendmail(sender_email, email, text)
        server.quit()
        
        print(f"✅ Email successfully sent to {email}")
        return True
        
    except smtplib.SMTPAuthenticationError as e:
        print(f"❌ SMTP Authentication failed: {e}")
        print("Please check your email credentials and ensure you're using an App Password for Gmail.")
        return False
    except smtplib.SMTPRecipientsRefused as e:
        print(f"❌ Recipient {email} was refused by the server: {e}")
        return False
    except smtplib.SMTPException as e:
        print(f"❌ SMTP error occurred: {e}")
        return False
    except Exception as e:
        print(f"❌ Failed to send email to {email}. Error: {e}")
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            return None
        return user_id
    except JWTError:
        return None

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    """Get current user from JWT token"""
    token = credentials.credentials
    user_id = verify_token(token)
    
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

def send_otp_email(email: str, otp: str):
    """Send OTP email - wrapper for send_email"""
    return send_email(email, otp)