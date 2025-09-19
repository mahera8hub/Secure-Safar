@echo off
echo ================================
echo    SecureSafar Startup Script
echo ================================
echo.

echo [1/4] Checking dependencies...

:: Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js found

:: Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python from https://python.org/
    pause
    exit /b 1
)
echo ✅ Python found

echo.
echo [2/4] Installing backend dependencies...
cd backend
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing Python packages...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Failed to install Python dependencies
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed

echo.
echo [3/4] Installing frontend dependencies...
cd ..\frontend
if not exist "node_modules" (
    echo Installing npm packages...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install npm dependencies
        pause
        exit /b 1
    )
)
echo ✅ Frontend dependencies installed

echo.
echo [4/4] Starting services...
echo.
echo Starting SecureSafar Application...
echo.
echo 🌐 Frontend will be available at: http://localhost:5173
echo 🔧 Backend API will be available at: http://localhost:8000
echo 📚 API Documentation: http://localhost:8000/docs
echo.
echo Demo Accounts:
echo - Tourist: tourist@securesafar.com / tourist123
echo - Police: police@securesafar.com / police123
echo - Admin: admin@securesafar.com / admin123
echo.
echo Press Ctrl+C to stop all services
echo.

:: Start backend in background
echo Starting backend server...
cd ..\backend
call venv\Scripts\activate.bat
start "SecureSafar Backend" cmd /k "uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

:: Wait a moment for backend to start
timeout /t 3 /nobreak >nul

:: Start frontend
echo Starting frontend server...
cd ..\frontend
start "SecureSafar Frontend" cmd /k "npm run dev"

echo.
echo ✅ Both services are starting...
echo.
echo Check the opened windows for any error messages.
echo If you see any dependency errors, please install:
echo - PostgreSQL (for database)
echo - MongoDB (for document storage)
echo - Redis (for caching)
echo.
echo The application should be ready in 10-30 seconds.
echo.

pause