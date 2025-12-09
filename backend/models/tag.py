"""
Tag model - User-specific tags for habits with many-to-many relationship
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship

from database import Base


# Association table for many-to-many relationship between Habit and Tag
habit_tags = Table(
    'habit_tags',
    Base.metadata,
    Column('habit_id', Integer, ForeignKey('habits.id', ondelete='CASCADE'), primary_key=True),
    Column('tag_id', Integer, ForeignKey('tags.id', ondelete='CASCADE'), primary_key=True)
)


class Tag(Base):
    __tablename__ = "tags"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="tags")
    habits = relationship("Habit", secondary=habit_tags, back_populates="tags")
