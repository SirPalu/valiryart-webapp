// frontend/src/components/chat/Chat.js
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

  // Scroll automatico a ultimo messaggio
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ✅ Carica messaggi usando API service
  const fetchMessages = async () => {
    try {
      console.log('📬 Fetching messages for request:', requestId);
      
      const response = await messagesAPI.getMessages(requestId);
      
      console.log('✅ Messages loaded:', response.data);
      
      setMessages(response.data.data.messages || []);
      setError(null);
    } catch (err) {
      console.error('❌ Fetch messages error:', err);
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

  // ✅ Invia messaggio usando API service
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) {
      toast.error('Scrivi un messaggio');
      return;
    }

    setSending(true);
    setError(null);

    try {
      console.log('📤 Sending message:', newMessage);
      
      const response = await messagesAPI.sendMessage(requestId, {
        messaggio: newMessage.trim()
      });
      
      console.log('✅ Message sent:', response.data);
      
      // Aggiungi messaggio immediatamente (optimistic update)
      setMessages(prev => [...prev, response.data.data.message]);
      setNewMessage('');
      scrollToBottom();
      toast.success('Messaggio inviato!');
    } catch (err) {
      console.error('❌ Send message error:', err);
      setError('Impossibile inviare il messaggio');
      toast.error('Errore nell\'invio del messaggio');
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
          messages.map((msg) => {
            // Determina se è un messaggio dell'admin o dell'utente
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