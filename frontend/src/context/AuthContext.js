import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'Farmer' or 'Vendor'
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    // Try to load from localStorage
    try {
      const raw = localStorage.getItem('smartmandi_auth');
      if (raw) {
        const parsed = JSON.parse(raw);
        setIsLoggedIn(parsed.isLoggedIn);
        setUserRole(parsed.userRole);
        setUserInfo(parsed.userInfo);
      }
    } catch (e) {
      console.warn('Could not load auth from localStorage', e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('smartmandi_auth', JSON.stringify({ isLoggedIn, userRole, userInfo }));
    } catch (e) {}
  }, [isLoggedIn, userRole, userInfo]);

  const login = (role = 'Farmer', email = '') => {
    setIsLoggedIn(true);
    setUserRole(role);
    setUserInfo({
      id: role === 'Farmer' ? 'FM401' : 'VEN105',
      name: role === 'Farmer' ? 'Sanket Hiremath' : 'Vishw Vora',
      email: email || (role === 'Farmer' ? 'farmer@example.com' : 'vendor@example.com'),
    });
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setUserInfo(null);
    try { localStorage.removeItem('smartmandi_auth'); } catch(e){}
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userRole, userInfo, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;