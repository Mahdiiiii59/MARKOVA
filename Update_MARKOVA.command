#!/bin/bash
cd "$(dirname "$0")"
echo "Pulling latest MARKOVA AI updates..."
git pull origin main
pip3 install -r requirements.txt
echo "Update Complete."
