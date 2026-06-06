import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';

const API_BASE_URL = 'http://localhost:8000';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    mobile: '',
    address: '',
    department: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const departments = [
    "General Medicine",
    "Cardiology",
    "Orthopedics",
    "Dermatology",
    "Pediatrics"
  ];

  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'name':
        if (!value.trim()) {
          error = 'Full name is required';
        }
        break;
      case 'age':
        if (!value) {
          error = 'Age is required';
        } else {
          const ageNum = parseInt(value, 10);
          if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
            error = 'Age must be between 1 and 120';
          }
        }
        break;
      case 'gender':
        if (!value) {
          error = 'Please select a gender';
        }
        break;
      case 'mobile':
        if (!value) {
          error = 'Mobile number is required';
        } else if (!/^\d{10}$/.test(value)) {
          error = 'Mobile number must be exactly 10 digits';
        }
        break;
      case 'department':
        if (!value) {
          error = 'Please select a department';
        }
        break;
      default:
        break;
    }
    
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validate field on change
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Prepare payload
    const payload = {
      name: formData.name.trim(),
      age: parseInt(formData.age, 10),
      gender: formData.gender,
      mobile: formData.mobile,
      address: formData.address.trim() || null,
      department: formData.department
    };

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to register patient');
      }

      const registeredPatient = await response.json();
      setIsLoading(false);
      // Navigate to token page, passing patient details as state
      navigate('/token', { state: { patient: registeredPatient } });
    } catch (err) {
      setIsLoading(false);
      setApiError(err.message || 'Connecting to server failed. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate('/welcome');
  };

  if (isLoading) {
    return (
      <div className="main-content fade-in">
        <div className="card">
          <Spinner message="Registering patient and generating token..." />
        </div>
      </div>
    );
  }

  return (
    <div className="main-content fade-in">
      <div className="card">
        <h2 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>Patient Registration</h2>
        
        {apiError && (
          <div style={{
            backgroundColor: 'var(--error-bg)',
            color: 'var(--error-text)',
            padding: '1rem',
            borderRadius: 'var(--border-radius)',
            border: '2px solid var(--error-text)',
            marginBottom: '1.5rem',
            fontWeight: 600
          }}>
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            {errors.name && <span className="invalid-feedback">{errors.name}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="age" className="form-label">
                Age <span className="required">*</span>
              </label>
              <input
                type="number"
                id="age"
                name="age"
                className={`form-control ${errors.age ? 'is-invalid' : ''}`}
                placeholder="1 - 120"
                value={formData.age}
                onChange={handleChange}
                onBlur={handleBlur}
                min="1"
                max="120"
                required
              />
              {errors.age && <span className="invalid-feedback">{errors.age}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="gender" className="form-label">
                Gender <span className="required">*</span>
              </label>
              <select
                id="gender"
                name="gender"
                className={`form-control ${errors.gender ? 'is-invalid' : ''}`}
                value={formData.gender}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <span className="invalid-feedback">{errors.gender}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="mobile" className="form-label">
              Mobile Number <span className="required">*</span>
            </label>
            <input
              type="tel"
              id="mobile"
              name="mobile"
              className={`form-control ${errors.mobile ? 'is-invalid' : ''}`}
              placeholder="10-digit number"
              value={formData.mobile}
              onChange={handleChange}
              onBlur={handleBlur}
              maxLength="10"
              required
            />
            {errors.mobile && <span className="invalid-feedback">{errors.mobile}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="department" className="form-label">
              Department <span className="required">*</span>
            </label>
            <select
              id="department"
              name="department"
              className={`form-control ${errors.department ? 'is-invalid' : ''}`}
              value={formData.department}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            >
              <option value="">Select Department</option>
              {departments.map((dept, index) => (
                <option key={index} value={dept}>{dept}</option>
              ))}
            </select>
            {errors.department && <span className="invalid-feedback">{errors.department}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="address" className="form-label">
              Address <span style={{ fontWeight: 500, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>(Optional)</span>
            </label>
            <textarea
              id="address"
              name="address"
              className="form-control"
              placeholder="Residential address"
              value={formData.address}
              onChange={handleChange}
              rows="2"
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1 }}
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 2 }}
            >
              Submit Check-In
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Register;
