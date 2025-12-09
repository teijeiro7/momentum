"""
Achievements router - View unlocked achievements
"""

from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from dependencies import get_db
from models import Achievement, User
from schemas import AchievementResponse
from utils.auth_utils import get_current_user

router = APIRouter(
    prefix="/achievements",
    tags=["achievements"]
)


@router.get("", response_model=List[AchievementResponse])
def list_achievements(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all achievements for current user"""
    achievements = db.query(Achievement).filter(
        Achievement.user_id == current_user.id
    ).order_by(Achievement.unlocked_at.desc()).all()
    
    return achievements
