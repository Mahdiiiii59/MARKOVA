"""
MARKOVA AI — LiteLLM Cloud Router & Fallback Pipeline
=====================================================
Multi-provider fallback cascade for MARKOVA AI:
1. Google Gemini (gemini-1.5-flash / gemini-2.0-flash)
2. OpenRouter Qwen (openrouter/qwen/qwen-2.5-72b-instruct)
3. Groq Llama (groq/llama-3.1-70b-versatile)
4. Local Ollama (ollama/llama3.1:8b)
"""

import os
import sys
import subprocess
from config import (
    GEMINI_API_KEY,
    OPENROUTER_API_KEY,
    GROQ_API_KEY,
    OLLAMA_MODEL_NAME,
    OLLAMA_SERVER_URL,
    SYSTEM_PERSONALITY
)

# Ordered fallback cascade
FALLBACK_PROVIDERS = [
    {
        "name": "Google Gemini 2.0 Flash",
        "model": "gemini/gemini-2.0-flash",
        "api_key_env": "GEMINI_API_KEY",
        "key_value": GEMINI_API_KEY,
    },
    {
        "name": "Google Gemini 1.5 Flash",
        "model": "gemini/gemini-1.5-flash",
        "api_key_env": "GEMINI_API_KEY",
        "key_value": GEMINI_API_KEY,
    },
    {
        "name": "OpenRouter (Qwen 2.5 72B)",
        "model": "openrouter/qwen/qwen-2.5-72b-instruct",
        "api_key_env": "OPENROUTER_API_KEY",
        "key_value": OPENROUTER_API_KEY,
    },
    {
        "name": "Groq (Llama 3.1 70B)",
        "model": "groq/llama-3.1-70b-versatile",
        "api_key_env": "GROQ_API_KEY",
        "key_value": GROQ_API_KEY,
    },
    {
        "name": "Local Ollama Engine",
        "model": f"ollama/{OLLAMA_MODEL_NAME}",
        "api_key_env": None,
        "key_value": "local",
        "api_base": OLLAMA_SERVER_URL,
    }
]

def ensure_litellm():
    """Ensures litellm package is available."""
    try:
        import litellm
        return litellm
    except ImportError:
        print("[LiteLLM Router] litellm not found. Installing...")
        try:
            subprocess.run([sys.executable, "-m", "pip", "install", "litellm"], check=True)
            import litellm
            return litellm
        except Exception as e:
            print(f"[LiteLLM Router] Auto-install failed: {e}")
            return None

def route_chat(messages: list, employee_context: dict = None) -> tuple[str, str]:
    """
    Tries each provider in ordered cascade.
    Returns (response_text, provider_name).
    """
    litellm = ensure_litellm()
    if not litellm:
        return "⚠️ LiteLLM is not installed and could not be loaded.", "Error"

    # Inject system personality if not in messages
    full_messages = []
    if not any(m.get("role") == "system" for m in messages):
        system_content = SYSTEM_PERSONALITY
        if employee_context:
            system_content += f"\n\nCURRENT EMPLOYEE FOCUS: {employee_context.get('name')} ({employee_context.get('role')})"
        full_messages.append({"role": "system", "content": system_content})

    full_messages.extend(messages)

    last_error = ""

    for provider in FALLBACK_PROVIDERS:
        # Check key availability
        if provider["api_key_env"] and not os.getenv(provider["api_key_env"]):
            continue

        try:
            kwargs = {
                "model": provider["model"],
                "messages": full_messages,
                "temperature": 0.3,
                "max_tokens": 1500,
            }
            if provider.get("api_base"):
                kwargs["api_base"] = provider["api_base"]

            response = litellm.completion(**kwargs)
            content = response.choices[0].message.content
            if content and content.strip():
                return content.strip(), provider["name"]

        except Exception as e:
            last_error = str(e)
            continue

    return f"⚠️ All AI fallback providers failed. Last error: {last_error}", "Fallback Exhausted"
