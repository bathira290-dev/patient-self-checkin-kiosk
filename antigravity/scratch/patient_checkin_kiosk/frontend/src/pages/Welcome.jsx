import React from 'react';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/register');
  };

  return (
    <div className="main-content fade-in">
      <div className="card welcome-container">
        <div className="welcome-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4.8 2.2c0-.2.2-.4.4-.4h13.6c.2 0 .4.2.4.4v19.6c0 .2-.2.4-.4.4H5.2c-.2 0-.4-.2-.4-.4V2.2z" />
            <path d="M12 8v8M8 12h8" />
          </svg>
        </div>
        
        <div>
          <h1 className="welcome-title">Welcome to CarePoint</h1>
          <p className="welcome-subtitle">
            Self-service patient registration. Tap the button below to check in and receive your consultation token.
          </p>
        </div>
        
        <button 
          className="btn btn-primary btn-lg" 
          onClick={handleStart}
          aria-label="Start patient check-in"
        >
          Check In
        </button>
      </div>
    </div>
  );
};

export default Welcome;
