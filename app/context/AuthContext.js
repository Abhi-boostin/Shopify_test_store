'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('customerAccessToken');
    const userData = localStorage.getItem('customerData');
    
    if (token && userData) {
      setAccessToken(token);
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = (token, customerData) => {
    localStorage.setItem('customerAccessToken', token);
    localStorage.setItem('customerData', JSON.stringify(customerData));
    setAccessToken(token);
    setUser(customerData);
  };

  const logout = () => {
    localStorage.removeItem('customerAccessToken');
    localStorage.removeItem('customerData');
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
