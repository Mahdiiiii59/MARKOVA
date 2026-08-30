"""
MARKOVA AI — One-Click Bootstrap Launcher
=========================================
Checks dependencies, ensures Hermes workspace & SQLite initialization,
verifies engine availability, and launches the Streamlit app.
"""

import sys
import os
import subprocess
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

def check_and_install_requirements():
    print("[1/4] Checking Python packages in requirements.txt...")
    req_file = BASE_DIR / "requirements.txt"
    if req_file.exists():
        try:
            subprocess.run([sys.executable, "-m", "pip", "install", "-r", str(req_file)], check=True)
            print("✓ Requirements verified.")
        except Exception as e:
            print(f"⚠️ Notice during pip install: {e}")

def check_hermes_setup():
    print("[2/4] Verifying Hermes workspace & CLI...")
    try:
        from hermes_bridge import HermesBridge
        bridge = HermesBridge()
        if bridge.is_available():
            print("✓ Hermes Agent CLI detected and functional.")
        else:
            print("ℹ️ Hermes CLI not found in PATH. LiteLLM cloud router will act as fallback brain.")
    except Exception as e:
        print(f"⚠️ Hermes initialization notice: {e}")

def check_database():
    print("[3/4] Initializing SQLite database...")
    try:
        import database
        database.init_db()
        print("✓ SQLite markova_data.db ready.")
    except Exception as e:
        print(f"⚠️ Database initialization notice: {e}")

def launch_streamlit():
    print("[4/4] Launching MARKOVA AI Streamlit interface...")
    app_path = BASE_DIR / "app.py"
    subprocess.run([
        sys.executable,
        "-m",
        "streamlit",
        "run",
        str(app_path),
        "--server.port=8501",
        "--server.headless=false"
    ])

if __name__ == "__main__":
    print("=" * 60)
    print("   MARKOVA AI — EXECUTIVE SYSTEM BOOTSTRAP")
    print("=" * 60)
    check_and_install_requirements()
    check_hermes_setup()
    check_database()
    launch_streamlit()
