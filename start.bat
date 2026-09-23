@echo off
SETLOCAL
cd /d "%~dp0"

where npm >nul 2>nul
if errorlevel 1 (
    echo Node.js/npm was not found in PATH.
    echo Please install Node.js and try again.
    pause
    exit /b 1
)

if not exist node_modules (
    echo Installing project dependencies...
    call npm install
)

echo Starting backend server...
start "Elevance Backend" cmd /k "cd /d ^"%~dp0^" && npm start"

echo Waiting for the app to become available...
timeout /t 4 >nul

echo Opening browser to the app...
start "" http://localhost:3000

echo App is running at: http://localhost:3000
exit /b 0
