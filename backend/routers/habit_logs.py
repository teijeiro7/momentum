"""
Habit logs router - CRUD endpoints for habit logs
"""

from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from dependencies import get_db
from models import Habit, HabitLog, User
from schemas import HabitLogCreate, HabitLogResponse
from utils.auth_utils import get_current_user

router = APIRouter(
    prefix="/habits/{habit_id}/logs",
    tags=["habit-logs"]
)


@router.post("", response_model=HabitLogResponse, status_code=201)
def create_habit_log(
    habit_id: int, 
    log: HabitLogCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if habit exists and belongs to user
    habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user.id
    ).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    # Check if log already exists for this date
    existing_log = db.query(HabitLog).filter(
        HabitLog.habit_id == habit_id,
        HabitLog.date == log.date
    ).first()
    
    if existing_log:
        # Update existing log
        existing_log.value = log.value
        db.commit()
        db.refresh(existing_log)
        return existing_log
    
    # Create new log
    db_log = HabitLog(habit_id=habit_id, date=log.date, value=log.value)
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log


@router.get("", response_model=List[HabitLogResponse])
def list_habit_logs(
    habit_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user.id
    ).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    logs = db.query(HabitLog).filter(HabitLog.habit_id == habit_id).all()
    return logs


@router.delete("/{log_id}", status_code=204)
def delete_habit_log(
    habit_id: int, 
    log_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify habit ownership
    habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user.id
    ).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    db_log = db.query(HabitLog).filter(
        HabitLog.id == log_id,
        HabitLog.habit_id == habit_id
    ).first()
    
    if not db_log:
        raise HTTPException(status_code=404, detail="Log not found")
    
    db.delete(db_log)
    db.commit()
    return None
