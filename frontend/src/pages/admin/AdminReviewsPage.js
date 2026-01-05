// frontend/src/pages/admin/AdminReviewsPage.js

import React, { useState, useEffect } from 'react';
import { reviewsAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import './AdminReviewsPage.css';

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, hidden
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [reviews, filter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewsAPI.getAll();
      setReviews(response.data.data.reviews);
    } catch (error) {
      console.error('Fetch reviews error:', error);
      toast.error('Errore nel caricamento delle recensioni');
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    let filtered = [...reviews];

    switch (filter) {
      case 'pending':
        filtered = filtered.filter(r => !r.approvata);
        break;
      case 'approved':
        filtered = filtered.filter(r => r.approvata && r.pubblicata);
        break;
      case 'hidden':
        filtered = filtered.filter(r => !r.pubblicata);
        break;
      default:
        // all
        break;
    }

    setFilteredReviews(filtered);
  };

  const handleApprove = async (reviewId, approve) => {
    try {
      await reviewsAPI.approve(reviewId, approve);
      toast.success(approve ? 'Recensione approvata!' : 'Approvazione rimossa');
      fetchReviews();
    } catch (error) {
      console.error('Approve error:', error);
      toast.error('Errore nell\'approvazione');
    }
  };

  const handleTogglePublish = async (reviewId, publish) => {
    try {
      await reviewsAPI.togglePublish(reviewId, publish);
      toast.success(publish ? 'Recensione pubblicata!' : 'Recensione nascosta');
      fetchReviews();
    } catch (error) {
      console.error('Toggle publish error:', error);
      toast.error('Errore nella pubblicazione');
    }
  };

  const handleReply = async (reviewId) => {
    if (!replyText.trim()) {
      toast.error('Scrivi una risposta');
      return;
    }

    try {
      setSubmitting(true);
      await reviewsAPI.reply(reviewId, { risposta_admin: replyText });
      toast.success('Risposta inviata!');
      setReplyingTo(null);
      setReplyText('');
      fetchReviews();
    } catch (error) {
      console.error('Reply error:', error);
      toast.error('Errore nell\'invio della risposta');
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getStats = () => {
    return {
      total: reviews.length,
      pending: reviews.filter(r => !r.approvata).length,
      approved: reviews.filter(r => r.approvata && r.pubblicata).length,
      avgRating: reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="admin-reviews-loading">
        <div className="spinner"></div>
        <p>Caricamento recensioni...</p>
      </div>
    );
  }

  return (
    <div className="admin-reviews-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>⭐ Gestione Recensioni</h1>
          <p>Approva, rispondi e gestisci le recensioni clienti</p>
        </div>
        <Button onClick={fetchReviews} variant="ghost">
          🔄 Aggiorna
        </Button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <Card className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Totali</p>
          </div>
        </Card>

        <Card className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.pending}</h3>
            <p>Da Approvare</p>
          </div>
        </Card>

        <Card className="stat-card approved">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.approved}</h3>
            <p>Pubblicate</p>
          </div>
        </Card>

        <Card className="stat-card rating">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>{stats.avgRating}</h3>
            <p>Media Rating</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Tutte ({reviews.length})
        </button>
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Da Approvare ({stats.pending})
        </button>
        <button
          className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
          onClick={() => setFilter('approved')}
        >
          Approvate ({stats.approved})
        </button>
        <button
          className={`filter-btn ${filter === 'hidden' ? 'active' : ''}`}
          onClick={() => setFilter('hidden')}
        >
          Nascoste
        </button>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <Card className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>Nessuna Recensione</h3>
          <p>Non ci sono recensioni da visualizzare</p>
        </Card>
      ) : (
        <div className="reviews-list">
          {filteredReviews.map(review => (
            <Card key={review.id} className="review-card">
              {/* Header */}
              <div className="review-header">
                <div className="user-info">
                  <h3>{review.user_nome} {review.user_cognome}</h3>
                  <p>{review.user_email}</p>
                  <small>
                    {new Date(review.created_at).toLocaleDateString('it-IT', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </small>
                </div>
                <div className="review-badges">
                  {!review.approvata && (
                    <span className="badge pending">⏳ Da Approvare</span>
                  )}
                  {review.approvata && review.pubblicata && (
                    <span className="badge approved">✅ Pubblicata</span>
                  )}
                  {!review.pubblicata && (
                    <span className="badge hidden">👁️ Nascosta</span>
                  )}
                </div>
              </div>

              {/* Rating */}
              <div className="review-rating">
                <span className="stars">{getRatingStars(review.rating)}</span>
                <span className="rating-text">{review.rating}/5</span>
              </div>

              {/* Content */}
              {review.titolo && (
                <h4 className="review-title">"{review.titolo}"</h4>
              )}
              <p className="review-text">{review.testo}</p>

              {/* Foto */}
              {review.foto_url && (
                <div className="review-photo">
                  <img
                    src={`${process.env.REACT_APP_API_URL?.replace('/api', '')}${review.foto_url}`}
                    alt="Recensione foto"
                  />
                </div>
              )}

              {/* Request Info */}
              <div className="request-info">
                <span>📋 Richiesta: #{review.request_id?.substring(0, 8).toUpperCase()}</span>
                <span>🏷️ {review.request_categoria}</span>
              </div>

              {/* Admin Reply */}
              {review.risposta_admin && (
                <div className="admin-reply">
                  <h5>💬 Tua Risposta:</h5>
                  <p>{review.risposta_admin}</p>
                  <small>
                    {new Date(review.risposta_admin_at).toLocaleDateString('it-IT')}
                  </small>
                </div>
              )}

              {/* Reply Form */}
              {replyingTo === review.id ? (
                <div className="reply-form">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Scrivi la tua risposta..."
                    rows={4}
                    className="reply-textarea"
                  />
                  <div className="reply-actions">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyText('');
                      }}
                      disabled={submitting}
                    >
                      Annulla
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => handleReply(review.id)}
                      loading={submitting}
                      disabled={!replyText.trim()}
                    >
                      Invia Risposta
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="review-actions">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setReplyingTo(review.id);
                      setReplyText(review.risposta_admin || '');
                    }}
                  >
                    💬 {review.risposta_admin ? 'Modifica Risposta' : 'Rispondi'}
                  </Button>

                  {!review.approvata ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleApprove(review.id, true)}
                    >
                      ✅ Approva
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleApprove(review.id, false)}
                    >
                      ❌ Rimuovi Approvazione
                    </Button>
                  )}

                  {review.pubblicata ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTogglePublish(review.id, false)}
                    >
                      👁️ Nascondi
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTogglePublish(review.id, true)}
                    >
                      👁️ Pubblica
                    </Button>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviewsPage;