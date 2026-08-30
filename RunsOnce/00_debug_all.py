"""
RunsOnce / 00_debug_all.py
Master debugger: System -> Engine -> Hermes -> Workspace -> DB -> End-to-end.
"""

import sys
import os
from pathlib import Path

# Add parent directory to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

import config
import database
from hermes_bridge import HermesBridge
from litellm_router import route_chat

def run_diagnostics():
    print("=" * 60)
    print("   MARKOVA AI — MASTER SYSTEM DIAGNOSTICS")
    print("=" * 60)

    # 1. Environment & Config
    print("\n[1] Environment & Configuration:")
    print(f"  • Base Path: {config.BASE_DIR}")
    print(f"  • Active Engine: {config.ACTIVE_ENGINE}")
    print(f"  • Gemini Key Present: {'Yes' if bool(config.GEMINI_API_KEY) else 'No'}")
    print(f"  • OpenRouter Key Present: {'Yes' if bool(config.OPENROUTER_API_KEY) else 'No'}")
    print(f"  • Groq Key Present: {'Yes' if bool(config.GROQ_API_KEY) else 'No'}")

    # 2. Database
    print("\n[2] Database & Schema:")
    database.init_db()
    emps = database.get_all_employees()
    print(f"  • SQLite DB: {config.DB_PATH} (OK)")
    print(f"  • Registered Personnel: {[e['name'] for e in emps]}")

    # 3. Hermes Bridge
    print("\n[3] Hermes Agent Bridge:")
    bridge = HermesBridge()
    available = bridge.is_available()
    print(f"  • Hermes Binary Path: {bridge.hermes_bin}")
    print(f"  • Hermes Workspace: {bridge.workspace_path}")
    print(f"  • Hermes CLI Responsive: {'Yes (Green)' if available else 'No (Will use LiteLLM fallback)'}")

    # 4. Fallback Routing Test
    print("\n[4] Fallback Routing Test:")
    test_msg = [{"role": "user", "content": "Ping test for MARKOVA AI. Reply with 'MARKOVA AI Operational' and nothing else."}]
    try:
        reply, provider = route_chat(test_msg)
        print(f"  • Test Provider: {provider}")
        print(f"  • Response: {reply[:100]}...")
    except Exception as e:
        print(f"  ⚠️ Fallback Error: {e}")

    print("\n" + "=" * 60)
    print("   DIAGNOSTICS COMPLETE")
    print("=" * 60)

if __name__ == "__main__":
    run_diagnostics()
