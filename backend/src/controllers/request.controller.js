const { verifyRecaptcha } = require('../utils/recaptcha.util');
const { validationResult } = require('express-validator');
const { query, transaction } = require('../config/database');
const emailService = require('../services/email.service');

// ============================================
// CREATE REQUEST - CON RECAPTCHA (anche guest)
// ============================================
const createRequest = async (req, res) => {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📥 INCOMING REQUEST DEBUG');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // ✅ VERIFICA RECAPTCHA (SOLO PER UTENTI NON AUTENTICATI)
    const isGuest = !req.user;
    
    if (isGuest) {
      const recaptchaToken = req.body.recaptchaToken;
      
      if (!recaptchaToken) {
        return res.status(400).json({
          success: false,
          message: 'Completa la verifica reCAPTCHA'
        });
      }

      const recaptchaResult = await verifyRecaptcha(recaptchaToken, req.ip);
      
      if (!recaptchaResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Verifica reCAPTCHA fallita. Riprova.',
          errorCodes: recaptchaResult.errorCodes
        });
      }

      console.log('✅ Guest reCAPTCHA verified');
    } else {
      console.log('✅ Authenticated user - skipping reCAPTCHA');
    }

    // ✅ RECAPTCHA OK - CONTINUA CON LOGICA NORMALE
    
    console.log('🔹 Body keys:', Object.keys(req.body));
    console.log('🔹 Files:', req.files?.length || 0);

    // Validazione input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      categoria,
      email_contatto,
      nome_contatto,
      telefono_contatto,
      descrizione,
      dati_specifici,
      data_evento,
      citta,
      indirizzo_consegna
    } = req.body;

    console.log('✅ Validation passed, starting transaction...');

    const userId = req.user ? req.user.id : null;
    console.log('👤 User ID:', userId);

    // ✅ IL RESTO RIMANE UGUALE
    const result = await transaction(async (client) => {
      console.log('🔄 Inside transaction - inserting request...');
      
      const requestResult = await client.query(
        `INSERT INTO requests (
          user_id, categoria, email_contatto, nome_contatto, telefono_contatto,
          descrizione, dati_specifici, data_evento, citta, indirizzo_consegna, stato
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'nuova')
        RETURNING *`,
        [
          userId,
          categoria,
          email_contatto,
          nome_contatto,
          telefono_contatto,
          descrizione,
          typeof dati_specifici === 'string' ? dati_specifici : JSON.stringify(dati_specifici),
          data_evento,
          citta,
          indirizzo_consegna
        ]
      );

      const request = requestResult.rows[0];
      console.log('✅ Request inserted with ID:', request.id);

      if (req.files && req.files.length > 0) {
        console.log(`📎 Processing ${req.files.length} files...`);
        
        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];
          console.log(`  📄 File ${i + 1}:`, file.filename);
          
          await client.query(
            `INSERT INTO request_attachments (
              request_id, filename, original_filename, file_path, 
              file_size, mime_type, ordine
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              request.id,
              file.filename,
              file.originalname,
              `/uploads/requests/${file.filename}`,
              file.size,
              file.mimetype,
              i
            ]
          );
        }
      }

      return request;
    });

    console.log('📧 Sending confirmation emails...');

    const attachmentsCount = (req.files && req.files.length) || 0;

    try {
      await emailService.sendConfirmationEmail(result, attachmentsCount);
      console.log('✅ Confirmation email sent');
    } catch (emailError) {
      console.error('⚠️  Confirmation email failed:', emailError);
    }

    try {
      await emailService.sendNewRequestAdminEmail(result, req.user, attachmentsCount);
      console.log('✅ Admin notification email sent');
    } catch (emailError) {
      console.error('⚠️  Admin email failed:', emailError);
    }
    
    await query(
      `INSERT INTO notifications (request_id, destinatario_email, tipo, oggetto, corpo, inviata)
       VALUES 
       ($1, $2, 'conferma_richiesta', $3, $4, true),
       ($1, $5, 'nuova_richiesta_admin', $6, $7, true)`,
      [
        result.id,
        email_contatto,
        `Richiesta Ricevuta #${result.id.substring(0, 8).toUpperCase()}`,
        'Conferma ricezione richiesta',
        'valiryart93@gmail.com',
        `Nuova Richiesta #${result.id.substring(0, 8).toUpperCase()}`,
        'Notifica nuova richiesta amministratore'
      ]
    );

    console.log('🎉 Request creation completed successfully!\n');

    res.status(201).json({
      success: true,
      message: 'Richiesta inviata con successo! Riceverai una conferma via email.',
      data: { request: result }
    });
  } catch (error) {
    console.error('❌ CREATE REQUEST ERROR:', error);
    
    res.status(500).json({
      success: false,
      message: 'Errore nell\'invio della richiesta'
    });
  }
};

// ============================================
// GET ALL REQUESTS (Admin o proprie)
// ============================================
const getRequests = async (req, res) => {
  try {
    const { stato, categoria, limit = 50, offset = 0 } = req.query;
    
    let queryText = `
      SELECT r.*, 
             u.nome as user_nome, 
             u.cognome as user_cognome,
             (SELECT COUNT(*) FROM messages m WHERE m.request_id = r.id) as totale_messaggi,
             (SELECT COUNT(*) FROM messages m WHERE m.request_id = r.id AND m.read_by_admin = false AND m.sender_type = 'user') as messaggi_non_letti
      FROM requests r
      LEFT JOIN users u ON r.user_id = u.id
    `;
    
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    // Se non admin, mostra solo proprie richieste
    if (req.user.ruolo !== 'admin') {
      conditions.push(`(r.user_id = $${paramIndex} OR r.email_contatto = $${paramIndex + 1})`);
      params.push(req.user.id, req.user.email);
      paramIndex += 2;
    }

    // Filtri
    if (stato) {
      conditions.push(`r.stato = $${paramIndex}`);
      params.push(stato);
      paramIndex++;
    }

    if (categoria) {
      conditions.push(`r.categoria = $${paramIndex}`);
      params.push(categoria);
      paramIndex++;
    }

    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }

    queryText += ` ORDER BY r.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    // Count totale per paginazione
    let countQuery = 'SELECT COUNT(*) FROM requests r';
    const countConditions = conditions.slice(0, -2); // Rimuovi LIMIT e OFFSET
    if (countConditions.length > 0) {
      countQuery += ' WHERE ' + countConditions.join(' AND ');
    }
    
    const countResult = await query(countQuery, params.slice(0, -2));
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: {
        requests: result.rows,
        pagination: {
          total: totalCount,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (parseInt(offset) + parseInt(limit)) < totalCount
        }
      }
    });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero delle richieste'
    });
  }
};

// ============================================
// GET SINGLE REQUEST
// ============================================
const getRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT r.*, 
              u.nome as user_nome, 
              u.cognome as user_cognome,
              u.email as user_email,
              u.telefono as user_telefono
       FROM requests r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Richiesta non trovata'
      });
    }

    const request = result.rows[0];

    // Verifica permessi: admin o proprietario
    if (req.user.ruolo !== 'admin') {
      const isOwner = request.user_id === req.user.id || request.email_contatto === req.user.email;
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Non hai i permessi per visualizzare questa richiesta'
        });
      }
    }

    // Recupera messaggi
    const messagesResult = await query(
      `SELECT * FROM messages 
       WHERE request_id = $1 
       ORDER BY created_at ASC`,
      [id]
    );

    // Recupera allegati
    const attachmentsResult = await query(
      `SELECT * FROM request_attachments 
       WHERE request_id = $1 
       ORDER BY ordine`,
      [id]
    );

    res.json({
      success: true,
      data: {
        request,
        messages: messagesResult.rows,
        attachments: attachmentsResult.rows
      }
    });
  } catch (error) {
    console.error('Get request by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero della richiesta'
    });
  }
};

// ============================================
// UPDATE REQUEST STATUS (solo admin)
// ============================================
const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { stato, note_admin, preventivo_importo, preventivo_note, data_consegna_prevista } = req.body;

    if (req.user.ruolo !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Solo gli amministratori possono modificare lo stato'
      });
    }

    // ✅ Recupera stato precedente
    const oldRequest = await query('SELECT * FROM requests WHERE id = $1', [id]);
    if (oldRequest.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Richiesta non trovata'
      });
    }
    const oldStatus = oldRequest.rows[0].stato;

    const result = await query(
      `UPDATE requests 
       SET stato = COALESCE($1, stato),
           note_admin = COALESCE($2, note_admin),
           preventivo_importo = COALESCE($3, preventivo_importo),
           preventivo_note = COALESCE($4, preventivo_note),
           data_consegna_prevista = COALESCE($5, data_consegna_prevista)
       WHERE id = $6
       RETURNING *`,
      [stato, note_admin, preventivo_importo, preventivo_note, data_consegna_prevista, id]
    );

    const updatedRequest = result.rows[0];

    // ✅ INVIO EMAIL: Notifica cambio stato al cliente
    if (stato && stato !== oldStatus) {
      await emailService.sendStatusChangeEmail(updatedRequest, oldStatus, stato);
      
      // Salva log notifica
      await query(
        `INSERT INTO notifications (request_id, destinatario_email, tipo, oggetto, corpo, inviata)
         VALUES ($1, $2, 'cambio_stato', $3, $4, true)`,
        [
          id,
          updatedRequest.email_contatto,
          `Aggiornamento Richiesta #${id.substring(0, 8).toUpperCase()}`,
          `Cambio stato da ${oldStatus} a ${stato}`
        ]
      );
    }

    res.json({
      success: true,
      message: 'Richiesta aggiornata con successo',
      data: { request: updatedRequest }
    });
  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nell\'aggiornamento della richiesta'
    });
  }
};

// ============================================
// DELETE REQUEST (solo admin)
// ============================================
const deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.ruolo !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Solo gli amministratori possono eliminare richieste'
      });
    }

    const result = await query(
      'DELETE FROM requests WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Richiesta non trovata'
      });
    }

    res.json({
      success: true,
      message: 'Richiesta eliminata con successo'
    });
  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nell\'eliminazione della richiesta'
    });
  }
};

// ============================================
// UPLOAD ATTACHMENT
// ============================================
const uploadAttachment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nessun file caricato'
      });
    }

    // Verifica richiesta esista
    const requestCheck = await query(
      'SELECT id FROM requests WHERE id = $1',
      [id]
    );

    if (requestCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Richiesta non trovata'
      });
    }

    // Salva attachment
    const result = await query(
      `INSERT INTO request_attachments (request_id, filename, original_filename, file_path, file_size, mime_type)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        id,
        req.file.filename,
        req.file.originalname,
        req.file.path,
        req.file.size,
        req.file.mimetype
      ]
    );

    res.json({
      success: true,
      message: 'File caricato con successo',
      data: { attachment: result.rows[0] }
    });
  } catch (error) {
    console.error('Upload attachment error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel caricamento del file'
    });
  }
};

// ============================================
// GET USER REQUESTS (per utente loggato)
// ============================================
const getMyRequests = async (req, res) => {
  try {
    const result = await query(
      `SELECT r.*,
              (SELECT COUNT(*) FROM messages m WHERE m.request_id = r.id) as totale_messaggi,
              (SELECT COUNT(*) FROM messages m WHERE m.request_id = r.id AND m.read_by_user = false AND m.sender_type = 'admin') as messaggi_non_letti
       FROM requests r
       WHERE r.user_id = $1 OR r.email_contatto = $2
       ORDER BY r.created_at DESC`,
      [req.user.id, req.user.email]
    );

    res.json({
      success: true,
      data: { requests: result.rows }
    });
  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero delle tue richieste'
    });
  }
};

module.exports = {
  createRequest,
  getRequests,
  getRequestById,
  updateRequestStatus,
  deleteRequest,
  uploadAttachment,
  getMyRequests
};