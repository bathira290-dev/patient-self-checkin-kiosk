import React, { useEffect, useState } from 'react';
import Spinner from '../components/Spinner';

const API_BASE_URL = 'http://localhost:8000';

const Admin = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const departments = [
    "General Medicine",
    "Cardiology",
    "Orthopedics",
    "Dermatology",
    "Pediatrics"
  ];

  // Fetch patients from API
  const fetchPatients = async (searchTerm = '', deptFilter = '') => {
    setIsLoading(true);
    setError(null);
    try {
      const url = new URL(`${API_BASE_URL}/api/patients`);
      if (searchTerm) {
        url.searchParams.append('search', searchTerm);
      }
      if (deptFilter) {
        url.searchParams.append('department', deptFilter);
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Failed to fetch patients data');
      }
      
      const data = await response.json();
      setPatients(data);
    } catch (err) {
      setError(err.message || 'Error communicating with server.');
    } finally {
      setIsLoading(false);
    }
  };

  // Live filtering on search/department change
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchPatients(search, department);
    }, 300); // 300ms debounce to prevent spamming backend on each keystroke

    return () => clearTimeout(delayDebounce);
  }, [search, department]);

  const handleRefresh = () => {
    fetchPatients(search, department);
  };

  const formatDateTime = (isoString) => {
    try {
      const date = new Date(isoString.replace(' ', 'T'));
      if (isNaN(date.getTime())) {
        return isoString;
      }
      return date.toLocaleString();
    } catch {
      return isoString;
    }
  };

  return (
    <div className="main-content fade-in admin-container">
      <div className="admin-header">
        <h1 className="admin-title">Admin Dashboard</h1>
        <button 
          className="btn btn-secondary" 
          onClick={handleRefresh}
          style={{ padding: '0.6rem 1.2rem', fontSize: '0.95rem' }}
          disabled={isLoading}
        >
          Refresh Data
        </button>
      </div>

      {/* Filter Options */}
      <div className="filters-bar">
        <div className="form-group">
          <label htmlFor="search" className="form-label" style={{ fontSize: '0.9rem' }}>Search Patient Name</label>
          <input
            type="text"
            id="search"
            className="form-control"
            placeholder="Type name to search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="dept-filter" className="form-label" style={{ fontSize: '0.9rem' }}>Filter by Department</label>
          <select
            id="dept-filter"
            className="form-control"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map((dept, index) => (
              <option key={index} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Table / Loading states */}
      {isLoading ? (
        <div className="card" style={{ maxWidth: 'none', width: '100%' }}>
          <Spinner message="Retrieving patients database..." />
        </div>
      ) : error ? (
        <div className="card" style={{ maxWidth: 'none', width: '100%', textAlign: 'center', borderColor: 'var(--error-text)', backgroundColor: 'var(--error-bg)' }}>
          <p style={{ color: 'var(--error-text)', fontWeight: 700, fontSize: '1.1rem' }}>{error}</p>
          <button className="btn btn-secondary" onClick={handleRefresh} style={{ marginTop: '1rem' }}>Try Again</button>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="patient-table">
            <thead>
              <tr>
                <th style={{ width: '100px' }}>Token</th>
                <th>Patient Name</th>
                <th style={{ width: '80px' }}>Age</th>
                <th style={{ width: '100px' }}>Gender</th>
                <th style={{ width: '140px' }}>Mobile</th>
                <th>Department</th>
                <th>Registered At</th>
              </tr>
            </thead>
            <tbody>
              {patients.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <div className="empty-state">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                      </svg>
                      <p style={{ fontWeight: 600 }}>No patients found matching the search criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                patients.map((patient) => (
                  <tr key={patient.id}>
                    <td>
                      <span className="badge" style={{ fontWeight: 800 }}>{patient.token}</span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{patient.name}</td>
                    <td>{patient.age}</td>
                    <td>{patient.gender}</td>
                    <td>{patient.mobile}</td>
                    <td>{patient.department}</td>
                    <td>{formatDateTime(patient.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Admin;
