"""
Goal model - User objectives for habits
Supports three types: STREAK (consecutive days), COUNT (total completions), DATE_BASED (deadline)
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum

from database import Base


class GoalType(str, enum.Enum):
    """Goal type enumeration"""
    STREAK = "STREAK"  # Complete habit X days in a row
    COUNT = "COUNT"    # Complete habit X times total
    DATE_BASED = "DATE_BASED"  # Complete habit by specific date


class Goal(Base):
    __tablename__ = "goals"
    
    id = Column(Integer, primary_key=True, index=True)
    habit_id = Column(Integer, ForeignKey("habits.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    goal_type = Column(SQLEnum(GoalType), nullable=False)
    target_value = Column(Integer, nullable=False)  # Target number (days/count)
    
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)  # Deadline for DATE_BASED goals
    
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    habit = relationship("Habit", back_populates="goals")
    user = relationship("User", back_populates="goals")
    achievements = relationship("Achievement", back_populates="goal", cascade="all, delete-orphan")
