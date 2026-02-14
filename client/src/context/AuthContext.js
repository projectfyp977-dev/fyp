import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { getApiUrl } from '../utils/apiUrl';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${getApiUrl()}/auth/me`);
      setUser(response.data.user);
    } catch (error) {
      console.error('Fetch user error:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const apiUrl = getApiUrl();
      const response = await axios.post(`${apiUrl}/auth/login`, { email, password }, { timeout: 10000 });
      const { token: newToken, user: userData } = response.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      return { success: true };
    } catch (error) {
      let message = 'Login failed';
      const apiUrl = getApiUrl();
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        message = `Server not reachable at ${apiUrl}/auth/login. 
        
Please check:
1. Backend server is running: Open terminal in server folder and run "npm run server" or "npm start"
2. XAMPP MySQL is running (if using local database)
3. If deployed on Vercel, set REACT_APP_API_URL environment variable to your backend URL
4. Check firewall/antivirus is not blocking port 5000`;
      } else if (error.code === 'ECONNABORTED') {
        message = `Request timeout. Server at ${apiUrl} is slow or not running. Check if backend server is running.`;
      } else if (error.response?.status === 400 && error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      return { success: false, message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const apiUrl = getApiUrl();
      const response = await axios.post(`${apiUrl}/auth/register`, {
        name,
        email,
        password
      });
      const { token: newToken, user: userData } = response.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed';
      const apiUrl = getApiUrl();
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        errorMessage = `Server not reachable at ${apiUrl}/auth/register. 
        
Please check:
1. Backend server is running: Open terminal in server folder and run "npm run server" or "npm start"
2. XAMPP MySQL is running (if using local database)
3. If deployed on Vercel, set REACT_APP_API_URL environment variable to your backend URL
4. Check firewall/antivirus is not blocking port 5000`;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      return { success: false, message: errorMessage };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

