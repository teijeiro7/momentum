"""
Authentication schemas
"""

from pydantic import BaseModel, EmailStr, Field
from datetime import datetime


class UserCreate(BaseModel):
    """Schema for user registration"""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserResponse(BaseModel):
    """Schema for user response (without password)"""
    id: int
    username: str
    email: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    """Schema for JWT token response"""
    access_token: str
    token_type: str


class LoginRequest(BaseModel):
    """Schema for login request"""
    username: str
    password: str
