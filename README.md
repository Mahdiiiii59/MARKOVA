# MARKOVA AI — Executive Assistant System

**Private Executive AI Chief of Staff for Nima Changizi (CEO of MARKOVA).**

MARKOVA AI delivers luxury menswear personnel management, document analysis, and strategic intelligence powered by the **Hermes Agent** memory layer with an automated multi-provider fallback router.

---

## 🏛️ Architecture & Workflow

```
Executive UI (Streamlit / Web Applet)
       │
       ├──► Primary Brain: Hermes Agent CLI (hermes -z "..." --in markova_workspace)
       │      ├── Workspace Context: AGENTS.md (Brand identity & staff directives)
       │      ├── Memory Engine: Hermes persistent workspace memory
       │      └── Local Engine: Ollama (:11434 on Win) / MLX (:8080 on Mac)
       │
       ├──► Fallback Brain: LiteLLM Router
       │      └── Gemini ──► OpenRouter (Qwen) ──► Groq (Llama 3.1) ──► Ollama (Local)
       │
       └──► Structured Storage: SQLite (markova_data.db)
              ├── employees (Micheal, Saeid, Mostafa, Asadi)
              ├── summaries (8-part structured executive reviews with timestamp history)
              └── documents (Uploaded sales reports, fabric invoices, fitting sheets)
```

---

## 🚀 Quick Launch

### Windows
- Double-click **`Run_MARKOVA.bat`** (displays the NEXURA AI Lab banner, checks environment, and launches the full-stack React 19 + Express application at `http://localhost:3000`).

### macOS / Linux
- Double-click **`Run_MARKOVA.command`** (or execute `./Run_MARKOVA.command` in terminal).

### Manual CLI
```bash
npm run dev
# or: python bootstrap.py
```

---

## 👔 Personnel Overview (Context Subjects)
- **Saeid**: Professional Salesman (Bespoke Tailoring & VIP Corporate Accounts).
- **Micheal**: Salesman (Showroom Floor & Customer Fittings).
- **Mostafa**: Salesman (Retail Suits & Ready-to-Wear Collections).
- **Asadi**: Accountant (Fabric Mill Invoices, Payroll & Financial Audits).

---

## 📊 Structured Executive Summary Schema
When generating an employee review, MARKOVA AI formats output using the strict 8-point schema:
```text
Role:
Recent updates:
Performance:
Project:
Salary:
Strengths:
Risks:
Recommended actions:
```
