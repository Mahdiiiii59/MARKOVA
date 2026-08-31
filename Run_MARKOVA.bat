@echo off
title MARKOVA AI - Executive System Launcher (NEXURA AI Lab)
chcp 65001 >nul
cls
color 0B

echo.
echo  =============================================================================
echo  ███╗   ██╗███████╗██╗  ██╗██╗   ██╗██████╗  █████╗     █████╗ ██╗
echo  ████╗  ██║██╔════╝╚██╗██╔╝██║   ██║██╔══██╗██╔══██╗   ██╔══██╗██║
echo  ██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║██████╔╝███████║   ███████║██║
echo  ██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║██╔══██╗██╔══██║   ██╔══██║██║
echo  ██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝██║  ██║██║  ██║██╗██║  ██║██║
echo  ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚═╝
echo.
echo           MARKOVA AI - EXECUTIVE COGNITIVE SUITE ^& ATELIER STUDIO
echo                Powered by NEXURA AI Lab ^& Nima Changizi (CEO)
echo  =============================================================================
echo.

cd /d "%~dp0"

echo [*] Checking for repository updates...
git pull origin main 2>nul || git pull 2>nul || echo [i] Running latest local build.

echo [*] Checking Node.js environment...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] Node.js is not found in PATH! Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo [*] First start detected: Installing Node.js dependencies...
    npm install
)

echo [*] Checking environment file (.env)...
if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo [i] Created default .env from template.
    )
)

echo.
echo =============================================================================
echo   Starting MARKOVA AI Full-Stack App (React 19 + Express + AI Router)
echo   Local Address: http://localhost:3000
echo =============================================================================
echo.

start "" http://localhost:3000 2>nul

npm run dev

pause
