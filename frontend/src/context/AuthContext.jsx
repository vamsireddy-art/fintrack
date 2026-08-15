/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');
    const profilePicture = localStorage.getItem('profilePicture');
    const authProvider = localStorage.getItem('authProvider');
    
    if (token && username) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return { token, username, email, profilePicture, authProvider };
    }
    return null;
  });
  const [loading] = useState(false);

  const login = (token, username, email = null, profilePicture = null, authProvider = 'local') => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    if (email) localStorage.setItem('email', email);
    if (profilePicture) localStorage.setItem('profilePicture', profilePicture);
    localStorage.setItem('authProvider', authProvider);
    setUser({ token, username, email, profilePicture, authProvider });
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('profilePicture');
    localStorage.removeItem('authProvider');
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
