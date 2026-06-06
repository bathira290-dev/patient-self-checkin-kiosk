import { useCallback, useEffect, useMemo, useState } from 'react';
import Spinner from '../components/Spinner';

const DEPARTMENTS = [
  'General Medicine',
  'Cardiology',
  'Orthopedics',
  'Dermatology',
  'Pediatrics',
];

const API_BASE = '/api';
const RECORDS_PER_PAGE = 10;

function formatTimestamp(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function formatCount(value) {
  return value.toLocaleString();
}

function Admin() {
  const [patients, setPatients] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState('token');
  const [sortDirection, setSortDirection] = useState('asc');
  const [retryKey, setRetryKey] = useState(0);

  const buildUrl = useCallback(
    ({ searchTerm, departmentFilter }) => {
      const params = new URLSearchParams();
      if (searchTerm?.trim()) params.append('search', searchTerm.trim());
      if (departmentFilter) params.append('department', departmentFilter);
      return `${API_BASE}/patients${params.toString() ? `?${params.toString()}` : ''}`;
    },
    []
  );

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const url = buildUrl({ searchTerm: search, departmentFilter: department });
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch patient records');
      }
      const data = await response.json();
      setPatients(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Unable to load patients. Please check the server connection.');
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, [buildUrl, search, department, retryKey]);

  const fetchAllPatients = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const response = await fetch(`${API_BASE}/patients`);
      if (!response.ok) {
        throw new Error('Failed to fetch summary records');
      }
      const data = await response.json();
      setAllPatients(Array.isArray(data) ? data : []);
    } catch {
      setError('Unable to load summary counts. Please check the server connection.');
      setAllPatients([]);
    } finally {
      setSummaryLoading(false);
    }
  }, [retryKey]);

  useEffect(() => {
    fetchAllPatients();
  }, [fetchAllPatients]);

  useEffect(() => {
    const timer = setTimeout(fetchPatients, 250);
    return () => clearTimeout(timer);
  }, [fetchPatients]);

  useEffect(() => {
    setPage(1);
  }, [search, department]);

  const summaryCounts = useMemo(() => {
    const totals = {
      total: allPatients.length,
      'General Medicine': 0,
      Cardiology: 0,
      Orthopedics: 0,
      Dermatology: 0,
      Pediatrics: 0,
    };

    allPatients.forEach((patient) => {
      if (patient.department in totals) {
        totals[patient.department] += 1;
      }
    });

    return totals;
  }, [allPatients]);

  const sortedPatients = useMemo(() => {
    return [...patients].sort((a, b) => {
      if (sortField === 'token') {
        const left = Number(a.token) || a.token || '';
        const right = Number(b.token) || b.token || '';
        if (left < right) return sortDirection === 'asc' ? -1 : 1;
        if (left > right) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      }

      if (sortField === 'created_at') {
        const left = new Date(a.created_at).getTime();
        const right = new Date(b.created_at).getTime();
        if (left < right) return sortDirection === 'asc' ? -1 : 1;
        if (left > right) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      }

      return 0;
    });
  }, [patients, sortField, sortDirection]);

  const pageCount = Math.max(1, Math.ceil(sortedPatients.length / RECORDS_PER_PAGE));
  const visiblePatients = sortedPatients.slice(
    (page - 1) * RECORDS_PER_PAGE,
    page * RECORDS_PER_PAGE
  );

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortField(field);
    setSortDirection('asc');
  };

  const handleReset = () => {
    setSearch('');
    setDepartment('');
    setError('');
    setRetryKey((prev) => prev + 1);
  };

  const handleRefresh = () => {
    setError('');
    setRetryKey((prev) => prev + 1);
  };

  const exportToCSV = () => {
    const headers = [
      'Token Number',
      'Patient Name',
      'Age',
      'Gender',
      'Mobile Number',
      'Department',
      'Registration Date & Time',
    ];
    const rows = sortedPatients.map((patient) => [
      patient.token,
      patient.name,
      patient.age,
      patient.gender,
      patient.mobile,
      patient.department,
      formatTimestamp(patient.created_at),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'patient-list.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const printList = () => {
    window.print();
  };

  return (
    <div className="page page-wide admin-page">
      <section className="dashboard-header">
        <div>
          <p className="eyebrow">Admin Console</p>
          <h1 className="dashboard-title">Patient Self Check-in Dashboard</h1>
          <p className="dashboard-copy">
            Monitor registrations, department traffic, and quickly manage patient listings.
          </p>
        </div>

        <div className="dashboard-actions no-print">
          <button className="btn btn-outline" type="button" onClick={handleRefresh}>
            Refresh Data
          </button>
          <button className="btn btn-outline" type="button" onClick={exportToCSV}>
            Export CSV
          </button>
          <button className="btn" type="button" onClick={printList}>
            Print List
          </button>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <span className="stat-label">Total Patients Registered</span>
          <strong className="stat-value">
            {summaryLoading ? '—' : formatCount(summaryCounts.total)}
          </strong>
        </article>
        {DEPARTMENTS.map((dept) => (
          <article className="stat-card" key={dept}>
            <span className="stat-label">{dept}</span>
            <strong className="stat-value">
              {summaryLoading ? '—' : formatCount(summaryCounts[dept])}
            </strong>
          </article>
        ))}
      </section>

      <div className="panel card">
        <div className="panel-header no-print">
          <div className="filters-panel">
            <div className="filter-group">
              <label className="form-label" htmlFor="search">
                Live search by name
              </label>
              <input
                id="search"
                type="search"
                className="form-input"
                placeholder="Search patients..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="filter-group">
              <label className="form-label" htmlFor="department">
                Department filter
              </label>
              <select
                id="department"
                className="form-select"
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
              >
                <option value="">All Departments</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button className="btn btn-outline" type="button" onClick={handleReset}>
            Reset filters
          </button>
        </div>

        {error && (
          <div className="api-error">
            {error}
            <button className="btn btn-outline" type="button" onClick={handleRefresh}>
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="loading-state">
            <Spinner size={32} label="Loading patients..." />
          </div>
        ) : visiblePatients.length === 0 ? (
          <div className="empty-state">
            No patient records match your current search and filter criteria.
          </div>
        ) : (
          <div className="table-wrapper">
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th
                      className="sortable"
                      onClick={() => handleSort('token')}
                      scope="col"
                    >
                      Token Number
                      <span className="sort-indicator">
                        {sortField === 'token' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                      </span>
                    </th>
                    <th scope="col">Patient Name</th>
                    <th scope="col">Age</th>
                    <th scope="col">Gender</th>
                    <th scope="col">Mobile Number</th>
                    <th scope="col">Department</th>
                    <th
                      className="sortable"
                      onClick={() => handleSort('created_at')}
                      scope="col"
                    >
                      Registration Date & Time
                      <span className="sort-indicator">
                        {sortField === 'created_at'
                          ? sortDirection === 'asc'
                            ? '↑'
                            : '↓'
                          : '↕'}
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visiblePatients.map((patient) => (
                    <tr key={patient.id}>
                      <td>
                        <strong>{patient.token}</strong>
                      </td>
                      <td>{patient.name}</td>
                      <td>{patient.age}</td>
                      <td>{patient.gender}</td>
                      <td>{patient.mobile}</td>
                      <td>{patient.department}</td>
                      <td>{formatTimestamp(patient.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <button
                type="button"
                className="pagination-button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {page} of {pageCount}
              </span>
              <button
                type="button"
                className="pagination-button"
                onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                disabled={page === pageCount}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;
