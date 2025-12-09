"""
Analytics schemas for dashboard overview
"""

from datetime import date
from typing import List, Dict
from pydantic import BaseModel


class HeatmapDataPoint(BaseModel):
    """Single data point for heatmap"""
    date: str
    value: int


class HeatmapResponse(BaseModel):
    """Heatmap response for single habit"""
    habit_name: str
    data: List[HeatmapDataPoint]


class OverallHeatmapDataPoint(BaseModel):
    """Data point for overall heatmap (all habits combined)"""
    date: str
    completed_count: int  # Number of habits completed on this day
    total_habits: int     # Total number of active habits on this day


class HabitSummary(BaseModel):
    """Summary statistics for a single habit"""
    habit_id: int
    habit_name: str
    total_logs: int
    completed_logs: int
    completion_rate: float
    current_streak: int
    longest_streak: int


class OverallStats(BaseModel):
    """Overall statistics across all habits"""
    total_habits: int
    total_logs: int
    total_completed: int
    overall_completion_rate: float
    best_day_count: int  # Most habits completed in a single day
    best_day_date: str | None
    active_streaks: int  # Number of habits with active streaks


class DashboardAnalytics(BaseModel):
    """Complete dashboard analytics"""
    overall_stats: OverallStats
    heatmap_data: List[OverallHeatmapDataPoint]
    habit_summaries: List[HabitSummary]
    category_breakdown: Dict[str, int]  # Category name -> completion count
