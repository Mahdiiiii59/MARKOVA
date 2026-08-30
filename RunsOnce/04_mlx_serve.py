"""
RunsOnce / 04_mlx_serve.py
Start persistent MLX server on :8080 (Mac).
"""

import sys
import subprocess
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))
import config

def start_mlx_server():
    print(f"[MLX Server] Launching MLX server on port {config.MLX_SERVER_PORT}...")
    cmd = [
        sys.executable,
        "-m",
        "mlx_lm.server",
        "--model",
        config.MLX_MODEL_DIR,
        "--port",
        str(config.MLX_SERVER_PORT)
    ]
    subprocess.run(cmd)

if __name__ == "__main__":
    start_mlx_server()
