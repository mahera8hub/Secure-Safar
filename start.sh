#!/bin/bash

# SecureSafar Startup Script for Linux/macOS
echo "================================"
echo "   SecureSafar Startup Script"
echo "================================"
echo

echo "[1/4] Checking dependencies..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js found: $(node --version)"

# Check Python
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "❌ Python is not installed or not in PATH"
    echo "Please install Python from https://python.org/"
    exit 1
fi
echo "✅ Python found"

echo
echo "[2/4] Installing backend dependencies..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv 2>/dev/null || python -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install Python packages
echo "Installing Python packages..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ Failed to install Python dependencies"
    exit 1
fi
echo "✅ Backend dependencies installed"

echo
echo "[3/4] Installing frontend dependencies..."
cd ../frontend

# Install npm packages if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing npm packages..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install npm dependencies"
        exit 1
    fi
fi
echo "✅ Frontend dependencies installed"

echo
echo "[4/4] Starting services..."
echo
echo "Starting SecureSafar Application..."
echo
echo "🌐 Frontend will be available at: http://localhost:5173"
echo "🔧 Backend API will be available at: http://localhost:8000"
echo "📚 API Documentation: http://localhost:8000/docs"
echo
echo "Demo Accounts:"
echo "- Tourist: tourist@securesafar.com / tourist123"
echo "- Police: police@securesafar.com / police123"
echo "- Admin: admin@securesafar.com / admin123"
echo
echo "Press Ctrl+C to stop all services"
echo

# Function to handle cleanup
cleanup() {
    echo
    echo "Shutting down services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup INT TERM

# Start backend in background
echo "Starting backend server..."
cd ../backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend in background
echo "Starting frontend server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo
echo "✅ Both services are starting..."
echo
echo "Check for any error messages above."
echo "If you see any dependency errors, please install:"
echo "- PostgreSQL (for database)"
echo "- MongoDB (for document storage)"
echo "- Redis (for caching)"
echo
echo "The application should be ready in 10-30 seconds."
echo "Press Ctrl+C to stop all services"
echo

# Wait for user to stop
wait