@echo off
title MARKOVA AI - System Update
echo Pulling latest MARKOVA AI updates...
git pull origin main
pip install -r requirements.txt
echo Update Complete.
pause
