from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class HabitLogCreate(BaseModel):
    """Schema for creating a habit log"""
    date: datetime
    value: bool
    note: Optional[str] = None


class HabitLogResponse(BaseModel):
    """Schema for habit log response"""
    id: int
    habit_id: int
    date: datetime
    value: bool
    note: Optional[str] = None
    
    model_config = {"from_attributes": True}
