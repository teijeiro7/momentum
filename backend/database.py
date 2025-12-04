"""
Database configuration and setup
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = "sqlite:///./habits.db"

engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def init_db():
    """Initialize database tables"""
    from models import habit, habit_log  # Import models to register them
    Base.metadata.create_all(bind=engine)
