import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Carica utente al mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('valiryart_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await authAPI.getCurrentUser();
      setUser(response.data.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('valiryart_token');
      localStorage.removeItem('valiryart_user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { user, token } = response.data.data;
      
      localStorage.setItem('valiryart_token', token);
      localStorage.setItem('valiryart_user', JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);
      
      toast.success('Login effettuato con successo!');
      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || 'Errore durante il login';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (data) => {
    try {
      const response = await authAPI.register(data);
      const { user, token } = response.data.data;
      
      localStorage.setItem('valiryart_token', token);
      localStorage.setItem('valiryart_user', JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);
      
      toast.success('Registrazione completata!');
      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || 'Errore durante la registrazione';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const googleLogin = async (credential) => {
    try {
      const response = await authAPI.googleAuth(credential);
      const { user, token } = response.data.data;
      
      localStorage.setItem('valiryart_token', token);
      localStorage.setItem('valiryart_user', JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);
      
      toast.success('Login con Google completato!');
      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || 'Errore login Google';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('valiryart_token');
      localStorage.removeItem('valiryart_user');
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logout effettuato');
    }
  };

  const updateUser = async (data) => {
    try {
      const response = await authAPI.updateProfile(data);
      const updatedUser = response.data.data.user;
      
      setUser(updatedUser);
      localStorage.setItem('valiryart_user', JSON.stringify(updatedUser));
      
      toast.success('Profilo aggiornato!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Errore aggiornamento profilo';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const isAdmin = () => {
    return user?.ruolo === 'admin';
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    register,
    googleLogin,
    logout,
    updateUser,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};