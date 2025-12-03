// frontend/src/pages/admin/RequestDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Chat from '../../components/chat/Chat';
import './RequestDetailPage.css';

const RequestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details'); // details, timeline, chat
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    estimated_price: '',
    event_date: '',
    notes: ''
  });

  useEffect(() => {
    fetchRequestDetail();
  }, [id]);

  const fetchRequestDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/requests/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error('Errore nel caricamento richiesta');

      const data = await response.json();
      setRequest(data.data);
      setEditForm({
        estimated_price: data.data.estimated_price || '',
        event_date: data.data.event_date ? data.data.event_date.split('T')[0] : '',
        notes: data.data.notes || ''
      });
      setError(null);
    } catch (err) {
      console.error('Errore:', err);
      setError('Impossibile caricare i dettagli della richiesta');
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/requests/${id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: newStatus })
        }
      );

      if (!response.ok) throw new Error('Errore aggiornamento stato');

      fetchRequestDetail();
    } catch (err) {
      console.error('Errore:', err);
      alert('Errore nell\'aggiornamento dello stato');
    }
  };

  const updateRequestDetails = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/requests/${id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(editForm)
        }
      );

      if (!response.ok) throw new Error('Errore aggiornamento dettagli');

      fetchRequestDetail();
      setIsEditing(false);
      alert('Dettagli aggiornati con successo!');
    } catch (err) {
      console.error('Errore:', err);
      alert('Errore nell\'aggiornamento dei dettagli');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    if (!price) return 'Da definire';
    return `€ ${parseFloat(price).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="request-detail-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Caricamento dettagli...</p>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="request-detail-page">
        <div className="error-container">
          <p>⚠️ {error || 'Richiesta non trovata'}</p>
          <button onClick={() => navigate('/admin/requests')} className="back-btn">
            ← Torna alle richieste
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="request-detail-page">
      {/* Header con Breadcrumb */}
      <div className="page-header">
        <button onClick={() => navigate('/admin/requests')} className="back-btn">
          ← Torna alle richieste
        </button>
        <div className="header-actions">
          {request.status === 'pending' && (
            <>
              <button
                onClick={() => updateRequestStatus('approved')}
                className="action-btn approve"
              >
                ✅ Approva
              </button>
              <button
                onClick={() => updateRequestStatus('rejected')}
                className="action-btn reject"
              >
                ❌ Rifiuta
              </button>
            </>
          )}
          {request.status === 'approved' && (
            <button
              onClick={() => updateRequestStatus('completed')}
              className="action-btn complete"
            >
              🎉 Segna come Completata
            </button>
          )}
        </div>
      </div>

      {/* Info Card Principale */}
      <div className="request-info-card">
        <div className="card-header">
          <div>
            <h1>{request.title || 'Richiesta senza titolo'}</h1>
            <div className="request-meta">
              <span className={`status-badge ${request.status}`}>
                {request.status === 'pending' && '⏳ In Attesa'}
                {request.status === 'approved' && '✅ Approvata'}
                {request.status === 'rejected' && '❌ Rifiutata'}
                {request.status === 'completed' && '🎉 Completata'}
              </span>
              <span className={`type-badge ${request.type}`}>
                {request.type === 'engraving' && '🪵 Incisione'}
                {request.type === 'cake' && '🍰 Torta'}
                {request.type === 'event' && '🎉 Evento'}
                {request.type === 'other' && '📝 Altro'}
              </span>
              <span>📅 {formatDate(request.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Cliente Info */}
        <div className="customer-section">
          <h3>👤 Informazioni Cliente</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Nome</label>
              <p>{request.customer_name || 'N/A'}</p>
            </div>
            <div className="info-item">
              <label>Email</label>
              <p>{request.customer_email}</p>
            </div>
            {request.customer_phone && (
              <div className="info-item">
                <label>Telefono</label>
                <p>{request.customer_phone}</p>
              </div>
            )}
            <div className="info-item">
              <label>ID Utente</label>
              <p>#{request.user_id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="tabs-container">
        <div className="tabs-nav">
          <button
            className={`tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            📋 Dettagli
          </button>
          <button
            className={`tab ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            ⏱️ Timeline
          </button>
          <button
            className={`tab ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            💬 Chat
          </button>
        </div>

        <div className="tab-content">
          {/* TAB: DETTAGLI */}
          {activeTab === 'details' && (
            <div className="details-tab">
              {!isEditing ? (
                <>
                  <div className="section">
                    <div className="section-header">
                      <h3>📝 Descrizione Richiesta</h3>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="edit-btn"
                      >
                        ✏️ Modifica
                      </button>
                    </div>
                    <p className="description-text">
                      {request.description || 'Nessuna descrizione fornita'}
                    </p>
                  </div>

                  <div className="details-grid">
                    <div className="detail-card">
                      <div className="detail-icon">💰</div>
                      <div className="detail-info">
                        <label>Prezzo Stimato</label>
                        <p>{formatPrice(request.estimated_price)}</p>
                      </div>
                    </div>

                    {request.event_date && (
                      <div className="detail-card">
                        <div className="detail-icon">📅</div>
                        <div className="detail-info">
                          <label>Data Evento</label>
                          <p>{formatDate(request.event_date)}</p>
                        </div>
                      </div>
                    )}

                    <div className="detail-card">
                      <div className="detail-icon">📊</div>
                      <div className="detail-info">
                        <label>ID Richiesta</label>
                        <p>#{request.id}</p>
                      </div>
                    </div>

                    <div className="detail-card">
                      <div className="detail-icon">🕐</div>
                      <div className="detail-info">
                        <label>Creata il</label>
                        <p>{formatDate(request.created_at)}</p>
                      </div>
                    </div>
                  </div>

                  {request.notes && (
                    <div className="section">
                      <h3>📌 Note Admin</h3>
                      <div className="notes-box">
                        {request.notes}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <form onSubmit={updateRequestDetails} className="edit-form">
                  <h3>✏️ Modifica Dettagli</h3>
                  
                  <div className="form-group">
                    <label>💰 Prezzo Stimato (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.estimated_price}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        estimated_price: e.target.value
                      })}
                      placeholder="Es: 150.00"
                    />
                  </div>

                  <div className="form-group">
                    <label>📅 Data Evento</label>
                    <input
                      type="date"
                      value={editForm.event_date}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        event_date: e.target.value
                      })}
                    />
                  </div>

                  <div className="form-group">
                    <label>📌 Note Admin</label>
                    <textarea
                      rows="5"
                      value={editForm.notes}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        notes: e.target.value
                      })}
                      placeholder="Note interne, promemoria, dettagli tecnici..."
                    />
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="save-btn">
                      💾 Salva Modifiche
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="cancel-btn"
                    >
                      ❌ Annulla
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="timeline-tab">
              <h3>⏱️ Storia della Richiesta</h3>
              <div className="timeline">
                <div className="timeline-item">
                  <div className="timeline-marker created"></div>
                  <div className="timeline-content">
                    <h4>📝 Richiesta Creata</h4>
                    <p>{formatDate(request.created_at)}</p>
                    <span className="timeline-detail">
                      Cliente: {request.customer_name}
                    </span>
                  </div>
                </div>

                {request.status !== 'pending' && (
                  <div className="timeline-item">
                    <div className={`timeline-marker ${request.status}`}></div>
                    <div className="timeline-content">
                      <h4>
                        {request.status === 'approved' && '✅ Richiesta Approvata'}
                        {request.status === 'rejected' && '❌ Richiesta Rifiutata'}
                        {request.status === 'completed' && '🎉 Lavoro Completato'}
                      </h4>
                      <p>{formatDate(request.updated_at || request.created_at)}</p>
                    </div>
                  </div>
                )}

                {request.status === 'completed' && (
                  <div className="timeline-item">
                    <div className="timeline-marker completed"></div>
                    <div className="timeline-content">
                      <h4>🎊 Progetto Finalizzato</h4>
                      <p>{formatDate(request.updated_at)}</p>
                      <span className="timeline-detail">
                        Cliente soddisfatto ✓
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: CHAT */}
          {activeTab === 'chat' && (
            <div className="chat-tab">
              <Chat
                requestId={request.id}
                recipientId={request.user_id}
                recipientName={request.customer_name}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestDetailPage;