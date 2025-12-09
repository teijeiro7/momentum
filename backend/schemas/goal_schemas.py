"""
Goal and Achievement schemas (Pydantic models)
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

from models.goal import GoalType


class GoalCreate(BaseModel):
    """Schema for creating a new goal"""
    habit_id: int
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    goal_type: GoalType
    target_value: int = Field(..., gt=0)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class GoalUpdate(BaseModel):
    """Schema for updating a goal"""
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    target_value: Optional[int] = Field(None, gt=0)
    end_date: Optional[datetime] = None


class GoalResponse(BaseModel):
    """Schema for goal response"""
    id: int
    habit_id: int
    user_id: int
    title: str
    description: Optional[str]
    goal_type: GoalType
    target_value: int
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    completed: bool
    completed_at: Optional[datetime]
    created_at: datetime
    
    model_config = {"from_attributes": True}


class GoalProgress(BaseModel):
    """Schema for goal progress details"""
    goal: GoalResponse
    current_value: int  # Current count/streak
    progress_percentage: float  # 0-100
    is_completed: bool
    days_remaining: Optional[int]  # For DATE_BASED goals


class AchievementResponse(BaseModel):
    """Schema for achievement response"""
    id: int
    goal_id: int
    user_id: int
    title: str
    description: Optional[str]
    unlocked_at: datetime
    created_at: datetime
    
    model_config = {"from_attributes": True}
