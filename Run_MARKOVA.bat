@echo off
setlocal enabledelayedexpansion
:: MARKOVA AI - Letta Executive Launcher
:: Added global error handling and robust pausing

cd /d "%~dp0"
title MARKOVA AI - Letta Executive Launcher
color 0B
cls

echo.
echo  =============================================================================
echo   _   _ _______  ___   _ ____      _       _    ___
echo  ^| \ ^| ^| ____\ \/ / ^| ^| ^|  _ \    / \     / \  ^|_ _^|
echo  ^|  \^| ^|  _^|  \  /^| ^| ^| ^| ^|_) ^|  / _ \   / _ \  ^| ^|
echo  ^| ^|\  ^| ^|___ /  \^| ^|_^| ^|  _ ^<  / ___ \ / ___ \ ^| ^|
echo  ^|_^| \_^|_____/_/\_\___/^|_^| \_\/_/   \_/_/   \_^|___^|
echo.
echo           MARKOVA AI - EXECUTIVE COGNITIVE SUITE
echo                Powered by NEXURA AI Lab ^& Nima Changizi (CEO)
echo  =============================================================================
echo.

:: 1. Search and verify Node.js
echo [*] Checking Node.js environment...
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js is NOT installed on this computer or not in PATH!
    echo To run MARKOVA AI, please install Node.js ^(Version 18 or 20 LTS^):
    echo Download from: https://nodejs.org/
    pause
    goto :eof
)

node -v

:: 2. Check Git & Auto Update
where git >nul 2>nul
if %errorlevel% equ 0 (
    echo [*] Checking for updates via Git...
    call git pull origin main >nul 2>nul || echo [i] Proceeding with current local version.
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

:: 4. Verify & Install Node Dependencies
if not exist "node_modules" (
    echo.
    echo [*] Required packages not found. Installing dependencies via npm...
    echo [*] Please wait a moment ^(this only happens on the first run^)...
    cmd /c "npm install"
    if errorlevel 1 (
        color 0C
        echo [ERROR] npm install encountered an error!
        pause
        goto :eof
    )
    echo [i] Packages successfully installed!
)

:: 5. Setup and Launch Letta Agent Programmatically
echo [*] Installing requirements for Letta agent configuration...
python -m pip install letta letta-client python-dotenv requests

:: Load .env into the batch session so letta server inherits the variables
if exist .env (
    for /f "usebackq tokens=1* delims==" %%a in (".env") do (
        set "%%a=%%b"
    )
)

:: Set Letta's OpenAI override variables to point to your GapGPT proxy
if defined GAPGPT_BASE_URL (
    set "OPENAI_API_BASE=%GAPGPT_BASE_URL%"
    set "OPENAI_BASE_URL=%GAPGPT_BASE_URL%"
)
if defined GAPGPT_API_KEY (
    set "OPENAI_API_KEY=%GAPGPT_API_KEY%"
)

echo [*] Starting Letta Server in background...
start /b cmd /c "letta server --listen"

echo [*] Initializing Letta Agent configuration...
python init_letta.py

:: 6. Build the Application
echo [*] Building application...
cmd /c "npm run build"

:: 7. Launch Full-Stack Server
echo.
echo =============================================================================
echo   MARKOVA AI Executive System is Starting...
echo   Target URL : http://localhost:3000
echo   Press Ctrl+C at any time to stop the server.
echo =============================================================================
echo.

:: Automatically open browser after a brief delay
start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3000"

:: Start the application
cmd /c "npm start"

:: If we reach here, it means the server stopped
color 0C
echo.
echo [!] The server has stopped.
pause
