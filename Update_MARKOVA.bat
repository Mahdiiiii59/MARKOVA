@echo off
title MARKOVA AI - System Update Engine
echo ============================================================
echo   MARKOVA AI — SYSTEM UPDATER (Windows)
echo ============================================================
echo [1/3] Pulling latest updates from GitHub...
git pull origin main
if %errorlevel% neq 0 (
    echo Attempting general git pull...
    git pull
)
echo [2/3] Updating Python packages...
python -m pip install -r requirements.txt
echo [3/3] Updating Node.js dependencies...
call npm install
echo ============================================================
echo   System update completed successfully!
echo ============================================================
pause
