// backend/src/controllers/review.controller.js

const { query } = require('../config/database');
const emailService = require('../services/email.service');

// ============================================
// CREATE REVIEW (solo utenti con richiesta completata)
// ============================================
const createReview = async (req, res) => {
  try {
    const { request_id, rating, titolo, testo } = req.body;
    const userId = req.user.id;

    // Validazione input
    if (!request_id || !rating || !testo) {
      return res.status(400).json({
        success: false,
        message: 'Campi obbligatori mancanti'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating deve essere tra 1 e 5'
      });
    }

    if (testo.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Testo recensione troppo lungo (max 500 caratteri)'
      });
    }

    // ✅ Verifica che la richiesta esista ed sia completata
    const requestCheck = await query(
      `SELECT id, stato, email_contatto, nome_contatto 
       FROM requests 
       WHERE id = $1 AND user_id = $2`,
      [request_id, userId]
    );

    if (requestCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Richiesta non trovata o non autorizzato'
      });
    }

    const requestData = requestCheck.rows[0];

    if (requestData.stato !== 'completata') {
      return res.status(400).json({
        success: false,
        message: 'Puoi recensire solo richieste completate'
      });
    }

    // ✅ Verifica che non esista già una recensione
    const existingReview = await query(
      'SELECT id FROM reviews WHERE user_id = $1 AND request_id = $2',
      [userId, request_id]
    );

    if (existingReview.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Hai già recensito questa richiesta'
      });
    }

    // ✅ Gestione upload foto (opzionale)
    let fotoUrl = null;
    if (req.file) {
      fotoUrl = `/uploads/reviews/${req.file.filename}`;
    }

    // ✅ Crea recensione
    const result = await query(
      `INSERT INTO reviews (user_id, request_id, rating, titolo, testo, foto_url, approvata)
       VALUES ($1, $2, $3, $4, $5, $6, false)
       RETURNING *`,
      [userId, request_id, rating, titolo, testo, fotoUrl]
    );

    const review = result.rows[0];

    // ✅ Invia email notifica ad admin
    try {
      await emailService.sendNewReviewAdminEmail(review, req.user, requestData);
    } catch (emailError) {
      console.error('⚠️ Email notifica recensione fallita:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Recensione inviata! Sarà visibile dopo approvazione.',
      data: { review }
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nella creazione della recensione'
    });
  }
};

// ============================================
// GET ALL REVIEWS (public - solo approvate)
// ============================================
const getPublicReviews = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const result = await query(
      `SELECT 
        r.*,
        u.nome as user_nome,
        u.cognome as user_cognome,
        req.categoria as request_categoria
       FROM reviews r
       INNER JOIN users u ON r.user_id = u.id
       INNER JOIN requests req ON r.request_id = req.id
       WHERE r.approvata = true AND r.pubblicata = true
       ORDER BY r.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    // Count totale
    const countResult = await query(
      'SELECT COUNT(*) FROM reviews WHERE approvata = true AND pubblicata = true'
    );

    // Calcola media rating
    const avgResult = await query(
      'SELECT AVG(rating) as media FROM reviews WHERE approvata = true AND pubblicata = true'
    );

    res.json({
      success: true,
      data: {
        reviews: result.rows,
        total: parseInt(countResult.rows[0].count),
        mediaRating: parseFloat(avgResult.rows[0].media || 0).toFixed(1)
      }
    });
  } catch (error) {
    console.error('Get public reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero delle recensioni'
    });
  }
};

// ============================================
// GET MY REVIEWS (utente loggato)
// ============================================
const getMyReviews = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT 
        r.*,
        req.categoria as request_categoria,
        req.descrizione as request_descrizione
       FROM reviews r
       INNER JOIN requests req ON r.request_id = req.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: { reviews: result.rows }
    });
  } catch (error) {
    console.error('Get my reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero delle tue recensioni'
    });
  }
};

// ============================================
// GET ALL REVIEWS (admin)
// ============================================
const getAllReviews = async (req, res) => {
  try {
    const { limit = 50, offset = 0, approvata, pubblicata } = req.query;

    let queryText = `
      SELECT 
        r.*,
        u.nome as user_nome,
        u.cognome as user_cognome,
        u.email as user_email,
        req.categoria as request_categoria,
        req.id as request_id
      FROM reviews r
      INNER JOIN users u ON r.user_id = u.id
      INNER JOIN requests req ON r.request_id = req.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (approvata !== undefined) {
      queryText += ` AND r.approvata = $${paramIndex}`;
      params.push(approvata === 'true');
      paramIndex++;
    }

    if (pubblicata !== undefined) {
      queryText += ` AND r.pubblicata = $${paramIndex}`;
      params.push(pubblicata === 'true');
      paramIndex++;
    }

    queryText += ` ORDER BY r.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    // Count totale
    let countQuery = 'SELECT COUNT(*) FROM reviews WHERE 1=1';
    const countParams = [];
    if (approvata !== undefined) {
      countQuery += ' AND approvata = $1';
      countParams.push(approvata === 'true');
    }
    
    const countResult = await query(countQuery, countParams);

    res.json({
      success: true,
      data: {
        reviews: result.rows,
        total: parseInt(countResult.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero delle recensioni'
    });
  }
};

// ============================================
// UPDATE REVIEW (solo propria)
// ============================================
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, titolo, testo } = req.body;
    const userId = req.user.id;

    // Verifica proprietà
    const reviewCheck = await query(
      'SELECT * FROM reviews WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Recensione non trovata'
      });
    }

    // Update
    const result = await query(
      `UPDATE reviews 
       SET rating = COALESCE($1, rating),
           titolo = COALESCE($2, titolo),
           testo = COALESCE($3, testo),
           approvata = false
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [rating, titolo, testo, id, userId]
    );

    res.json({
      success: true,
      message: 'Recensione aggiornata (richiede nuova approvazione)',
      data: { review: result.rows[0] }
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nell\'aggiornamento della recensione'
    });
  }
};

// ============================================
// DELETE REVIEW (solo propria)
// ============================================
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await query(
      'DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Recensione non trovata'
      });
    }

    res.json({
      success: true,
      message: 'Recensione eliminata'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nell\'eliminazione della recensione'
    });
  }
};

// ============================================
// ADMIN: REPLY TO REVIEW
// ============================================
const replyToReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { risposta_admin } = req.body;
    const adminId = req.user.id;

    if (!risposta_admin || !risposta_admin.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Risposta obbligatoria'
      });
    }

    const result = await query(
      `UPDATE reviews 
       SET risposta_admin = $1,
           risposta_admin_at = CURRENT_TIMESTAMP,
           risposta_admin_by = $2
       WHERE id = $3
       RETURNING *`,
      [risposta_admin.trim(), adminId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Recensione non trovata'
      });
    }

    const review = result.rows[0];

    // ✅ Invia email notifica all'utente
    try {
      const userData = await query(
        'SELECT u.*, req.* FROM users u INNER JOIN requests req ON req.id = $1 WHERE u.id = $2',
        [review.request_id, review.user_id]
      );
      
      if (userData.rows.length > 0) {
        await emailService.sendReviewReplyEmail(review, userData.rows[0]);
      }
    } catch (emailError) {
      console.error('⚠️ Email notifica risposta fallita:', emailError);
    }

    res.json({
      success: true,
      message: 'Risposta inviata',
      data: { review: result.rows[0] }
    });
  } catch (error) {
    console.error('Reply to review error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nell\'invio della risposta'
    });
  }
};

// ============================================
// ADMIN: APPROVE REVIEW
// ============================================
const approveReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvata } = req.body;

    const result = await query(
      'UPDATE reviews SET approvata = $1 WHERE id = $2 RETURNING *',
      [approvata, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Recensione non trovata'
      });
    }

    res.json({
      success: true,
      message: approvata ? 'Recensione approvata' : 'Approvazione rimossa',
      data: { review: result.rows[0] }
    });
  } catch (error) {
    console.error('Approve review error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nell\'approvazione'
    });
  }
};

// ============================================
// ADMIN: TOGGLE PUBLISH
// ============================================
const togglePublish = async (req, res) => {
  try {
    const { id } = req.params;
    const { pubblicata } = req.body;

    const result = await query(
      'UPDATE reviews SET pubblicata = $1 WHERE id = $2 RETURNING *',
      [pubblicata, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Recensione non trovata'
      });
    }

    res.json({
      success: true,
      message: pubblicata ? 'Recensione pubblicata' : 'Recensione nascosta',
      data: { review: result.rows[0] }
    });
  } catch (error) {
    console.error('Toggle publish error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nella pubblicazione'
    });
  }
};

// ============================================
// CHECK IF CAN REVIEW
// ============================================
const canReview = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    // Verifica richiesta completata
    const requestCheck = await query(
      'SELECT stato FROM requests WHERE id = $1 AND user_id = $2',
      [requestId, userId]
    );

    if (requestCheck.rows.length === 0) {
      return res.json({
        success: true,
        data: { canReview: false, reason: 'request_not_found' }
      });
    }

    if (requestCheck.rows[0].stato !== 'completata') {
      return res.json({
        success: true,
        data: { canReview: false, reason: 'not_completed' }
      });
    }

    // Verifica se già recensito
    const reviewCheck = await query(
      'SELECT id FROM reviews WHERE user_id = $1 AND request_id = $2',
      [userId, requestId]
    );

    if (reviewCheck.rows.length > 0) {
      return res.json({
        success: true,
        data: { canReview: false, reason: 'already_reviewed' }
      });
    }

    res.json({
      success: true,
      data: { canReview: true }
    });
  } catch (error) {
    console.error('Can review error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nella verifica'
    });
  }
};

module.exports = {
  createReview,
  getPublicReviews,
  getMyReviews,
  getAllReviews,
  updateReview,
  deleteReview,
  replyToReview,
  approveReview,
  togglePublish,
  canReview
};