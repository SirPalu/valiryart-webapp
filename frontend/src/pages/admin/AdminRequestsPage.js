// frontend/src/pages/admin/AdminRequestsPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestsAPI } from '../../services/api'; // ✅ Importa API service
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

  const [sortBy, setSortBy] = useState('date_desc');

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    completed: 0
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [requests, filters, sortBy]);

  // ✅ USA requestsAPI invece di fetch()
  const fetchRequests = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching admin requests...');
      
      const response = await requestsAPI.getAll(); // ✅ Usa API service
      
      console.log('✅ Requests loaded:', response.data);
      
      const data = response.data.data.requests || [];
      setRequests(data);
      calculateStats(data);
      setError(null);
    } catch (err) {
      console.error('❌ Fetch requests error:', err);
      console.error('❌ Error response:', err.response?.data);
      setError('Impossibile caricare le richieste');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const stats = {
      total: data.length,
      pending: data.filter(r => r.stato === 'nuova').length,
      approved: data.filter(r => r.stato === 'in_valutazione').length,
      rejected: data.filter(r => r.stato === 'rifiutata').length,
      completed: data.filter(r => r.stato === 'completata').length
    };
    setStats(stats);
  };

  const applyFilters = () => {
    let filtered = [...requests];

    if (filters.status !== 'all') {
      filtered = filtered.filter(r => r.stato === filters.status);
    }

    if (filters.type !== 'all') {
      filtered = filtered.filter(r => r.categoria === filters.type);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(r => 
        r.nome_contatto?.toLowerCase().includes(search) ||
        r.email_contatto?.toLowerCase().includes(search) ||
        r.descrizione?.toLowerCase().includes(search)
      );
    }

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

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'date_asc':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'name_asc':
          return (a.nome_contatto || '').localeCompare(b.nome_contatto || '');
        case 'name_desc':
          return (b.nome_contatto || '').localeCompare(a.nome_contatto || '');
        default:
          return 0;
      }
    });

    setFilteredRequests(filtered);
  };

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

  // ✅ USA adminAPI per update status
  const updateRequestStatus = async (requestId, newStatus) => {
    try {
      const { adminAPI } = require('../../services/api');
      await adminAPI.updateRequestStatus(requestId, { stato: newStatus });
      fetchRequests();
    } catch (err) {
      console.error('❌ Update status error:', err);
      alert('Errore nell\'aggiornamento dello stato');
    }
  };

  const formatDate = (dateString) => {
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

      {/* Stats Cards */}
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
            <span className="stat-label">Nuove</span>
            <span className="stat-value">{stats.pending}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon approved">✅</div>
          <div className="stat-info">
            <span className="stat-label">In Valutazione</span>
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

          <div className="filter-group">
            <label>Stato</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="filter-select"
            >
              <option value="all">Tutti</option>
              <option value="nuova">Nuova</option>
              <option value="in_valutazione">In Valutazione</option>
              <option value="preventivo_inviato">Preventivo Inviato</option>
              <option value="in_lavorazione">In Lavorazione</option>
              <option value="completata">Completata</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Categoria</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="filter-select"
            >
              <option value="all">Tutti</option>
              <option value="incisioni">Incisioni</option>
              <option value="torte">Torte</option>
              <option value="eventi">Eventi</option>
              <option value="altro">Altro</option>
            </select>
          </div>

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
            </select>
          </div>
        </div>

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
                  <h3>{request.descrizione?.substring(0, 100) || 'Richiesta'}</h3>
                  <div className="request-meta">
                    <span>👤 {request.nome_contatto || 'N/A'}</span>
                    <span>📧 {request.email_contatto}</span>
                    <span>📅 {formatDate(request.created_at)}</span>
                    <span className={`type-badge ${request.categoria}`}>
                      {request.categoria}
                    </span>
                  </div>
                </div>
                <span className={`status-badge ${request.stato}`}>
                  {request.stato}
                </span>
              </div>

              <div className="request-card-body">
                <p className="request-description">
                  {request.descrizione?.substring(0, 150)}...
                </p>

                {request.data_evento && (
                  <div className="request-detail">
                    <strong>📅 Data Evento:</strong> {formatDate(request.data_evento)}
                  </div>
                )}

                {request.preventivo_importo && (
                  <div className="request-detail">
                    <strong>💰 Preventivo:</strong> {formatPrice(request.preventivo_importo)}
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

                {request.stato === 'nuova' && (
                  <>
                    <button
                      onClick={() => updateRequestStatus(request.id, 'in_valutazione')}
                      className="action-btn approve"
                    >
                      ✅ Prendi in Carico
                    </button>
                    <button
                      onClick={() => updateRequestStatus(request.id, 'rifiutata')}
                      className="action-btn reject"
                    >
                      ❌ Rifiuta
                    </button>
                  </>
                )}

                <button
                  onClick={() => navigate(`/admin/requests/${request.id}`)}
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