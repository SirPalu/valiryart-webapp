// frontend/src/components/chat/Chat.js - OPZIONE A: POLLING OTTIMIZZATO
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { messagesAPI } from '../../services/api';
import toast from 'react-hot-toast';
import './Chat.css';

const Chat = ({ requestId, recipientId, recipientName }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const lastFetchRef = useRef(null); // ✅ Timestamp ultima fetch
  const isTabVisibleRef = useRef(true); // ✅ Track tab visibility

  // ✅ CONFIGURAZIONE POLLING OTTIMIZZATO
  const POLL_INTERVAL = 60000; // 60 secondi (da 5s a 60s = 12x meno richieste!)
  const POLL_INTERVAL_BACKGROUND = 300000; // 5 minuti quando tab nascosta

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ✅ FETCH OTTIMIZZATA con timestamp
  const fetchMessages = async (forceRefresh = false) => {
    try {
      // ✅ Skip fetch se tab nascosta e ultima fetch recente
      if (!isTabVisibleRef.current && lastFetchRef.current) {
        const timeSinceLastFetch = Date.now() - lastFetchRef.current;
        if (timeSinceLastFetch < POLL_INTERVAL_BACKGROUND && !forceRefresh) {
          return; // Skip fetch
        }
      }

      const response = await messagesAPI.getMessages(requestId);
      
      setMessages(response.data.data.messages || []);
      setError(null);
      lastFetchRef.current = Date.now(); // ✅ Salva timestamp
    } catch (err) {
      console.error('❌ Fetch messages error:', err);
      setError('Impossibile caricare i messaggi');
    } finally {
      setLoading(false);
    }
  };

  // ✅ VISIBILITY CHANGE - Stop polling quando tab nascosta
  useEffect(() => {
    const handleVisibilityChange = () => {
      isTabVisibleRef.current = !document.hidden;
      
      if (!document.hidden) {
        // Tab tornata visibile - fetch immediata
        fetchMessages(true);
        
        // Restart polling con intervallo normale
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
        pollIntervalRef.current = setInterval(fetchMessages, POLL_INTERVAL);
      } else {
        // Tab nascosta - rallenta polling
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
        pollIntervalRef.current = setInterval(fetchMessages, POLL_INTERVAL_BACKGROUND);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [requestId]);

  // ✅ POLLING SETUP
  useEffect(() => {
    // Fetch iniziale
    fetchMessages(true);

    // Avvia polling (60 secondi invece di 5!)
    pollIntervalRef.current = setInterval(() => {
      fetchMessages();
    }, POLL_INTERVAL);

    // Cleanup
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [requestId]);

  // Scroll quando arrivano nuovi messaggi
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ✅ INVIA MESSAGGIO + FETCH IMMEDIATA
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) {
      toast.error('Scrivi un messaggio');
      return;
    }

    setSending(true);
    setError(null);

    try {
      const response = await messagesAPI.sendMessage(requestId, {
        messaggio: newMessage.trim()
      });
      
      // Optimistic update
      setMessages(prev => [...prev, response.data.data.message]);
      setNewMessage('');
      scrollToBottom();
      toast.success('Messaggio inviato!');
      
      // ✅ Fetch immediata dopo invio per sincronizzare
      setTimeout(() => fetchMessages(true), 500);
    } catch (err) {
      console.error('❌ Send message error:', err);
      setError('Impossibile inviare il messaggio');
      toast.error('Errore nell\'invio del messaggio');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ora';
    if (diffMins < 60) return `${diffMins} min fa`;
    if (diffHours < 24) return `${diffHours}h fa`;
    if (diffDays < 7) return `${diffDays}g fa`;
    
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="chat-container">
        <div className="chat-loading">
          <div className="spinner"></div>
          <p>Caricamento chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {/* Header Chat */}
      <div className="chat-header">
        <div className="chat-recipient-info">
          <div className="recipient-avatar">
            {recipientName ? recipientName.charAt(0).toUpperCase() : '?'}
          </div>
          <div>
            <h3>{recipientName || 'Chat'}</h3>
            <span className="online-status">
              <span className="status-dot"></span>
              {isTabVisibleRef.current ? 'Online' : 'Away'}
            </span>
          </div>
        </div>
        <div className="chat-actions">
          <button 
            className="refresh-btn" 
            onClick={() => fetchMessages(true)}
            title="Aggiorna messaggi"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Messaggi */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <div className="empty-icon">💬</div>
            <p>Nessun messaggio ancora</p>
            <p className="empty-subtitle">Inizia la conversazione!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isAdmin = user?.ruolo === 'admin';
            const isMyMessage = isAdmin 
              ? msg.sender_type === 'admin' 
              : msg.sender_type === 'user';

            return (
              <div
                key={msg.id}
                className={`message ${isMyMessage ? 'message-sent' : 'message-received'}`}
              >
                <div className="message-avatar">
                  {msg.sender_type === 'admin' ? '👩‍🎨' : '👤'}
                </div>
                <div className="message-content">
                  <div className="message-header">
                    <span className="message-sender">
                      {msg.sender_type === 'admin' 
                        ? 'Valeria' 
                        : msg.nome || recipientName || 'Cliente'}
                    </span>
                  </div>
                  <p>{msg.messaggio}</p>
                  <span className="message-time">{formatDate(msg.created_at)}</span>
                </div>
                {msg.read_at && isMyMessage && (
                  <span className="message-read">✓✓</span>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Messaggio */}
      <div className="chat-input-container">
        {error && (
          <div className="chat-error">
            ⚠️ {error}
          </div>
        )}
        <form onSubmit={handleSendMessage} className="chat-input-form">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={user?.ruolo === 'admin' 
              ? `Rispondi a ${recipientName}...` 
              : 'Scrivi un messaggio a Valeria...'}
            disabled={sending}
            className="chat-input"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="chat-send-btn"
          >
            {sending ? '⏳' : '📩'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;