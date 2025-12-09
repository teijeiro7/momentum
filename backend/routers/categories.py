"""
Categories router - CRUD and analytics endpoints for habit categories
"""

from typing import List
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import func
import pandas as pd

from dependencies import get_db
from models import Category, Habit, HabitLog, User
from schemas import CategoryCreate, CategoryUpdate, CategoryResponse, CategoryStats
from utils.auth_utils import get_current_user

router = APIRouter(
    prefix="/categories",
    tags=["categories"]
)


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    category: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new category"""
    # Check if category name already exists
    existing = db.query(Category).filter(Category.name == category.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this name already exists"
        )
    
    db_category = Category(
        name=category.name,
        description=category.description,
        color=category.color,
        icon=category.icon
    )
    
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    
    return db_category


@router.get("", response_model=List[CategoryResponse])
def list_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all available categories"""
    categories = db.query(Category).all()
    return categories


@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific category"""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.get("/{category_id}/habits", response_model=List)
def get_category_habits(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all habits in a category for current user"""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    habits = db.query(Habit).filter(
        Habit.category_id == category_id,
        Habit.user_id == current_user.id
    ).all()
    
    return habits


@router.get("/{category_id}/stats", response_model=CategoryStats)
def get_category_stats(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get category statistics using Pandas.
    
    Calculates:
    - Number of habits in category
    - Overall completion rate for category
    """
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Get user's habits in this category
    habits = db.query(Habit).filter(
        Habit.category_id == category_id,
        Habit.user_id == current_user.id
    ).all()
    
    habit_count = len(habits)
    
    if habit_count == 0:
        return CategoryStats(
            id=category.id,
            name=category.name,
            description=category.description,
            color=category.color,
            icon=category.icon,
            habit_count=0,
            completion_rate=0.0
        )
    
    # Get all logs for these habits
    habit_ids = [h.id for h in habits]
    logs = db.query(HabitLog).filter(HabitLog.habit_id.in_(habit_ids)).all()
    
    if not logs:
        completion_rate = 0.0
    else:
        # Use Pandas to calculate completion rate
        df = pd.DataFrame([
            {'habit_id': log.habit_id, 'value': log.value}
            for log in logs
        ])
        
        total_logs = len(df)
        completed_logs = len(df[df['value'] == True])
        completion_rate = (completed_logs / total_logs) * 100 if total_logs > 0 else 0.0
    
    return CategoryStats(
        id=category.id,
        name=category.name,
        description=category.description,
        color=category.color,
        icon=category.icon,
        habit_count=habit_count,
        completion_rate=round(completion_rate, 2)
    )


@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    category_update: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a category"""
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Update fields if provided
    if category_update.name is not None:
        # Check for duplicate name
        existing = db.query(Category).filter(
            Category.name == category_update.name,
            Category.id != category_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category with this name already exists"
            )
        db_category.name = category_update.name
    
    if category_update.description is not None:
        db_category.description = category_update.description
    if category_update.color is not None:
        db_category.color = category_update.color
    if category_update.icon is not None:
        db_category.icon = category_update.icon
    
    db.commit()
    db.refresh(db_category)
    
    return db_category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a category (sets habits' category_id to NULL)"""
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Set category_id to NULL for all habits using this category
    db.query(Habit).filter(Habit.category_id == category_id).update(
        {Habit.category_id: None}
    )
    
    db.delete(db_category)
    db.commit()
    
    return None
