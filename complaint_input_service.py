from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "complaint.db")

app = FastAPI(title="Complaint Input Service")

class ComplaintIn(BaseModel):
    title: str = Field(..., min_length=1, description="민원명")
    requester: str = Field(..., min_length=1, description="요청자")
    system_name: str = Field(..., min_length=1, description="시스템명")
    priority: str = Field("중", pattern="^(상|중|하)$")
    detail: str = Field("", description="요청내용")

class ComplaintOut(ComplaintIn):
    id: int
    status: str
    created_at: str

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_conn()
    cur = conn.cursor()
    cur.executescript(
        '''
        CREATE TABLE IF NOT EXISTS complaints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            requester TEXT NOT NULL,
            system_name TEXT NOT NULL,
            priority TEXT NOT NULL CHECK(priority IN ('상','중','하')),
            detail TEXT,
            status TEXT NOT NULL DEFAULT '접수',
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS complaint_input_log (
            log_id INTEGER PRIMARY KEY AUTOINCREMENT,
            complaint_id INTEGER,
            action_type TEXT NOT NULL,
            actor TEXT NOT NULL,
            action_at TEXT NOT NULL,
            action_detail TEXT,
            FOREIGN KEY (complaint_id) REFERENCES complaints(id)
        );
        '''
    )
    conn.commit()
    conn.close()

@app.on_event("startup")
def startup():
    init_db()

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/complaints", response_model=ComplaintOut)
def create_complaint(item: ComplaintIn):
    now = datetime.now().isoformat(timespec="seconds")
    conn = get_conn()
    cur = conn.cursor()

    cur.execute(
        '''
        INSERT INTO complaints (title, requester, system_name, priority, detail, status, created_at)
        VALUES (?, ?, ?, ?, ?, '접수', ?)
        ''',
        (item.title, item.requester, item.system_name, item.priority, item.detail, now)
    )
    complaint_id = cur.lastrowid

    cur.execute(
        '''
        INSERT INTO complaint_input_log (complaint_id, action_type, actor, action_at, action_detail)
        VALUES (?, 'INSERT', ?, ?, ?)
        ''',
        (complaint_id, item.requester, now, f"민원 등록: {item.title}")
    )

    conn.commit()

    row = cur.execute("SELECT * FROM complaints WHERE id = ?", (complaint_id,)).fetchone()
    conn.close()

    return dict(row)

@app.get("/complaints", response_model=List[ComplaintOut])
def list_complaints():
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM complaints ORDER BY id DESC"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]
