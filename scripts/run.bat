@echo off
echo ==================================
echo Habit Tracker MVP - Starting...
echo ==================================
echo.

echo Starting Backend (FastAPI)...
cd backend
start "Backend - FastAPI" cmd /k "venv\Scripts\activate && python main.py"
cd ..

timeout /t 3 /nobreak >nul

echo Starting Frontend (React + Vite)...
cd frontend
start "Frontend - React" cmd /k "npm run dev"
cd ..

echo.
echo ==================================
echo Servers Running!
echo ==================================
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:8000/docs
echo.
echo Press any key to stop servers (close terminal windows manually)
echo ==================================
pause >nul
