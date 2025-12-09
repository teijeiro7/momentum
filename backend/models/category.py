"""
Category model - Predefined categories for organizing habits
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship

from database import Base


class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False, index=True)
    description = Column(String, nullable=True)
    color = Column(String, nullable=False, default="#10b981")  # Default green
    icon = Column(String, nullable=True)  # Icon identifier (e.g., "fitness", "book")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    habits = relationship("Habit", back_populates="category")
