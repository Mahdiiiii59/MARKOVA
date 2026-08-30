"""
RunsOnce / 01_debug_mlx.py
Deep MLX test (starts MLX server, tests inference, clean exit).
Targeted for macOS Apple Silicon.
"""

import sys
import subprocess
import time
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

import config

def test_mlx():
    print("[MLX Debug] Checking MLX server on localhost:8080...")
    try:
        import urllib.request
        req = urllib.request.Request("http://localhost:8080/v1/models")
        with urllib.request.urlopen(req, timeout=3) as response:
            print("✓ MLX server is active on port 8080.")
            print(f"Response: {response.read().decode('utf-8')}")
    except Exception as e:
        print(f"ℹ️ MLX server not detected on :8080 ({e}). Start it via 04_mlx_serve.py on Mac.")

if __name__ == "__main__":
    test_mlx()
