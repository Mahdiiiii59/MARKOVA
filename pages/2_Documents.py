"""
MARKOVA AI — Documents Page (2_Documents.py)
============================================
Document upload with drag & drop, employee/topic assignment, text extraction,
statistical analysis & charts, and document-specific AI interrogation.
"""

import os
import shutil
import streamlit as st
import pandas as pd
import altair as alt
from pathlib import Path
import config
from database import (
    get_all_employees,
    add_document,
    get_all_documents,
    get_document_by_id,
    delete_document,
    update_document_summary
)
from hermes_bridge import HermesBridge
from litellm_router import route_chat

st.set_page_config(
    page_title="MARKOVA AI — Documents & Intelligence",
    page_icon="📄",
    layout="wide"
)

# Custom Styling
st.markdown("""
<style>
    .stApp {
        background-color: #0c0a09;
        color: #f5f5f4;
    }
    .doc-card {
        background: #1c1917;
        border: 1px solid #292524;
        border-radius: 8px;
        padding: 14px;
        margin-bottom: 12px;
    }
</style>
""", unsafe_allow_html=True)

# Helper function to extract text from files
def extract_text(file_path: Path, file_type: str) -> str:
    try:
        if file_type in [".txt", ".md", ".csv", ".json", ".log"]:
            with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                return f.read()
        elif file_type == ".pdf":
            try:
                import pypdf
                reader = pypdf.PdfReader(str(file_path))
                text = ""
                for page in reader.pages:
                    text += page.extract_text() or ""
                return text
            except Exception as e:
                return f"[PDF parsing fallback: Could not extract full text - {e}]"
        else:
            with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                return f.read()
    except Exception as e:
        return f"[Text extraction error: {e}]"

st.title("📄 Document Intelligence & Analysis")
st.caption("Upload sales reports, fabric invoices, fitting logs, and ask AI detailed analytical questions.")

tab_upload, tab_manage, tab_query = st.tabs(["📤 Upload & Extract", "🗄️ Document Library", "💬 Ask Document"])

employees = get_all_employees()
emp_map = {e["name"]: e["id"] for e in employees}

# ----------------- TAB 1: UPLOAD & EXTRACT -----------------
with tab_upload:
    st.subheader("Upload Executive Document")
    uploaded_file = st.file_uploader(
        "Drag and drop files here (PDF, TXT, CSV, JSON, MD):",
        type=["pdf", "txt", "csv", "json", "md"],
        help="Assign documents to specific sales staff or accounting topics for scoped context."
    )

    c1, c2 = st.columns(2)
    with c1:
        assign_emp = st.selectbox(
            "Assign to Employee (Optional):",
            options=["None (General Company Archive)"] + list(emp_map.keys())
        )
    with c2:
        topic = st.selectbox(
            "Business Topic Category:",
            options=[
                "General Showroom",
                "Bespoke Client Fitting",
                "Fabric Supplier Invoice",
                "Monthly Sales Ledger",
                "Tailoring Alteration",
                "Operational Overhead"
            ]
        )

    if uploaded_file is not None:
        if st.button("🚀 Process & Extract Text", type="primary", use_container_width=True):
            file_ext = Path(uploaded_file.name).suffix.lower()
            save_path = config.DOCUMENTS_DIR / uploaded_file.name

            # Save file to disk
            with open(save_path, "wb") as f:
                f.write(uploaded_file.getbuffer())

            # Extract Text
            extracted = extract_text(save_path, file_ext)
            emp_id_val = emp_map.get(assign_emp) if assign_emp in emp_map else None

            # Add to Database
            doc_id = add_document(
                filename=uploaded_file.name,
                filepath=str(save_path),
                file_type=file_ext,
                file_size=uploaded_file.size,
                employee_id=emp_id_val,
                topic=topic,
                extracted_text=extracted
            )

            st.success(f"Document `{uploaded_file.name}` uploaded and indexed successfully!")
            st.rerun()

# ----------------- TAB 2: DOCUMENT LIBRARY -----------------
with tab_manage:
    st.subheader("Indexed Documents Archive")
    docs = get_all_documents()

    if not docs:
        st.info("No documents uploaded yet. Use the Upload tab to add files.")
    else:
        for doc in docs:
            with st.expander(f"📁 {doc['filename']} &bull; Topic: {doc['topic']} &bull; Assigned: {doc['employee_name'] or 'General'}"):
                c_info, c_stats = st.columns([1, 1])
                with c_info:
                    st.write(f"**Uploaded:** {doc['upload_date']}")
                    st.write(f"**File Size:** {round(doc['file_size'] / 1024, 2)} KB")
                    st.write(f"**Format:** `{doc['file_type']}`")

                    if st.button("🗑️ Remove Document", key=f"del_doc_{doc['id']}"):
                        delete_document(doc['id'])
                        try:
                            if os.path.exists(doc['filepath']):
                                os.remove(doc['filepath'])
                        except Exception:
                            pass
                        st.rerun()

                with c_stats:
                    # Simple text stats & visual chart
                    text_sample = doc['extracted_text'] or ""
                    words = text_sample.split()
                    char_count = len(text_sample)
                    word_count = len(words)

                    st.markdown(f"**Word Count:** `{word_count}` | **Characters:** `{char_count}`")

                    if word_count > 10:
                        # Top frequent words chart (excluding trivial stop words)
                        stop_words = {"the", "and", "a", "to", "of", "in", "is", "for", "on", "with", "as", "by", "at", "it", "this", "that"}
                        clean_words = [w.lower().strip(".,!?:;\"'()") for w in words if len(w) > 3 and w.lower() not in stop_words]
                        word_freq = pd.Series(clean_words).value_counts().head(8).reset_index()
                        word_freq.columns = ["Keyword", "Frequency"]

                        if not word_freq.empty:
                            chart = alt.Chart(word_freq).mark_bar(color="#d97706").encode(
                                x=alt.X("Frequency:Q", title="Occurrences"),
                                y=alt.Y("Keyword:N", sort="-x", title="Key Terms")
                            ).properties(height=180)
                            st.altair_chart(chart, use_container_width=True)

                st.divider()
                st.markdown("**Extracted Text Content:**")
                st.text_area("Content", value=doc['extracted_text'], height=160, key=f"txt_{doc['id']}", disabled=True)

# ----------------- TAB 3: ASK DOCUMENT -----------------
with tab_query:
    st.subheader("💬 Document Interrogation (Q&A)")
    docs = get_all_documents()
    if not docs:
        st.info("Upload at least one document first to ask questions.")
    else:
        doc_titles = [f"#{d['id']} - {d['filename']} ({d['topic']})" for d in docs]
        selected_doc_str = st.selectbox("Select Target Document:", options=doc_titles)
        selected_doc_id = int(selected_doc_str.split(" - ")[0].replace("#", ""))
        doc_record = get_document_by_id(selected_doc_id)

        if doc_record:
            st.caption(f"Querying document context for `{doc_record['filename']}`")

            doc_query = st.text_input(
                "Ask a question about this document:",
                placeholder="e.g. What are the key fabric prices listed, or what were Saeid's sales numbers?"
            )

            if st.button("🔍 Interrogate Document", type="primary"):
                if doc_query.strip():
                    with st.spinner("Analyzing document contents with AI..."):
                        context_payload = (
                            f"[DOCUMENT METADATA: {doc_record['filename']}, Topic: {doc_record['topic']}]\n"
                            f"[DOCUMENT CONTENT]:\n{doc_record['extracted_text'][:4000]}\n\n"
                            f"QUESTION: {doc_query.strip()}\n"
                            f"Provide a clear, executive-grade answer based strictly on the document text."
                        )

                        response, provider = route_chat([{"role": "user", "content": context_payload}])
                        st.markdown("### Analysis Result")
                        st.markdown(response)
                        st.caption(f"🧠 *Inference Provider: {provider}*")
