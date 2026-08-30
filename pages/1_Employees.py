"""
MARKOVA AI — Employees Page (1_Employees.py)
============================================
Management of employee profiles, fact logging into Hermes memory,
generating structured 8-part executive summaries, and reviewing summary history.
"""

import streamlit as st
import config
from database import (
    get_all_employees,
    get_employee_facts,
    add_employee_fact,
    delete_fact,
    save_employee_summary,
    get_employee_summaries,
    get_employee_by_id
)
from hermes_bridge import HermesBridge
from litellm_router import route_chat

st.set_page_config(
    page_title="MARKOVA AI — Personnel Intelligence",
    page_icon="👥",
    layout="wide"
)

# Custom Styling
st.markdown("""
<style>
    .stApp {
        background-color: #0c0a09;
        color: #f5f5f4;
    }
    .emp-header-card {
        background: linear-gradient(135deg, #1c1917 0%, #292524 100%);
        border: 1px solid #44403c;
        border-radius: 10px;
        padding: 18px 24px;
        margin-bottom: 20px;
    }
    .fact-pill {
        background: #1c1917;
        border-left: 3px solid #d97706;
        border-radius: 4px;
        padding: 8px 12px;
        margin-bottom: 8px;
    }
    .summary-box {
        background: #171717;
        border: 1px solid #404040;
        border-radius: 8px;
        padding: 16px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.88rem;
        white-space: pre-wrap;
    }
</style>
""", unsafe_allow_html=True)

# Hermes Bridge
@st.cache_resource
def get_hermes():
    return HermesBridge()

hermes = get_hermes()
hermes_online = hermes.is_available()

st.title("👥 Staff Intelligence & Executive Summaries")
st.caption(f"MARKOVA Menswear Personnel Operations &bull; Memory Managed via `{config.WORKSPACE_DIR.name}`")

employees = get_all_employees()
if not employees:
    st.warning("No employees registered in the database.")
    st.stop()

# Employee Tabs
tabs = st.tabs([f"👔 {e['name']} ({e['role']})" for e in employees])

for idx, emp in enumerate(employees):
    with tabs[idx]:
        emp_id = emp["id"]
        emp_name = emp["name"]
        emp_role = emp["role"]
        emp_dept = emp.get("dept", "Staff")

        # Header Info Card
        st.markdown(f"""
        <div class="emp-header-card">
            <div style="font-size: 1.4rem; font-weight: 700; color: #fbbf24;">{emp_name}</div>
            <div style="font-size: 1rem; color: #e7e5e4;">{emp_role} &bull; <span style="color: #a8a29e;">{emp_dept}</span></div>
        </div>
        """, unsafe_allow_html=True)

        col_facts, col_summary = st.columns([1, 1.2], gap="large")

        # ----------------- LEFT COLUMN: FACTS MANAGEMENT -----------------
        with col_facts:
            st.subheader("📝 Factual Knowledge Base")
            st.caption("Facts are synchronized with Hermes memory and SQLite storage.")

            # Add Fact Form
            with st.form(key=f"form_add_fact_{emp_id}"):
                fact_input = st.text_area(
                    "Add Note / Observed Fact:",
                    height=90,
                    placeholder=f"e.g., {emp_name} closed 3 bespoke cashmere coats with total value of $4,800."
                )
                category = st.selectbox(
                    "Category:",
                    options=["general", "performance", "client_fitting", "salary_commission", "attendance"],
                    key=f"cat_{emp_id}"
                )
                submit_fact = st.form_submit_button("➕ Commit Fact to Memory", use_container_width=True)

                if submit_fact and fact_input.strip():
                    # 1. Save to SQLite
                    add_employee_fact(emp_id, fact_input.strip(), category)
                    # 2. Feed to Hermes Memory
                    if hermes_online:
                        hermes.memorize_fact(emp_name, fact_input.strip())
                    st.success(f"Fact recorded for {emp_name}!")
                    st.rerun()

            # View Existing Facts
            facts = get_employee_facts(emp_id)
            st.write("")
            st.markdown(f"**Recorded Facts ({len(facts)})**")
            if facts:
                for f in facts:
                    c1, c2 = st.columns([5, 1])
                    with c1:
                        st.markdown(f"""
                        <div class="fact-pill">
                            <div style="font-size: 0.85rem; color: #f5f5f4;">{f['fact_text']}</div>
                            <div style="font-size: 0.7rem; color: #78716c; margin-top: 4px;">Category: {f['category']} &bull; {f['created_at']}</div>
                        </div>
                        """, unsafe_allow_html=True)
                    with c2:
                        if st.button("❌", key=f"del_fact_{f['id']}", help="Delete Fact"):
                            delete_fact(f['id'])
                            st.rerun()
            else:
                st.info("No recorded facts for this staff member yet.")

        # ----------------- RIGHT COLUMN: STRUCTURED SUMMARY GENERATION -----------------
        with col_summary:
            st.subheader("📊 Executive Summary Engine")
            st.caption("Generates structured intelligence following MARKOVA's 8-part executive protocol.")

            # Button to Generate Summary
            if st.button(f"⚡ Generate Intelligence Summary for {emp_name}", key=f"btn_gen_sum_{emp_id}", type="primary", use_container_width=True):
                with st.spinner(f"Analyzing all memory and facts for {emp_name}..."):
                    fact_texts = [f["fact_text"] for f in facts]
                    generated_summary = ""
                    model_label = "Hermes Agent"

                    if hermes_online:
                        generated_summary, model_label = hermes.generate_summary(emp_name, emp_role, fact_texts)

                    if not hermes_online or generated_summary.startswith("⚠️"):
                        prompt = f"""
Generate an executive intelligence summary for {emp_name} ({emp_role}, {emp_dept}) at MARKOVA.
Factual records:
{chr(10).join(['- ' + t for t in fact_texts]) if fact_texts else 'No specific logged notes.'}

Format STRICTLY according to:
Role:
Recent updates:
Performance:
Project:
Salary:
Strengths:
Risks:
Recommended actions:

(Use 'No data available' if data is missing; use 'None needed at this time' if no actions are required.)
"""
                        generated_summary, model_label = route_chat(
                            [{"role": "user", "content": prompt}],
                            employee_context={"name": emp_name, "role": emp_role, "dept": emp_dept}
                        )

                    # Save to Database History
                    save_employee_summary(emp_id, generated_summary, model_label)
                    st.success("Executive summary generated and saved to history!")
                    st.rerun()

            # Display Summary History
            st.write("")
            summaries = get_employee_summaries(emp_id)
            st.markdown(f"**Summary History Archives ({len(summaries)})**")

            if summaries:
                for idx_s, s in enumerate(summaries):
                    with st.expander(f"📑 Snapshot #{len(summaries) - idx_s} — {s['created_at']} ({s['model_used']})", expanded=(idx_s == 0)):
                        st.markdown(f'<div class="summary-box">{s["summary_text"]}</div>', unsafe_allow_html=True)
            else:
                st.info("No generated summaries yet. Click the button above to generate one.")
