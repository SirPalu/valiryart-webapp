import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { requestsAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import './UserDashboard.css';

const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await requestsAPI.getMyRequests();
      const requests = response.data.data.requests;

      // Calcola statistiche
      const statsData = {
        totale: requests.length,
        nuove: requests.filter(r => r.stato === 'nuova').length,
        in_lavorazione: requests.filter(r => ['in_valutazione', 'preventivo_inviato', 'in_lavorazione'].includes(r.stato)).length,
        completate: requests.filter(r => r.stato === 'completata').length,
        messaggi_non_letti: requests.reduce((sum, r) => sum + (parseInt(r.messaggi_non_letti) || 0), 0)
      };

      setStats(statsData);
      setRecentRequests(requests.slice(0, 5)); // Ultime 5
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

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Caricamento dati...</p>
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Benvenuto, {user?.nome}! 👋</h1>
          <p>Ecco una panoramica delle tue richieste ValiryArt</p>
        </div>
        <Link to="/richiesta">
          <Button variant="primary" size="lg">
            ➕ Nuova Richiesta
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <Card className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{stats?.totale || 0}</h3>
            <p>Richieste Totali</p>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon">🔨</div>
          <div className="stat-content">
            <h3>{stats?.in_lavorazione || 0}</h3>
            <p>In Lavorazione</p>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon">🎉</div>
          <div className="stat-content">
            <h3>{stats?.completate || 0}</h3>
            <p>Completate</p>
          </div>
        </Card>

        <Card className="stat-card highlight">
          <div className="stat-icon">💬</div>
          <div className="stat-content">
            <h3>{stats?.messaggi_non_letti || 0}</h3>
            <p>Messaggi da Leggere</p>
          </div>
        </Card>
      </div>

      {/* Recent Requests */}
      <div className="recent-section">
        <div className="section-header">
          <h2>Richieste Recenti</h2>
          <Link to="/user/requests">
            <Button variant="ghost">Vedi Tutte →</Button>
          </Link>
        </div>

        {recentRequests.length === 0 ? (
          <Card className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>Nessuna Richiesta</h3>
            <p>Non hai ancora inviato richieste. Inizia creando la tua prima opera personalizzata!</p>
            <Link to="/richiesta">
              <Button variant="primary">Crea Prima Richiesta</Button>
            </Link>
          </Card>
        ) : (
          <div className="requests-list">
            {recentRequests.map(request => (
              <Link 
                key={request.id} 
                to={`/user/requests/${request.id}`}
                className="request-item"
              >
                <Card hoverable className="request-card">
                  <div className="request-header">
                    <div className="request-icon">
                      {getCategoriaIcon(request.categoria)}
                    </div>
                    <div className="request-info">
                      <h3>{request.descrizione.substring(0, 50)}{request.descrizione.length > 50 ? '...' : ''}</h3>
                      <p className="request-meta">
                        <span>#{request.id.substring(0, 8).toUpperCase()}</span>
                        <span>•</span>
                        <span>{new Date(request.created_at).toLocaleDateString('it-IT')}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="request-footer">
                    {getStatusBadge(request.stato)}
                    {parseInt(request.messaggi_non_letti) > 0 && (
                      <span className="unread-badge">
                        {request.messaggi_non_letti} nuovo{parseInt(request.messaggi_non_letti) > 1 ? 'i' : ''} messaggi{parseInt(request.messaggi_non_letti) > 1 ? 'o' : ''}
                      </span>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Azioni Rapide</h2>
        <div className="actions-grid">
          <Link to="/incisioni">
            <Card hoverable className="action-card">
              <span className="action-icon">🪵</span>
              <h3>Incisioni su Legno</h3>
              <p>Personalizza oggetti in legno</p>
            </Card>
          </Link>

          <Link to="/torte">
            <Card hoverable className="action-card">
              <span className="action-icon">🎂</span>
              <h3>Torte Decorative</h3>
              <p>Torte scenografiche per eventi</p>
            </Card>
          </Link>

          <Link to="/eventi">
            <Card hoverable className="action-card">
              <span className="action-icon">🎉</span>
              <h3>Allestimento Eventi</h3>
              <p>Decori personalizzati</p>
            </Card>
          </Link>

          <Link to="/user/profile">
            <Card hoverable className="action-card">
              <span className="action-icon">👤</span>
              <h3>Il Mio Profilo</h3>
              <p>Gestisci i tuoi dati</p>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;