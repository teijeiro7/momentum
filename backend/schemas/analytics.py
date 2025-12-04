"""
Analytics schemas (Pydantic models)
"""

from typing import List
from pydantic import BaseModel


class HeatmapDataPoint(BaseModel):
    """Single data point for heatmap"""
    date: str  # YYYY-MM-DD format
    value: int  # 0 or 1 for boolean


class HeatmapResponse(BaseModel):
    """Schema for heatmap response"""
    habit_name: str
    data: List[HeatmapDataPoint]
