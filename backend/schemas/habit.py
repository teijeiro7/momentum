"""
Habit schemas (Pydantic models)
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class HabitCreate(BaseModel):
    """Schema for creating a new habit"""
    name: str = Field(..., min_length=1, max_length=100)
    goal: str = Field(..., min_length=1, max_length=500)
    category_id: Optional[int] = None
    tag_ids: Optional[List[int]] = []


class HabitUpdate(BaseModel):
    """Schema for updating a habit"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    goal: Optional[str] = Field(None, min_length=1, max_length=500)
    category_id: Optional[int] = None
    tag_ids: Optional[List[int]] = None


class CategoryBasic(BaseModel):
    """Basic category info for nested responses"""
    id: int
    name: str
    color: str
    icon: Optional[str]
    
    model_config = {"from_attributes": True}


class TagBasic(BaseModel):
    """Basic tag info for nested responses"""
    id: int
    name: str
    
    model_config = {"from_attributes": True}


class HabitResponse(BaseModel):
    """Schema for habit response"""
    id: int
    name: str
    goal: str
    created_at: datetime
    category: Optional[CategoryBasic] = None
    tags: List[TagBasic] = []
    
    model_config = {"from_attributes": True}
