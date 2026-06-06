import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // We want to hide navigation links on welcome, register, and token screens to prevent patients from accessing the admin panel or escaping the flow.
  const isKioskMode = currentPath === '/welcome' || currentPath === '/' || currentPath === '/register' || currentPath === '/token';

  return (
    <nav className="navbar">
      <Link to="/welcome" className="navbar-brand">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
        <span>CarePoint Kiosk</span>
      </Link>
      
      {!isKioskMode ? (
        <div className="navbar-nav">
          <Link to="/welcome" className={`nav-link ${currentPath === '/welcome' ? 'active' : ''}`}>
            Kiosk Mode
          </Link>
          <Link to="/admin" className={`nav-link ${currentPath === '/admin' ? 'active' : ''}`}>
            Admin Panel
          </Link>
        </div>
      ) : (
        // Clean badge for kiosk representation
        <span className="badge">Kiosk Self Check-In</span>
      )}
    </nav>
  );
};

export default Navbar;
