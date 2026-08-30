import React, { useState, useEffect } from 'react';
import { Terminal, Copy, Check, Apple, Monitor, Database, Brain, Shield, RefreshCw, Cpu, Activity } from 'lucide-react';

export const SystemHub: React.FC = () => {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string>('app.py');
  const [systemLogs, setSystemLogs] = useState<string[]>([
    '[SYSTEM] Booting MARKOVA AI runtime (NEXURA AI Lab)...',
    '[HERMES] Initializing Hermes workspace bridge at /markova_workspace/AGENTS.md',
    '[MEMORY] Loaded 5 employee facts and 1 8-point summary records from markova_data.db',
    '[SALES ENGINE] Cached 168 showroom transactions (38.12 Billion Tomans recorded)',
    '[ROUTER] Primary AI: Gemini 2.0 Flash (Cloud) | Fallback 1: OpenRouter (Qwen 72B) | Fallback 2: Groq | Local: Ollama/MLX',
    '[SERVER] Ready and listening on port 3000'
  ]);

  const filesContent: Record<string, { label: string; path: string; desc: string; code: string }> = {
    'app.py': {
      label: 'app.py',
      path: '/app.py',
      desc: 'Streamlit entry point: Clean Executive chat directly conversing with CEO Nima Changizi.',
      code: `import streamlit as st
import config
from hermes_bridge import HermesBridge
from litellm_router import route_chat

st.set_page_config(page_title="MARKOVA AI — by NEXURA AI Lab", page_icon="👔", layout="centered")

st.markdown("### Good morning, Nima.")
# Executive Chat directly connects to Hermes + LiteLLM fallback
...`
    },
    'hermes_bridge.py': {
      label: 'hermes_bridge.py',
      path: '/hermes_bridge.py',
      desc: 'Subprocess wrapper for Hermes Agent CLI with isolated markova_workspace and fact memorization.',
      code: `import os, subprocess
from pathlib import Path
from config import WORKSPACE_DIR

class HermesBridge:
    def __init__(self, workspace_path: Path = WORKSPACE_DIR):
        self.workspace_path = Path(workspace_path).resolve()
        self.hermes_bin = self._find_hermes()

    def chat(self, user_message: str):
        # hermes -z "<msg>" --in markova_workspace
        result = subprocess.run(
            [self.hermes_bin, "-z", user_message, "--in", str(self.workspace_path)],
            capture_output=True,
            text=True
        )
        return result.stdout.strip()`
    },
    'litellm_router.py': {
      label: 'litellm_router.py',
      path: '/litellm_router.py',
      desc: 'Specialized model routing: Business Analytics model vs Chat model with multi-tier fallback.',
      code: `import os
from config import GEMINI_API_KEY, OPENROUTER_API_KEY, GROQ_API_KEY, OLLAMA_MODEL_NAME

# Specialized API definitions for different tasks
MODELS_BY_TASK = {
    "business_audit": "gemini/gemini-2.0-flash", # or specialized reasoning model
    "executive_chat": "gemini/gemini-2.0-flash",
    "fast_summary": "gemini/gemini-2.0-flash"
}

FALLBACK_PROVIDERS = [
    {"name": "Google Gemini 2.0 Flash", "model": "gemini/gemini-2.0-flash", "api_key_env": "GEMINI_API_KEY"},
    {"name": "OpenRouter (Qwen 2.5 72B)", "model": "openrouter/qwen/qwen-2.5-72b-instruct", "api_key_env": "OPENROUTER_API_KEY"},
    {"name": "Groq (Llama 3.1 70B)", "model": "groq/llama-3.1-70b-versatile", "api_key_env": "GROQ_API_KEY"},
    {"name": "Local Ollama Engine", "model": f"ollama/{OLLAMA_MODEL_NAME}"}
]`
    },
    'database.py': {
      label: 'database.py',
      path: '/database.py',
      desc: 'Minimal SQLite storage for employee facts, 8-part summaries, and business sales ledger.',
      code: `import sqlite3
from config import DB_PATH

def init_db():
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    # creates employees, facts, summaries, documents tables
    ...`
    },
    'config.py': {
      label: 'config.py',
      path: '/config.py',
      desc: 'System settings: CEO Name (Nima Changizi), local engines, and workspace directory.',
      code: `import os
from pathlib import Path

APP_NAME = "MARKOVA AI"
CREATED_BY = "NEXURA AI Lab"
CEO_NAME = "Nima Changizi"
ACTIVE_ENGINE = os.getenv("ACTIVE_ENGINE", "ollama").lower() # "mlx" or "ollama"`
    }
  };

  const handleCopy = (filename: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedFile(filename);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Header with NEXURA Lab Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-stone-100 tracking-tight">System Telemetry & Launchers</h2>
            <span className="text-[10px] bg-stone-900 border border-stone-800 text-stone-400 px-2 py-0.5 rounded font-mono">
              v2.4
            </span>
          </div>
          <p className="text-xs text-stone-400">
            Runtime architecture, live bridge logs, and local launchers created by <b className="text-stone-200">NEXURA AI Lab</b>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-mono text-emerald-400">All Engines Nominal</span>
        </div>
      </div>

      {/* Live System Logs Console */}
      <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-stone-800/80 pb-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-300">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>Live System & Hermes Bridge Telemetry</span>
          </div>
          <span className="text-[10px] text-stone-500 font-mono">Auto-Refreshing</span>
        </div>

        <div className="bg-stone-950 border border-stone-800/90 rounded-xl p-3.5 font-mono text-xs text-stone-300 space-y-1.5 max-h-48 overflow-y-auto">
          {systemLogs.map((log, index) => (
            <div key={index} className="leading-relaxed flex items-start gap-2">
              <span className="text-stone-600 select-none">{String(index + 1).padStart(2, '0')}</span>
              <span className={log.includes('HERMES') ? 'text-amber-400' : log.includes('ROUTER') ? 'text-sky-400' : log.includes('SALES') ? 'text-emerald-400' : 'text-stone-300'}>
                {log}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Cross-Platform Execution Guides */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Windows */}
        <div className="bg-stone-900/60 border border-stone-800/80 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-stone-100 font-bold text-xs">
            <Monitor className="w-4 h-4 text-amber-500" />
            <span>Windows Setup & Launcher (`Run_MARKOVA.bat`)</span>
          </div>
          <p className="text-xs text-stone-400">
            Runs Ollama on <code className="text-amber-400">localhost:11434</code> with llama3.1:8b and Hermes Agent CLI.
          </p>
          <div className="bg-stone-950 border border-stone-800 rounded-xl p-3 font-mono text-xs text-stone-300 space-y-1">
            <div className="text-stone-500">:: 1. Run in Command Prompt / Terminal</div>
            <div>pip install hermes-agent streamlit litellm</div>
            <div>ollama pull llama3.1:8b</div>
            <div>python bootstrap.py</div>
          </div>
        </div>

        {/* macOS */}
        <div className="bg-stone-900/60 border border-stone-800/80 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-stone-100 font-bold text-xs">
            <Apple className="w-4 h-4 text-amber-500" />
            <span>macOS Setup & Launcher (`Run_MARKOVA.command`)</span>
          </div>
          <p className="text-xs text-stone-400">
            Runs Apple Silicon MLX on <code className="text-amber-400">localhost:8080</code> for zero GPU latency.
          </p>
          <div className="bg-stone-950 border border-stone-800 rounded-xl p-3 font-mono text-xs text-stone-300 space-y-1">
            <div className="text-stone-500"># 1. Run in macOS Terminal</div>
            <div>pip3 install hermes-agent streamlit litellm mlx-lm</div>
            <div>python3 bootstrap.py</div>
          </div>
        </div>
      </div>

      {/* Script Code Inspector */}
      <div className="bg-stone-900/60 border border-stone-800/80 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800/80 pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {Object.keys(filesContent).map(fname => (
              <button
                key={fname}
                onClick={() => setSelectedFile(fname)}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  selectedFile === fname
                    ? 'bg-amber-600 text-stone-950 font-bold'
                    : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
                }`}
              >
                {fname}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleCopy(selectedFile, filesContent[selectedFile].code)}
            className="flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer self-start sm:self-auto"
          >
            {copiedFile === selectedFile ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Script</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-stone-400">
          {filesContent[selectedFile].desc}
        </p>

        <pre className="bg-stone-950 border border-stone-800/90 rounded-xl p-4 font-mono text-xs text-stone-300 overflow-x-auto max-h-72">
          <code>{filesContent[selectedFile].code}</code>
        </pre>
      </div>

      {/* Attribution Footer */}
      <div className="text-center text-xs text-stone-500 py-2">
        MARKOVA AI Executive Architecture &bull; Engineered by NEXURA AI Lab
      </div>
    </div>
  );
};
