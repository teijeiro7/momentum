from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session

from dependencies import get_db
from models import Habit, User, Tag
from schemas import HabitCreate, HabitUpdate, HabitResponse
from utils.auth_utils import get_current_user

router = APIRouter(
    prefix="/habits",
    tags=["habits"]
)


@router.post("", response_model=HabitResponse, status_code=201)
def create_habit(
    habit: HabitCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_habit = Habit(
        name=habit.name, 
        goal=habit.goal,
        user_id=current_user.id,
        category_id=habit.category_id
    )
    
    # Add tags if provided
    if habit.tag_ids:
        tags = db.query(Tag).filter(
            Tag.id.in_(habit.tag_ids),
            Tag.user_id == current_user.id
        ).all()
        db_habit.tags = tags
    
    db.add(db_habit)
    db.commit()
    db.refresh(db_habit)
    return db_habit


@router.get("", response_model=List[HabitResponse])
def list_habits(
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    tag_id: Optional[int] = Query(None, description="Filter by tag ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Habit).filter(Habit.user_id == current_user.id)
    
    # Filter by category if provided
    if category_id is not None:
        query = query.filter(Habit.category_id == category_id)
    
    # Filter by tag if provided
    if tag_id is not None:
        query = query.join(Habit.tags).filter(Tag.id == tag_id)
    
    habits = query.all()
    return habits


@router.get("/{habit_id}", response_model=HabitResponse)
def get_habit(
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
    return habit


@router.put("/{habit_id}", response_model=HabitResponse)
def update_habit(
    habit_id: int, 
    habit_update: HabitUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user.id
    ).first()
    if not db_habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    # Update basic fields
    if habit_update.name is not None:
        db_habit.name = habit_update.name
    if habit_update.goal is not None:
        db_habit.goal = habit_update.goal
    if habit_update.category_id is not None:
        db_habit.category_id = habit_update.category_id
    
    # Update tags if provided
    if habit_update.tag_ids is not None:
        tags = db.query(Tag).filter(
            Tag.id.in_(habit_update.tag_ids),
            Tag.user_id == current_user.id
        ).all()
        db_habit.tags = tags
    
    db.commit()
    db.refresh(db_habit)
    return db_habit


@router.delete("/{habit_id}", status_code=204)
def delete_habit(
    habit_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user.id
    ).first()
    if not db_habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    db.delete(db_habit)
    db.commit()
    return None
