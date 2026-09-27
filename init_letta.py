import os
import sys
import time
import socket
from urllib.parse import urlparse
from dotenv import load_dotenv, set_key

env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=env_path)

LETTA_SERVER_URL = os.getenv("LETTA_SERVER_URL", "http://localhost:8283")

def wait_for_server(url, timeout=30):
    start_time = time.time()
    print(f"[*] Waiting for Letta server at {url} to become ready...")

    parsed = urlparse(url)
    host = parsed.hostname or "127.0.0.1"
    port = parsed.port or 8283

    while time.time() - start_time < timeout:
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(2)
            result = s.connect_ex((host, port))
            s.close()
            if result == 0:
                # Add a brief cushion for FastAPI route registration
                time.sleep(2)
                return True
        except Exception:
            pass
        time.sleep(1.5)
    return False

def setup_agent():
    # 25-30s timeout is realistic for Windows local server boot
    if not wait_for_server(LETTA_SERVER_URL, timeout=30):
        print("[!] Letta server did not respond in time. Ensure 'letta server' is running without errors.")
        sys.exit(1)

    from letta_client import Letta
    print(f"[*] Connecting to Letta server at {LETTA_SERVER_URL}...")

    try:
        client = Letta(base_url=LETTA_SERVER_URL)
    except Exception as e:
        print(f"[!] Failed to initialize Letta client: {e}")
        sys.exit(1)

    agent_name = "markova-agent"

    # Ensure explicit UTF-8 encoding for Persian text
    persona = "شما «مارا» هستید، مشاور هوشمند، صمیمی و وفادار نیما چنگیزی (مدیرعامل خانه مد مارکووا)."
    if os.path.exists("AGENTS.md"):
        try:
            with open("AGENTS.md", "r", encoding="utf-8") as f:
                persona = f.read()
        except Exception as e:
            print(f"[*] Error reading AGENTS.md: {e}. Using default persona.")

    # Check for existing agent
    try:
        response = client.agents.list()
        agents = response if isinstance(response, list) else getattr(response, 'data', response)
        for a in agents:
            a_name = getattr(a, 'name', None) or (a.get('name') if isinstance(a, dict) else None)
            if a_name == agent_name:
                agent_id = getattr(a, 'id', None) or (a.get('id') if isinstance(a, dict) else None)
                print(f"[*] Agent '{agent_name}' already exists with ID: {agent_id}")
                update_env(agent_id)
                return
    except Exception as e:
        print(f"[*] Querying agents: {e}. Proceeding to create...")

    print(f"[*] Creating new Letta agent '{agent_name}'...")
    try:
        model_name = os.getenv("GAPGPT_MODEL", "gpt-4o")
        if not model_name.startswith("openai/"):
            model_name = f"openai/{model_name}"

        # Clean SDK syntax without obsolete llm_config dictionary
        agent = client.agents.create(
            name=agent_name,
            model=model_name,
            embedding="openai/text-embedding-ada-002",
            memory_blocks=[
                {"label": "persona", "value": persona},
                {"label": "human", "value": "نام کاربر نیما است. او مدیرعامل خانه مد و دوخت سفارشی MARKOVA است."}
            ]
        )

        agent_id = getattr(agent, 'id', None) or (agent.get('id') if isinstance(agent, dict) else None)
        if not agent_id:
            print(f"[!] Could not determine Agent ID from response: {agent}")
            sys.exit(1)

        print(f"[+] Successfully created Agent ID: {agent_id}")
        update_env(agent_id)

    except Exception as e:
        print(f"[!] Failed to create agent: {e}")
        sys.exit(1)

def update_env(agent_id):
    if not os.path.exists(env_path):
        open(env_path, 'a').close()
    set_key(env_path, "LETTA_AGENT_ID", str(agent_id))
    print(f"[+] Updated .env with LETTA_AGENT_ID={agent_id}")

if __name__ == "__main__":
    setup_agent()