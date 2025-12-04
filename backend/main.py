"""
Habit Tracker MVP - Backend
FastAPI + SQLAlchemy + Pandas for data analytics

Refactored for scalability with modular structure:
- database.py: Database configuration
- models/: SQLAlchemy models
- schemas/: Pydantic schemas
- routers/: API endpoints
- dependencies.py: Shared dependencies
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db
from routers import habits, habit_logs, analytics, auth

# Initialize database
init_db()

# Create FastAPI app
app = FastAPI(
    title="Habit Tracker API",
    description="MVP para demostrar Python mastery con Pandas analytics",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(habits.router)
app.include_router(habit_logs.router)
app.include_router(analytics.router)


# Health check endpoint
@app.get("/")
def root():
    """Health check endpoint"""
    return {
        "message": "Habit Tracker API is running",
        "docs": "/docs",
        "version": "1.0.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
