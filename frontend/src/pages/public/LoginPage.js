import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import './AuthPages.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Rimuovi errore del campo modificato
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email obbligatoria';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email non valida';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password obbligatoria';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password minimo 8 caratteri';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    const result = await login(formData.email, formData.password);
    setLoading(false);
    
    if (result.success) {
      // Redirect basato su ruolo
      const isAdmin = result.user.ruolo === 'admin';
      navigate(isAdmin ? '/admin' : '/user');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    const result = await googleLogin(credentialResponse.credential);
    setLoading(false);
    
    if (result.success) {
      const isAdmin = result.user.ruolo === 'admin';
      navigate(isAdmin ? '/admin' : '/user');
    }
  };

  const handleGoogleError = () => {
    setErrors({ google: 'Errore durante login con Google' });
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          {/* Header */}
          <div className="auth-header">
            <h1 className="auth-title">Accedi</h1>
            <p className="auth-subtitle">Bentornato su ValiryArt</p>
          </div>

          {/* Google Login */}
          <div className="google-login-wrapper">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_black"
              size="large"
              width="100%"
              text="signin_with"
              locale="it"
            />
            {errors.google && (
              <p className="error-message">{errors.google}</p>
            )}
          </div>

          <div className="divider">
            <span>oppure</span>
          </div>

          {/* Form Login */}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-control ${errors.email ? 'error' : ''}`}
                placeholder="tua@email.it"
                disabled={loading}
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-control ${errors.password ? 'error' : ''}`}
                placeholder="••••••••"
                disabled={loading}
              />
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>

            <div className="form-footer">
              <Link to="/forgot-password" className="forgot-link">
                Password dimenticata?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              Accedi
            </Button>
          </form>

          {/* Link Registrazione */}
          <div className="auth-switch">
            <p>
              Non hai un account?{' '}
              <Link to="/register" className="switch-link">
                Registrati ora
              </Link>
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="auth-info">
          <h3>Perché registrarsi?</h3>
          <ul>
            <li>📋 Storico completo delle tue richieste</li>
            <li>💬 Chat diretta con Valeria</li>
            <li>🔔 Notifiche su stato lavori</li>
            <li>⚡ Richieste più veloci</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;