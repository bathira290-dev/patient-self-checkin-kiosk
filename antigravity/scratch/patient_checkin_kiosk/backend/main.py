from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
import sqlite3
import re
from typing import List, Optional
from datetime import datetime
import os

app = FastAPI(title="Patient Self Check-in Kiosk API")

# Enable CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = os.path.join(os.path.dirname(__file__), "patients.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# Initialize Database
def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            age INTEGER NOT NULL,
            gender TEXT NOT NULL,
            mobile TEXT NOT NULL,
            address TEXT,
            department TEXT NOT NULL,
            token TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

init_db()

# Department Prefix Mapping
DEPT_PREFIXES = {
    "General Medicine": "GEN",
    "Cardiology": "CARD",
    "Orthopedics": "ORTH",
    "Dermatology": "DERM",
    "Pediatrics": "PEDS"
}

# Pydantic Schemas
class PatientCreate(BaseModel):
    name: str = Field(..., min_length=1, description="Full Name is required")
    age: int = Field(..., ge=1, le=120, description="Age must be between 1 and 120")
    gender: str = Field(..., description="Gender is required")
    mobile: str = Field(..., description="Mobile number is required")
    address: Optional[str] = None
    department: str = Field(..., description="Department is required")

    @field_validator("gender")
    @classmethod
    def validate_gender(cls, v):
        allowed = ["Male", "Female", "Other"]
        if v not in allowed:
            raise ValueError(f"Gender must be one of {allowed}")
        return v

    @field_validator("mobile")
    @classmethod
    def validate_mobile(cls, v):
        if not re.match(r"^\d{10}$", v):
            raise ValueError("Mobile number must be exactly 10 digits")
        return v

    @field_validator("department")
    @classmethod
    def validate_department(cls, v):
        if v not in DEPT_PREFIXES:
            raise ValueError(f"Department must be one of {list(DEPT_PREFIXES.keys())}")
        return v

class PatientResponse(BaseModel):
    id: int
    name: str
    age: int
    gender: str
    mobile: str
    address: Optional[str]
    department: str
    token: str
    created_at: str

def generate_dept_token(conn, department: str) -> str:
    prefix = DEPT_PREFIXES.get(department, "TEMP")
    cursor = conn.cursor()
    # Find the latest patient registered for this department
    cursor.execute(
        "SELECT token FROM patients WHERE department = ? ORDER BY id DESC LIMIT 1",
        (department,)
    )
    row = cursor.fetchone()
    if not row:
        token_num = 1
    else:
        last_token = row["token"]
        try:
            # Token format is PREFIX-NUMBER, e.g. CARD-12
            parts = last_token.split("-")
            token_num = int(parts[-1]) + 1
        except (ValueError, IndexError):
            token_num = 1
            
    return f"{prefix}-{token_num}"

@app.post("/api/patients", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
def register_patient(patient: PatientCreate):
    conn = get_db_connection()
    try:
        token = generate_dept_token(conn, patient.department)
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO patients (name, age, gender, mobile, address, department, token)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                patient.name,
                patient.age,
                patient.gender,
                patient.mobile,
                patient.address,
                patient.department,
                token
            )
        )
        conn.commit()
        
        # Get the inserted row
        patient_id = cursor.lastrowid
        cursor.execute("SELECT * FROM patients WHERE id = ?", (patient_id,))
        row = cursor.fetchone()
        
        return PatientResponse(
            id=row["id"],
            name=row["name"],
            age=row["age"],
            gender=row["gender"],
            mobile=row["mobile"],
            address=row["address"],
            department=row["department"],
            token=row["token"],
            created_at=row["created_at"]
        )
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error occurred: {str(e)}"
        )
    finally:
        conn.close()

@app.get("/api/patients", response_model=List[PatientResponse])
def get_patients(
    search: Optional[str] = Query(None, description="Search by patient name"),
    department: Optional[str] = Query(None, description="Filter by department")
):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = "SELECT * FROM patients WHERE 1=1"
    params = []
    
    if search:
        query += " AND name LIKE ?"
        params.append(f"%{search}%")
        
    if department:
        query += " AND department = ?"
        params.append(department)
        
    query += " ORDER BY id DESC"
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    
    patients = []
    for row in rows:
        patients.append(
            PatientResponse(
                id=row["id"],
                name=row["name"],
                age=row["age"],
                gender=row["gender"],
                mobile=row["mobile"],
                address=row["address"],
                department=row["department"],
                token=row["token"],
                created_at=row["created_at"]
            )
        )
    conn.close()
    return patients

@app.get("/api/patients/{id}", response_model=PatientResponse)
def get_patient(id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM patients WHERE id = ?", (id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID {id} not found"
        )
        
    return PatientResponse(
        id=row["id"],
        name=row["name"],
        age=row["age"],
        gender=row["gender"],
        mobile=row["mobile"],
        address=row["address"],
        department=row["department"],
        token=row["token"],
        created_at=row["created_at"]
    )
