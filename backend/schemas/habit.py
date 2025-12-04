"""
Habit schemas (Pydantic models)
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class HabitCreate(BaseModel):
    """Schema for creating a new habit"""
    name: str = Field(..., min_length=1, max_length=100)
    goal: str = Field(..., min_length=1, max_length=500)


class HabitUpdate(BaseModel):
    """Schema for updating a habit"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    goal: Optional[str] = Field(None, min_length=1, max_length=500)


class HabitResponse(BaseModel):
    """Schema for habit response"""
    id: int
    name: str
    goal: str
    created_at: datetime
    
    model_config = {"from_attributes": True}
