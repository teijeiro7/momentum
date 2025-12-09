"""
Category schemas (Pydantic models)
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class CategoryCreate(BaseModel):
    """Schema for creating a new category"""
    name: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = Field(None, max_length=200)
    color: str = Field(default="#10b981", pattern="^#[0-9A-Fa-f]{6}$")
    icon: Optional[str] = Field(None, max_length=50)


class CategoryUpdate(BaseModel):
    """Schema for updating a category"""
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    description: Optional[str] = Field(None, max_length=200)
    color: Optional[str] = Field(None, pattern="^#[0-9A-Fa-f]{6}$")
    icon: Optional[str] = Field(None, max_length=50)


class CategoryResponse(BaseModel):
    """Schema for category response"""
    id: int
    name: str
    description: Optional[str]
    color: str
    icon: Optional[str]
    created_at: datetime
    
    model_config = {"from_attributes": True}


class CategoryStats(BaseModel):
    """Schema for category with statistics"""
    id: int
    name: str
    description: Optional[str]
    color: str
    icon: Optional[str]
    habit_count: int
    completion_rate: float  # 0-100 percentage
    
    model_config = {"from_attributes": True}
