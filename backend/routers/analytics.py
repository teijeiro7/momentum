"""
Analytics router - Data analytics endpoints using Pandas
"""

from datetime import datetime, timedelta
import pandas as pd

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from dependencies import get_db
from models import Habit, HabitLog
from schemas import HeatmapResponse, HeatmapDataPoint

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"]
)


@router.get("/{habit_id}/heatmap", response_model=HeatmapResponse)
def get_habit_heatmap(habit_id: int, db: Session = Depends(get_db)):
    """
    CRITICAL ENDPOINT: Demonstrates Python mastery with Pandas
    
    Process:
    1. Fetch all logs from database
    2. Load into Pandas DataFrame
    3. Use Pandas to fill missing dates with 0
    4. Format for ApexCharts heatmap visualization
    5. Return last 30 days of data
    """
    
    # Verify habit exists
    habit = db.query(Habit).filter(Habit.id == habit_id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    # Fetch all logs for this habit
    logs = db.query(HabitLog).filter(HabitLog.habit_id == habit_id).all()
    
    # Convert to DataFrame
    if logs:
        # Create DataFrame from logs
        df = pd.DataFrame([
            {
                'date': log.date.date(),  # Convert datetime to date
                'value': 1 if log.value else 0  # Convert boolean to int
            }
            for log in logs
        ])
        
        # Set date as index for easier manipulation
        df['date'] = pd.to_datetime(df['date'])
        df = df.set_index('date')
    else:
        # Create empty DataFrame with proper structure
        df = pd.DataFrame(columns=['value'])
        df.index = pd.DatetimeIndex([])
        df.index.name = 'date'
    
    # Define date range: last 30 days from today
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=29)  # 30 days total (including today)
    
    # Create complete date range
    date_range = pd.date_range(start=start_date, end=end_date, freq='D')
    
    # Reindex to fill missing dates with 0
    df = df.reindex(date_range, fill_value=0)
    
    # Format data for ApexCharts
    # ApexCharts expects: [{date: "YYYY-MM-DD", value: 0}, ...]
    heatmap_data = [
        HeatmapDataPoint(
            date=date.strftime('%Y-%m-%d'),
            value=int(df.loc[date, 'value']) if 'value' in df.columns else 0
        )
        for date in date_range
    ]
    
    return HeatmapResponse(
        habit_name=habit.name,
        data=heatmap_data
    )
