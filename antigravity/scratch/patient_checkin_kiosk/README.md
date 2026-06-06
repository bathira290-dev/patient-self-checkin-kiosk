# Patient Self Check-in Kiosk Application

A complete self-service Patient Check-in Kiosk application featuring a FastAPI backend (SQLite DB) and a React.js frontend (Vite & React Router). The application is styled with a highly tactile, healthcare-themed monochrome CSS design optimized for kiosk touch screens.

## Tech Stack
- **Frontend**: React.js, React Router, Fetch API, Vanilla CSS.
- **Backend**: FastAPI, Pydantic (data validation), SQLite (Python built-in `sqlite3`).
- **Database**: SQLite (persisted locally in `/backend/patients.db`).

---

## Project Structure
```text
/backend
  main.py            # FastAPI application, Pydantic schemas, and DB setup
  requirements.txt   # Backend dependency list (fastapi, uvicorn, pydantic)
  patients.db        # SQLite database (generated automatically on startup)
/frontend
  index.html
  vite.config.js     # Configured to run on port 3000
  package.json       # Frontend package configurations and scripts
  src/
    main.jsx         # App mounting entrypoint
    App.jsx          # React Router configurations & navbar layout
    index.css        # Clean monochrome/healthcare styling and print styles
    components/
      Navbar.jsx     # Navigation bar (adapts between Kiosk and Admin mode)
      Spinner.jsx    # Async loading indicator
    pages/
      Welcome.jsx    # Touchscreen Welcome Check-In screen
      Register.jsx   # Registration form with dynamic inline validations
      Token.jsx      # Confirmation screen with print layout and auto-redirect
      Admin.jsx      # Admin dashboard with live filtering and search
README.md            # Setup and overview documentation
```

---

## Setup & Running the Application

### 1. Backend Setup (FastAPI)

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment (optional but recommended):
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate

   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   The backend API will be available at: [http://localhost:8000](http://localhost:8000)

### 2. Frontend Setup (React)

1. Open another terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install frontend packages:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm start
   ```
   *Note: You can also run `npm run dev` to start the server.*

   The frontend will run on: [http://localhost:3000](http://localhost:3000)

---

## Key Features & Implementations

### Token Generation
Tokens are generated dynamically per department to reflect a standard hospital triage system. When a patient registers, the system queries the SQLite database for the latest registration in that specific department, increments the counter, and returns a formatted code:
- **General Medicine** $\rightarrow$ `GEN-X`
- **Cardiology** $\rightarrow$ `CARD-X`
- **Orthopedics** $\rightarrow$ `ORTH-X`
- **Dermatology** $\rightarrow$ `DERM-X`
- **Pediatrics** $\rightarrow$ `PEDS-X`

### Dynamic Inline Validation
All registration fields are validated dynamically:
- **Full Name**: Cannot be blank.
- **Age**: Must be a number between 1 and 120.
- **Gender**: Selected from Male, Female, or Other.
- **Mobile Number**: Must be exactly 10 digits.
- **Department**: Must be selected from the valid list.

### Print Layout
When the **Print Ticket** button is clicked on the token confirmation page, the browser's native print screen is shown. Custom media queries in `index.css` target `@media print` to hide the application layout, navbar, back buttons, and countdown notices, printing **only** the physical ticket stub.

### Admin Dashboard
The Admin Dashboard ([http://localhost:3000/admin](http://localhost:3000/admin)) allows receptionists to review patients database with real-time filtering:
- **Live Search**: As you type in the search bar, the UI debounces keyboard input and queries the backend `GET /api/patients?search=<query>` endpoint.
- **Department Filter**: Dropdown queries `GET /api/patients?department=<selected>` to instantly filter records.
