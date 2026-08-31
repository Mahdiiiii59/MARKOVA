#!/bin/bash
# =============================================================================
# MARKOVA AI - Executive System Launcher (macOS / Linux)
# Powered by NEXURA AI Lab & Nima Changizi (CEO)
# =============================================================================

cd "$(dirname "$0")"

# ANSI Colors
CYAN='\033[0;36m'
GOLD='\033[0;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m' # No Color

clear

echo -e "${GOLD}"
cat << "EOF"
 =============================================================================
  _   _ _______  ___   _ ____      _       _    ___ 
 | \ | | ____\ \/ / | | |  _ \    / \     / \  |_ _|
 |  \| |  _|  \  /| | | | |_) |  / _ \   / _ \  | | 
 | |\  | |___ /  \| |_| |  _ <  / ___ \ / ___ \ | | 
 |_| \_|_____/_/\_\\___/|_| \_\/_/   \_/_/   \_|___|

          MARKOVA AI - EXECUTIVE COGNITIVE SUITE & ATELIER STUDIO
               Powered by NEXURA AI Lab & Nima Changizi (CEO)
 =============================================================================
EOF
echo -e "${NC}"

echo -e "${CYAN}[*] Verifying Node.js runtime...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}${BOLD}[ERROR] Node.js is not found on your system!${NC}"
    echo -e "Please install Node.js 18+ or 20+ from: https://nodejs.org/"
    read -p "Press Enter to exit..."
    exit 1
fi

NODE_VER=$(node -v)
echo -e "ℹ️  Detected Node.js: ${GREEN}${NODE_VER}${NC}"

# Check for updates if git is available
if command -v git &> /dev/null; then
    echo -e "${CYAN}[*] Checking for updates via Git...${NC}"
    git pull origin main 2>/dev/null || git pull 2>/dev/null || echo -e "ℹ️  Proceeding with local build."
fi

# Environment initialization
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "ℹ️  Created .env configuration file from template."
    fi
fi

# Dependencies check
if [ ! -d "node_modules/tsx" ]; then
    echo -e "${CYAN}[*] Installing dependencies via npm...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}[ERROR] npm install encountered an issue!${NC}"
        read -p "Press Enter to exit..."
        exit 1
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
