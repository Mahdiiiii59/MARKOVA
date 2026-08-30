"""
RunsOnce / 05_preflight.py
Git safety check before push: ensures secrets, database, models, and workspace
are ignored and not staged.
"""

import subprocess
import sys

def preflight():
    print("=" * 60)
    print("   MARKOVA AI — GIT PREFLIGHT INTEGRITY CHECK")
    print("=" * 60)

    # Check git status
    res = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True)
    staged_or_untracked = res.stdout.splitlines()

    forbidden_prefixes = [".env", "markova_data.db", "markova_workspace", "Model", ".gguf", ".safetensors"]
    violations = []

    for line in staged_or_untracked:
        file_path = line[3:].strip()
        for forbidden in forbidden_prefixes:
            if forbidden in file_path and not file_path.endswith(".example") and not file_path.endswith(".gitignore"):
                violations.append(file_path)

    if violations:
        print("❌ STOP! The following sensitive or large files are tracked or unignored:")
        for v in violations:
            print(f"  • {v}")
        print("\nPlease update your .gitignore before committing.")
        sys.exit(1)
    else:
        print("✓ SAFE TO PUSH: No secrets, database binaries, or weights are leaking.")

if __name__ == "__main__":
    preflight()
