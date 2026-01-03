// frontend/src/pages/admin/AdminUsersPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import './AdminUsersPage.css';

const AdminUsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtri
  const [filters, setFilters] = useState({
    search: '',
    role: 'all',
    status: 'all',
    verified: 'all',
    registrationFrom: '',
    registrationTo: ''
  });

  const [sortBy, setSortBy] = useState('date_desc');

  const [stats, setStats] = useState({
    total: 0,
    admin: 0,
    active: 0,
    verified: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, filters, sortBy]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching users...');
      
      const response = await adminAPI.getAllUsers();
      
      console.log('✅ Users loaded:', response.data);
      
      const data = response.data.data.users || [];
      setUsers(data);
      calculateStats(data);
      setError(null);
    } catch (err) {
      console.error('❌ Fetch users error:', err);
      console.error('❌ Error response:', err.response?.data);
      setError('Impossibile caricare gli utenti');
      toast.error('Errore nel caricamento degli utenti');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const stats = {
      total: data.length,
      admin: data.filter(u => u.ruolo === 'admin').length,
      active: data.filter(u => u.attivo).length,
      verified: data.filter(u => u.email_verified).length
    };
    setStats(stats);
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Search filter (nome, cognome, email)
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(u => 
        u.nome?.toLowerCase().includes(search) ||
        u.cognome?.toLowerCase().includes(search) ||
        u.email?.toLowerCase().includes(search)
      );
    }

    // Role filter
    if (filters.role !== 'all') {
      filtered = filtered.filter(u => u.ruolo === filters.role);
    }

    // Status filter
    if (filters.status !== 'all') {
      const isActive = filters.status === 'active';
      filtered = filtered.filter(u => u.attivo === isActive);
    }

    // Verified filter
    if (filters.verified !== 'all') {
      const isVerified = filters.verified === 'verified';
      filtered = filtered.filter(u => u.email_verified === isVerified);
    }

    // Date range filters
    if (filters.registrationFrom) {
      filtered = filtered.filter(u => 
        new Date(u.created_at) >= new Date(filters.registrationFrom)
      );
    }
    if (filters.registrationTo) {
      filtered = filtered.filter(u => 
        new Date(u.created_at) <= new Date(filters.registrationTo)
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'date_asc':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'name_asc':
          return (a.nome || '').localeCompare(b.nome || '');
        case 'name_desc':
          return (b.nome || '').localeCompare(a.nome || '');
        case 'last_login_desc':
          return new Date(b.last_login || 0) - new Date(a.last_login || 0);
        case 'last_login_asc':
          return new Date(a.last_login || 0) - new Date(b.last_login || 0);
        default:
          return 0;
      }
    });

    setFilteredUsers(filtered);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      role: 'all',
      status: 'all',
      verified: 'all',
      registrationFrom: '',
      registrationTo: ''
    });
    setSortBy('date_desc');
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await adminAPI.updateUserStatus(userId, { attivo: newStatus });
      toast.success(`Utente ${newStatus ? 'attivato' : 'disattivato'} con successo`);
      fetchUsers();
    } catch (err) {
      console.error('❌ Toggle status error:', err);
      toast.error('Errore nell\'aggiornamento dello stato');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Mai';
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserInitials = (nome, cognome) => {
    const n = nome?.charAt(0) || '';
    const c = cognome?.charAt(0) || '';
    return (n + c).toUpperCase() || '?';
  };

  if (loading) {
    return (
      <div className="admin-users-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Caricamento utenti...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-users-page">
        <div className="error-container">
          <p>⚠️ {error}</p>
          <button onClick={fetchUsers} className="retry-btn">
            Riprova
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-users-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Gestione Utenti</h1>
          <p>Visualizza e gestisci tutti gli utenti registrati</p>
        </div>
        <button onClick={fetchUsers} className="refresh-btn">
          🔄 Aggiorna
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <span className="stat-label">Totale Utenti</span>
            <span className="stat-value">{stats.total}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-info">
            <span className="stat-label">Utenti Attivi</span>
            <span className="stat-value">{stats.active}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-label">Email Verificate</span>
            <span className="stat-value">{stats.verified}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👑</div>
          <div className="stat-info">
            <span className="stat-label">Admin</span>
            <span className="stat-value">{stats.admin}</span>
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
              placeholder="Nome, cognome, email..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Ruolo</label>
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="filter-select"
            >
              <option value="all">Tutti</option>
              <option value="user">Utenti</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Stato</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="filter-select"
            >
              <option value="all">Tutti</option>
              <option value="active">Attivi</option>
              <option value="inactive">Disattivati</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Email Verificata</label>
            <select
              value={filters.verified}
              onChange={(e) => setFilters({ ...filters, verified: e.target.value })}
              className="filter-select"
            >
              <option value="all">Tutti</option>
              <option value="verified">Verificata</option>
              <option value="unverified">Non Verificata</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Ordina per</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="date_desc">Registrazione (recenti)</option>
              <option value="date_asc">Registrazione (meno recenti)</option>
              <option value="name_asc">Nome A-Z</option>
              <option value="name_desc">Nome Z-A</option>
              <option value="last_login_desc">Ultimo accesso (recente)</option>
              <option value="last_login_asc">Ultimo accesso (vecchio)</option>
            </select>
          </div>
        </div>

        <div className="filters-row">
          <div className="filter-group">
            <label>Registrato Da</label>
            <input
              type="date"
              value={filters.registrationFrom}
              onChange={(e) => setFilters({ ...filters, registrationFrom: e.target.value })}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Registrato Fino A</label>
            <input
              type="date"
              value={filters.registrationTo}
              onChange={(e) => setFilters({ ...filters, registrationTo: e.target.value })}
              className="filter-input"
            />
          </div>

          <button onClick={resetFilters} className="reset-filters-btn">
            ↺ Reset Filtri
          </button>
        </div>

        <div className="results-count">
          Mostrando <strong>{filteredUsers.length}</strong> di <strong>{stats.total}</strong> utenti
        </div>
      </div>

      {/* Tabella Utenti */}
      {filteredUsers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👤</div>
          <p>Nessun utente trovato</p>
          <p className="empty-subtitle">Prova a modificare i filtri</p>
        </div>
      ) : (
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Utente</th>
                <th>Email</th>
                <th>Telefono</th>
                <th>Ruolo</th>
                <th>Stato</th>
                <th>Email Verificata</th>
                <th>Registrato</th>
                <th>Ultimo Accesso</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  {/* Utente */}
                  <td>
                    <div className="user-info">
                      {user.google_avatar_url ? (
                        <img
                          src={user.google_avatar_url}
                          alt={`${user.nome} ${user.cognome}`}
                          className="user-avatar"
                        />
                      ) : (
                        <div className="user-avatar-placeholder">
                          {getUserInitials(user.nome, user.cognome)}
                        </div>
                      )}
                      <div className="user-details">
                        <strong>{user.nome} {user.cognome}</strong>
                        <span className="user-id-badge">
                          ID: {user.id.substring(0, 8).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td>
                    <small>{user.email}</small>
                  </td>

                  {/* Telefono */}
                  <td>
                    {user.telefono || <span style={{ color: 'rgba(255,255,255,0.5)' }}>N/D</span>}
                  </td>

                  {/* Ruolo */}
                  <td>
                    <span className={`role-badge ${user.ruolo}`}>
                      {user.ruolo === 'admin' ? '👑 Admin' : '👤 User'}
                    </span>
                  </td>

                  {/* Stato */}
                  <td>
                    <span className={`status-badge ${user.attivo ? 'active' : 'inactive'}`}>
                      {user.attivo ? '✅ Attivo' : '❌ Disattivato'}
                    </span>
                  </td>

                  {/* Email Verificata */}
                  <td>
                    {user.email_verified ? (
                      <span className="verified-badge">✅ Verificata</span>
                    ) : (
                      <span className="unverified-badge">⚠️ Non Verificata</span>
                    )}
                  </td>

                  {/* Registrato */}
                  <td className="date-cell">
                    {formatDate(user.created_at)}
                  </td>

                  {/* Ultimo Accesso */}
                  <td className="date-cell">
                    {formatDate(user.last_login)}
                  </td>

                  {/* Azioni */}
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => navigate(`/admin/requests?search=${user.email}`)}
                        className="action-btn view"
                        title="Visualizza richieste dell'utente"
                      >
                        📋 Richieste
                      </button>
                      {user.ruolo !== 'admin' && (
                        <button
                          onClick={() => toggleUserStatus(user.id, user.attivo)}
                          className={`action-btn ${user.attivo ? 'deactivate' : 'activate'}`}
                        >
                          {user.attivo ? '🚫 Disattiva' : '✅ Attiva'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;