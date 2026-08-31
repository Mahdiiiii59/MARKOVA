"""
MARKOVA AI — System Configuration
==================================
Private Executive Assistant Configuration for Nima Changizi (CEO of MARKOVA).
Cross-platform support for macOS (MLX) and Windows (Ollama).
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Project Info
APP_NAME = "MARKOVA AI"
CEO_NAME = "Nima Changizi"
BRAND_INDUSTRY = "Bespoke & Ready-to-Wear Luxury Menswear / Tailoring"

# Paths
BASE_DIR = Path(__file__).resolve().parent
WORKSPACE_DIR = BASE_DIR / "markova_workspace"
DB_PATH = BASE_DIR / "markova_data.db"
DOCUMENTS_DIR = BASE_DIR / "uploaded_documents"
MODEL_DIR = BASE_DIR / "Model"

# Ensure runtime directories exist
WORKSPACE_DIR.mkdir(exist_ok=True)
DOCUMENTS_DIR.mkdir(exist_ok=True)

# Initial Staff Roster
INITIAL_EMPLOYEES = {
    "Micheal": {"role": "Salesman", "dept": "Showroom Floor & Customer Fittings"},
    "Saeid": {"role": "Professional Salesman", "dept": "Bespoke Tailoring & VIP Corporate Accounts"},
    "Mostafa": {"role": "Salesman", "dept": "Retail Suits & Ready-to-Wear Sales"},
    "Asadi": {"role": "Accountant", "dept": "Financial Records, Fabrics Invoicing & Payroll"},
}

# ACTIVE INFERENCE ENGINE TOGGLE
# "mlx"    -> macOS Apple Silicon (via mlx_lm.server :8080)
# "ollama" -> Windows / Linux (via Ollama :11434)
ACTIVE_ENGINE = os.getenv("ACTIVE_ENGINE", "ollama").lower()

# Local Engine Endpoints & Models
MLX_SERVER_URL = "http://localhost:8080/v1"
MLX_MODEL_DIR = str(MODEL_DIR / "DeepSeek-R1-Distill-Qwen-8B-MLX")
MLX_SERVER_PORT = 8080

OLLAMA_SERVER_URL = "http://localhost:11434/v1"
OLLAMA_MODEL_NAME = os.getenv("OLLAMA_MODEL_NAME", "llama3.1:8b")

# API Keys & Cloud Endpoints (Loaded from .env)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GAPGPT_API_KEY = os.getenv("GAPGPT_API_KEY", "")
GAPGPT_BASE_URL = os.getenv("GAPGPT_BASE_URL", "https://api.gapgpt.com/v1")
GAPGPT_MODEL = os.getenv("GAPGPT_MODEL", "gapgpt-qwen-3.8")
GAPGPT_IMAGE_FAST_MODEL = os.getenv("GAPGPT_IMAGE_FAST_MODEL", "gapgpt/z-image")
GAPGPT_IMAGE_QUALITY_MODEL = os.getenv("GAPGPT_IMAGE_QUALITY_MODEL", "gpt-image-2")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
FAL_KEY = os.getenv("FAL_KEY", "")
CLOUDINARY_URL = os.getenv("CLOUDINARY_URL", "")

# Hermes Agent Persona Blueprint
SYSTEM_PERSONALITY = f"""# AGENTS.md — MARKOVA AI Core Identity

You are **MARKOVA AI**, the dedicated, high-intelligence executive AI chief of staff for **{CEO_NAME}**, CEO of **MARKOVA** (a premier luxury menswear and bespoke suit tailoring brand).

## Brand & Domain Knowledge:
- **MARKOVA** specializes in Italian & English wool suits (Super 130s–180s), bespoke hand-tailoring, VIP executive wardrobing, and premium ready-to-wear collections.
- Team members:
  * **Saeid** (Professional Salesman): Expert in high-ticket bespoke clients, custom measuring, VIP fabric recommendations (cashmere, silk blends), and high-volume corporate deals.
  * **Micheal** (Salesman): Showroom floor sales, fitting coordination, alterations turnaround, client relationship management.
  * **Mostafa** (Salesman): Daily retail customer conversions, accessories pairing, off-the-rack inventory movement.
  * **Asadi** (Accountant): Fabric yardage invoices, supplier payments (Italy/Turkey mills), commission tracking, operational expenses.

## Executive Directives:
1. Speak with concise, professional executive precision.
2. Maintain strict confidentiality.
3. Keep context scoped to the selected employee when requested.
4. When generating employee performance summaries, you MUST strictly adhere to the 8-point schema:
   - Role:
   - Recent updates:
   - Performance:
   - Project:
   - Salary:
   - Strengths:
   - Risks:
   - Recommended actions:
   (Use 'No data available' if information is missing; use 'None needed at this time' if no actions are required).
"""
