import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Token = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const patient = location.state?.patient;
  
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // If no patient state was passed, redirect back to welcome
    if (!patient) {
      navigate('/welcome');
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/welcome');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [patient, navigate]);

  const handlePrint = () => {
    window.print();
  };

  const handleDone = () => {
    navigate('/welcome');
  };

  if (!patient) {
    return null;
  }

  // Format the date nicely
  const formatDateTime = (isoString) => {
    try {
      // SQLite TIMESTAMP returns in "YYYY-MM-DD HH:MM:SS" or ISO. 
      // In JS, spaces or dashes could cause parsing issues in older engines, but modern JS handles it.
      // If it doesn't parse, fallback to string.
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
    <div className="main-content fade-in">
      <div className="card ticket-container">
        <h2 style={{ fontWeight: 800 }}>Check-In Successful</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Please collect your token ticket below.</p>
        
        {/* Printable Ticket */}
        <div className="ticket-card">
          <div className="ticket-header">
            <div className="ticket-hospital-name">CAREPOINT HEALTHCARE</div>
            <div className="ticket-dept">{patient.department}</div>
          </div>
          
          <div className="ticket-token-section">
            <div className="ticket-token-label">Token Number</div>
            <div className="ticket-token-number">{patient.token}</div>
          </div>
          
          <div className="ticket-patient-details">
            <span className="details-label">Patient Name:</span>
            <span className="details-val" style={{ textTransform: 'uppercase', fontWeight: 600 }}>{patient.name}</span>
            
            <span className="details-label">Age / Gender:</span>
            <span className="details-val">{patient.age} years / {patient.gender}</span>
            
            <span className="details-label">Mobile:</span>
            <span className="details-val">{patient.mobile}</span>
            
            <span className="details-label">Registered At:</span>
            <span className="details-val">{formatDateTime(patient.created_at)}</span>
          </div>
          
          <div className="ticket-footer">
            <p>Please wait for your token to be called in the waiting area.</p>
          </div>
        </div>

        {/* Actions (Hidden during printing via index.css) */}
        <div className="ticket-actions">
          <button 
            className="btn btn-secondary" 
            onClick={handlePrint}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print Ticket
          </button>
          
          <button 
            className="btn btn-primary" 
            onClick={handleDone}
          >
            Done
          </button>
        </div>

        <p className="redirect-notice">
          Returning to welcome screen in {countdown} seconds...
        </p>
      </div>
    </div>
  );
};

export default Token;
