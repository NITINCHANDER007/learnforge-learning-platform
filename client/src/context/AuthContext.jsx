import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('learnforge_token') || localStorage.getItem('datadrix_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await api.getMe();
          setUser(res.user);
        } catch (e) {
          console.warn('Failed to restore session:', e.message);
          logout();
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (identifier, password) => {
    const res = await api.login({ identifier, password });
    localStorage.setItem('learnforge_token', res.token);
    localStorage.setItem('datadrix_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res;
  };

  const register = async (nameOrPayload, email, phone, password) => {
    let payload;
    if (typeof nameOrPayload === 'object') {
      payload = nameOrPayload;
    } else if (password !== undefined) {
      payload = { name: nameOrPayload, email, phone, password };
    } else {
      payload = { name: nameOrPayload, email, password: phone };
    }

    const res = await api.register(payload);
    localStorage.setItem('learnforge_token', res.token);
    localStorage.setItem('datadrix_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('learnforge_token');
    localStorage.removeItem('datadrix_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = (updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile, isAuthenticated: !!user, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
