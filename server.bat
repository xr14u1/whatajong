@echo off
title WHATAJONG - Telegram Mini App Runner
echo ========================================================
echo        WHATAJONG - TELEGRAM MINI APP RUNNER
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking Node.js environment...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not found in PATH! Please install Node.js 18+.
    pause
    exit /b 1
)

echo [2/3] Checking dependencies...
if not exist "node_modules\" (
    echo Installing node dependencies...
    cmd /c npm install
)

echo [3/3] Starting Whatajong Backend & Frontend Dev Server...
echo.
echo   * Backend API:  http://localhost:3002
echo   * Game WebApp:  http://localhost:5173
echo.
echo Press Ctrl+C at any time to terminate the servers.
echo ========================================================
echo.

start "" http://localhost:5173

cmd /c npm start
pause
