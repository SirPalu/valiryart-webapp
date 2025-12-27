// frontend/src/pages/admin/RequestDetailPage.js - ✅ CON ALLEGATI
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import Chat from '../../components/chat/Chat';
import toast from 'react-hot-toast';
import './RequestDetailPage.css';

const RequestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [attachments, setAttachments] = useState([]); // ✅ NUOVO
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    preventivo_importo: '',
    data_consegna_prevista: '',
    note_admin: ''
  });

  useEffect(() => {
    fetchRequestDetail();
  }, [id]);

  const fetchRequestDetail = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching request:', id);
      
      const response = await adminAPI.getRequestById(id);
      console.log('✅ Response:', response.data);
      
      const { request: requestData, attachments: attachmentsData } = response.data.data; // ✅ AGGIORNATO
      
      setRequest(requestData);
      setAttachments(attachmentsData || []); // ✅ NUOVO
      
      setEditForm({
        preventivo_importo: requestData.preventivo_importo || '',
        data_consegna_prevista: requestData.data_consegna_prevista ? requestData.data_consegna_prevista.split('T')[0] : '',
        note_admin: requestData.note_admin || ''
      });
      setError(null);
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError('Impossibile caricare i dettagli della richiesta');
      toast.error('Errore nel caricamento della richiesta');
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (newStatus) => {
    try {
      console.log('🔄 Updating status to:', newStatus);
      await adminAPI.updateRequestStatus(id, { stato: newStatus });
      toast.success('Stato aggiornato!');
      fetchRequestDetail();
    } catch (err) {
      console.error('❌ Update error:', err);
      toast.error('Errore nell\'aggiornamento dello stato');
    }
  };

  const updateRequestDetails = async (e) => {
    e.preventDefault();
    try {
      console.log('💾 Saving details:', editForm);
      await adminAPI.updateRequestStatus(id, editForm);
      fetchRequestDetail();
      setIsEditing(false);
      toast.success('Dettagli aggiornati!');
    } catch (err) {
      console.error('❌ Save error:', err);
      toast.error('Errore nel salvataggio');
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

  // Parse dati specifici
  const getDatiSpecifici = () => {
    if (!request.dati_specifici) return null;
    try {
      return typeof request.dati_specifici === 'string' 
        ? JSON.parse(request.dati_specifici) 
        : request.dati_specifici;
    } catch (e) {
      console.error('Error parsing dati_specifici:', e);
      return null;
    }
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

  const datiSpecifici = getDatiSpecifici();

  return (
    <div className="request-detail-page">
      {/* Header */}
      <div className="page-header">
        <button onClick={() => navigate('/admin/requests')} className="back-btn">
          ← Torna alle richieste
        </button>
        <div className="header-actions">
          {request.stato === 'nuova' && (
            <>
              <button
                onClick={() => updateRequestStatus('in_valutazione')}
                className="action-btn approve"
              >
                ✅ Prendi in Carico
              </button>
              <button
                onClick={() => updateRequestStatus('rifiutata')}
                className="action-btn reject"
              >
                ❌ Rifiuta
              </button>
            </>
          )}
          {request.stato === 'in_valutazione' && (
            <button
              onClick={() => updateRequestStatus('preventivo_inviato')}
              className="action-btn approve"
            >
              💰 Invia Preventivo
            </button>
          )}
          {request.stato === 'in_lavorazione' && (
            <button
              onClick={() => updateRequestStatus('completata')}
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
          <div className="header-left">
            <div className="request-icon-big">
              {getCategoriaIcon(request.categoria)}
            </div>
            <div>
              <span className="request-id-badge">
                #{request.id.substring(0, 8).toUpperCase()}
              </span>
              <h1>{getCategoriaLabel(request.categoria)}</h1>
              <div className="request-meta">
                {getStatusBadge(request.stato)}
                <span>📅 {formatDate(request.created_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cliente Info */}
        <div className="customer-section">
          <h3>👤 Informazioni Cliente</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Nome Completo</label>
              <p>{request.nome_contatto || 'N/A'}</p>
            </div>
            <div className="info-item">
              <label>Email</label>
              <p>{request.email_contatto}</p>
            </div>
            <div className="info-item">
              <label>Telefono</label>
              <p>{request.telefono_contatto || 'Non fornito'}</p>
            </div>
            <div className="info-item">
              <label>Utente Registrato</label>
              <p>{request.user_id ? `Sì (ID: ${request.user_id.substring(0, 8)})` : 'No (Guest)'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs-nav">
          <button
            className={`tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            📋 Dettagli Completi
          </button>
          <button
            className={`tab ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            ⚙️ Gestione Admin
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
          {/* TAB: DETTAGLI COMPLETI */}
          {activeTab === 'details' && (
            <div className="details-tab">
              {/* Descrizione */}
              <div className="section">
                <h3>📝 Descrizione Richiesta</h3>
                <div className="description-box">
                  {request.descrizione || 'Nessuna descrizione fornita'}
                </div>
              </div>

              {/* ✅ NUOVA SEZIONE: FILE ALLEGATI */}
              {attachments.length > 0 && (
                <div className="section">
                  <h3>🖼️ File Allegati ({attachments.length})</h3>
                  <div className="attachments-grid">
                    {attachments.map((attachment, index) => (
                      <div key={attachment.id || index} className="attachment-card">
                        {attachment.mime_type?.startsWith('image/') ? (
                          <img 
                            src={`${process.env.REACT_APP_API_URL.replace('/api', '')}${attachment.file_path}`}
                            alt={attachment.original_filename}
                            className="attachment-image"
                          />
                        ) : (
                          <div className="attachment-file">
                            <span className="file-icon">📄</span>
                            <span className="file-name">{attachment.original_filename}</span>
                          </div>
                        )}
                        <div className="attachment-info">
                          <p className="attachment-name">{attachment.original_filename}</p>
                          <span className="attachment-size">
                            {(attachment.file_size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                        <a 
                          href={`${process.env.REACT_APP_API_URL.replace('/api', '')}${attachment.file_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="attachment-download"
                        >
                          📥 Scarica
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dati Specifici per Categoria */}
              {datiSpecifici && (
                <div className="section">
                  <h3>🔧 Dettagli Specifici - {getCategoriaLabel(request.categoria)}</h3>
                  <div className="details-grid-full">
                    {Object.entries(datiSpecifici).map(([key, value]) => {
                      if (!value || (Array.isArray(value) && value.length === 0)) return null;
                      
                      return (
                        <div key={key} className="detail-card-full">
                          <div className="detail-label-full">
                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                          </div>
                          <div className="detail-value-full">
                            {Array.isArray(value) ? value.join(', ') : String(value)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Info Consegna/Evento */}
              {(request.citta || request.indirizzo_consegna || request.data_evento) && (
                <div className="section">
                  <h3>📍 Informazioni Consegna/Evento</h3>
                  <div className="info-grid">
                    {request.citta && (
                      <div className="info-item">
                        <label>Città</label>
                        <p>{request.citta}</p>
                      </div>
                    )}
                    {request.indirizzo_consegna && (
                      <div className="info-item">
                        <label>Indirizzo Consegna</label>
                        <p>{request.indirizzo_consegna}</p>
                      </div>
                    )}
                    {request.data_evento && (
                      <div className="info-item">
                        <label>Data Evento</label>
                        <p>{formatDate(request.data_evento)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: GESTIONE ADMIN */}
          {activeTab === 'admin' && (
            <div className="admin-tab">
              {!isEditing ? (
                <>
                  <div className="section">
                    <div className="section-header">
                      <h3>💰 Preventivo e Note Admin</h3>
                      <button onClick={() => setIsEditing(true)} className="edit-btn">
                        ✏️ Modifica
                      </button>
                    </div>
                    
                    <div className="details-grid">
                      <div className="detail-card">
                        <div className="detail-icon">💰</div>
                        <div className="detail-info">
                          <label>Preventivo</label>
                          <p className="price-big">{formatPrice(request.preventivo_importo)}</p>
                        </div>
                      </div>

                      {request.data_consegna_prevista && (
                        <div className="detail-card">
                          <div className="detail-icon">📅</div>
                          <div className="detail-info">
                            <label>Consegna Prevista</label>
                            <p>{formatDate(request.data_consegna_prevista)}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {request.note_admin && (
                      <div className="notes-box">
                        <strong>📌 Note Admin:</strong>
                        <p>{request.note_admin}</p>
                      </div>
                    )}

                    {request.preventivo_note && (
                      <div className="notes-box">
                        <strong>💬 Note Preventivo:</strong>
                        <p>{request.preventivo_note}</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <form onSubmit={updateRequestDetails} className="edit-form">
                  <h3>✏️ Modifica Dettagli Admin</h3>
                  
                  <div className="form-group">
                    <label>💰 Preventivo (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.preventivo_importo}
                      onChange={(e) => setEditForm({ ...editForm, preventivo_importo: e.target.value })}
                      placeholder="Es: 150.00"
                    />
                  </div>

                  <div className="form-group">
                    <label>📅 Data Consegna Prevista</label>
                    <input
                      type="date"
                      value={editForm.data_consegna_prevista}
                      onChange={(e) => setEditForm({ ...editForm, data_consegna_prevista: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>📌 Note Admin (interne)</label>
                    <textarea
                      rows="5"
                      value={editForm.note_admin}
                      onChange={(e) => setEditForm({ ...editForm, note_admin: e.target.value })}
                      placeholder="Note private visibili solo agli admin..."
                    />
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="save-btn">💾 Salva</button>
                    <button type="button" onClick={() => setIsEditing(false)} className="cancel-btn">
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
                      Cliente: {request.nome_contatto}
                    </span>
                  </div>
                </div>

                {request.stato !== 'nuova' && (
                  <div className="timeline-item">
                    <div className={`timeline-marker ${request.stato}`}></div>
                    <div className="timeline-content">
                      <h4>{getStatusBadge(request.stato)}</h4>
                      <p>{formatDate(request.updated_at || request.created_at)}</p>
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
                recipientName={request.nome_contatto}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestDetailPage;