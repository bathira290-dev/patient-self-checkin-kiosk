import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Welcome from './pages/Welcome';
import Register from './pages/Register';
import Token from './pages/Token';
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Welcome Page */}
        <Route path="/welcome" element={<Welcome />} />
        
        {/* Register Page */}
        <Route path="/register" element={<Register />} />
        
        {/* Token Confirmation Page */}
        <Route path="/token" element={<Token />} />
        
        {/* Admin Dashboard */}
        <Route path="/admin" element={<Admin />} />
        
        {/* Redirect base URL to welcome */}
        <Route path="/" element={<Navigate to="/welcome" replace />} />
        
        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
