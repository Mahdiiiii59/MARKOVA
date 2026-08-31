#!/bin/bash
# =============================================================================
# MARKOVA AI - Executive System Launcher (macOS / Linux)
# Powered by NEXURA AI Lab
# =============================================================================

cd "$(dirname "$0")"

# ANSI Colors
CYAN='\033[0;36m'
GOLD='\033[0;33m'
GREEN='\033[0;32m'
BOLD='\033[1m'
NC='\033[0m' # No Color

clear

echo -e "${GOLD}"
cat << "EOF"
 =============================================================================
 ███╗   ██╗███████╗██╗  ██╗██╗   ██╗██████╗  █████╗     █████╗ ██╗
 ████╗  ██║██╔════╝╚██╗██╔╝██║   ██║██╔══██╗██╔══██╗   ██╔══██╗██║
 ██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║██████╔╝███████║   ███████║██║
 ██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║██╔══██╗██╔══██║   ██╔══██║██║
 ██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝██║  ██║██║  ██║██╗██║  ██║██║
 ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚═╝

          MARKOVA AI - EXECUTIVE COGNITIVE SUITE & ATELIER STUDIO
               Powered by NEXURA AI Lab & Nima Changizi (CEO)
 =============================================================================
EOF
echo -e "${NC}"

echo -e "${CYAN}[*] Checking for updates...${NC}"
git pull origin main 2>/dev/null || git pull 2>/dev/null || echo -e "ℹ️  Proceeding with local build."

echo -e "${CYAN}[*] Verifying Node.js runtime...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "❌ Node.js could not be found! Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo -e "${CYAN}[*] Installing Node dependencies...${NC}"
    npm install
fi

if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "ℹ️  Created .env configuration file."
    fi
fi

echo ""
echo -e "${GREEN}${BOLD}=============================================================================${NC}"
echo -e "${GREEN}${BOLD}  Starting MARKOVA AI Full-Stack App (React 19 + Express + AI Router)${NC}"
echo -e "${GREEN}${BOLD}  Local Address: http://localhost:3000${NC}"
echo -e "${GREEN}${BOLD}=============================================================================${NC}"
echo ""

# Auto open browser in macOS or Linux
if command -v open &> /dev/null; then
    (sleep 2 && open "http://localhost:3000") &
elif command -v xdg-open &> /dev/null; then
    (sleep 2 && xdg-open "http://localhost:3000") &
fi

npm run dev
