import unittest
from fastapi.testclient import TestClient
import os
import sqlite3

# Set DB_PATH to a test database so we don't clobber the dev db
os.environ["DB_PATH"] = "test_patients.db"

# Force recreation of the test db file
if os.path.exists("test_patients.db"):
    os.remove("test_patients.db")

from main import app, get_db_connection

client = TestClient(app)

class TestPatientKioskAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Database gets initialized on main import, but let's make sure it's the test db
        pass

    @classmethod
    def tearDownClass(cls):
        # Clean up test database
        if os.path.exists("test_patients.db"):
            try:
                os.remove("test_patients.db")
            except PermissionError:
                pass

    def test_01_register_patient_valid(self):
        # Test registering a valid patient
        payload = {
            "name": "Jane Doe",
            "age": 28,
            "gender": "Female",
            "mobile": "1234567890",
            "address": "123 Health Ave",
            "department": "Cardiology"
        }
        response = client.post("/api/patients", json=payload)
        self.assertEqual(response.status_code, 201)
        
        data = response.json()
        self.assertEqual(data["name"], "Jane Doe")
        self.assertEqual(data["token"], "CARD-1")
        self.assertIn("id", data)
        self.assertIn("created_at", data)

    def test_02_register_patient_token_increment(self):
        # Test registering another patient in Cardiology increments the token
        payload = {
            "name": "Alice Smith",
            "age": 35,
            "gender": "Female",
            "mobile": "9876543210",
            "address": "456 Pulse Blvd",
            "department": "Cardiology"
        }
        response = client.post("/api/patients", json=payload)
        self.assertEqual(response.status_code, 201)
        
        data = response.json()
        self.assertEqual(data["token"], "CARD-2")

        # Test registering in another department starts at 1
        payload_peds = {
            "name": "Tommy Green",
            "age": 8,
            "gender": "Male",
            "mobile": "5556667777",
            "department": "Pediatrics" # Address omitted (optional)
        }
        response_peds = client.post("/api/patients", json=payload_peds)
        self.assertEqual(response_peds.status_code, 201)
        self.assertEqual(response_peds.json()["token"], "PEDS-1")

    def test_03_register_patient_invalid_data(self):
        # Test invalid age (200)
        payload = {
            "name": "Old Man",
            "age": 200,
            "gender": "Male",
            "mobile": "1234567890",
            "department": "General Medicine"
        }
        response = client.post("/api/patients", json=payload)
        self.assertEqual(response.status_code, 422)

        # Test invalid mobile (9 digits)
        payload = {
            "name": "Mobile User",
            "age": 40,
            "gender": "Other",
            "mobile": "123456789",
            "department": "Dermatology"
        }
        response = client.post("/api/patients", json=payload)
        self.assertEqual(response.status_code, 422)

        # Test invalid gender
        payload = {
            "name": "Invalid Gender",
            "age": 40,
            "gender": "Alien",
            "mobile": "1234567890",
            "department": "Dermatology"
        }
        response = client.post("/api/patients", json=payload)
        self.assertEqual(response.status_code, 422)

    def test_04_get_patients(self):
        response = client.get("/api/patients")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 3) # CARD-1, CARD-2, PEDS-1

    def test_05_get_patients_filtered(self):
        # Search by name
        response = client.get("/api/patients?search=Alice")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["name"], "Alice Smith")

        # Filter by department
        response = client.get("/api/patients?department=Pediatrics")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["token"], "PEDS-1")

    def test_06_get_patient_by_id(self):
        response = client.get("/api/patients/1")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["name"], "Jane Doe")

        # 404 response
        response = client.get("/api/patients/999")
        self.assertEqual(response.status_code, 404)

if __name__ == "__main__":
    unittest.main()
