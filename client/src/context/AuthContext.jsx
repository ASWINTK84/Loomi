import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const userRaw = localStorage.getItem('user');

    try {
      const userData = userRaw ? JSON.parse(userRaw) : null;

      if (storedToken && userData) {
        setIsLoggedIn(true);
        setUser(userData);
        setToken(storedToken);
      }
    } catch (err) {
      console.error('Failed to parse user data from localStorage:', err);
      // If parsing fails, clear both token and user to prevent inconsistent state
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      setUser(null);
      setToken(null);
    }
  }, []);

  const login = (newToken, userData) => {
    try {
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setIsLoggedIn(true);
      setUser(userData);
      setToken(newToken);
    } catch (err) {
      console.error('Login failed to save user data to localStorage:', err);
      // Optionally clear if saving fails too, but less common
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, token, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};