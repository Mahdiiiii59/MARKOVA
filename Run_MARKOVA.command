#!/bin/bash
cd "$(dirname "$0")"
echo "============================================================"
echo "   MARKOVA AI - Launching Executive Assistant (macOS)"
echo "============================================================"
git pull origin main
python3 bootstrap.py
