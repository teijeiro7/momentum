"""
Habit model
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from database import Base


class Habit(Base):
    __tablename__ = "habits"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    goal = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)  # Optional category
    
    # Relationships
    user = relationship("User", back_populates="habits")
    category = relationship("Category", back_populates="habits")
    tags = relationship("Tag", secondary="habit_tags", back_populates="habits")
    logs = relationship("HabitLog", back_populates="habit", cascade="all, delete-orphan")
    goals = relationship("Goal", back_populates="habit", cascade="all, delete-orphan")
    streaks = relationship("Streak", back_populates="habit", cascade="all, delete-orphan")


