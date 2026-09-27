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

## 🧠 Step 2: Configure Environment (One-Time Setup)

Letta acts as Mara's brain. You must configure your environment file so the app knows how to communicate with the Letta memory core and GapGPT.

1. Open the MARKOVA folder.
2. Locate the file named `.env.example`.
3. Rename it to `.env` (remove the `.example` part).
4. Open the `.env` file in any text editor (like Notepad or TextEdit).
5. Paste your private **GapGPT API key** inside the file (look for `GAPGPT_API_KEY=""`).
6. Save and close the file.

*(Note: The Letta Agent installation, GapGPT configuration, and `LETTA_AGENT_ID` setup are fully automated by the startup script!)*

---

## 🚀 Step 3: Launching MARKOVA (Daily Operation)

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
  The automatic agent setup failed to write the Agent ID to the `.env` file. You can check the terminal output for errors, or manually run `python init_letta.py` to diagnose. Ensure you did not name the file `.env.txt` by accident.
* **App says "ارتباط من با سرور مرکزی قطع شده است" (Connection to Letta failed)**:
  The background Letta server didn't start properly. Open a separate terminal, type `letta server --listen`, press Enter, and try chatting in the UI again.
* **Blank Screen / Doesn't Load**:
  Ensure Node.js is properly installed. Close the terminal window and double-click the launcher script again to force it to rebuild.
