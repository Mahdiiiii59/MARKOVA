#!/bin/bash
cd "$(dirname "$0")"
echo "============================================================"
echo "   MARKOVA AI — UPDATER ENGINE (macOS/Linux)"
echo "============================================================"
echo "[1/3] Pulling latest updates from GitHub..."
git pull origin main || git pull
echo "[2/3] Updating Python packages..."
python3 -m pip install -r requirements.txt
echo "[3/3] Updating Node.js dependencies..."
npm install
echo "============================================================"
echo "✓ System update completed successfully!"
echo "============================================================"

