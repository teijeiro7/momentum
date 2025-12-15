from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class StreakResponse(BaseModel):
    """Schema for single streak response"""
    id: int
    habit_id: int
    start_date: datetime
    end_date: Optional[datetime]
    length: int
    is_current: bool
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}


class StreakStats(BaseModel):
    """Schema for streak statistics"""
    habit_id: int
    current_streak: int  # Current consecutive days
    longest_streak: int  # Best streak ever
    total_streaks: int  # Number of streak periods
    average_streak_length: float


class StreakHistory(BaseModel):
    """Schema for historical streak records"""
    habit_id: int
    streaks: List[StreakResponse]
    total_count: int
