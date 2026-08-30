"""
MARKOVA AI — Main Streamlit Application (Executive Chat)
========================================================
Private Executive Assistant for Nima Changizi (CEO of MARKOVA).
Primary Engine: Hermes Agent (CLI with isolated workspace memory)
Fallback Engine: LiteLLM Router (Gemini -> OpenRouter -> Groq -> Ollama)
"""

import streamlit as st
import config
from database import (
    get_all_employees,
    get_employee_facts,
    add_employee_fact,
    get_employee_by_name
)
from hermes_bridge import HermesBridge
from litellm_router import route_chat

# Page Configuration
st.set_page_config(
    page_title="MARKOVA AI — Executive Assistant",
    page_icon="👔",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize Session State
if "chat_history" not in st.session_state:
    st.session_state.chat_history = [
        {
            "role": "assistant",
            "content": (
                "Good day, Mr. Changizi. **MARKOVA AI** is online and connected to your private workspace memory.\n\n"
                "I am tracking your team (**Saeid**, **Micheal**, **Mostafa**, and **Asadi**), showroom operations, and document archives. "
                "How may I assist you with executive decisions today?"
            ),
            "source": "System Initialization"
        }
    ]

if "selected_emp_name" not in st.session_state:
    st.session_state.selected_emp_name = "All Team (General Context)"

# Initialize Hermes Bridge
@st.cache_resource
def get_hermes():
    return HermesBridge()

hermes = get_hermes()
hermes_online = hermes.is_available()

# ----------------- CUSTOM CSS -----------------
st.markdown("""
<style>
    /* Luxury Dark Palette */
    .stApp {
        background-color: #0c0a09;
        color: #f5f5f4;
        font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .brand-header {
        font-family: 'Cinzel', serif;
        letter-spacing: 0.15em;
        color: #d97706;
        text-transform: uppercase;
        font-size: 1.6rem;
        font-weight: 700;
        margin-bottom: 0.2rem;
    }
    .brand-sub {
        font-size: 0.82rem;
        color: #a8a29e;
        letter-spacing: 0.05em;
        margin-bottom: 1.2rem;
    }
    .employee-card {
        background: #1c1917;
        border: 1px solid #292524;
        border-radius: 8px;
        padding: 12px 14px;
        margin-bottom: 12px;
    }
    .context-badge {
        display: inline-block;
        font-size: 0.75rem;
        padding: 2px 8px;
        border-radius: 4px;
        background: #292524;
        color: #fbbf24;
        border: 1px solid #44403c;
    }
</style>
""", unsafe_allow_html=True)

# ----------------- SIDEBAR -----------------
with st.sidebar:
    st.markdown('<div class="brand-header">MARKOVA AI</div>', unsafe_allow_html=True)
    st.markdown(f'<div class="brand-sub">Executive Suite &bull; {config.CEO_NAME}</div>', unsafe_allow_html=True)

    # Engine Status
    status_color = "🟢" if hermes_online else "🟡"
    status_text = "Hermes Agent (Active)" if hermes_online else "LiteLLM Cloud Fallback (Active)"
    st.caption(f"**Inference Core:** {status_color} {status_text}")
    st.caption(f"**Engine Config:** `{config.ACTIVE_ENGINE.upper()}`")

    st.divider()

    # Employee Focus Selector
    st.subheader("👔 Staff Intelligence")
    employees = get_all_employees()
    emp_options = ["All Team (General Context)"] + [e["name"] for e in employees]

    selected_emp_name = st.selectbox(
        "Chat Context Focus:",
        options=emp_options,
        index=emp_options.index(st.session_state.selected_emp_name) if st.session_state.selected_emp_name in emp_options else 0
    )
    st.session_state.selected_emp_name = selected_emp_name

    # Selected Employee Profile Preview
    selected_emp = None
    if selected_emp_name != "All Team (General Context)":
        selected_emp = get_employee_by_name(selected_emp_name)
        if selected_emp:
            facts = get_employee_facts(selected_emp["id"])
            st.markdown(f"""
            <div class="employee-card">
                <div style="font-weight: 600; color: #fbbf24; font-size: 0.95rem;">{selected_emp['name']}</div>
                <div style="font-size: 0.8rem; color: #a8a29e;">{selected_emp['role']}</div>
                <div style="font-size: 0.75rem; color: #78716c; margin-top: 4px;">{selected_emp['dept']}</div>
                <hr style="border: 0; border-top: 1px solid #292524; margin: 8px 0;" />
                <div style="font-size: 0.75rem; color: #d6d3d1;"><b>Active Facts:</b> {len(facts)} on record</div>
            </div>
            """, unsafe_allow_html=True)

            # Quick Fact Adder in Sidebar
            with st.expander("➕ Log New Fact to Memory"):
                new_fact = st.text_area("Observation / Fact:", height=70, placeholder="e.g., Saeid closed a 4-tuxedo wedding party package.")
                if st.button("Commit to Memory", key="btn_quick_fact"):
                    if new_fact.strip():
                        add_employee_fact(selected_emp["id"], new_fact.strip())
                        if hermes_online:
                            hermes.memorize_fact(selected_emp["name"], new_fact.strip())
                        st.success("Fact committed to Hermes & database!")
                        st.rerun()

    st.divider()
    if st.button("🗑️ Clear Chat History", use_container_width=True):
        st.session_state.chat_history = []
        st.rerun()

# ----------------- MAIN CHAT AREA -----------------
st.title("Executive Intelligence Feed")

# Context Indicator Bar
active_ctx_label = st.session_state.selected_emp_name
st.markdown(
    f"Active Scoped Context: <span class='context-badge'>🎯 {active_ctx_label}</span> &nbsp;&bull;&nbsp; "
    f"Memory Isolation: <span class='context-badge'>🔒 `markova_workspace`</span>",
    unsafe_allow_html=True
)

st.write("")

# Render Messages
for msg in st.session_state.chat_history:
    with st.chat_message(msg["role"], avatar="👔" if msg["role"] == "user" else "⚡"):
        st.markdown(msg["content"])
        if "source" in msg and msg["source"]:
            st.caption(f"🧠 *Source: {msg['source']}*")

# Chat Input
if prompt := st.chat_input("Ask about team performance, showroom operations, or log instructions..."):
    # Append User Message
    st.session_state.chat_history.append({
        "role": "user",
        "content": prompt,
        "source": None
    })

    with st.chat_message("user", avatar="👔"):
        st.markdown(prompt)

    # Generate Response
    with st.chat_message("assistant", avatar="⚡"):
        with st.spinner("Analyzing executive context..."):
            emp_ctx = selected_emp if selected_emp else None
            response_text = ""
            source_label = ""

            # 1. Try Hermes Primary
            if hermes_online:
                response_text, source_label = hermes.chat(prompt, employee_context=emp_ctx)

            # 2. If Hermes Failed or is Unavailable, trigger LiteLLM Fallback Router
            if not hermes_online or response_text.startswith("⚠️"):
                # Prepare message array
                history_for_llm = [
                    {"role": m["role"], "content": m["content"]}
                    for m in st.session_state.chat_history[-6:]
                ]
                response_text, source_label = route_chat(history_for_llm, employee_context=emp_ctx)

            st.markdown(response_text)
            st.caption(f"🧠 *Source: {source_label}*")

            # Save to session history
            st.session_state.chat_history.append({
                "role": "assistant",
                "content": response_text,
                "source": source_label
            })
