"""
RunsOnce / 02_fetch_mlx_model.py
Download MLX-format model from Hugging Face for Mac Apple Silicon.
"""

import sys
import subprocess
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "Model"
MODEL_DIR.mkdir(exist_ok=True)

def fetch_model():
    print("[MLX Fetch] Downloading MLX-format 8B DeepSeek/Qwen model...")
    cmd = [
        sys.executable,
        "-m",
        "huggingface_hub",
        "download",
        "mlx-community/DeepSeek-R1-Distill-Qwen-8B-4bit",
        "--local-dir",
        str(MODEL_DIR / "DeepSeek-R1-Distill-Qwen-8B-MLX")
    ]
    try:
        subprocess.run(cmd, check=True)
        print("✓ MLX Model downloaded to Model/ directory.")
    except Exception as e:
        print(f"⚠️ Error downloading MLX model: {e}")

if __name__ == "__main__":
    fetch_model()
