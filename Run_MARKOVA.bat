@echo off
setlocal enabledelayedexpansion
title MARKOVA AI - Executive System Launcher (NEXURA AI Lab)
color 0B
cls

echo.
echo  =============================================================================
echo   _   _ _______  ___   _ ____      _       _    ___ 
echo  ^| \ ^| ^| ____\ \/ / ^| ^| ^|  _ \    / \     / \  ^|_ _^|
echo  ^|  \^| ^|  _^|  \  /^| ^| ^| ^| ^|_) ^|  / _ \   / _ \  ^| ^| 
echo  ^| ^|\  ^| ^|___ /  \^| ^|_^| ^|  _ ^<  / ___ \ / ___ \ ^| ^| 
echo  ^|_^| \_^|_____/_/\_\\___/^|_^| \_\/_/   \_/_/   \_^|___^|
echo.
echo           MARKOVA AI - EXECUTIVE COGNITIVE SUITE ^& ATELIER STUDIO
echo                Powered by NEXURA AI Lab ^& Nima Changizi (CEO)
echo  =============================================================================
echo.

cd /d "%~dp0"

:: 1. Search and verify Node.js
echo [*] Checking Node.js environment...
set "NODE_CMD="

where node >nul 2>nul
if %errorlevel% equ 0 (
    set "NODE_CMD=node"
) else (
    if exist "C:\Program Files\nodejs\node.exe" (
        set "PATH=%PATH%;C:\Program Files\nodejs"
        set "NODE_CMD=C:\Program Files\nodejs\node.exe"
    ) else if exist "C:\Program Files (x86)\nodejs\node.exe" (
        set "PATH=%PATH%;C:\Program Files (x86)\nodejs"
        set "NODE_CMD=C:\Program Files (x86)\nodejs\node.exe"
    ) else if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" (
        set "PATH=%PATH%;%LOCALAPPDATA%\Programs\nodejs"
        set "NODE_CMD=%LOCALAPPDATA%\Programs\nodejs\node.exe"
    ) else if exist "%APPDATA%\npm\node.exe" (
        set "PATH=%PATH%;%APPDATA%\npm"
        set "NODE_CMD=%APPDATA%\npm\node.exe"
    )
)

if not defined NODE_CMD (
    color 0C
    echo.
    echo =============================================================================
    echo [ERROR] Node.js is NOT installed on this computer!
    echo =============================================================================
    echo To run MARKOVA AI, please install Node.js (Version 18 or 20 LTS):
    echo 1. Download Node.js from: https://nodejs.org/
    echo 2. Run the installer and keep all default settings.
    echo 3. Double-click Run_MARKOVA.bat again.
    echo =============================================================================
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v 2^>nul') do echo [i] Detected Node.js version: %%v

:: 2. Check Git (Optional)
where git >nul 2>nul
if %errorlevel% equ 0 (
    echo [*] Checking for updates via Git...
    call git pull origin main 2>nul || call git pull 2>nul || echo [i] Proceeding with current local version.
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
if not exist "node_modules\tsx" (
    echo.
    echo [*] Required packages not found. Installing dependencies via npm...
    echo [*] Please wait a moment (this only happens on the first run)...
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo.
        echo [ERROR] npm install encountered an error!
        echo Please make sure your internet connection is active or try running:
        echo    npm install --legacy-peer-deps
        echo.
        pause
        exit /b 1
    )
    echo [i] Packages successfully installed!
)

:: 5. Launch Full-Stack Server
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
call npm run dev

if %errorlevel% neq 0 (
    color 0C
    echo.
    echo =============================================================================
    echo [!] Server stopped or encountered an error (Exit Code: %errorlevel%).
    echo If port 3000 is in use, close any running Node processes or restart terminal.
    echo =============================================================================
    echo.
    pause
)
