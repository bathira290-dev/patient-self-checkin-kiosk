import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function formatTimestamp(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function Token() {
  const location = useLocation();
  const navigate = useNavigate();
  const patient = location.state?.patient;
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (!patient) {
      navigate('/welcome', { replace: true });
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/welcome', { replace: true });
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

  if (!patient) return null;

  return (
    <div className="page">
      <div className="card card-narrow">
        <h1 className="title" style={{ fontSize: '1.75rem' }}>
          Check-in Confirmed
        </h1>
        <p className="subtitle">Please note your token number</p>

        <div className="token-display">
          <p className="token-label">Your Token</p>
          <p className="token-number">{patient.token}</p>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <div className="detail-row">
            <span className="detail-label">Patient Name</span>
            <span className="detail-value">{patient.name}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Department</span>
            <span className="detail-value">{patient.department}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Registered At</span>
            <span className="detail-value">
              {formatTimestamp(patient.created_at)}
            </span>
          </div>
        </div>

        <div className="btn-group no-print">
          <button className="btn" onClick={handlePrint}>
            Print
          </button>
          <button
            className="btn btn-outline"
            onClick={() => navigate('/welcome', { replace: true })}
          >
            Done
          </button>
        </div>

        <p className="countdown no-print">
          Returning to welcome screen in {countdown} second
          {countdown !== 1 ? 's' : ''}...
        </p>
      </div>
    </div>
  );
}

export default Token;
