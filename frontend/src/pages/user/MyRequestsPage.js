// frontend/src/pages/user/MyRequestsPage.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { requestsAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import './MyRequestsPage.css';

const MyRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtri
  const [filters, setFilters] = useState({
    categoria: 'tutte',
    stato: 'tutti',
    search: ''
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, requests]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await requestsAPI.getMyRequests();
      setRequests(response.data.data.requests);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...requests];

    // Filtra per categoria
    if (filters.categoria !== 'tutte') {
      filtered = filtered.filter(r => r.categoria === filters.categoria);
    }

    // Filtra per stato
    if (filters.stato !== 'tutti') {
      filtered = filtered.filter(r => r.stato === filters.stato);
    }

    // Filtra per ricerca
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(r => 
        r.descrizione.toLowerCase().includes(searchLower) ||
        r.id.toLowerCase().includes(searchLower) ||
        r.categoria.toLowerCase().includes(searchLower)
      );
    }

    setFilteredRequests(filtered);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const getStatusBadge = (stato) => {
    const statusConfig = {
      nuova: { label: '🆕 Nuova', color: 'blue' },
      in_valutazione: { label: '🔍 In Valutazione', color: 'yellow' },
      preventivo_inviato: { label: '💰 Preventivo Inviato', color: 'purple' },
      accettata: { label: '✅ Accettata', color: 'green' },
      in_lavorazione: { label: '🔨 In Lavorazione', color: 'orange' },
      completata: { label: '🎉 Completata', color: 'success' },
      rifiutata: { label: '❌ Rifiutata', color: 'red' },
      annullata: { label: '🚫 Annullata', color: 'gray' }
    };

    const config = statusConfig[stato] || { label: stato, color: 'gray' };
    return <span className={`status-badge ${config.color}`}>{config.label}</span>;
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

  const getCategoriaLabel = (categoria) => {
    const labels = {
      incisioni: 'Incisioni su Legno',
      torte: 'Torte Decorative',
      eventi: 'Allestimento Eventi',
      altro: 'Altro'
    };
    return labels[categoria] || categoria;
  };

  if (loading) {
    return (
      <div className="requests-loading">
        <div className="spinner"></div>
        <p>Caricamento richieste...</p>
      </div>
    );
  }

  return (
    <div className="my-requests-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Le Mie Richieste</h1>
          <p>Gestisci e monitora tutte le tue richieste ValiryArt</p>
        </div>
        <Link to="/richiesta">
          <Button variant="primary" size="lg">
            ➕ Nuova Richiesta
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="filters-card">
        <div className="filters-container">
          {/* Search */}
          <div className="filter-group search-group">
            <label>🔍 Cerca</label>
            <input
              type="text"
              placeholder="Cerca per ID, descrizione..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="search-input"
            />
          </div>

          {/* Categoria */}
          <div className="filter-group">
            <label>📂 Categoria</label>
            <select
              value={filters.categoria}
              onChange={(e) => handleFilterChange('categoria', e.target.value)}
              className="filter-select"
            >
              <option value="tutte">Tutte</option>
              <option value="incisioni">🪵 Incisioni</option>
              <option value="torte">🎂 Torte</option>
              <option value="eventi">🎉 Eventi</option>
              <option value="altro">💡 Altro</option>
            </select>
          </div>

          {/* Stato */}
          <div className="filter-group">
            <label>📊 Stato</label>
            <select
              value={filters.stato}
              onChange={(e) => handleFilterChange('stato', e.target.value)}
              className="filter-select"
            >
              <option value="tutti">Tutti</option>
              <option value="nuova">🆕 Nuova</option>
              <option value="in_valutazione">🔍 In Valutazione</option>
              <option value="preventivo_inviato">💰 Preventivo</option>
              <option value="accettata">✅ Accettata</option>
              <option value="in_lavorazione">🔨 In Lavorazione</option>
              <option value="completata">🎉 Completata</option>
            </select>
          </div>

          {/* Clear Filters */}
          {(filters.categoria !== 'tutte' || filters.stato !== 'tutti' || filters.search) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilters({ categoria: 'tutte', stato: 'tutti', search: '' })}
            >
              ✕ Resetta Filtri
            </Button>
          )}
        </div>

        {/* Results Count */}
        <div className="results-count">
          Mostrando <strong>{filteredRequests.length}</strong> di <strong>{requests.length}</strong> richieste
        </div>
      </Card>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <Card className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>Nessuna Richiesta Trovata</h3>
          <p>
            {filters.categoria !== 'tutte' || filters.stato !== 'tutti' || filters.search
              ? 'Prova a modificare i filtri di ricerca'
              : 'Non hai ancora inviato richieste. Inizia ora!'}
          </p>
          {requests.length === 0 && (
            <Link to="/richiesta">
              <Button variant="primary">Crea Prima Richiesta</Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="requests-grid">
          {filteredRequests.map(request => (
            <Link 
              key={request.id}
              to={`/user/requests/${request.id}`}
              className="request-link"
            >
              <Card hoverable className="request-card">
                {/* Header */}
                <div className="request-card-header">
                  <div className="request-icon-large">
                    {getCategoriaIcon(request.categoria)}
                  </div>
                  <div className="request-main-info">
                    <span className="request-id">#{request.id.substring(0, 8).toUpperCase()}</span>
                    <h3 className="request-title">
                      {request.descrizione.length > 60 
                        ? `${request.descrizione.substring(0, 60)}...` 
                        : request.descrizione
                      }
                    </h3>
                    <p className="request-category">{getCategoriaLabel(request.categoria)}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="request-details">
                  <div className="detail-item">
                    <span className="detail-label">📅 Data:</span>
                    <span className="detail-value">
                      {new Date(request.created_at).toLocaleDateString('it-IT', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  {request.data_evento && (
                    <div className="detail-item">
                      <span className="detail-label">🗓️ Evento:</span>
                      <span className="detail-value">
                        {new Date(request.data_evento).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                  )}

                  {request.preventivo_importo && (
                    <div className="detail-item">
                      <span className="detail-label">💰 Preventivo:</span>
                      <span className="detail-value price">
                        €{parseFloat(request.preventivo_importo).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="request-card-footer">
                  {getStatusBadge(request.stato)}
                  
                  <div className="footer-actions">
                    {parseInt(request.totale_messaggi) > 0 && (
                      <span className="messages-count">
                        💬 {request.totale_messaggi}
                      </span>
                    )}
                    {parseInt(request.messaggi_non_letti) > 0 && (
                      <span className="unread-badge">
                        {request.messaggi_non_letti} nuovi
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRequestsPage;