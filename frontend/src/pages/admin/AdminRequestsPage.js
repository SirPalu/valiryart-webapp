// frontend/src/pages/admin/AdminRequestsPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminRequestsPage.css';

const AdminRequestsPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtri
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    search: '',
    dateFrom: '',
    dateTo: ''
  });

  // Ordinamento
  const [sortBy, setSortBy] = useState('date_desc');

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    completed: 0
  });

  // Carica richieste
  useEffect(() => {
    fetchRequests();
  }, []);

  // Applica filtri quando cambiano
  useEffect(() => {
    applyFilters();
  }, [requests, filters, sortBy]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/requests`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error('Errore nel caricamento richieste');

      const data = await response.json();
      setRequests(data.data || []);
      calculateStats(data.data || []);
      setError(null);
    } catch (err) {
      console.error('Errore:', err);
      setError('Impossibile caricare le richieste');
    } finally {
      setLoading(false);
    }
  };

  // Calcola statistiche
  const calculateStats = (data) => {
    const stats = {
      total: data.length,
      pending: data.filter(r => r.status === 'pending').length,
      approved: data.filter(r => r.status === 'approved').length,
      rejected: data.filter(r => r.status === 'rejected').length,
      completed: data.filter(r => r.status === 'completed').length
    };
    setStats(stats);
  };

  // Applica filtri e ordinamento
  const applyFilters = () => {
    let filtered = [...requests];

    // Filtro stato
    if (filters.status !== 'all') {
      filtered = filtered.filter(r => r.status === filters.status);
    }

    // Filtro tipo
    if (filters.type !== 'all') {
      filtered = filtered.filter(r => r.type === filters.type);
    }

    // Filtro ricerca (nome cliente, email, titolo)
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(r => 
        r.customer_name?.toLowerCase().includes(search) ||
        r.customer_email?.toLowerCase().includes(search) ||
        r.title?.toLowerCase().includes(search) ||
        r.description?.toLowerCase().includes(search)
      );
    }

    // Filtro data
    if (filters.dateFrom) {
      filtered = filtered.filter(r => 
        new Date(r.created_at) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(r => 
        new Date(r.created_at) <= new Date(filters.dateTo)
      );
    }

    // Ordinamento
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'date_asc':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'name_asc':
          return (a.customer_name || '').localeCompare(b.customer_name || '');
        case 'name_desc':
          return (b.customer_name || '').localeCompare(a.customer_name || '');
        case 'price_desc':
          return (b.estimated_price || 0) - (a.estimated_price || 0);
        case 'price_asc':
          return (a.estimated_price || 0) - (b.estimated_price || 0);
        default:
          return 0;
      }
    });

    setFilteredRequests(filtered);
  };

  // Reset filtri
  const resetFilters = () => {
    setFilters({
      status: 'all',
      type: 'all',
      search: '',
      dateFrom: '',
      dateTo: ''
    });
    setSortBy('date_desc');
  };

  // Aggiorna stato richiesta
  const updateRequestStatus = async (requestId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/requests/${requestId}`,
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

      // Ricarica richieste
      fetchRequests();
    } catch (err) {
      console.error('Errore:', err);
      alert('Errore nell\'aggiornamento dello stato');
    }
  };

  // Formatta data
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Formatta prezzo
  const formatPrice = (price) => {
    if (!price) return 'Da definire';
    return `€ ${parseFloat(price).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="admin-requests-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Caricamento richieste...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-requests-page">
        <div className="error-container">
          <p>⚠️ {error}</p>
          <button onClick={fetchRequests} className="retry-btn">
            Riprova
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-requests-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Gestione Richieste</h1>
          <p>Gestisci tutte le richieste clienti</p>
        </div>
        <button onClick={fetchRequests} className="refresh-btn">
          🔄 Aggiorna
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon total">📊</div>
          <div className="stat-info">
            <span className="stat-label">Totale</span>
            <span className="stat-value">{stats.total}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending">⏳</div>
          <div className="stat-info">
            <span className="stat-label">In Attesa</span>
            <span className="stat-value">{stats.pending}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon approved">✅</div>
          <div className="stat-info">
            <span className="stat-label">Approvate</span>
            <span className="stat-value">{stats.approved}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon completed">🎉</div>
          <div className="stat-info">
            <span className="stat-label">Completate</span>
            <span className="stat-value">{stats.completed}</span>
          </div>
        </div>
      </div>

      {/* Filtri */}
      <div className="filters-section">
        <div className="filters-row">
          {/* Ricerca */}
          <div className="filter-group">
            <label>🔍 Cerca</label>
            <input
              type="text"
              placeholder="Nome, email, descrizione..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="filter-input"
            />
          </div>

          {/* Stato */}
          <div className="filter-group">
            <label>Stato</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="filter-select"
            >
              <option value="all">Tutti</option>
              <option value="pending">In Attesa</option>
              <option value="approved">Approvate</option>
              <option value="rejected">Rifiutate</option>
              <option value="completed">Completate</option>
            </select>
          </div>

          {/* Tipo */}
          <div className="filter-group">
            <label>Tipo</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="filter-select"
            >
              <option value="all">Tutti</option>
              <option value="engraving">Incisione</option>
              <option value="cake">Torta</option>
              <option value="event">Evento</option>
              <option value="other">Altro</option>
            </select>
          </div>

          {/* Ordinamento */}
          <div className="filter-group">
            <label>Ordina per</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="date_desc">Data (recenti)</option>
              <option value="date_asc">Data (meno recenti)</option>
              <option value="name_asc">Nome A-Z</option>
              <option value="name_desc">Nome Z-A</option>
              <option value="price_desc">Prezzo (alto)</option>
              <option value="price_asc">Prezzo (basso)</option>
            </select>
          </div>
        </div>

        {/* Data Range */}
        <div className="filters-row">
          <div className="filter-group">
            <label>Da Data</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>A Data</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="filter-input"
            />
          </div>

          <button onClick={resetFilters} className="reset-filters-btn">
            ↺ Reset Filtri
          </button>
        </div>

        <div className="results-count">
          Mostrando <strong>{filteredRequests.length}</strong> di <strong>{stats.total}</strong> richieste
        </div>
      </div>

      {/* Lista Richieste */}
      <div className="requests-list">
        {filteredRequests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>Nessuna richiesta trovata</p>
            <p className="empty-subtitle">Prova a modificare i filtri</p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div key={request.id} className="request-card">
              <div className="request-card-header">
                <div className="request-main-info">
                  <h3>{request.title || 'Richiesta senza titolo'}</h3>
                  <div className="request-meta">
                    <span>👤 {request.customer_name || 'N/A'}</span>
                    <span>📧 {request.customer_email}</span>
                    <span>📅 {formatDate(request.created_at)}</span>
                    <span className={`type-badge ${request.type}`}>
                      {request.type === 'engraving' && '🪵 Incisione'}
                      {request.type === 'cake' && '🍰 Torta'}
                      {request.type === 'event' && '🎉 Evento'}
                      {request.type === 'other' && '📝 Altro'}
                    </span>
                  </div>
                </div>
                <span className={`status-badge ${request.status}`}>
                  {request.status === 'pending' && '⏳ In Attesa'}
                  {request.status === 'approved' && '✅ Approvata'}
                  {request.status === 'rejected' && '❌ Rifiutata'}
                  {request.status === 'completed' && '🎉 Completata'}
                </span>
              </div>

              <div className="request-card-body">
                <p className="request-description">
                  {request.description || 'Nessuna descrizione'}
                </p>

                {request.event_date && (
                  <div className="request-detail">
                    <strong>📅 Data Evento:</strong> {formatDate(request.event_date)}
                  </div>
                )}

                {request.estimated_price && (
                  <div className="request-detail">
                    <strong>💰 Prezzo Stimato:</strong> {formatPrice(request.estimated_price)}
                  </div>
                )}

                {request.notes && (
                  <div className="request-detail">
                    <strong>📝 Note:</strong> {request.notes}
                  </div>
                )}
              </div>

              <div className="request-card-actions">
                <button
                  onClick={() => navigate(`/admin/requests/${request.id}`)}
                  className="action-btn view"
                >
                  👁️ Dettagli
                </button>

                {request.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateRequestStatus(request.id, 'approved')}
                      className="action-btn approve"
                    >
                      ✅ Approva
                    </button>
                    <button
                      onClick={() => updateRequestStatus(request.id, 'rejected')}
                      className="action-btn reject"
                    >
                      ❌ Rifiuta
                    </button>
                  </>
                )}

                {request.status === 'approved' && (
                  <button
                    onClick={() => updateRequestStatus(request.id, 'completed')}
                    className="action-btn complete"
                  >
                    🎉 Completa
                  </button>
                )}

                <button
                  onClick={() => navigate(`/admin/requests/${request.id}/chat`)}
                  className="action-btn chat"
                >
                  💬 Chat
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminRequestsPage;