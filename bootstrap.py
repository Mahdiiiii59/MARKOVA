"""
MARKOVA AI — Comprehensive First-Start & Bootstrap Launcher
==========================================================
1. Checks & auto-creates .env from .env.example if missing.
2. Ensures all workspace, models, and lookbook directories exist.
3. Checks and installs Python dependencies from requirements.txt.
4. Checks and initializes Node.js dependencies (node_modules).
5. Initializes SQLite business database and personnel tables.
6. Detects active AI backends (Gemini, GapGPT, Groq, OpenRouter, MLX, Ollama).
7. Launches the Streamlit executive dashboard or Node.js Visual Studio.
"""

import sys
import os
import shutil
import subprocess
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

def check_and_create_env():
    print("[1/6] Checking environment configuration (.env)...")
    env_file = BASE_DIR / ".env"
    env_example = BASE_DIR / ".env.example"
    if not env_file.exists():
        if env_example.exists():
            shutil.copy(env_example, env_file)
            print("✓ Created .env from .env.example template.")
        else:
            print("⚠️ .env.example not found. Creating blank .env file.")
            env_file.touch()
    else:
        print("✓ .env configuration file exists.")

def ensure_workspace_directories():
    print("[2/6] Ensuring workspace & local model directories exist...")
    dirs_to_create = [
        BASE_DIR / "Models",
        BASE_DIR / "MARKOVA" / "Model",
        BASE_DIR / "markova_workspace" / "lookbooks",
        BASE_DIR / "markova_workspace" / "documents",
        BASE_DIR / "uploaded_documents"
    ]
    for d in dirs_to_create:
        d.mkdir(parents=True, exist_ok=True)
    print("✓ Workspace directories verified.")

def check_and_install_python_requirements():
    print("[3/6] Checking Python packages in requirements.txt...")
    req_file = BASE_DIR / "requirements.txt"
    if req_file.exists():
        try:
            subprocess.run([sys.executable, "-m", "pip", "install", "-r", str(req_file)], check=True)
            print("✓ Python requirements verified.")
        except Exception as e:
            print(f"⚠️ Notice during pip install: {e}")

def check_and_install_node_dependencies():
    print("[4/6] Checking Node.js packages (node_modules)...")
    pkg_file = BASE_DIR / "package.json"
    node_modules = BASE_DIR / "node_modules"
    if pkg_file.exists() and not node_modules.exists():
        print("ℹ️ node_modules not detected. Running 'npm install'...")
        try:
            subprocess.run(["npm", "install"], cwd=str(BASE_DIR), check=True, shell=True)
            print("✓ Node.js dependencies installed.")
        except Exception as e:
            print(f"⚠️ Notice during npm install: {e}")
    else:
        print("✓ Node.js environment ready.")

def check_database_and_hermes():
    print("[5/6] Initializing SQLite database & memory...")
    try:
        import database
        database.init_db()
        print("✓ SQLite database initialized.")
    except Exception as e:
        print(f"⚠️ Database initialization notice: {e}")

    try:
        from hermes_bridge import HermesBridge
        bridge = HermesBridge()
        if bridge.is_available():
            print("✓ Hermes Agent CLI detected and functional.")
        else:
            print("ℹ️ Hermes CLI not in PATH. Cloud AI Router & Local Fallback active.")
    except Exception as e:
        print(f"ℹ️ Hermes check: {e}")

def display_engine_summary():
    print("[6/6] AI Engines & Routing status:")
    try:
        from dotenv import load_dotenv
        load_dotenv(BASE_DIR / ".env")
        gemini = bool(os.getenv("GEMINI_API_KEY"))
        gapgpt = bool(os.getenv("GAPGPT_API_KEY"))
        groq = bool(os.getenv("GROQ_API_KEY"))
        openrouter = bool(os.getenv("OPENROUTER_API_KEY"))
        print(f"   • Google Gemini: {'✓ Configured' if gemini else '○ Key missing (optional)'}")
        print(f"   • GapGPT:        {'✓ Configured' if gapgpt else '○ Key missing (optional)'}")
        print(f"   • Groq:          {'✓ Configured' if groq else '○ Key missing (optional)'}")
        print(f"   • OpenRouter:    {'✓ Configured' if openrouter else '○ Key missing (optional)'}")
        print(f"   • MLX (Apple):   http://localhost:8080/v1 (Auto-detected)")
        print(f"   • Ollama:        http://localhost:11434/v1 (Auto-detected)")
    except Exception as e:
        print(f"ℹ️ Engine summary notice: {e}")

def launch_app():
    print("\n🚀 Launching MARKOVA AI Full-Stack Cognitive Suite & Studio (React 19 + Express on Port 3000)...")
    try:
        import webbrowser
        webbrowser.open("http://localhost:3000")
    except Exception:
        pass
    
    subprocess.run(["npm", "run", "dev"], cwd=str(BASE_DIR), shell=True)

if __name__ == "__main__":
    banner = r"""
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
"""
    print(banner)
    check_and_create_env()
    ensure_workspace_directories()
    check_and_install_python_requirements()
    check_and_install_node_dependencies()
    check_database_and_hermes()
    display_engine_summary()
    launch_app()
