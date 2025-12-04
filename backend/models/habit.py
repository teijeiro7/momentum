"""
Habit model
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship

from database import Base


class Habit(Base):
    __tablename__ = "habits"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    goal = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    logs = relationship("HabitLog", back_populates="habit", cascade="all, delete-orphan")
