#!/usr/bin/env bash
# MARKOVA AI - macOS/Linux Double-Click Launcher (NEXURA AI Lab)

# Navigate to the script's directory
cd "$(dirname "$0")"

# ANSI Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

clear
echo -e "${CYAN}"
echo " ============================================================================="
echo "  __  __    _    ____  _  _______  __     ___      _    ___ "
echo " |  \/  |  / \  |  _ \| |/ / _ \ \/ /    / \ \    / /  |_ _|"
echo " | |\/| | / _ \ | |_) | ' / | | \  /    / _ \ \/\/ /    | | "
echo " | |  | |/ ___ \|  _ <| . \ |_| /  \   / ___ \    /     | | "
echo " |_|  |_/_/   \_\_| \_\_|\_\___/_/\_\ /_/   \_\/\/     |___|"
echo "                                                               "
echo "                      MARKOVA AI 
echo "               Powered by NEXURA AI Lab
echo " ============================================================================="
echo -e "${NC}"
echo ""

# 1. Check Node.js
echo -e "${YELLOW}[*] Checking Node.js environment...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}=============================================================================${NC}"
    echo -e "${RED}[ERROR] Node.js is NOT installed!${NC}"
    echo -e "Please install Node.js (Version 18 or 20 LTS) from https://nodejs.org/"
    echo -e "${RED}=============================================================================${NC}"
    read -p "Press Enter to exit..."
    exit 1
fi
node_version=$(node -v)
echo -e "${GREEN}[i] Detected Node.js version: ${node_version}${NC}"

# 2. Git Check & Auto-pull
if command -v git &> /dev/null; then
    echo -e "${YELLOW}[*] Checking for updates via Git...${NC}"
    GIT_TERMINAL_PROMPT=0 git pull origin main > /dev/null 2>&1 || echo -e "${CYAN}[i] Proceeding with current local version.${NC}"
else
    echo -e "${CYAN}[i] Git not found, skipping update check.${NC}"
fi

# 3. Environment Variables
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo -e "${YELLOW}[*] Initializing .env configuration from template...${NC}"
        cp .env.example .env
    fi
fi

# 4. Install Node dependencies
if [ ! -d "node_modules" ]; then
    echo -e "\n${YELLOW}[*] Required packages not found. Installing dependencies via npm...${NC}"
    echo -e "${CYAN}[*] Please wait a moment...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "\n${RED}[ERROR] npm install encountered an error!${NC}"
        read -p "Press Enter to exit..."
        exit 1
    fi
    echo -e "${GREEN}[i] Packages successfully installed!${NC}"
fi

# 5. Setup and Launch Letta Agent Programmatically
echo -e "${YELLOW}[*] Installing requirements for Letta agent configuration...${NC}"
python3 -m pip install letta letta-client python-dotenv > /dev/null 2>&1

echo -e "${YELLOW}[*] Starting Letta Server in background...${NC}"
letta server --listen > /dev/null 2>&1 &
LETTA_PID=$!

echo -e "${YELLOW}[*] Initializing Letta Agent configuration...${NC}"
python3 init_letta.py

# 6. Build the application
echo -e "${YELLOW}[*] Building application...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "\n${RED}[ERROR] npm run build encountered an error!${NC}"
    read -p "Press Enter to exit..."
    exit 1
fi

# 7. Start the UI Server
echo -e "\n${CYAN}=============================================================================${NC}"
echo -e "${GREEN}  MARKOVA AI Executive System is Starting...${NC}"
echo -e "${GREEN}  Target URL : http://localhost:3000${NC}"
echo -e "${CYAN}  Press Ctrl+C to stop the server.${NC}"
echo -e "${CYAN}=============================================================================${NC}\n"

# Open browser depending on OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    (sleep 3 && open "http://localhost:3000") &
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    if command -v xdg-open &> /dev/null; then
        (sleep 3 && xdg-open "http://localhost:3000") &
    fi
fi

npm start

# Cleanup background process
if [ ! -z "$LETTA_PID" ]; then
    kill $LETTA_PID 2>/dev/null || true
fi

echo -e "\n${RED}[!] Server stopped.${NC}"
read -p "Press Enter to exit..."
