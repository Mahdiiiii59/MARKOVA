"""
MARKOVA AI — SQLite Database Layer
==================================
Thread-safe SQLite CRUD operations for employees, structured summaries,
facts, and document metadata.
"""

import sqlite3
import datetime
from pathlib import Path
from config import DB_PATH, INITIAL_EMPLOYEES

def get_conn():
    """Returns a thread-safe connection to the SQLite database."""
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes tables and seeds initial employees if empty."""
    conn = get_conn()
    cursor = conn.cursor()

    # Employees Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL,
        dept TEXT DEFAULT '',
        notes TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Facts Table (Quick-access facts cached alongside Hermes memory)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS facts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        fact_text TEXT NOT NULL,
        category TEXT DEFAULT 'general',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    )
    """)

    # Summaries Table (History of generated executive summaries)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS summaries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        summary_text TEXT NOT NULL,
        model_used TEXT DEFAULT 'Hermes-Agent',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    )
    """)

    # Documents Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        filepath TEXT NOT NULL,
        file_type TEXT NOT NULL,
        file_size INTEGER DEFAULT 0,
        employee_id INTEGER,
        topic TEXT DEFAULT 'General',
        extracted_text TEXT DEFAULT '',
        summary_notes TEXT DEFAULT '',
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
    )
    """)

    conn.commit()

    # Seed Initial Employees if table is empty
    cursor.execute("SELECT COUNT(*) FROM employees")
    if cursor.fetchone()[0] == 0:
        for name, info in INITIAL_EMPLOYEES.items():
            cursor.execute(
                "INSERT INTO employees (name, role, dept) VALUES (?, ?, ?)",
                (name, info["role"], info.get("dept", ""))
            )
        conn.commit()

    conn.close()

# ==================== EMPLOYEE CRUD ====================

def get_all_employees():
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM employees ORDER BY id ASC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_employee_by_name(name: str):
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM employees WHERE name = ?", (name,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_employee_by_id(emp_id: int):
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM employees WHERE id = ?", (emp_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

# ==================== FACTS CRUD ====================

def add_employee_fact(employee_id: int, fact_text: str, category: str = "general"):
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO facts (employee_id, fact_text, category) VALUES (?, ?, ?)",
        (employee_id, fact_text.strip(), category)
    )
    conn.commit()
    fact_id = cursor.lastrowid
    conn.close()
    return fact_id

def get_employee_facts(employee_id: int):
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM facts WHERE employee_id = ? ORDER BY created_at DESC",
        (employee_id,)
    )
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def delete_fact(fact_id: int):
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM facts WHERE id = ?", (fact_id,))
    conn.commit()
    conn.close()

# ==================== SUMMARIES CRUD ====================

def save_employee_summary(employee_id: int, summary_text: str, model_used: str = "Hermes-Agent"):
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO summaries (employee_id, summary_text, model_used) VALUES (?, ?, ?)",
        (employee_id, summary_text, model_used)
    )
    conn.commit()
    summary_id = cursor.lastrowid
    conn.close()
    return summary_id

def get_employee_summaries(employee_id: int):
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM summaries WHERE employee_id = ? ORDER BY created_at DESC",
        (employee_id,)
    )
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

# ==================== DOCUMENTS CRUD ====================

def add_document(filename: str, filepath: str, file_type: str, file_size: int, employee_id=None, topic: str = "General", extracted_text: str = ""):
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO documents (filename, filepath, file_type, file_size, employee_id, topic, extracted_text)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (filename, filepath, file_type, file_size, employee_id, topic, extracted_text))
    conn.commit()
    doc_id = cursor.lastrowid
    conn.close()
    return doc_id

def get_all_documents():
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT d.*, e.name as employee_name
        FROM documents d
        LEFT JOIN employees e ON d.employee_id = e.id
        ORDER BY d.upload_date DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_document_by_id(doc_id: int):
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT d.*, e.name as employee_name
        FROM documents d
        LEFT JOIN employees e ON d.employee_id = e.id
        WHERE d.id = ?
    """, (doc_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def update_document_summary(doc_id: int, summary_notes: str):
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("UPDATE documents SET summary_notes = ? WHERE id = ?", (summary_notes, doc_id))
    conn.commit()
    conn.close()

def delete_document(doc_id: int):
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM documents WHERE id = ?", (doc_id,))
    conn.commit()
    conn.close()

# Auto-initialize on import
init_db()
