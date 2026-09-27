@echo off
:: MARKOVA AI - Letta Executive Launcher
:: Added global error handling and robust pausing

cd /d "%~dp0"
title MARKOVA AI - Letta Executive Launcher
color 0B
cls

echo.
echo =============================================================================
echo.
echo           MARKOVA AI - EXECUTIVE COGNITIVE SUITE
echo                Powered by NEXURA AI Lab and Nima Changizi
echo.
echo =============================================================================
echo.

:: 1. Search and verify Node.js
echo [*] Checking Node.js environment...
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js is NOT installed on this computer or not in PATH.
    echo To run MARKOVA AI, please install Node.js Version 18 or 20 LTS.
    echo Download from: https://nodejs.org/
    pause
    goto :eof
)

node -v

:: 2. Check Git and Auto Update
where git >nul 2>nul
if %errorlevel% equ 0 (
    echo [*] Checking for updates via Git...
    call git pull origin main >nul 2>nul
) else (
    echo [i] Git not detected in PATH, proceeding with local build.
)

:: 3. Prepare Environment Configuration
if not exist ".env" (
    if exist ".env.example" (
        echo [*] Initializing .env configuration from template...
        copy ".env.example" ".env" >nul
    )
)

:: 4. Verify and Install Node Dependencies
if not exist "node_modules" (
    echo.
    echo [*] Required packages not found. Installing dependencies via npm...
    echo [*] Please wait a moment, this only happens on the first run...
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo [ERROR] npm install encountered an error.
        pause
        goto :eof
    )
    echo [i] Packages successfully installed.
)

:: 5. Launch Letta Server in Background
where letta >nul 2>nul
if %errorlevel% equ 0 (
    echo [*] Starting Letta Server in background...
    start /b letta server --listen >nul 2>nul
) else (
    echo [!] Note: Make sure Letta is installed, e.g., pip install letta.
)

:: 6. Build the Application
echo [*] Building application...
call npm run build

:: 7. Launch Full-Stack Server
echo.
echo =============================================================================
echo   MARKOVA AI Executive System is Starting...
echo   Target URL : http://localhost:3000
echo   Press Ctrl+C at any time to stop the server.
echo =============================================================================
echo.

:: Automatically open browser after a brief delay
start http://localhost:3000

:: Start the application directly using node so npm doesn't hijack the process
node dist/server.cjs

:: If we reach here, it means the server stopped
color 0C
echo.
echo [!] The server has stopped.
pause
