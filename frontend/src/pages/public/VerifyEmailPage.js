import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './VerifyEmailPage.css';

const VerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading | success | error | expired | already_verified
  const [message, setMessage] = useState('');

  useEffect(() => {
    verifyEmail();
    // eslint-disable-next-line
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await axios.get(`/api/auth/verify-email/${token}`);
      
      if (response.data.alreadyVerified) {
        setStatus('already_verified');
        setMessage('La tua email è già stata verificata in precedenza.');
      } else {
        setStatus('success');
        setMessage(response.data.message || 'Email verificata con successo!');
        
        // Redirect dopo 3 secondi
        setTimeout(() => {
          navigate('/user');
        }, 3000);
      }
    } catch (error) {
      console.error('Email verification error:', error);
      
      if (error.response?.data?.expired) {
        setStatus('expired');
        setMessage('Il link di verifica è scaduto.');
      } else {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Errore durante la verifica email.');
      }
    }
  };

  return (
    <div className="verify-email-page">
      <div className="verify-email-container">
        <div className="verify-email-card">
          {/* Loading State */}
          {status === 'loading' && (
            <>
              <div className="verify-icon loading">
                <div className="spinner"></div>
              </div>
              <h1 className="verify-title">Verifica in corso...</h1>
              <p className="verify-message">Stiamo verificando la tua email. Un attimo di pazienza!</p>
            </>
          )}

          {/* Success State */}
          {status === 'success' && (
            <>
              <div className="verify-icon success">
                <span className="checkmark">✓</span>
              </div>
              <h1 className="verify-title">Email Verificata! 🎉</h1>
              <p className="verify-message">{message}</p>
              <p className="verify-submessage">Verrai reindirizzato alla tua area personale...</p>
              <Link to="/user" className="verify-button">
                Vai alla Dashboard
              </Link>
            </>
          )}

          {/* Already Verified State */}
          {status === 'already_verified' && (
            <>
              <div className="verify-icon info">
                <span className="info-icon">ℹ</span>
              </div>
              <h1 className="verify-title">Email Già Verificata</h1>
              <p className="verify-message">{message}</p>
              <Link to="/user" className="verify-button">
                Vai alla Dashboard
              </Link>
            </>
          )}

          {/* Error State */}
          {status === 'error' && (
            <>
              <div className="verify-icon error">
                <span className="error-icon">✕</span>
              </div>
              <h1 className="verify-title">Verifica Fallita</h1>
              <p className="verify-message">{message}</p>
              <p className="verify-submessage">Il link potrebbe essere non valido o già utilizzato.</p>
              <Link to="/login" className="verify-button">
                Torna al Login
              </Link>
            </>
          )}

          {/* Expired State */}
          {status === 'expired' && (
            <>
              <div className="verify-icon expired">
                <span className="expired-icon">⌛</span>
              </div>
              <h1 className="verify-title">Link Scaduto</h1>
              <p className="verify-message">{message}</p>
              <p className="verify-submessage">
                I link di verifica sono validi per 1 ora. Puoi richiedere un nuovo link dall'area personale.
              </p>
              <Link to="/login" className="verify-button">
                Vai al Login
              </Link>
            </>
          )}

          {/* Footer Info */}
          <div className="verify-footer">
            <p>
              Hai bisogno di aiuto?{' '}
              <a href="mailto:valiryart93@gmail.com" className="verify-link">
                Contattaci
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;