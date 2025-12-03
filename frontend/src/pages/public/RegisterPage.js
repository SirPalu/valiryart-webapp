import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import './AuthPages.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome obbligatorio';
    }
    
    if (!formData.cognome.trim()) {
      newErrors.cognome = 'Cognome obbligatorio';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email obbligatoria';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email non valida';
    }
    
    if (formData.telefono && !/^[0-9+\s()-]{8,}$/.test(formData.telefono)) {
      newErrors.telefono = 'Numero telefono non valido';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password obbligatoria';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password minimo 8 caratteri';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Le password non coincidono';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);
    setLoading(false);
    
    if (result.success) {
      navigate('/user');
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
    setErrors({ google: 'Errore durante registrazione con Google' });
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Registrati</h1>
            <p className="auth-subtitle">Crea il tuo account ValiryArt</p>
          </div>

          {/* Google Register */}
          <div className="google-login-wrapper">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_black"
              size="large"
              width="100%"
              text="signup_with"
              locale="it"
            />
            {errors.google && (
              <p className="error-message">{errors.google}</p>
            )}
          </div>

          <div className="divider">
            <span>oppure</span>
          </div>

          {/* Form Registrazione */}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nome" className="form-label">
                  Nome *
                </label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className={`form-control ${errors.nome ? 'error' : ''}`}
                  placeholder="Mario"
                  disabled={loading}
                />
                {errors.nome && (
                  <span className="error-message">{errors.nome}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="cognome" className="form-label">
                  Cognome *
                </label>
                <input
                  type="text"
                  id="cognome"
                  name="cognome"
                  value={formData.cognome}
                  onChange={handleChange}
                  className={`form-control ${errors.cognome ? 'error' : ''}`}
                  placeholder="Rossi"
                  disabled={loading}
                />
                {errors.cognome && (
                  <span className="error-message">{errors.cognome}</span>
                )}
              </div>
            </div>

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
              <label htmlFor="telefono" className="form-label">
                Telefono
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className={`form-control ${errors.telefono ? 'error' : ''}`}
                placeholder="+39 123 456 7890"
                disabled={loading}
              />
              {errors.telefono && (
                <span className="error-message">{errors.telefono}</span>
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
              <small className="form-hint">Minimo 8 caratteri</small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Conferma Password *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="••••••••"
                disabled={loading}
              />
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              Registrati
            </Button>
          </form>

          <div className="auth-switch">
            <p>
              Hai già un account?{' '}
              <Link to="/login" className="switch-link">
                Accedi
              </Link>
            </p>
          </div>
        </div>

        <div className="auth-info">
          <h3>Cosa puoi fare</h3>
          <ul>
            <li>🪵 Richiedere incisioni personalizzate</li>
            <li>🎂 Ordinare torte decorative</li>
            <li>🎉 Organizzare eventi unici</li>
            <li>💬 Chattare direttamente con Valeria</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;