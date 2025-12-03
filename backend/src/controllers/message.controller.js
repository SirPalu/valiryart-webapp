const { query } = require('../config/database');
const emailService = require('../services/email.service');

// ============================================
// SEND MESSAGE
// ============================================
const sendMessage = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { messaggio } = req.body;

    if (!messaggio || messaggio.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Il messaggio non può essere vuoto'
      });
    }

    // Verifica richiesta esista
    const requestCheck = await query(
      'SELECT * FROM requests WHERE id = $1',
      [requestId]
    );

    if (requestCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Richiesta non trovata'
      });
    }

    const request = requestCheck.rows[0];

    // Determina sender type e verifica permessi
    let senderType, senderId, senderEmail, senderName;

    if (req.user.ruolo === 'admin') {
      senderType = 'admin';
      senderId = req.user.id;
      senderEmail = req.user.email;
      senderName = `${req.user.nome} ${req.user.cognome}`;
    } else {
      // Verifica che l'utente sia il proprietario della richiesta
      const isOwner = request.user_id === req.user.id || request.email_contatto === req.user.email;
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Non hai i permessi per inviare messaggi in questa richiesta'
        });
      }
      senderType = 'user';
      senderId = req.user.id;
      senderEmail = req.user.email;
      senderName = `${req.user.nome} ${req.user.cognome}`;
    }

    // Inserisci messaggio
    const result = await query(
      `INSERT INTO messages (request_id, sender_id, sender_type, sender_email, messaggio)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [requestId, senderId, senderType, senderEmail, messaggio]
    );

    const message = result.rows[0];

    // ✅ INVIO EMAIL: Notifica nuovo messaggio
    const isForAdmin = senderType === 'user';
    await emailService.sendNewMessageEmail(request, senderName, messaggio, isForAdmin);

    // Salva log notifica
    await query(
      `INSERT INTO notifications (request_id, destinatario_email, tipo, oggetto, corpo, inviata)
       VALUES ($1, $2, 'nuovo_messaggio', $3, $4, true)`,
      [
        requestId,
        isForAdmin ? 'valiryart93@gmail.com' : request.email_contatto,
        `Nuovo Messaggio - Richiesta #${requestId.substring(0, 8).toUpperCase()}`,
        messaggio
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Messaggio inviato con successo',
      data: { message }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nell\'invio del messaggio'
    });
  }
};

// ============================================
// GET MESSAGES
// ============================================
const getMessages = async (req, res) => {
  try {
    const { requestId } = req.params;

    // Verifica richiesta esista
    const requestCheck = await query(
      'SELECT * FROM requests WHERE id = $1',
      [requestId]
    );

    if (requestCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Richiesta non trovata'
      });
    }

    const request = requestCheck.rows[0];

    // Verifica permessi
    if (req.user.ruolo !== 'admin') {
      const isOwner = request.user_id === req.user.id || request.email_contatto === req.user.email;
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Non hai i permessi per visualizzare questi messaggi'
        });
      }
    }

    // Recupera messaggi
    const result = await query(
      `SELECT m.*, u.nome, u.cognome, u.google_avatar_url
       FROM messages m
       LEFT JOIN users u ON m.sender_id = u.id
       WHERE m.request_id = $1
       ORDER BY m.created_at ASC`,
      [requestId]
    );

    // Marca messaggi come letti
    if (req.user.ruolo === 'admin') {
      await query(
        `UPDATE messages 
         SET read_by_admin = true, read_at = CURRENT_TIMESTAMP
         WHERE request_id = $1 AND read_by_admin = false AND sender_type = 'user'`,
        [requestId]
      );
    } else {
      await query(
        `UPDATE messages 
         SET read_by_user = true, read_at = CURRENT_TIMESTAMP
         WHERE request_id = $1 AND read_by_user = false AND sender_type = 'admin'`,
        [requestId]
      );
    }

    res.json({
      success: true,
      data: { messages: result.rows }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero dei messaggi'
    });
  }
};

// ============================================
// MARK AS READ
// ============================================
const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const updateField = req.user.ruolo === 'admin' ? 'read_by_admin' : 'read_by_user';

    const result = await query(
      `UPDATE messages 
       SET ${updateField} = true, read_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [messageId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Messaggio non trovato'
      });
    }

    res.json({
      success: true,
      message: 'Messaggio segnato come letto'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nell\'aggiornamento del messaggio'
    });
  }
};

// ============================================
// GET UNREAD COUNT
// ============================================
const getUnreadCount = async (req, res) => {
  try {
    let result;

    if (req.user.ruolo === 'admin') {
      // Admin: conta messaggi non letti da utenti
      result = await query(
        `SELECT COUNT(*) as unread_count
         FROM messages
         WHERE sender_type = 'user' AND read_by_admin = false`
      );
    } else {
      // User: conta messaggi non letti da admin nelle proprie richieste
      result = await query(
        `SELECT COUNT(*) as unread_count
         FROM messages m
         INNER JOIN requests r ON m.request_id = r.id
         WHERE m.sender_type = 'admin' 
           AND m.read_by_user = false
           AND (r.user_id = $1 OR r.email_contatto = $2)`,
        [req.user.id, req.user.email]
      );
    }

    res.json({
      success: true,
      data: { unreadCount: parseInt(result.rows[0].unread_count) }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero dei messaggi non letti'
    });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  markAsRead,
  getUnreadCount
};