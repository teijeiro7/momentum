"""
Streak calculation utilities using Pandas
Demonstrates Python mastery with data processing
"""

from datetime import datetime, date, timedelta
from typing import List, Tuple, Optional
import pandas as pd

from models.habit_log import HabitLog


def calculate_current_streak(logs: List[HabitLog]) -> int:
    """
    Calculate the current active streak of consecutive completions.
    
    Uses Pandas to:
    1. Convert logs to DataFrame
    2. Filter only completed logs
    3. Sort by date
    4. Check for consecutive days from today backwards
    
    Args:
        logs: List of HabitLog objects
        
    Returns:
        Length of current streak (0 if no current streak)
    """
    if not logs:
        return 0
    
    # Convert to DataFrame
    df = pd.DataFrame([
        {'date': log.date.date(), 'value': log.value}
        for log in logs
    ])
    
    # Filter only completed logs
    df = df[df['value'] == True].copy()
    
    if df.empty:
        return 0
    
    # Convert to datetime and sort
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date', ascending=False).drop_duplicates(subset=['date'])
    
    # Check if today or yesterday has a log (streak must be recent)
    today = pd.Timestamp(date.today())
    yesterday = today - pd.Timedelta(days=1)
    
    latest_date = df['date'].iloc[0]
    
    # Streak is broken if last completion was more than 1 day ago
    if latest_date < yesterday:
        return 0
    
    # Count consecutive days backwards from latest
    streak = 0
    current_date = latest_date
    
    for log_date in df['date']:
        if log_date == current_date:
            streak += 1
            current_date -= pd.Timedelta(days=1)
        elif log_date < current_date:
            # Gap found, streak ends
            break
    
    return streak


def calculate_longest_streak(logs: List[HabitLog]) -> int:
    """
    Calculate the longest streak ever achieved.
    
    Uses Pandas to:
    1. Create complete date range
    2. Identify consecutive completion groups
    3. Find maximum group length
    
    Args:
        logs: List of HabitLog objects
        
    Returns:
        Length of longest streak
    """
    if not logs:
        return 0
    
    # Convert to DataFrame
    df = pd.DataFrame([
        {'date': log.date.date(), 'value': log.value}
        for log in logs
    ])
    
    # Filter only completed logs
    df = df[df['value'] == True].copy()
    
    if df.empty:
        return 0
    
    # Convert to datetime and sort
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date').drop_duplicates(subset=['date'])
    
    # Calculate date differences to find gaps
    df['date_diff'] = df['date'].diff().dt.days
    
    # Mark new streak groups (when diff > 1 or NaN for first row)
    df['new_streak'] = (df['date_diff'] > 1) | (df['date_diff'].isna())
    df['streak_group'] = df['new_streak'].cumsum()
    
    # Count streak lengths
    streak_lengths = df.groupby('streak_group').size()
    
    return int(streak_lengths.max())


def get_streak_history(logs: List[HabitLog]) -> List[Tuple[date, Optional[date], int]]:
    """
    Get all historical streak periods.
    
    Returns list of tuples: (start_date, end_date, length)
    end_date is None for current/ongoing streaks
    
    Args:
        logs: List of HabitLog objects
        
    Returns:
        List of (start_date, end_date, length) tuples
    """
    if not logs:
        return []
    
    # Convert to DataFrame
    df = pd.DataFrame([
        {'date': log.date.date(), 'value': log.value}
        for log in logs
    ])
    
    # Filter only completed logs
    df = df[df['value'] == True].copy()
    
    if df.empty:
        return []
    
    # Convert to datetime and sort
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date').drop_duplicates(subset=['date'])
    
    # Calculate date differences to find gaps
    df['date_diff'] = df['date'].diff().dt.days
    
    # Mark new streak groups
    df['new_streak'] = (df['date_diff'] > 1) | (df['date_diff'].isna())
    df['streak_group'] = df['new_streak'].cumsum()
    
    # Get streak periods
    streaks = []
    for group_id in df['streak_group'].unique():
        group_df = df[df['streak_group'] == group_id]
        start_date = group_df['date'].min().date()
        end_date = group_df['date'].max().date()
        length = len(group_df)
        
        # Check if this is the current streak
        today = date.today()
        yesterday = today - timedelta(days=1)
        
        # Current streak if end_date is today or yesterday
        if end_date >= yesterday:
            streaks.append((start_date, None, length))
        else:
            streaks.append((start_date, end_date, length))
    
    return streaks


def detect_streak_breaks(logs: List[HabitLog]) -> List[date]:
    """
    Find dates where streaks were broken (gaps in completion).
    
    Useful for pattern analysis and understanding user behavior.
    
    Args:
        logs: List of HabitLog objects
        
    Returns:
        List of dates where streaks ended
    """
    if not logs:
        return []
    
    # Convert to DataFrame
    df = pd.DataFrame([
        {'date': log.date.date(), 'value': log.value}
        for log in logs
    ])
    
    # Filter only completed logs
    df = df[df['value'] == True].copy()
    
    if df.empty:
        return []
    
    # Convert to datetime and sort
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date').drop_duplicates(subset=['date'])
    
    # Calculate date differences
    df['date_diff'] = df['date'].diff().dt.days
    
    # Find where gaps occur (diff > 1)
    breaks = df[df['date_diff'] > 1]['date'].tolist()
    
    # Convert to date objects
    return [d.date() for d in breaks]


def calculate_streak_statistics(logs: List[HabitLog]) -> dict:
    """
    Calculate comprehensive streak statistics.
    
    Returns:
        Dictionary with current_streak, longest_streak, total_streaks, average_length
    """
    current = calculate_current_streak(logs)
    longest = calculate_longest_streak(logs)
    history = get_streak_history(logs)
    
    total_streaks = len(history)
    average_length = sum(length for _, _, length in history) / total_streaks if total_streaks > 0 else 0
    
    return {
        "current_streak": current,
        "longest_streak": longest,
        "total_streaks": total_streaks,
        "average_streak_length": round(average_length, 2)
    }
