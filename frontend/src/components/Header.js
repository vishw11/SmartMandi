import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const { isLoggedIn, userRole, userInfo, logout, login } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sm-header">
      <div className="sm-left">
        <Link to="/" className="sm-logo">SmartMandi</Link>
      </div>
      <div className="sm-right">
        {!isLoggedIn && (
          <>
            <button onClick={() => navigate('/')} className="sm-btn">Login</button>
            <button onClick={() => navigate('/register')} className="sm-btn sm-ghost">Register</button>
            <button onClick={() => { login('Farmer'); navigate('/farmer/dashboard'); }} className="sm-btn">Auto Farmer Login</button>
            <button onClick={() => { login('Vendor'); navigate('/vendor/dashboard'); }} className="sm-btn">Auto Vendor Login</button>
          </>
        )}
        {isLoggedIn && (
          <>
            <span className="sm-welcome">Hi, {userInfo?.name}</span>
            <Link to={`/${userRole?.toLowerCase()}/dashboard`} className="sm-link">Dashboard</Link>
            <button onClick={() => { logout(); navigate('/'); }} className="sm-btn sm-logout">Logout</button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;