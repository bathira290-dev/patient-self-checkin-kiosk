import { useCallback, useEffect, useState } from 'react';
import Spinner from '../components/Spinner';

const DEPARTMENTS = [
  'General Medicine',
  'Cardiology',
  'Orthopedics',
  'Dermatology',
  'Pediatrics',
];

const API_BASE = 'http://localhost:8000/api';

function formatTimestamp(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function Admin() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError('');

    const params = new URLSearchParams();
    if (search.trim()) params.append('search', search.trim());
    if (department) params.append('department', department);

    const query = params.toString();
    const url = `${API_BASE}/patients${query ? `?${query}` : ''}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch patients');
      }
      const data = await response.json();
      setPatients(data);
    } catch {
      setError('Unable to load patients. Please check the server connection.');
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, [search, department]);

  useEffect(() => {
    const debounce = setTimeout(fetchPatients, 300);
    return () => clearTimeout(debounce);
  }, [fetchPatients]);

  return (
    <div className="page page-wide">
      <div className="card">
        <h1 className="title" style={{ fontSize: '1.75rem' }}>
          Admin Dashboard
        </h1>
        <p className="subtitle">View and search registered patients</p>

        <div className="filters">
          <div className="filter-group">
            <label className="form-label" htmlFor="search">
              Search by Name
            </label>
            <input
              id="search"
              type="text"
              className="form-input"
              placeholder="Type to search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label className="form-label" htmlFor="filter-department">
              Filter by Department
            </label>
            <select
              id="filter-department"
              className="form-select"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <div className="api-error">{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <Spinner size={32} label="Loading patients..." />
          </div>
        ) : patients.length === 0 ? (
          <div className="empty-state">No patients found.</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Mobile</th>
                  <th>Department</th>
                  <th>Registered At</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.token}</strong>
                    </td>
                    <td>{p.name}</td>
                    <td>{p.age}</td>
                    <td>{p.gender}</td>
                    <td>{p.mobile}</td>
                    <td>{p.department}</td>
                    <td>{formatTimestamp(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;
