import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

// Configure Axios Request Interceptor globally to pass token
axios.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo'))
      : null;
    if (userInfo && userInfo.token) {
      config.headers.Authorization = `Bearer ₹{userInfo.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLogin = () => {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        try {
          setUser(JSON.parse(userInfo));
        } catch (e) {
          console.error('Error parsing stored user info:', e);
          localStorage.removeItem('userInfo');
        }
      }
      setLoading(false);
    };
    checkLogin();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const userData = res.data.data;
      localStorage.setItem('userInfo', JSON.stringify(userData));
      setUser(userData);
      return { success: true, data: userData };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await axios.post('/api/auth/register', { name, email, password });
      const userData = res.data.data;
      localStorage.setItem('userInfo', JSON.stringify(userData));
      setUser(userData);
      return { success: true, data: userData };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, message };
    }
  };

  const loginWithGoogle = async (name, email) => {
    try {
      const res = await axios.post('/api/auth/google-login', { name, email });
      const userData = res.data.data;
      localStorage.setItem('userInfo', JSON.stringify(userData));
      setUser(userData);
      return { success: true, data: userData };
    } catch (error) {
      const message = error.response?.data?.message || 'Google Login failed. Please try again.';
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};
