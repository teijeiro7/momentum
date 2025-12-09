"""
Streak model - Historical record of habit streaks
Tracks consecutive completion periods for analytics
"""

from datetime import datetime
from sqlalchemy import Column, Integer, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from database import Base


class Streak(Base):
    __tablename__ = "streaks"
    
    id = Column(Integer, primary_key=True, index=True)
    habit_id = Column(Integer, ForeignKey("habits.id", ondelete="CASCADE"), nullable=False)
    
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=True)  # Null if streak is current/ongoing
    length = Column(Integer, nullable=False)  # Number of consecutive days
    is_current = Column(Boolean, default=False)  # True if this is the active streak
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    habit = relationship("Habit", back_populates="streaks")
