"""
RunsOnce / setup_ollama.py
Build or pull local model for Ollama (Windows / Linux).
"""

import sys
import subprocess
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))
import config

def setup_ollama():
    print(f"[Ollama Setup] Pulling or verifying model: {config.OLLAMA_MODEL_NAME}...")
    try:
        subprocess.run(["ollama", "pull", config.OLLAMA_MODEL_NAME], check=True)
        print(f"✓ Model {config.OLLAMA_MODEL_NAME} is ready in Ollama.")
    except Exception as e:
        print(f"⚠️ Notice during Ollama model setup: {e}")
        print("Ensure Ollama is installed and running on your system (ollama serve).")

if __name__ == "__main__":
    setup_ollama()
