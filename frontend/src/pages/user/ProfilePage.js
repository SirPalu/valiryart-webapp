import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // States per le diverse sezioni
  const [profileData, setProfileData] = useState({
    nome: user?.nome || '',
    telefono: user?.telefono || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [deleteData, setDeleteData] = useState({
    password: '',
    confirmText: ''
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState({
    profile: false,
    password: false,
    delete: false
  });

  const [errors, setErrors] = useState({});

  // Determina se è utente Google
  const isGoogleUser = user?.google_avatar_url && !user?.password_hash;

  // ============================================
  // AGGIORNA PROFILO
  // ============================================
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, profile: true }));
    setErrors({});

    try {
      const response = await authAPI.updateProfile({
        nome: profileData.nome,
        telefono: profileData.telefono
      });

      toast.success('Profilo aggiornato con successo!');
      
      // Aggiorna context
      // Nota: AuthContext dovrebbe avere un metodo refreshUser()
      window.location.reload(); // Workaround temporaneo
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error(error.response?.data?.message || 'Errore nell\'aggiornamento');
      setErrors({ profile: error.response?.data?.message });
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };

  // ============================================
  // CAMBIO PASSWORD
  // ============================================
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, password: true }));
    setErrors({});

    // Validazione client-side
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrors({ password: 'Le password non coincidono' });
      setLoading(prev => ({ ...prev, password: false }));
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setErrors({ password: 'La password deve essere di almeno 8 caratteri' });
      setLoading(prev => ({ ...prev, password: false }));
      return;
    }

    try {
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      toast.success('Password cambiata con successo!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Change password error:', error);
      toast.error(error.response?.data?.message || 'Errore nel cambio password');
      setErrors({ password: error.response?.data?.message });
    } finally {
      setLoading(prev => ({ ...prev, password: false }));
    }
  };

  // ============================================
  // ELIMINA ACCOUNT
  // ============================================
  const handleDeleteAccount = async () => {
    setLoading(prev => ({ ...prev, delete: true }));
    setErrors({});

    // Validazione
    if (deleteData.confirmText !== 'DELETE') {
      setErrors({ delete: 'Scrivi DELETE per confermare' });
      setLoading(prev => ({ ...prev, delete: false }));
      return;
    }

    if (!isGoogleUser && !deleteData.password) {
      setErrors({ delete: 'Password richiesta per confermare' });
      setLoading(prev => ({ ...prev, delete: false }));
      return;
    }

    try {
      await authAPI.deleteAccount({
        password: deleteData.password,
        confirmText: deleteData.confirmText
      });

      toast.success('Account eliminato con successo');
      
      // Logout e redirect
      setTimeout(() => {
        logout();
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Delete account error:', error);
      toast.error(error.response?.data?.message || 'Errore nell\'eliminazione account');
      setErrors({ delete: error.response?.data?.message });
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <h1>Il Mio Profilo</h1>
          <p>Gestisci le tue informazioni personali</p>
        </div>

        <div className="profile-grid">
          
          {/* ============================================
              SEZIONE: INFORMAZIONI ACCOUNT
              ============================================ */}
          <Card className="profile-section">
            <div className="section-header">
              <h2>📊 Informazioni Account</h2>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Email:</span>
                <span className="info-value">{user?.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Tipo Account:</span>
                <span className="info-value">
                  {isGoogleUser ? (
                    <span className="badge badge-google">
                      <img 
                        src="https://www.google.com/favicon.ico" 
                        alt="Google" 
                        style={{ width: '16px', marginRight: '4px' }}
                      />
                      Google
                    </span>
                  ) : (
                    <span className="badge badge-email">📧 Email</span>
                  )}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Membro dal:</span>
                <span className="info-value">
                  {user?.created_at 
                    ? new Date(user.created_at).toLocaleDateString('it-IT')
                    : '-'
                  }
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Ruolo:</span>
                <span className="info-value">
                  {user?.ruolo === 'admin' ? '👑 Admin' : '👤 Utente'}
                </span>
              </div>
            </div>
          </Card>

          {/* ============================================
              SEZIONE: MODIFICA PROFILO
              ============================================ */}
          <Card className="profile-section">
            <div className="section-header">
              <h2>✏️ Modifica Profilo</h2>
            </div>
            <form onSubmit={handleProfileUpdate} className="profile-form">
              <div className="form-group">
                <label>Nome *</label>
                <input
                  type="text"
                  value={profileData.nome}
                  onChange={(e) => setProfileData(prev => ({ ...prev, nome: e.target.value }))}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label>Telefono</label>
                <input
                  type="tel"
                  value={profileData.telefono}
                  onChange={(e) => setProfileData(prev => ({ ...prev, telefono: e.target.value }))}
                  placeholder="+39 123 456 7890"
                  className="form-control"
                />
                <small className="form-hint">Utile per essere contattato più velocemente</small>
              </div>

              <div className="form-group readonly">
                <label>Email</label>
                <input
                  type="email"
                  value={user?.email}
                  disabled
                  className="form-control"
                />
                <small className="form-hint">L'email non può essere modificata</small>
              </div>

              {errors.profile && (
                <div className="error-message">{errors.profile}</div>
              )}

              <Button 
                type="submit" 
                variant="primary"
                loading={loading.profile}
                disabled={loading.profile}
              >
                Salva Modifiche
              </Button>
            </form>
          </Card>

          {/* ============================================
              SEZIONE: CAMBIO PASSWORD (solo utenti non-Google)
              ============================================ */}
          {!isGoogleUser && (
            <Card className="profile-section">
              <div className="section-header">
                <h2>🔐 Cambio Password</h2>
              </div>
              <form onSubmit={handlePasswordChange} className="profile-form">
                <div className="form-group">
                  <label>Password Attuale *</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Nuova Password *</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="form-control"
                    minLength={8}
                    required
                  />
                  <small className="form-hint">Minimo 8 caratteri, una maiuscola e un numero</small>
                </div>

                <div className="form-group">
                  <label>Conferma Nuova Password *</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>

                {errors.password && (
                  <div className="error-message">{errors.password}</div>
                )}

                <Button 
                  type="submit" 
                  variant="primary"
                  loading={loading.password}
                  disabled={loading.password}
                >
                  Cambia Password
                </Button>
              </form>
            </Card>
          )}

          {/* ============================================
              SEZIONE: ZONA PERICOLOSA
              ============================================ */}
          <Card className="profile-section danger-zone">
            <div className="section-header">
              <h2>⚠️ Zona Pericolosa</h2>
            </div>
            <div className="danger-content">
              <p className="danger-warning">
                <strong>Attenzione:</strong> L'eliminazione dell'account è permanente e irreversibile. 
                Tutti i tuoi dati, richieste e messaggi saranno cancellati definitivamente.
              </p>
              <Button 
                variant="danger"
                onClick={() => setShowDeleteModal(true)}
              >
                🗑️ Elimina Account
              </Button>
            </div>
          </Card>

        </div>
      </div>

      {/* ============================================
          MODAL: CONFERMA ELIMINAZIONE
          ============================================ */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚠️ Conferma Eliminazione Account</h3>
              <button 
                className="modal-close"
                onClick={() => setShowDeleteModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-warning">
                Questa azione <strong>non può essere annullata</strong>. 
                Tutti i tuoi dati saranno eliminati permanentemente.
              </p>

              <div className="form-group">
                <label>Scrivi <strong>DELETE</strong> per confermare:</label>
                <input
                  type="text"
                  value={deleteData.confirmText}
                  onChange={(e) => setDeleteData(prev => ({ ...prev, confirmText: e.target.value }))}
                  placeholder="DELETE"
                  className="form-control"
                  autoComplete="off"
                />
              </div>

              {!isGoogleUser && (
                <div className="form-group">
                  <label>Conferma con la tua password:</label>
                  <input
                    type="password"
                    value={deleteData.password}
                    onChange={(e) => setDeleteData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Password"
                    className="form-control"
                  />
                </div>
              )}

              {errors.delete && (
                <div className="error-message">{errors.delete}</div>
              )}
            </div>

            <div className="modal-footer">
              <Button 
                variant="ghost" 
                onClick={() => setShowDeleteModal(false)}
                disabled={loading.delete}
              >
                Annulla
              </Button>
              <Button 
                variant="danger"
                onClick={handleDeleteAccount}
                loading={loading.delete}
                disabled={loading.delete || deleteData.confirmText !== 'DELETE'}
              >
                Elimina Definitivamente
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;