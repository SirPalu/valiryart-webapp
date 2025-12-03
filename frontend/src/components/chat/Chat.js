// frontend/src/components/chat/Chat.js
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
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

  // Scroll automatico a ultimo messaggio
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Carica messaggi
  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/messages?requestId=${requestId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error('Errore nel caricamento messaggi');

      const data = await response.json();
      setMessages(data.data || []);
      setError(null);
    } catch (err) {
      console.error('Errore caricamento messaggi:', err);
      setError('Impossibile caricare i messaggi');
    } finally {
      setLoading(false);
    }
  };

  // Polling ogni 5 secondi (adatto per chat non real-time)
  useEffect(() => {
    fetchMessages();

    // Avvia polling
    pollIntervalRef.current = setInterval(() => {
      fetchMessages();
    }, 5000);

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

  // Invia messaggio
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    setSending(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            requestId: requestId,
            recipientId: recipientId,
            message: newMessage.trim()
          })
        }
      );

      if (!response.ok) throw new Error('Errore invio messaggio');

      const data = await response.json();
      
      // Aggiungi messaggio immediatamente (ottimistic update)
      setMessages(prev => [...prev, data.data]);
      setNewMessage('');
      scrollToBottom();
    } catch (err) {
      console.error('Errore invio messaggio:', err);
      setError('Impossibile inviare il messaggio');
    } finally {
      setSending(false);
    }
  };

  // Formatta data
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
              Online
            </span>
          </div>
        </div>
        <div className="chat-actions">
          <button 
            className="refresh-btn" 
            onClick={fetchMessages}
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
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${msg.sender_id === user.id ? 'message-sent' : 'message-received'}`}
            >
              <div className="message-content">
                <p>{msg.message}</p>
                <span className="message-time">{formatDate(msg.created_at)}</span>
              </div>
              {msg.read_at && msg.sender_id === user.id && (
                <span className="message-read">✓✓</span>
              )}
            </div>
          ))
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
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Scrivi un messaggio..."
            disabled={sending}
            className="chat-input"
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