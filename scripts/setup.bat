@echo off
echo ==================================
echo Habit Tracker MVP - Setup Script
echo ==================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed
    pause
    exit /b 1
)

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed
    pause
    exit /b 1
)

echo Python found
echo Node.js found
echo.

REM Setup Backend
echo Setting up Backend...
cd backend

if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing Python dependencies...
pip install -r requirements.txt

cd ..

REM Setup Frontend
echo.
echo Setting up Frontend...
cd frontend

echo Installing Node dependencies...
call npm install

cd ..

echo.
echo ==================================
echo Setup Complete!
echo ==================================
echo.
echo To run the application:
echo 1. Run: run.bat
echo    OR manually:
echo 2. Terminal 1: cd backend ^&^& venv\Scripts\activate ^&^& python main.py
echo 3. Terminal 2: cd frontend ^&^& npm run dev
echo.
pause
