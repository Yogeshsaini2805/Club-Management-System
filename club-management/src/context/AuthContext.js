import React, { createContext, useState, useContext, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('jecrc_user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);

      // Refresh role from server to catch mid-session changes
      if (parsed.id) {
        fetch(`${API_BASE_URL}/me?user_id=${parsed.id}`)
          .then(res => res.ok ? res.json() : null)
          .then(freshUser => {
            if (freshUser) {
              setUser(freshUser);
              localStorage.setItem('jecrc_user', JSON.stringify(freshUser));
            }
          })
          .catch(() => {}); // Silently fail if backend is unreachable
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    if (!email.endsWith('@jecrcu.edu.in')) {
      return { success: false, message: 'Please use a valid JECRC University email ID (@jecrcu.edu.in)' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('jecrc_user', JSON.stringify(data.user));
        return { success: true };
      } else {
        const errData = await response.json().catch(() => ({}));
        return { success: false, message: errData.detail || 'Invalid email or password.' };
      }
    } catch (err) {
      return { success: false, message: 'Server error. Is the backend running?' };
    }
  };

  const demoLogin = () => {
    const demoUser = {
      email: 'demo.student@jecrcu.edu.in',
      name: 'Demo Student',
      role: 'student'
    };
    setUser(demoUser);
    localStorage.setItem('jecrc_user', JSON.stringify(demoUser));
    return { success: true };
  };


  const updateUserProfile = async (userData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': String(user.id)
        },
        body: JSON.stringify(userData)
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        localStorage.setItem('jecrc_user', JSON.stringify(updatedUser));
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('jecrc_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, demoLogin, logout, loading, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
