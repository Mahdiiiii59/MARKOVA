import os
import sys
import time

try:
    import requests
except ImportError:
    os.system(f"{sys.executable} -m pip install requests")
    import requests

try:
    from dotenv import load_dotenv, set_key
except ImportError:
    os.system(f"{sys.executable} -m pip install python-dotenv")
    from dotenv import load_dotenv, set_key

# Ensure letta_client is installed
try:
    from letta_client import Letta
except ImportError:
    print("[!] letta-client is not installed. Installing now...")
    os.system(f"{sys.executable} -m pip install letta-client")
    from letta_client import Letta

env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=env_path)

LETTA_SERVER_URL = os.getenv("LETTA_SERVER_URL", "http://localhost:8283")

def wait_for_server(url, timeout=30):
    start_time = time.time()
    print(f"[*] Waiting for Letta server at {url} to become ready...")
    while time.time() - start_time < timeout:
        try:
            # simple socket connect to check if port is open
            import socket
            from urllib.parse import urlparse

            parsed = urlparse(url)
            host = parsed.hostname
            port = parsed.port or (443 if parsed.scheme == 'https' else 80)

            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(2)
            result = s.connect_ex((host, port))
            s.close()

            if result == 0:
                return True
        except Exception:
            pass
        time.sleep(2)
    return False

def setup_agent():
    # Wait for server to come online
    if not wait_for_server(LETTA_SERVER_URL, timeout=5):
        print(f"[!] Letta server did not become ready within the timeout. Please check if it's running.")
        sys.exit(1)

    print(f"[*] Connecting to Letta server at {LETTA_SERVER_URL}...")
    try:
        client = Letta(base_url=LETTA_SERVER_URL)
    except Exception as e:
        print(f"[!] Failed to initialize Letta client: {e}")
        sys.exit(1)


    agent_name = "markova-agent"

    # Read persona from AGENTS.md
    persona = "شما «مارا» هستید، مشاور هوشمند، صمیمی و وفادار نیما چنگیزی (مدیرعامل خانه مد مارکووا). شما دقیق، حامی و پرانرژی هستید."
    try:
        with open("AGENTS.md", "r") as f:
            persona = f.read()
    except Exception as e:
        print(f"[*] Could not read AGENTS.md for persona: {e}, using default.")


    # Check if agent already exists
    try:
        # Some Letta versions paginate or return a list directly
        response = client.agents.list()

        # Determine how to iterate based on the Letta API response structure
        agents = response if isinstance(response, list) else getattr(response, 'data', response)

        for a in agents:
            if getattr(a, 'name', None) == agent_name or (isinstance(a, dict) and a.get('name') == agent_name):
                agent_id = getattr(a, 'id', None) or (isinstance(a, dict) and a.get('id'))
                print(f"[*] Agent '{agent_name}' already exists with ID: {agent_id}")
                update_env(agent_id)
                return
    except Exception as e:
        print(f"[*] Could not fetch existing agents, proceeding to create: {e}")

    print(f"[*] Creating new Letta agent '{agent_name}'...")
    try:
        # Create the agent bypassing the CLI wizard
        # GapGPT uses standard OpenAI format: openai/<model-id>
# Configure the Letta Agent properly with the GapGPT details
        gapgpt_base_url = os.getenv("GAPGPT_BASE_URL", "https://api.gapgpt.com/v1")
        gapgpt_api_key = os.getenv("GAPGPT_API_KEY", "")

        # Determine the model from env, fallback to openai/gpt-4o if not specified
        model_name = os.getenv("GAPGPT_MODEL", "gpt-4o")
        if not model_name.startswith("openai/"):
            # Ensure it is prefixed with openai/ for Letta when using GapGPT
            model_name = "openai/" + model_name

        print(f"[*] Setting up agent with model: {model_name} at base URL: {gapgpt_base_url}")

        agent = client.agents.create(
            name=agent_name,
            model=model_name,
            embedding="openai/text-embedding-ada-002", # We need some default embedding model
            memory_blocks=[
                {"label": "persona", "value": persona},
                {"label": "human", "value": "نام کاربر نیما است. او مدیرعامل خانه مد و دوخت سفارشی MARKOVA است."}
            ],
            llm_config={
                "model_endpoint": gapgpt_base_url,
                "model_endpoint_type": "openai",
                "model_wrapper": None,
                "context_window": 8192,
                "model": model_name.replace("openai/", "") # Provide the bare model to the config
            }
        )

        agent_id = getattr(agent, 'id', None) or (isinstance(agent, dict) and agent.get('id'))
        if not agent_id:
            print(f"[!] Agent created but could not determine ID: {agent}")
            sys.exit(1)

        print(f"[+] Successfully created Agent ID: {agent_id}")
        update_env(agent_id)
    except Exception as e:
        print(f"[!] Failed to create agent: {e}")
        sys.exit(1)

def update_env(agent_id):
    print(f"[*] Updating .env file with LETTA_AGENT_ID={agent_id}")
    if not os.path.exists(env_path):
        open(env_path, 'a').close()

    set_key(env_path, "LETTA_AGENT_ID", agent_id)
    print(f"[+] .env updated successfully.")

if __name__ == "__main__":
    # If called with --wait-only, just wait for server and exit
    if len(sys.argv) > 1 and sys.argv[1] == "--wait-only":
        if wait_for_server(LETTA_SERVER_URL, timeout=10):
            sys.exit(0)
        else:
            sys.exit(1)

    setup_agent()
