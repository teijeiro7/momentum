"""
Habits router - CRUD endpoints for habits
"""

from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from dependencies import get_db
from models import Habit
from schemas import HabitCreate, HabitUpdate, HabitResponse

router = APIRouter(
    prefix="/habits",
    tags=["habits"]
)


@router.post("", response_model=HabitResponse, status_code=201)
def create_habit(habit: HabitCreate, db: Session = Depends(get_db)):
    """Create a new habit"""
    db_habit = Habit(name=habit.name, goal=habit.goal)
    db.add(db_habit)
    db.commit()
    db.refresh(db_habit)
    return db_habit


@router.get("", response_model=List[HabitResponse])
def list_habits(db: Session = Depends(get_db)):
    """List all habits"""
    habits = db.query(Habit).all()
    return habits


@router.get("/{habit_id}", response_model=HabitResponse)
def get_habit(habit_id: int, db: Session = Depends(get_db)):
    """Get a specific habit"""
    habit = db.query(Habit).filter(Habit.id == habit_id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    return habit


@router.put("/{habit_id}", response_model=HabitResponse)
def update_habit(habit_id: int, habit_update: HabitUpdate, db: Session = Depends(get_db)):
    """Update a habit"""
    db_habit = db.query(Habit).filter(Habit.id == habit_id).first()
    if not db_habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    if habit_update.name is not None:
        db_habit.name = habit_update.name
    if habit_update.goal is not None:
        db_habit.goal = habit_update.goal
    
    db.commit()
    db.refresh(db_habit)
    return db_habit


@router.delete("/{habit_id}", status_code=204)
def delete_habit(habit_id: int, db: Session = Depends(get_db)):
    """Delete a habit"""
    db_habit = db.query(Habit).filter(Habit.id == habit_id).first()
    if not db_habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    db.delete(db_habit)
    db.commit()
    return None
