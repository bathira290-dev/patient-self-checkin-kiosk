# Implementation Plan - Patient Self Check-in Kiosk Application

We will build a Patient Self Check-in Kiosk Application with a FastAPI backend (SQLite DB) and a React.js frontend (using React Router and styled with clean, healthcare-themed monochrome CSS).

## User Review Required

> [!IMPORTANT]
> - **Active Workspace**: Since you currently do not have an active workspace set, we will create the project in `C:\Users\HP\.gemini\antigravity\scratch\patient_checkin_kiosk`. After the project is set up, we recommend that you configure this directory as your active workspace.
> - **Frontend Port**: The spec specifies CORS enabled for `localhost:3000`. We will configure the Vite React dev server to run on port `3000` to align with this spec.
> - **Token Generation Strategy**: We will implement a department-specific auto-increment token. For example, registering for *Cardiology* will result in token `CARD-1`, then `CARD-2`, etc. Registering for *Pediatrics* will result in `PEDS-1`, then `PEDS-2`, etc. This makes tokens clear and distinct per department, which is standard for kiosks. Let's map departments to short prefixes:
>   - General Medicine -> `GEN`
>   - Cardiology -> `CARD`
>   - Orthopedics -> `ORTH`
>   - Dermatology -> `DERM`
>   - Pediatrics -> `PEDS`

## Proposed Changes

We will create a clean and organized structure under `C:\Users\HP\.gemini\antigravity\scratch\patient_checkin_kiosk`:
```
/backend
  main.py
  requirements.txt
/frontend
  package.json
  vite.config.js
  index.html
  src/
    main.jsx
    App.jsx
    index.css
    pages/
      Welcome.jsx
      Register.jsx
      Token.jsx
      Admin.jsx
    components/
      Navbar.jsx
      Spinner.jsx
README.md
```

---

### Backend Component (`/backend`)

We will implement a FastAPI application with SQLite database storage.

#### [NEW] [main.py](file:///C:/Users/HP/.gemini/antigravity/scratch/patient_checkin_kiosk/backend/main.py)
- Establish SQLite DB connection using Python's built-in `sqlite3` library.
- On startup, create the `patients` table:
  ```sql
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
  ```
- Implement CORS middleware for `http://localhost:3000` (and `http://127.0.0.1:3000`).
- Define Pydantic schemas:
  - `PatientCreate`:
    - `name`: non-empty string.
    - `age`: integer between 1 and 120.
    - `gender`: string (must be Male, Female, or Other).
    - `mobile`: exactly 10 digits (validated via regex).
    - `address`: optional string.
    - `department`: string (must be one of: General Medicine, Cardiology, Orthopedics, Dermatology, Pediatrics).
  - `PatientResponse`: extends `PatientCreate` with `id`, `token`, and `created_at`.
- Implement token generation logic:
  - Query DB for the highest token number for the selected department, parse the integer part, increment it, and format it as `<PREFIX>-<NUMBER>`.
- Implement endpoints:
  - `POST /api/patients`: Create patient record, generate token, insert into DB, return patient object.
  - `GET /api/patients`: Fetch all patients. Support query parameters `search` (filter by name case-insensitively) and `department` (filter by department).
  - `GET /api/patients/{id}`: Fetch a single patient by ID or return 404.

#### [NEW] [requirements.txt](file:///C:/Users/HP/.gemini/antigravity/scratch/patient_checkin_kiosk/backend/requirements.txt)
- List dependencies: `fastapi`, `uvicorn[standard]`, `pydantic`.

---

### Frontend Component (`/frontend`)

We will build the frontend using React (Vite template).

#### [NEW] [package.json](file:///C:/Users/HP/.gemini/antigravity/scratch/patient_checkin_kiosk/frontend/package.json)
- React, React-DOM, React Router (`react-router-dom`).
- Script to run Vite server on port 3000.

#### [NEW] [vite.config.js](file:///C:/Users/HP/.gemini/antigravity/scratch/patient_checkin_kiosk/frontend/vite.config.js)
- Configure React plugin and set port to `3000`.

#### [NEW] [index.css](file:///C:/Users/HP/.gemini/antigravity/scratch/patient_checkin_kiosk/frontend/src/index.css)
- Healthcare-themed, high-contrast, clean minimalist design.
- Works perfectly in monochrome (shades of slate, charcoal, and crisp borders) with light/dark contrast suited for kiosk touch screens.
- Global styles for large inputs, buttons, and clear typography (using modern sans-serif like system-ui or Inter).

#### [NEW] [App.jsx](file:///C:/Users/HP/.gemini/antigravity/scratch/patient_checkin_kiosk/frontend/src/App.jsx)
- Setup React Router with pages:
  - `/welcome` (and `/` redirects there)
  - `/register`
  - `/token`
  - `/admin`

#### [NEW] [Welcome.jsx](file:///C:/Users/HP/.gemini/antigravity/scratch/patient_checkin_kiosk/frontend/src/pages/Welcome.jsx)
- Clean welcome screen with a large, inviting "Check In" button.
- Interactive animation or layout for touchscreens.

#### [NEW] [Register.jsx](file:///C:/Users/HP/.gemini/antigravity/scratch/patient_checkin_kiosk/frontend/src/pages/Register.jsx)
- Form inputs with inline validation on change/blur:
  - Name, Gender, Department (required)
  - Age (1-120)
  - Mobile (10 digits check)
- Submit handles async call to `POST /api/patients` and displays loading spinner.
- Navigates to `/token` passing the patient and token state on success.

#### [NEW] [Token.jsx](file:///C:/Users/HP/.gemini/antigravity/scratch/patient_checkin_kiosk/frontend/src/pages/Token.jsx)
- Shows a print-ticket preview: Patient Name, Department, Token Number, Registration Timestamp.
- "Print Ticket" button which triggers the browser print dialog (`window.print()`) with print-optimized CSS (hides navigation/buttons on print).
- Auto-redirects to `/welcome` after 10 seconds using a timer.

#### [NEW] [Admin.jsx](file:///C:/Users/HP/.gemini/antigravity/scratch/patient_checkin_kiosk/frontend/src/pages/Admin.jsx)
- Dashboard showing all registered patients in a readable table.
- Search input (triggers live filtering by name).
- Dropdown filter (triggers filtering by department).
- Columns: Token, Name, Age, Gender, Mobile, Department, Registered At.

#### [NEW] [Navbar.jsx](file:///C:/Users/HP/.gemini/antigravity/scratch/patient_checkin_kiosk/frontend/src/components/Navbar.jsx)
- Simple modern navigation header. Useful for admin view. Hides on the kiosk/token views to avoid user tampering.

#### [NEW] [Spinner.jsx](file:///C:/Users/HP/.gemini/antigravity/scratch/patient_checkin_kiosk/frontend/src/components/Spinner.jsx)
- Modern loading spinner component.

---

### README Component

#### [NEW] [README.md](file:///C:/Users/HP/.gemini/antigravity/scratch/patient_checkin_kiosk/README.md)
- Complete setup instructions for backend (Python virtual environment, package installation, running Uvicorn).
- Complete setup instructions for frontend (Node dependencies, running dev server).
- Overview of design decisions and APIs.

## Verification Plan

### Automated Tests
We will verify that code conforms to requirements and runs without syntax/linting errors.
We will run:
- Frontend build test: `npm run build`
- Python syntax check: run backend via Uvicorn to check startup.

### Manual Verification
- Walk through the user flow: Welcome -> Register -> Token -> Auto-redirect back to Welcome.
- Verify that validation works (empty fields, age limits, mobile length) dynamically.
- Check Admin page filters (search, department dropdown) and verify the patients list matches the database.
- Verify print styles (only the ticket is printed, buttons/layout are hidden).
