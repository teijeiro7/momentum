"""
Analytics router - Data analytics endpoints using Pandas
"""

from datetime import datetime, timedelta
from typing import Dict
import pandas as pd

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from dependencies import get_db
from models import Habit, HabitLog, User, Category
from schemas.analytics import (
    HeatmapResponse, 
    HeatmapDataPoint, 
    DashboardAnalytics,
    OverallStats,
    OverallHeatmapDataPoint,
    HabitSummary
)
from utils.auth_utils import get_current_user
from utils.streak_calculator import calculate_current_streak, calculate_longest_streak

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"]
)


@router.get("/dashboard", response_model=DashboardAnalytics)
def get_dashboard_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get comprehensive dashboard analytics for all user habits.
    
    Returns:
    - Overall statistics (total habits, completion rate, etc.)
    - Combined heatmap showing all habits activity
    - Individual habit summaries
    - Category breakdown
    
    Uses Pandas for efficient data processing and aggregation.
    """
    
    # Get all user habits
    habits = db.query(Habit).filter(Habit.user_id == current_user.id).all()
    
    if not habits:
        # Return empty analytics for users with no habits
        return DashboardAnalytics(
            overall_stats=OverallStats(
                total_habits=0,
                total_logs=0,
                total_completed=0,
                overall_completion_rate=0.0,
                best_day_count=0,
                best_day_date=None,
                active_streaks=0
            ),
            heatmap_data=[],
            habit_summaries=[],
            category_breakdown={}
        )
    
    habit_ids = [h.id for h in habits]
    
    # Get all logs for user's habits
    all_logs = db.query(HabitLog).filter(HabitLog.habit_id.in_(habit_ids)).all()
    
    # Convert to DataFrame for analysis
    if all_logs:
        df = pd.DataFrame([
            {
                'habit_id': log.habit_id,
                'date': log.date.date(),
                'value': log.value,
                'habit_name': next((h.name for h in habits if h.id == log.habit_id), 'Unknown')
            }
            for log in all_logs
        ])
    else:
        df = pd.DataFrame(columns=['habit_id', 'date', 'value', 'habit_name'])
    
    # Calculate overall stats
    total_logs = len(df)
    total_completed = len(df[df['value'] == True]) if not df.empty else 0
    overall_completion_rate = (total_completed / total_logs * 100) if total_logs > 0 else 0.0
    
    # Find best day (most habits completed)
    if not df.empty and total_completed > 0:
        completed_df = df[df['value'] == True]
        daily_counts = completed_df.groupby('date').size()
        best_day_count = int(daily_counts.max())
        best_day_date = daily_counts.idxmax().strftime('%Y-%m-%d')
    else:
        best_day_count = 0
        best_day_date = None
    
    # Calculate active streaks
    active_streaks = 0
    habit_summaries = []
    
    for habit in habits:
        habit_logs = [log for log in all_logs if log.habit_id == habit.id]
        
        # Calculate stats for this habit
        total_habit_logs = len(habit_logs)
        completed_habit_logs = sum(1 for log in habit_logs if log.value)
        completion_rate = (completed_habit_logs / total_habit_logs * 100) if total_habit_logs > 0 else 0.0
        
        current_streak = calculate_current_streak(habit_logs)
        longest_streak = calculate_longest_streak(habit_logs)
        
        if current_streak > 0:
            active_streaks += 1
        
        habit_summaries.append(HabitSummary(
            habit_id=habit.id,
            habit_name=habit.name,
            total_logs=total_habit_logs,
            completed_logs=completed_habit_logs,
            completion_rate=round(completion_rate, 2),
            current_streak=current_streak,
            longest_streak=longest_streak
        ))
    
    # Generate combined heatmap for last 30 days
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=29)
    date_range = pd.date_range(start=start_date, end=end_date, freq='D')
    
    heatmap_data = []
    for date in date_range:
        date_obj = date.date()
        
        # Count how many habits were completed on this date
        if not df.empty:
            day_logs = df[df['date'] == date_obj]
            completed_count = len(day_logs[day_logs['value'] == True])
        else:
            completed_count = 0
        
        heatmap_data.append(OverallHeatmapDataPoint(
            date=date.strftime('%Y-%m-%d'),
            completed_count=completed_count,
            total_habits=len(habits)
        ))
    
    # Category breakdown
    category_breakdown: Dict[str, int] = {}
    
    for habit in habits:
        if habit.category_id:
            category = db.query(Category).filter(Category.id == habit.category_id).first()
            if category:
                category_name = category.name
                habit_logs = [log for log in all_logs if log.habit_id == habit.id and log.value]
                category_breakdown[category_name] = category_breakdown.get(category_name, 0) + len(habit_logs)
    
    # Add "Uncategorized" for habits without category
    uncategorized_logs = sum(
        len([log for log in all_logs if log.habit_id == h.id and log.value])
        for h in habits if not h.category_id
    )
    if uncategorized_logs > 0:
        category_breakdown["Sin categoría"] = uncategorized_logs
    
    return DashboardAnalytics(
        overall_stats=OverallStats(
            total_habits=len(habits),
            total_logs=total_logs,
            total_completed=total_completed,
            overall_completion_rate=round(overall_completion_rate, 2),
            best_day_count=best_day_count,
            best_day_date=best_day_date,
            active_streaks=active_streaks
        ),
        heatmap_data=heatmap_data,
        habit_summaries=habit_summaries,
        category_breakdown=category_breakdown
    )


@router.get("/{habit_id}/heatmap", response_model=HeatmapResponse)
def get_habit_heatmap(
    habit_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get heatmap for a specific habit.
    
    Process:
    1. Fetch all logs from database
    2. Load into Pandas DataFrame
    3. Use Pandas to fill missing dates with 0
    4. Format for ApexCharts heatmap visualization
    5. Return last 30 days of data
    """
    
    # Verify habit exists and belongs to user
    habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user.id
    ).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    # Fetch all logs for this habit
    logs = db.query(HabitLog).filter(HabitLog.habit_id == habit_id).all()
    
    # Convert to DataFrame
    if logs:
        # Create DataFrame from logs
        df = pd.DataFrame([
            {
                'date': log.date.date(),  # Convert datetime to date
                'value': 1 if log.value else 0  # Convert boolean to int
            }
            for log in logs
        ])
        
        # Set date as index for easier manipulation
        df['date'] = pd.to_datetime(df['date'])
        df = df.set_index('date')
    else:
        # Create empty DataFrame with proper structure
        df = pd.DataFrame(columns=['value'])
        df.index = pd.DatetimeIndex([])
        df.index.name = 'date'
    
    # Define date range: last 30 days from today
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=29)  # 30 days total (including today)
    
    # Create complete date range
    date_range = pd.date_range(start=start_date, end=end_date, freq='D')
    
    # Reindex to fill missing dates with 0
    df = df.reindex(date_range, fill_value=0)
    
    # Format data for ApexCharts
    # ApexCharts expects: [{date: "YYYY-MM-DD", value: 0}, ...]
    heatmap_data = [
        HeatmapDataPoint(
            date=date.strftime('%Y-%m-%d'),
            value=int(df.loc[date, 'value']) if 'value' in df.columns else 0
        )
        for date in date_range
    ]
    
    return HeatmapResponse(
        habit_name=habit.name,
        data=heatmap_data
    )
