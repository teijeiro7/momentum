"""
Goal progress calculation utilities
Handles different goal types: STREAK, COUNT, DATE_BASED
"""

from datetime import datetime, date
from typing import List, Optional, Tuple
import pandas as pd

from models.goal import Goal, GoalType
from models.habit_log import HabitLog
from utils.streak_calculator import calculate_current_streak


def calculate_goal_progress(goal: Goal, logs: List[HabitLog]) -> Tuple[int, float]:
    """
    Calculate current progress for a goal.
    
    Args:
        goal: Goal object
        logs: List of HabitLog objects for the habit
        
    Returns:
        Tuple of (current_value, progress_percentage)
    """
    if goal.goal_type == GoalType.STREAK:
        current_value = calculate_current_streak(logs)
    elif goal.goal_type == GoalType.COUNT:
        current_value = calculate_total_completions(logs, goal.start_date)
    elif goal.goal_type == GoalType.DATE_BASED:
        current_value = calculate_completions_until_date(logs, goal.start_date, goal.end_date)
    else:
        current_value = 0
    
    # Calculate percentage (capped at 100%)
    progress_percentage = min((current_value / goal.target_value) * 100, 100.0) if goal.target_value > 0 else 0.0
    
    return current_value, round(progress_percentage, 2)


def check_goal_completion(goal: Goal, logs: List[HabitLog]) -> bool:
    """
    Check if a goal has been completed.
    
    Args:
        goal: Goal object
        logs: List of HabitLog objects
        
    Returns:
        True if goal is completed, False otherwise
    """
    current_value, progress = calculate_goal_progress(goal, logs)
    
    # For DATE_BASED goals, also check if deadline has passed
    if goal.goal_type == GoalType.DATE_BASED and goal.end_date:
        if datetime.now() > goal.end_date and current_value < goal.target_value:
            return False
    
    return current_value >= goal.target_value


def calculate_total_completions(logs: List[HabitLog], start_date: Optional[datetime] = None) -> int:
    """
    Calculate total number of completions.
    
    Args:
        logs: List of HabitLog objects
        start_date: Optional start date to count from
        
    Returns:
        Total number of completed logs
    """
    if not logs:
        return 0
    
    # Convert to DataFrame
    df = pd.DataFrame([
        {'date': log.date, 'value': log.value}
        for log in logs
    ])
    
    # Filter by start_date if provided
    if start_date:
        df = df[df['date'] >= start_date]
    
    # Count completed logs
    return int(df[df['value'] == True].shape[0])


def calculate_completions_until_date(
    logs: List[HabitLog], 
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
) -> int:
    """
    Calculate completions within a date range.
    
    Args:
        logs: List of HabitLog objects
        start_date: Optional start date
        end_date: Optional end date
        
    Returns:
        Number of completions in range
    """
    if not logs:
        return 0
    
    # Convert to DataFrame
    df = pd.DataFrame([
        {'date': log.date, 'value': log.value}
        for log in logs
    ])
    
    # Filter by date range
    if start_date:
        df = df[df['date'] >= start_date]
    if end_date:
        df = df[df['date'] <= end_date]
    
    # Count completed logs
    return int(df[df['value'] == True].shape[0])


def get_estimated_completion_date(goal: Goal, logs: List[HabitLog]) -> Optional[date]:
    """
    Estimate when a goal will be completed based on current trend.
    
    Uses Pandas to calculate average completion rate and project forward.
    
    Args:
        goal: Goal object
        logs: List of HabitLog objects
        
    Returns:
        Estimated completion date or None if not enough data
    """
    if not logs or len(logs) < 7:  # Need at least a week of data
        return None
    
    # Convert to DataFrame
    df = pd.DataFrame([
        {'date': log.date.date(), 'value': log.value}
        for log in logs
    ])
    
    # Filter only completed logs
    completed_df = df[df['value'] == True].copy()
    
    if completed_df.empty:
        return None
    
    # Convert to datetime
    completed_df['date'] = pd.to_datetime(completed_df['date'])
    completed_df = completed_df.sort_values('date')
    
    # Calculate completion rate (completions per day) over last 30 days
    thirty_days_ago = datetime.now() - pd.Timedelta(days=30)
    recent_df = completed_df[completed_df['date'] >= thirty_days_ago]
    
    if recent_df.empty:
        return None
    
    # Calculate average completions per day
    days_span = (recent_df['date'].max() - recent_df['date'].min()).days + 1
    completions_count = len(recent_df)
    avg_per_day = completions_count / days_span if days_span > 0 else 0
    
    if avg_per_day == 0:
        return None
    
    # Calculate remaining work
    current_value, _ = calculate_goal_progress(goal, logs)
    remaining = goal.target_value - current_value
    
    if remaining <= 0:
        return date.today()  # Already completed
    
    # Estimate days needed
    days_needed = remaining / avg_per_day
    
    # Project completion date
    estimated_date = date.today() + pd.Timedelta(days=int(days_needed))
    
    return estimated_date.date() if hasattr(estimated_date, 'date') else estimated_date


def calculate_days_remaining(goal: Goal) -> Optional[int]:
    """
    Calculate days remaining until goal deadline.
    
    Args:
        goal: Goal object
        
    Returns:
        Days remaining or None if no deadline
    """
    if not goal.end_date:
        return None
    
    delta = goal.end_date.date() - date.today()
    return max(delta.days, 0)


def get_goal_insights(goal: Goal, logs: List[HabitLog]) -> dict:
    """
    Get comprehensive insights about goal progress.
    
    Returns:
        Dictionary with progress metrics and insights
    """
    current_value, progress_percentage = calculate_goal_progress(goal, logs)
    is_completed = check_goal_completion(goal, logs)
    days_remaining = calculate_days_remaining(goal)
    estimated_completion = get_estimated_completion_date(goal, logs)
    
    insights = {
        "current_value": current_value,
        "target_value": goal.target_value,
        "progress_percentage": progress_percentage,
        "is_completed": is_completed,
        "days_remaining": days_remaining,
        "estimated_completion_date": estimated_completion.isoformat() if estimated_completion else None,
    }
    
    # Add goal-specific insights
    if goal.goal_type == GoalType.STREAK:
        insights["insight_type"] = "streak"
        insights["message"] = f"Current streak: {current_value} days. Target: {goal.target_value} days."
    elif goal.goal_type == GoalType.COUNT:
        remaining = goal.target_value - current_value
        insights["insight_type"] = "count"
        insights["message"] = f"{current_value} completions. {remaining} more to reach {goal.target_value}."
    elif goal.goal_type == GoalType.DATE_BASED:
        insights["insight_type"] = "date_based"
        if days_remaining is not None:
            insights["message"] = f"{current_value}/{goal.target_value} completions. {days_remaining} days remaining."
        else:
            insights["message"] = f"{current_value}/{goal.target_value} completions."
    
    return insights
