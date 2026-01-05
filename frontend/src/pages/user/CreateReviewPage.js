// frontend/src/pages/user/CreateReviewPage.js

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { reviewsAPI, requestsAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import './CreateReviewPage.css';

const CreateReviewPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('request');

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [canReview, setCanReview] = useState(null);

  const [formData, setFormData] = useState({
    rating: 0,
    titolo: '',
    testo: '',
    foto: null
  });

  const [fotoPreview, setFotoPreview] = useState(null);
  const [hoveredStar, setHoveredStar] = useState(0);

  useEffect(() => {
    if (requestId) {
      checkCanReview();
      fetchRequestDetail();
    } else {
      navigate('/user/requests');
    }
  }, [requestId]);

  const checkCanReview = async () => {
    try {
      const response = await reviewsAPI.canReview(requestId);
      setCanReview(response.data.data);

      if (!response.data.data.canReview) {
        const reasons = {
          request_not_found: 'Richiesta non trovata',
          not_completed: 'Puoi recensire solo richieste completate',
          already_reviewed: 'Hai già recensito questa richiesta'
        };
        
        toast.error(reasons[response.data.data.reason] || 'Non puoi recensire questa richiesta');
        setTimeout(() => navigate('/user/requests'), 2000);
      }
    } catch (error) {
      console.error('Check can review error:', error);
      toast.error('Errore nella verifica');
      navigate('/user/requests');
    }
  };

  const fetchRequestDetail = async () => {
    try {
      setLoading(true);
      const response = await requestsAPI.getById(requestId);
      setRequest(response.data.data.request);
    } catch (error) {
      console.error('Fetch request error:', error);
      toast.error('Impossibile caricare la richiesta');
      navigate('/user/requests');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Verifica tipo file
      if (!file.type.startsWith('image/')) {
        toast.error('Seleziona un\'immagine valida');
        return;
      }

      // Verifica dimensione (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Immagine troppo grande (max 5MB)');
        return;
      }

      setFormData(prev => ({ ...prev, foto: file }));
      
      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFoto = () => {
    setFormData(prev => ({ ...prev, foto: null }));
    setFotoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validazione
    if (formData.rating === 0) {
      toast.error('Seleziona una valutazione');
      return;
    }

    if (!formData.testo.trim()) {
      toast.error('Scrivi la tua recensione');
      return;
    }

    if (formData.testo.length > 500) {
      toast.error('Recensione troppo lunga (max 500 caratteri)');
      return;
    }

    try {
      setSubmitting(true);

      // Crea FormData per upload foto
      const data = new FormData();
      data.append('request_id', requestId);
      data.append('rating', formData.rating);
      data.append('titolo', formData.titolo);
      data.append('testo', formData.testo);
      
      if (formData.foto) {
        data.append('foto', formData.foto);
      }

      await reviewsAPI.create(data);
      
      toast.success('Recensione inviata! Sarà visibile sulla Home.');
      setTimeout(() => navigate('/user/requests'), 2000);
    } catch (error) {
      console.error('Submit review error:', error);
      toast.error(error.response?.data?.message || 'Errore nell\'invio della recensione');
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoriaIcon = (categoria) => {
    const icons = {
      incisioni: '🪵',
      torte: '🎂',
      eventi: '🎉',
      altro: '💡'
    };
    return icons[categoria] || '📋';
  };

  if (loading) {
    return (
      <div className="create-review-loading">
        <div className="spinner"></div>
        <p>Caricamento...</p>
      </div>
    );
  }

  if (!canReview?.canReview) {
    return null;
  }

  return (
    <div className="create-review-page">
      <div className="page-header">
        <Link to={`/user/requests/${requestId}`} className="back-link">
          ← Torna alla Richiesta
        </Link>
        <h1>✍️ Scrivi una Recensione</h1>
        <p>Condividi la tua esperienza con ValiryArt</p>
      </div>

      <div className="review-content">
        {/* Request Info */}
        <Card className="request-info-card">
          <h3>📋 Per la richiesta:</h3>
          <div className="request-summary">
            <span className="request-icon">{getCategoriaIcon(request.categoria)}</span>
            <div className="request-details">
              <h4>{request.categoria}</h4>
              <p>#{request.id.substring(0, 8).toUpperCase()}</p>
              <small>Completata il {new Date(request.completata_at || request.updated_at).toLocaleDateString('it-IT')}</small>
            </div>
          </div>
        </Card>

        {/* Review Form */}
        <Card className="review-form-card">
          <form onSubmit={handleSubmit}>
            {/* Rating */}
            <div className="form-group rating-group">
              <label className="form-label">
                ⭐ Valutazione *
              </label>
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star ${star <= (hoveredStar || formData.rating) ? 'active' : ''}`}
                    onClick={() => handleRatingClick(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                  >
                    ★
                  </button>
                ))}
              </div>
              {formData.rating > 0 && (
                <p className="rating-text">
                  {formData.rating === 1 && '⭐ Scarsa'}
                  {formData.rating === 2 && '⭐⭐ Sufficiente'}
                  {formData.rating === 3 && '⭐⭐⭐ Buona'}
                  {formData.rating === 4 && '⭐⭐⭐⭐ Ottima'}
                  {formData.rating === 5 && '⭐⭐⭐⭐⭐ Eccellente'}
                </p>
              )}
            </div>

            {/* Titolo */}
            <div className="form-group">
              <label className="form-label">
                📄 Titolo (opzionale)
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Es: Lavoro fantastico!"
                value={formData.titolo}
                onChange={(e) => setFormData({ ...formData, titolo: e.target.value })}
                maxLength={100}
              />
              <small>{formData.titolo.length}/100</small>
            </div>

            {/* Testo */}
            <div className="form-group">
              <label className="form-label">
                💬 Racconta la tua esperienza *
              </label>
              <textarea
                className="form-textarea"
                rows={6}
                placeholder="Descrivi la tua esperienza con ValiryArt, la qualità del lavoro, la comunicazione con Valeria..."
                value={formData.testo}
                onChange={(e) => setFormData({ ...formData, testo: e.target.value })}
                maxLength={500}
                required
              />
              <small className={formData.testo.length > 450 ? 'text-warning' : ''}>
                {formData.testo.length}/500 caratteri
              </small>
            </div>

            {/* Foto */}
            <div className="form-group">
              <label className="form-label">
                📷 Aggiungi una foto (opzionale)
              </label>
              
              {!fotoPreview ? (
                <div className="foto-upload-area">
                  <input
                    type="file"
                    id="foto-input"
                    accept="image/*"
                    onChange={handleFotoChange}
                    className="foto-input-hidden"
                  />
                  <label htmlFor="foto-input" className="foto-upload-label">
                    <div className="upload-icon">📤</div>
                    <p>Clicca per caricare un'immagine</p>
                    <small>JPG, PNG, max 5MB</small>
                  </label>
                </div>
              ) : (
                <div className="foto-preview-container">
                  <img src={fotoPreview} alt="Preview" className="foto-preview" />
                  <button
                    type="button"
                    onClick={handleRemoveFoto}
                    className="remove-foto-btn"
                  >
                    ✕ Rimuovi
                  </button>
                </div>
              )}
            </div>

            {/* Privacy Note */}
            <div className="privacy-note">
              <p>
                <strong>ℹ️ Nota:</strong> La tua recensione sarà visibile  sulla Home.
                Valeria potrà rispondere alla tua recensione.
              </p>
            </div>

            {/* Actions */}
            <div className="form-actions">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate(`/user/requests/${requestId}`)}
                disabled={submitting}
              >
                Annulla
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={submitting}
                disabled={submitting || formData.rating === 0 || !formData.testo.trim()}
              >
                {submitting ? 'Invio...' : '✅ Invia Recensione'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CreateReviewPage;