import { useNavigate } from 'react-router-dom';

function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <div className="card card-narrow" style={{ textAlign: 'center' }}>
        <div className="icon-circle" aria-hidden="true">
          +
        </div>
        <h1 className="title">Welcome</h1>
        <p className="subtitle">
          Patient Self Check-in Kiosk
          <br />
          Tap below to register your visit
        </p>
        <button
          className="btn"
          onClick={() => navigate('/register')}
          style={{ width: '100%', maxWidth: '320px' }}
        >
          Check In
        </button>
      </div>
    </div>
  );
}

export default Welcome;
