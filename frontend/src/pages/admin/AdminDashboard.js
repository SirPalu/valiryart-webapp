// frontend/src/pages/admin/AdminDashboard.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI, requestsAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, requestsRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        requestsAPI.getAll({ limit: 10 })
      ]);

      setStats(statsRes.data.data);
      setRecentRequests(requestsRes.data.data.requests);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (stato) => {
    const statusConfig = {
      nuova: { label: '🆕 Nuova', color: 'blue' },
      in_valutazione: { label: '🔍 In Valutazione', color: 'yellow' },
      preventivo_inviato: { label: '💰 Preventivo', color: 'purple' },
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

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Caricamento dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Welcome Header */}
      <div className="admin-welcome">
        <div className="welcome-content">
          <h1>👋 Ciao Valeria!</h1>
          <p>Ecco una panoramica delle tue attività ValiryArt</p>
        </div>
        <div className="quick-actions-header">
          <Link to="/admin/requests?stato=nuova">
            <Button variant="primary">
              🔔 Richieste Nuove ({stats?.requests?.nuove || 0})
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="admin-stats-grid">
        <Card className="stat-card">
          <div className="stat-header">
            <span className="stat-icon">📋</span>
            <span className="stat-label">Totale Richieste</span>
          </div>
          <div className="stat-value">{stats?.requests?.nuove + stats?.requests?.in_valutazione + stats?.requests?.preventivo_inviato + stats?.requests?.in_lavorazione || 0}</div>
          <div className="stat-footer">
            <span className="stat-trend">
              +{stats?.requests?.ultima_settimana || 0} questa settimana
            </span>
          </div>
        </Card>

        <Card className="stat-card highlight">
          <div className="stat-header">
            <span className="stat-icon">🆕</span>
            <span className="stat-label">Richieste Nuove</span>
          </div>
          <div className="stat-value">{stats?.requests?.nuove || 0}</div>
          <div className="stat-footer">
            <Link to="/admin/requests?stato=nuova">Visualizza →</Link>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-header">
            <span className="stat-icon">🔨</span>
            <span className="stat-label">In Lavorazione</span>
          </div>
          <div className="stat-value">{stats?.requests?.in_lavorazione || 0}</div>
          <div className="stat-footer">
            <Link to="/admin/requests?stato=in_lavorazione">Visualizza →</Link>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-header">
            <span className="stat-icon">💰</span>
            <span className="stat-label">Preventivi Inviati</span>
          </div>
          <div className="stat-value">{stats?.requests?.preventivo_inviato || 0}</div>
          <div className="stat-footer">
            <Link to="/admin/requests?stato=preventivo_inviato">Visualizza →</Link>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-header">
            <span className="stat-icon">🎉</span>
            <span className="stat-label">Completate</span>
          </div>
          <div className="stat-value">{stats?.requests?.completate || 0}</div>
          <div className="stat-footer">
            <span className="stat-trend">Questo mese</span>
          </div>
        </Card>

        <Card className="stat-card highlight">
          <div className="stat-header">
            <span className="stat-icon">💬</span>
            <span className="stat-label">Messaggi Non Letti</span>
          </div>
          <div className="stat-value">{stats?.unreadMessages || 0}</div>
          <div className="stat-footer">
            <Link to="/admin/requests">Rispondi →</Link>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-header">
            <span className="stat-icon">👥</span>
            <span className="stat-label">Utenti Registrati</span>
          </div>
          <div className="stat-value">{stats?.users?.totale || 0}</div>
          <div className="stat-footer">
            <span className="stat-trend">+{stats?.users?.nuovi_mese || 0} questo mese</span>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-header">
            <span className="stat-icon">💸</span>
            <span className="stat-label">Revenue Mese</span>
          </div>
          <div className="stat-value">€{parseFloat(stats?.revenue?.totale || 0).toFixed(0)}</div>
          <div className="stat-footer">
            <span className="stat-trend">{stats?.revenue?.numero_ordini || 0} ordini</span>
          </div>
        </Card>
      </div>

      {/* Recent Requests */}
      <div className="recent-requests-section">
        <div className="section-header">
          <h2>📋 Richieste Recenti</h2>
          <Link to="/admin/requests">
            <Button variant="ghost">Vedi Tutte →</Button>
          </Link>
        </div>

        {recentRequests.length === 0 ? (
          <Card className="empty-state">
            <p>Nessuna richiesta recente</p>
          </Card>
        ) : (
          <div className="requests-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Categoria</th>
                  <th>Descrizione</th>
                  <th>Stato</th>
                  <th>Data</th>
                  <th>Messaggi</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.map(request => (
                  <tr key={request.id}>
                    <td>
                      <span className="request-id-small">
                        #{request.id.substring(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="client-info">
                        <strong>{request.nome_contatto}</strong>
                        <small>{request.email_contatto}</small>
                      </div>
                    </td>
                    <td>
                      <span className="categoria-badge">
                        {getCategoriaIcon(request.categoria)} {request.categoria}
                      </span>
                    </td>
                    <td className="description-cell">
                      {request.descrizione.substring(0, 50)}...
                    </td>
                    <td>
                      {getStatusBadge(request.stato)}
                    </td>
                    <td className="date-cell">
                      {new Date(request.created_at).toLocaleDateString('it-IT', {
                        day: '2-digit',
                        month: 'short'
                      })}
                    </td>
                    <td className="messages-cell">
                      <span className="messages-count">
                        💬 {request.totale_messaggi || 0}
                      </span>
                      {parseInt(request.messaggi_non_letti) > 0 && (
                        <span className="unread-badge-small">
                          {request.messaggi_non_letti}
                        </span>
                      )}
                    </td>
                    <td>
                      <Link to={`/admin/requests/${request.id}`}>
                        <Button variant="ghost" size="sm">
                          Apri →
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Stats by Category */}
      <div className="category-stats">
        <h2>📊 Richieste per Categoria</h2>
        <div className="category-grid">
          {stats?.requestsByCategory?.map(cat => (
            <Card key={cat.categoria} className="category-card">
              <div className="category-icon">{getCategoriaIcon(cat.categoria)}</div>
              <h3>{cat.categoria}</h3>
              <div className="category-numbers">
                <div className="category-stat">
                  <span className="stat-num">{cat.totale}</span>
                  <span className="stat-label">Totali</span>
                </div>
                <div className="category-stat">
                  <span className="stat-num">{cat.completate}</span>
                  <span className="stat-label">Completate</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;