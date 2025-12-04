#!/bin/bash

echo "=================================="
echo "Habit Tracker MVP - Setup Script"
echo "=================================="
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is not installed"
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    exit 1
fi

echo "✓ Python 3 found: $(python3 --version)"
echo "✓ Node.js found: $(node --version)"
echo ""

# Setup Backend
echo "📦 Setting up Backend..."
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

cd ..

# Setup Frontend
echo ""
echo "📦 Setting up Frontend..."
cd frontend

# Install dependencies
echo "Installing Node dependencies..."
npm install

cd ..

echo ""
echo "=================================="
echo "✅ Setup Complete!"
echo "=================================="
echo ""
echo "To run the application:"
echo "1. Run: ./run.sh"
echo "   OR manually:"
echo "2. Terminal 1: cd backend && source venv/bin/activate && python main.py"
echo "3. Terminal 2: cd frontend && npm run dev"
echo ""
