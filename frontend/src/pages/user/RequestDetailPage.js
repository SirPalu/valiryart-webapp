// frontend/src/pages/user/RequestDetailPage.js - CON ALLEGATI

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { requestsAPI, messagesAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import './RequestDetailPage.css';

const RequestDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [request, setRequest] = useState(null);
  const [messages, setMessages] = useState([]);
  const [attachments, setAttachments] = useState([]); // ✅ NUOVO
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetchRequestDetail();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchRequestDetail = async () => {
    try {
      setLoading(true);
      const [requestRes, messagesRes] = await Promise.all([
        requestsAPI.getById(id),
        messagesAPI.getMessages(id)
      ]);

      const requestData = requestRes.data.data;
      setRequest(requestData.request);
      setMessages(messagesRes.data.data.messages);
      setAttachments(requestData.attachments || []); // ✅ NUOVO
    } catch (error) {
      console.error('Error fetching request detail:', error);
      toast.error('Impossibile caricare la richiesta');
      navigate('/user/requests');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) {
      toast.error('Scrivi un messaggio');
      return;
    }

    try {
      setSendingMessage(true);
      const response = await messagesAPI.sendMessage(id, { messaggio: newMessage });
      
      setMessages(prev => [...prev, response.data.data.message]);
      setNewMessage('');
      toast.success('Messaggio inviato!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Errore nell\'invio del messaggio');
    } finally {
      setSendingMessage(false);
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
      <div className="detail-loading">
        <div className="spinner"></div>
        <p>Caricamento dettagli...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="detail-error">
        <h2>Richiesta non trovata</h2>
        <Link to="/user/requests">
          <Button variant="primary">← Torna alle Richieste</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="request-detail-page">
      {/* Header */}
      <div className="detail-header">
        <Link to="/user/requests" className="back-link">
          ← Torna alle Richieste
        </Link>
        <div className="header-content">
          <div className="header-left">
            <div className="request-icon-big">
              {getCategoriaIcon(request.categoria)}
            </div>
            <div className="header-info">
              <span className="request-id">
                #{request.id.substring(0, 8).toUpperCase()}
              </span>
              <h1>{getCategoriaLabel(request.categoria)}</h1>
              <p className="request-date">
                Creata il {new Date(request.created_at).toLocaleDateString('it-IT', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
          <div className="header-right">
            {getStatusBadge(request.stato)}
          </div>
        </div>
      </div>

      <div className="detail-content">
        {/* Left Column - Details */}
        <div className="detail-left">
          {/* Descrizione */}
          <Card className="info-card">
            <h2>📝 Descrizione Richiesta</h2>
            <p className="description-text">{request.descrizione}</p>
          </Card>

          {/* ✅ NUOVA SEZIONE: ALLEGATI */}
          {attachments.length > 0 && (
            <Card className="info-card">
              <h2>📎 File Allegati ({attachments.length})</h2>
              <div className="attachments-grid">
                {attachments.map((attachment, index) => (
                  <div key={attachment.id || index} className="attachment-card">
                    {attachment.mime_type?.startsWith('image/') ? (
                      <a 
                        href={`${process.env.REACT_APP_API_URL.replace('/api', '')}${attachment.file_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img 
                          src={`${process.env.REACT_APP_API_URL.replace('/api', '')}${attachment.file_path}`}
                          alt={attachment.original_filename}
                          className="attachment-image"
                        />
                      </a>
                    ) : (
                      <div className="attachment-file-icon">
                        <span className="file-icon">📄</span>
                      </div>
                    )}
                    <div className="attachment-info">
                      <p className="attachment-name" title={attachment.original_filename}>
                        {attachment.original_filename}
                      </p>
                      <div className="attachment-meta">
                        <span className="attachment-size">
                          {(attachment.file_size / 1024).toFixed(1)} KB
                        </span>
                        <a 
                          href={`${process.env.REACT_APP_API_URL.replace('/api', '')}${attachment.file_path}`}
                          download={attachment.original_filename}
                          className="download-link"
                        >
                          📥 Scarica
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Dettagli Tecnici */}
          {request.dati_specifici && (
            <Card className="info-card">
              <h2>🔧 Dettagli Tecnici</h2>
              <div className="technical-details">
                {Object.entries(
                  typeof request.dati_specifici === 'string' 
                    ? JSON.parse(request.dati_specifici)
                    : request.dati_specifici
                ).map(([key, value]) => {
                  if (!value || (Array.isArray(value) && value.length === 0)) return null;
                  
                  return (
                    <div key={key} className="detail-row">
                      <span className="detail-key">{key.replace(/_/g, ' ')}:</span>
                      <span className="detail-value">
                        {Array.isArray(value) ? value.join(', ') : String(value)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Info Consegna */}
          {(request.citta || request.indirizzo_consegna || request.data_evento) && (
            <Card className="info-card">
              <h2>📍 Informazioni Consegna/Evento</h2>
              <div className="delivery-info">
                {request.citta && (
                  <div className="info-item">
                    <span className="info-label">Città:</span>
                    <span className="info-value">{request.citta}</span>
                  </div>
                )}
                {request.indirizzo_consegna && (
                  <div className="info-item">
                    <span className="info-label">Indirizzo:</span>
                    <span className="info-value">{request.indirizzo_consegna}</span>
                  </div>
                )}
                {request.data_evento && (
                  <div className="info-item">
                    <span className="info-label">Data Evento:</span>
                    <span className="info-value">
                      {new Date(request.data_evento).toLocaleDateString('it-IT', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Preventivo */}
          {request.preventivo_importo && (
            <Card className="info-card preventivo-card">
              <h2>💰 Preventivo</h2>
              <div className="preventivo-content">
                <div className="preventivo-amount">
                  €{parseFloat(request.preventivo_importo).toFixed(2)}
                </div>
                {request.preventivo_note && (
                  <div className="preventivo-note">
                    <strong>Note:</strong>
                    <p>{request.preventivo_note}</p>
                  </div>
                )}
                {request.data_consegna_prevista && (
                  <div className="delivery-date">
                    <span>📅 Consegna prevista:</span>
                    <span>{new Date(request.data_consegna_prevista).toLocaleDateString('it-IT')}</span>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column - Chat */}
        <div className="detail-right">
          <Card className="chat-card">
            <div className="chat-header">
              <h2>💬 Conversazione con Valeria</h2>
              <span className="messages-count">{messages.length} messaggi</span>
            </div>

            <div className="messages-container">
              {messages.length === 0 ? (
                <div className="no-messages">
                  <div className="no-messages-icon">💬</div>
                  <p>Nessun messaggio ancora</p>
                  <small>Inizia la conversazione con Valeria!</small>
                </div>
              ) : (
                <div className="messages-list">
                  {messages.map((message) => (
                    <div 
                      key={message.id}
                      className={`message ${message.sender_type === 'user' ? 'user-message' : 'admin-message'}`}
                    >
                      <div className="message-avatar">
                        {message.sender_type === 'admin' ? '👩‍🎨' : '👤'}
                      </div>
                      <div className="message-content">
                        <div className="message-header">
                          <span className="message-sender">
                            {message.sender_type === 'admin' ? 'Valeria' : message.nome || 'Tu'}
                          </span>
                          <span className="message-time">
                            {new Date(message.created_at).toLocaleString('it-IT', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="message-text">{message.messaggio}</div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="message-form">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Scrivi un messaggio a Valeria..."
                rows={3}
                disabled={sendingMessage}
                className="message-input"
              />
              <Button
                type="submit"
                variant="primary"
                loading={sendingMessage}
                disabled={!newMessage.trim() || sendingMessage}
              >
                {sendingMessage ? 'Invio...' : '📤 Invia Messaggio'}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailPage;