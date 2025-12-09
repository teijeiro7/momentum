"""
Streaks router - Advanced streak analytics using Pandas
"""

from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from dependencies import get_db
from models import Habit, HabitLog, Streak, User
from schemas import StreakResponse, StreakStats, StreakHistory
from utils.auth_utils import get_current_user
from utils.streak_calculator import (
    calculate_current_streak,
    calculate_longest_streak,
    get_streak_history,
    calculate_streak_statistics
)

router = APIRouter(
    prefix="/streaks",
    tags=["streaks"]
)


@router.get("/{habit_id}", response_model=StreakStats)
def get_streak_stats(
    habit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get comprehensive streak statistics for a habit.
    
    Uses Pandas to calculate:
    - Current active streak
    - Longest streak ever
    - Total number of streak periods
    - Average streak length
    """
    # Verify habit exists and belongs to user
    habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user.id
    ).first()
    
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    # Get all logs for this habit
    logs = db.query(HabitLog).filter(HabitLog.habit_id == habit_id).all()
    
    # Calculate statistics using Pandas
    stats = calculate_streak_statistics(logs)
    
    return StreakStats(
        habit_id=habit_id,
        current_streak=stats["current_streak"],
        longest_streak=stats["longest_streak"],
        total_streaks=stats["total_streaks"],
        average_streak_length=stats["average_streak_length"]
    )


@router.get("/{habit_id}/history", response_model=StreakHistory)
def get_streak_history_endpoint(
    habit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get historical streak records for a habit.
    
    Returns all streak periods with start/end dates and lengths.
    """
    # Verify habit exists and belongs to user
    habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user.id
    ).first()
    
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    # Get all logs
    logs = db.query(HabitLog).filter(HabitLog.habit_id == habit_id).all()
    
    # Calculate streak history using Pandas
    history = get_streak_history(logs)
    
    # Convert to response format
    streak_responses = []
    for idx, (start_date, end_date, length) in enumerate(history):
        # Check if we have this streak in database
        db_streak = db.query(Streak).filter(
            Streak.habit_id == habit_id,
            Streak.start_date == start_date
        ).first()
        
        if not db_streak:
            # Create new streak record
            db_streak = Streak(
                habit_id=habit_id,
                start_date=start_date,
                end_date=end_date,
                length=length,
                is_current=(end_date is None)
            )
            db.add(db_streak)
        else:
            # Update existing streak
            db_streak.end_date = end_date
            db_streak.length = length
            db_streak.is_current = (end_date is None)
        
        streak_responses.append(StreakResponse(
            id=db_streak.id if db_streak.id else idx,
            habit_id=habit_id,
            start_date=start_date,
            end_date=end_date,
            length=length,
            is_current=(end_date is None),
            created_at=db_streak.created_at if db_streak.created_at else start_date,
            updated_at=db_streak.updated_at if db_streak.updated_at else start_date
        ))
    
    db.commit()
    
    return StreakHistory(
        habit_id=habit_id,
        streaks=streak_responses,
        total_count=len(streak_responses)
    )


@router.get("/{habit_id}/current", response_model=dict)
def get_current_streak(
    habit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current active streak details"""
    # Verify habit exists and belongs to user
    habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user.id
    ).first()
    
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    # Get all logs
    logs = db.query(HabitLog).filter(HabitLog.habit_id == habit_id).all()
    
    # Calculate current streak
    current = calculate_current_streak(logs)
    
    return {
        "habit_id": habit_id,
        "habit_name": habit.name,
        "current_streak": current,
        "message": f"You're on a {current}-day streak!" if current > 0 else "Start your streak today!"
    }


@router.post("/{habit_id}/recalculate", response_model=dict)
def recalculate_streaks(
    habit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Recalculate and update all streak records for a habit.
    Useful for fixing inconsistencies or after bulk data import.
    """
    # Verify habit exists and belongs to user
    habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user.id
    ).first()
    
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    # Delete existing streak records
    db.query(Streak).filter(Streak.habit_id == habit_id).delete()
    
    # Get all logs
    logs = db.query(HabitLog).filter(HabitLog.habit_id == habit_id).all()
    
    # Calculate streak history
    history = get_streak_history(logs)
    
    # Create new streak records
    for start_date, end_date, length in history:
        db_streak = Streak(
            habit_id=habit_id,
            start_date=start_date,
            end_date=end_date,
            length=length,
            is_current=(end_date is None)
        )
        db.add(db_streak)
    
    db.commit()
    
    return {
        "message": "Streaks recalculated successfully",
        "total_streaks": len(history)
    }
