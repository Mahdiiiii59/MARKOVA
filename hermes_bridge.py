"""
MARKOVA AI — Hermes Agent Bridge
================================
Subprocess wrapper for NousResearch Hermes Agent CLI.
Handles workspace isolation (--in markova_workspace), memory persistence,
and structured executive prompt execution.
"""

import os
import shutil
import subprocess
from pathlib import Path
from config import WORKSPACE_DIR, SYSTEM_PERSONALITY, BASE_DIR

class HermesBridge:
    def __init__(self, workspace_path: Path = WORKSPACE_DIR):
        self.workspace_path = Path(workspace_path).resolve()
        self.workspace_path.mkdir(exist_ok=True)
        self.hermes_bin = self._find_hermes()
        self.setup_workspace()

    def _find_hermes(self) -> str:
        """Locates hermes binary in system PATH or platform-specific default directories."""
        # Check standard PATH
        path_bin = shutil.which("hermes")
        if path_bin:
            return path_bin

        # Windows AppData / Python Scripts fallbacks
        if os.name == "nt":
            appdata = os.environ.get("APPDATA", "")
            localappdata = os.environ.get("LOCALAPPDATA", "")
            possible_paths = [
                Path(localappdata) / "Programs" / "Python" / "Python311" / "Scripts" / "hermes.exe",
                Path(localappdata) / "Programs" / "Python" / "Python312" / "Scripts" / "hermes.exe",
                Path(appdata) / "Python" / "Python311" / "Scripts" / "hermes.exe",
                Path(appdata) / "Python" / "Python312" / "Scripts" / "hermes.exe",
                Path.home() / "AppData" / "Roaming" / "Python" / "Scripts" / "hermes.exe",
            ]
            for p in possible_paths:
                if p.exists():
                    return str(p)
        else:
            # macOS / Linux fallbacks
            possible_paths = [
                Path.home() / ".local" / "bin" / "hermes",
                Path("/usr/local/bin/hermes"),
                Path("/opt/homebrew/bin/hermes"),
            ]
            for p in possible_paths:
                if p.exists():
                    return str(p)

        return "hermes"  # default invocation name

    def setup_workspace(self, custom_personality: str = None):
        """Ensures AGENTS.md is present in the workspace for Hermes auto-injection."""
        agents_file = self.workspace_path / "AGENTS.md"
        content = custom_personality or SYSTEM_PERSONALITY
        with open(agents_file, "w", encoding="utf-8") as f:
            f.write(content)

    def is_available(self) -> bool:
        """Checks if Hermes CLI is runnable and responsive."""
        try:
            result = subprocess.run(
                [self.hermes_bin, "--version"],
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                timeout=5
            )
            return result.returncode == 0
        except Exception:
            return False

    def chat(self, user_message: str, employee_context: dict = None) -> tuple[str, str]:
        """
        Executes a prompt through Hermes Agent with workspace isolation.
        Returns (response_text, provider_label).
        """
        # Inject employee context header if provided
        prompt = user_message
        if employee_context:
            context_header = (
                f"[SYSTEM CONTEXT: Active focus is on employee {employee_context.get('name')} "
                f"({employee_context.get('role', 'Staff')}, Dept: {employee_context.get('dept', '')})]\n\n"
            )
            prompt = context_header + user_message

        try:
            cmd = [
                self.hermes_bin,
                "-z",
                prompt,
                "--in",
                str(self.workspace_path)
            ]

            process = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                timeout=60
            )

            if process.returncode == 0 and process.stdout.strip():
                return process.stdout.strip(), "Hermes Agent (Workspace Memory)"
            else:
                err_msg = process.stderr.strip() or "Hermes returned empty response or non-zero exit code."
                return f"⚠️ Hermes Error: {err_msg}", "Hermes (Failed)"

        except FileNotFoundError:
            return "⚠️ Hermes CLI not found in environment PATH.", "Hermes (Unavailable)"
        except subprocess.TimeoutExpired:
            return "⚠️ Hermes request timed out after 60 seconds.", "Hermes (Timeout)"
        except Exception as e:
            return f"⚠️ Hermes execution error: {str(e)}", "Hermes (Error)"

    def memorize_fact(self, employee_name: str, fact: str) -> tuple[str, bool]:
        """Directly sends a memorization instruction to Hermes memory."""
        prompt = (
            f"Please memorize this verified fact about employee {employee_name} for future executive reference: "
            f"'{fact}'. Acknowledge that this knowledge has been committed to MARKOVA workspace memory."
        )
        response, provider = self.chat(prompt)
        success = not response.startswith("⚠️")
        return response, success

    def generate_summary(self, employee_name: str, role: str, facts: list[str]) -> tuple[str, str]:
        """Generates the formal 8-part executive summary."""
        facts_block = "\n".join([f"- {f}" for f in facts]) if facts else "No specific recent facts logged."
        prompt = f"""
Generate an executive intelligence summary for {employee_name} ({role}) at MARKOVA.
Here are the recent factual updates on record:
{facts_block}

You MUST format the summary EXACTLY using this structured template:
Role:
Recent updates:
Performance:
Project:
Salary:
Strengths:
Risks:
Recommended actions:

(Rules: Use 'No data available' for any section without information; state 'None needed at this time' for Recommended actions if no immediate intervention is required.)
"""
        return self.chat(prompt)
