"""
HabitLog schemas (Pydantic models)
"""

from datetime import datetime
from pydantic import BaseModel


class HabitLogCreate(BaseModel):
    """Schema for creating a habit log"""
    date: datetime
    value: bool


class HabitLogResponse(BaseModel):
    """Schema for habit log response"""
    id: int
    habit_id: int
    date: datetime
    value: bool
    
    model_config = {"from_attributes": True}
