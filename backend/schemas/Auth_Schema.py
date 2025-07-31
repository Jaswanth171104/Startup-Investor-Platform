from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class OTPRequest(BaseModel):
    email: EmailStr

class OTPVerify(BaseModel):
    email: EmailStr
    otp: str

class OTPVerifyAndSignup(BaseModel):
    email: EmailStr
    otp: str
    password: str
    role: str

class UserBase(BaseModel):
    email: EmailStr
    role: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    role: str
    email: str

class OTPResponse(BaseModel):
    message: str
    email: str
    warning: Optional[str] = None