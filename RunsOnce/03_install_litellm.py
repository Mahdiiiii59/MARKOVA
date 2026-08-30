"""
RunsOnce / 03_install_litellm.py
Installs LiteLLM for cloud model routing.
"""

import sys
import subprocess

def install_litellm():
    print("[LiteLLM Installer] Installing litellm package...")
    subprocess.run([sys.executable, "-m", "pip", "install", "litellm", "google-generativeai"], check=True)
    print("✓ LiteLLM ready.")

if __name__ == "__main__":
    install_litellm()
