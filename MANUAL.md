# MARKOVA AI - Setup & Operations Manual

This guide explains how to install, configure, and launch the MARKOVA Executive Cognitive Suite on both Windows and macOS/Linux.

The MARKOVA UI serves as the front-end, while **Letta (MemGPT)** acts as the cognitive memory core running in the background. The intelligence is powered by **GapGPT**.

---

## 🛑 Step 1: Install Prerequisites (One-Time Setup)

Before you begin, ensure your computer has the necessary tools installed.

### 1. Install Node.js (For the UI)
* Go to [https://nodejs.org/](https://nodejs.org/)
* Download and install the **LTS (Long Term Support)** version.
* Keep all installation settings as default.

### 2. Install Python (For the Letta AI Engine)
* **Windows**: Go to [https://www.python.org/downloads/](https://www.python.org/downloads/) and install Python. **Crucial**: Make sure to check the box that says **"Add Python to PATH"** at the bottom of the installer window before clicking install.
* **macOS**: Python is usually installed, but it's recommended to install the latest version via Homebrew (`brew install python`) or by downloading it from the Python website.

---

## 🧠 Step 2: Install and Configure Letta & GapGPT (One-Time Setup)

Letta acts as Mara's brain. You must install and configure it to use the GapGPT API.

1. Open your Terminal (macOS) or Command Prompt (Windows).
2. Install Letta by running:
   ```bash
   pip install letta
   ```
3. Run the Letta setup wizard:
   ```bash
   letta setup
   ```
4. **Configure Letta for GapGPT**:
   * **LLM Provider**: Choose `openai` (GapGPT uses OpenAI's API format).
   * **Base URL**: Enter `https://api.gapgpt.com/v1`
   * **API Key**: Paste your private GapGPT API key here. Letta will encrypt and store it securely.
   * **Model Name**: Type `claude-3-5-sonnet` (or the specific model you wish to use).

5. **Create the "Mara" Agent**:
   * Still in the terminal, create the agent by running:
     ```bash
     letta --new-agent
     ```
   * **Name**: Type `Mara`.
   * **Persona/System Prompt**: Open the `AGENTS.md` file located in your MARKOVA folder. Copy all the text inside it (which describes Mara's warm, Farsi-speaking INFP personality and business logic) and paste it into the wizard.
   * **IMPORTANT**: When the agent is created, Letta will give you an **Agent ID** (e.g., `agent-12345-abcde`). **Copy this ID**.

---

## ⚙️ Step 3: Link Letta to the MARKOVA App (One-Time Setup)

1. Open the MARKOVA folder.
2. Locate the file named `.env.example`.
3. Rename it to `.env` (remove the `.example` part).
4. Open the `.env` file in any text editor (like Notepad or TextEdit).
5. Add your Letta Agent ID so it looks exactly like this:
   ```text
   LETTA_AGENT_ID=paste-your-agent-id-here
   ```
6. Save and close the file.

---

## 🚀 Step 4: Launching MARKOVA (Daily Operation)

You are now ready to use the app. From now on, you only need to execute one click.

### For Windows Users
1. Open the MARKOVA folder.
2. Double-click the file named **`Run_MARKOVA.bat`**.
   * *What it does*: A terminal window will open. It will automatically check for updates, boot the Letta memory core silently in the background, start the MARKOVA web server, and open `http://localhost:3000` in your web browser.
   * Do not close the black terminal window while using the app.

### For macOS / Linux Users
1. Open the MARKOVA folder in Finder.
2. Double-click the file named **`Run_MARKOVA.command`**.
   * *(Note: If macOS prevents it from running the first time, right-click the file, select "Open", and confirm. Alternatively, open Terminal, drag the file into it, and press Enter).*
   * *What it does*: It automatically updates the app, boots the Letta server in the background, launches the MARKOVA UI, and opens Safari/Chrome to `http://localhost:3000`.
   * Keep the Terminal window open while working.

---

## ❓ Troubleshooting

* **App says "برای اتصال به من لطفا LETTA_AGENT_ID را تنظیم کنید" (Please set LETTA_AGENT_ID)**:
  You forgot to paste your Agent ID into the `.env` file, or you named the file `.env.txt` by accident.
* **App says "ارتباط من با سرور مرکزی قطع شده است" (Connection to Letta failed)**:
  The background Letta server didn't start properly. Open a separate terminal, type `letta server --listen`, press Enter, and try chatting in the UI again.
* **Blank Screen / Doesn't Load**:
  Ensure Node.js is properly installed. Close the terminal window and double-click the launcher script again to force it to rebuild.
