import React from 'react';

const Spinner = ({ message = "Loading..." }) => {
  return (
    <div className="spinner-container">
      <div className="spinner" role="status"></div>
      <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{message}</p>
    </div>
  );
};

export default Spinner;
