"""
Tag schemas (Pydantic models)
"""

from datetime import datetime
from pydantic import BaseModel, Field


class TagCreate(BaseModel):
    """Schema for creating a new tag"""
    name: str = Field(..., min_length=1, max_length=30)


class TagResponse(BaseModel):
    """Schema for tag response"""
    id: int
    name: str
    user_id: int
    created_at: datetime
    
    model_config = {"from_attributes": True}


class TagWithCount(BaseModel):
    """Schema for tag with usage count"""
    id: int
    name: str
    habit_count: int  # Number of habits using this tag
    
    model_config = {"from_attributes": True}
