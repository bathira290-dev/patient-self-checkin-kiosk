from datetime import datetime
from typing import Optional

import sqlite3
from contextlib import contextmanager

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

DATABASE = "patients.db"

DEPARTMENTS = [
    "General Medicine",
    "Cardiology",
    "Orthopedics",
    "Dermatology",
    "Pediatrics",
]


def init_db():
    with get_db() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS patients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                age INTEGER NOT NULL,
                gender TEXT NOT NULL,
                mobile TEXT NOT NULL,
                address TEXT,
                department TEXT NOT NULL,
                token INTEGER NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        conn.commit()


@contextmanager
def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


def row_to_dict(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "name": row["name"],
        "age": row["age"],
        "gender": row["gender"],
        "mobile": row["mobile"],
        "address": row["address"],
        "department": row["department"],
        "token": row["token"],
        "created_at": row["created_at"],
    }


def get_next_token(conn: sqlite3.Connection, department: str) -> int:
    cursor = conn.execute(
        "SELECT COALESCE(MAX(token), 0) + 1 AS next_token FROM patients WHERE department = ?",
        (department,),
    )
    return cursor.fetchone()["next_token"]


class PatientCreate(BaseModel):
    name: str = Field(..., min_length=1)
    age: int = Field(..., ge=1, le=120)
    gender: str = Field(..., min_length=1)
    mobile: str = Field(..., min_length=10, max_length=10)
    address: Optional[str] = None
    department: str = Field(..., min_length=1)

    @field_validator("mobile")
    @classmethod
    def validate_mobile(cls, value: str) -> str:
        if not value.isdigit():
            raise ValueError("Mobile must contain exactly 10 numeric digits")
        return value

    @field_validator("department")
    @classmethod
    def validate_department(cls, value: str) -> str:
        if value not in DEPARTMENTS:
            raise ValueError(f"Department must be one of: {', '.join(DEPARTMENTS)}")
        return value


class PatientResponse(BaseModel):
    id: int
    name: str
    age: int
    gender: str
    mobile: str
    address: Optional[str]
    department: str
    token: int
    created_at: str


app = FastAPI(title="Patient Self Check-in Kiosk API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


@app.post("/api/patients", response_model=PatientResponse, status_code=201)
def register_patient(patient: PatientCreate):
    created_at = datetime.now().isoformat()

    with get_db() as conn:
        token = get_next_token(conn, patient.department)
        cursor = conn.execute(
            """
            INSERT INTO patients (name, age, gender, mobile, address, department, token, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                patient.name.strip(),
                patient.age,
                patient.gender,
                patient.mobile,
                patient.address.strip() if patient.address else None,
                patient.department,
                token,
                created_at,
            ),
        )
        conn.commit()
        patient_id = cursor.lastrowid

        row = conn.execute(
            "SELECT * FROM patients WHERE id = ?", (patient_id,)
        ).fetchone()

    return row_to_dict(row)


@app.get("/api/patients", response_model=list[PatientResponse])
def list_patients(
    search: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
):
    query = "SELECT * FROM patients WHERE 1=1"
    params: list = []

    if search:
        query += " AND name LIKE ?"
        params.append(f"%{search}%")

    if department:
        query += " AND department = ?"
        params.append(department)

    query += " ORDER BY created_at DESC"

    with get_db() as conn:
        rows = conn.execute(query, params).fetchall()

    return [row_to_dict(row) for row in rows]


@app.get("/api/patients/{patient_id}", response_model=PatientResponse)
def get_patient(patient_id: int):
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM patients WHERE id = ?", (patient_id,)
        ).fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Patient not found")

    return row_to_dict(row)
