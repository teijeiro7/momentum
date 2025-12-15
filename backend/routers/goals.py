from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, status, Query
from sqlalchemy.orm import Session

from dependencies import get_db
from models import Goal, Habit, HabitLog, Achievement, User
from schemas import GoalCreate, GoalUpdate, GoalResponse, GoalProgress, AchievementResponse
from utils.auth_utils import get_current_user
from utils.goal_calculator import (
    calculate_goal_progress,
    check_goal_completion,
    get_goal_insights,
    calculate_days_remaining
)

router = APIRouter(
    prefix="/goals",
    tags=["goals"]
)


@router.post("", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
def create_goal(
    goal: GoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify habit exists and belongs to user
    habit = db.query(Habit).filter(
        Habit.id == goal.habit_id,
        Habit.user_id == current_user.id
    ).first()
    
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    db_goal = Goal(
        habit_id=goal.habit_id,
        user_id=current_user.id,
        title=goal.title,
        description=goal.description,
        goal_type=goal.goal_type,
        target_value=goal.target_value,
        start_date=goal.start_date or datetime.utcnow(),
        end_date=goal.end_date
    )
    
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    
    return db_goal


@router.get("", response_model=List[GoalResponse])
def list_goals(
    active_only: bool = Query(False, description="Filter to only active (incomplete) goals"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all goals for current user"""
    query = db.query(Goal).filter(Goal.user_id == current_user.id)
    
    if active_only:
        query = query.filter(Goal.completed == False)
    
    goals = query.all()
    return goals


@router.get("/{goal_id}", response_model=GoalResponse)
def get_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific goal"""
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    return goal


@router.get("/{goal_id}/progress", response_model=GoalProgress)
def get_goal_progress(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get detailed progress for a goal"""
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    # Get habit logs
    logs = db.query(HabitLog).filter(HabitLog.habit_id == goal.habit_id).all()
    
    # Calculate progress
    current_value, progress_percentage = calculate_goal_progress(goal, logs)
    is_completed = check_goal_completion(goal, logs)
    days_remaining = calculate_days_remaining(goal)
    
    return GoalProgress(
        goal=goal,
        current_value=current_value,
        progress_percentage=progress_percentage,
        is_completed=is_completed,
        days_remaining=days_remaining
    )


@router.post("/{goal_id}/check", response_model=GoalResponse)
def check_and_update_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    # Get habit logs
    logs = db.query(HabitLog).filter(HabitLog.habit_id == goal.habit_id).all()
    
    # Check completion
    is_completed = check_goal_completion(goal, logs)
    
    # Update goal if newly completed
    if is_completed and not goal.completed:
        goal.completed = True
        goal.completed_at = datetime.utcnow()
        
        # Create achievement
        achievement = Achievement(
            goal_id=goal.id,
            user_id=current_user.id,
            title=f"🎉 {goal.title}",
            description=f"Completed goal: {goal.description or goal.title}"
        )
        db.add(achievement)
        
        db.commit()
        db.refresh(goal)
    
    return goal


@router.put("/{goal_id}", response_model=GoalResponse)
def update_goal(
    goal_id: int,
    goal_update: GoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()
    
    if not db_goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    # Update fields if provided
    if goal_update.title is not None:
        db_goal.title = goal_update.title
    if goal_update.description is not None:
        db_goal.description = goal_update.description
    if goal_update.target_value is not None:
        db_goal.target_value = goal_update.target_value
    if goal_update.end_date is not None:
        db_goal.end_date = goal_update.end_date
    
    db.commit()
    db.refresh(db_goal)
    
    return db_goal


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    db.delete(goal)
    db.commit()
    
    return None


@router.get("/habit/{habit_id}/goals", response_model=List[GoalResponse])
def get_habit_goals(
    habit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify habit belongs to user
    habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user.id
    ).first()
    
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    goals = db.query(Goal).filter(Goal.habit_id == habit_id).all()
    return goals
