import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';

  return (
    <nav className="app-navbar no-print">
      <Link to="/welcome" className="nav-title">
        + HealthCare Kiosk
      </Link>
      <div className="nav-links">
        <Link
          to="/welcome"
          className={`nav-link ${location.pathname === '/welcome' || location.pathname === '/' ? 'active' : ''}`}
        >
          Check In
        </Link>
        <Link
          to="/admin"
          className={`nav-link ${isAdmin ? 'active' : ''}`}
        >
          Admin
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
