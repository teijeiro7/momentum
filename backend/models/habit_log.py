"""
HabitLog model
"""

from sqlalchemy import Column, Integer, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship

from database import Base


class HabitLog(Base):
    __tablename__ = "habit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    habit_id = Column(Integer, ForeignKey("habits.id"), nullable=False)
    date = Column(DateTime, nullable=False)
    value = Column(Boolean, default=False)  # True = completed, False = not completed
    note = Column(Text, nullable=True)  # Optional journal note/reflection
    
    habit = relationship("Habit", back_populates="logs")
