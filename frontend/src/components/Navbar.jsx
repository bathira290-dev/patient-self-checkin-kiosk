import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';

  return (
    <nav
      className="no-print"
      style={{
        background: '#1a1a1a',
        color: '#fff',
        padding: '0.875rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Link
        to="/welcome"
        style={{
          fontWeight: 700,
          fontSize: '1.125rem',
          letterSpacing: '0.02em',
        }}
      >
        + HealthCare Kiosk
      </Link>
      <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.9375rem' }}>
        <Link
          to="/welcome"
          style={{
            opacity: location.pathname === '/welcome' || location.pathname === '/' ? 1 : 0.7,
          }}
        >
          Check In
        </Link>
        <Link
          to="/admin"
          style={{ opacity: isAdmin ? 1 : 0.7 }}
        >
          Admin
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
