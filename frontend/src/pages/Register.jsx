import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';

const DEPARTMENTS = [
  'General Medicine',
  'Cardiology',
  'Orthopedics',
  'Dermatology',
  'Pediatrics',
];

const GENDERS = ['Male', 'Female', 'Other'];

const API_BASE = 'http://localhost:8000/api';

function validateForm(values) {
  const errors = {};

  if (!values.name.trim()) {
    errors.name = 'Full name is required';
  }

  if (!values.age) {
    errors.age = 'Age is required';
  } else {
    const ageNum = Number(values.age);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      errors.age = 'Age must be between 1 and 120';
    }
  }

  if (!values.gender) {
    errors.gender = 'Gender is required';
  }

  if (!values.mobile) {
    errors.mobile = 'Mobile number is required';
  } else if (!/^\d{10}$/.test(values.mobile)) {
    errors.mobile = 'Mobile must be exactly 10 numeric digits';
  }

  if (!values.department) {
    errors.department = 'Department is required';
  }

  return errors;
}

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: '',
    mobile: '',
    address: '',
    department: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    if (apiError) setApiError('');
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    const fieldErrors = validateForm(form);
    if (fieldErrors[name]) {
      setErrors((prev) => ({ ...prev, [name]: fieldErrors[name] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldErrors = validateForm(form);
    setErrors(fieldErrors);

    if (Object.keys(fieldErrors).length > 0) return;

    setLoading(true);
    setApiError('');

    try {
      const response = await fetch(`${API_BASE}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          age: Number(form.age),
          gender: form.gender,
          mobile: form.mobile,
          address: form.address.trim() || null,
          department: form.department,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const detail = data.detail;
        if (Array.isArray(detail)) {
          setApiError(detail.map((d) => d.msg).join(', '));
        } else if (typeof detail === 'string') {
          setApiError(detail);
        } else {
          setApiError('Registration failed. Please try again.');
        }
        return;
      }

      const patient = await response.json();
      navigate('/token', { state: { patient } });
    } catch {
      setApiError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h1 className="title" style={{ fontSize: '1.75rem' }}>
          Patient Registration
        </h1>
        <p className="subtitle">Please fill in your details below</p>

        {apiError && <div className="api-error">{apiError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Full Name <span className="required">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className={`form-input ${errors.name ? 'error' : ''}`}
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your full name"
              autoComplete="name"
            />
            {errors.name && <p className="error-message">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="age">
              Age <span className="required">*</span>
            </label>
            <input
              id="age"
              name="age"
              type="number"
              min="1"
              max="120"
              className={`form-input ${errors.age ? 'error' : ''}`}
              value={form.age}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="1–120"
            />
            {errors.age && <p className="error-message">{errors.age}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="gender">
              Gender <span className="required">*</span>
            </label>
            <select
              id="gender"
              name="gender"
              className={`form-select ${errors.gender ? 'error' : ''}`}
              value={form.gender}
              onChange={handleChange}
              onBlur={handleBlur}
            >
              <option value="">Select gender</option>
              {GENDERS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            {errors.gender && <p className="error-message">{errors.gender}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="mobile">
              Mobile Number <span className="required">*</span>
            </label>
            <input
              id="mobile"
              name="mobile"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              className={`form-input ${errors.mobile ? 'error' : ''}`}
              value={form.mobile}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="10-digit mobile number"
            />
            {errors.mobile && <p className="error-message">{errors.mobile}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="address">
              Address
            </label>
            <input
              id="address"
              name="address"
              type="text"
              className="form-input"
              value={form.address}
              onChange={handleChange}
              placeholder="Optional"
              autoComplete="street-address"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="department">
              Department <span className="required">*</span>
            </label>
            <select
              id="department"
              name="department"
              className={`form-select ${errors.department ? 'error' : ''}`}
              value={form.department}
              onChange={handleChange}
              onBlur={handleBlur}
            >
              <option value="">Select department</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            {errors.department && (
              <p className="error-message">{errors.department}</p>
            )}
          </div>

          <div className="btn-group">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/welcome')}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? <Spinner size={20} label="Registering..." /> : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
