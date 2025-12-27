const { query } = require('../config/database');

// ============================================
// DASHBOARD STATS
// ============================================
const getDashboardStats = async (req, res) => {
  try {
    // Statistiche richieste
    const requestStats = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE stato = 'nuova') as nuove,
        COUNT(*) FILTER (WHERE stato = 'in_valutazione') as in_valutazione,
        COUNT(*) FILTER (WHERE stato = 'preventivo_inviato') as preventivo_inviato,
        COUNT(*) FILTER (WHERE stato = 'in_lavorazione') as in_lavorazione,
        COUNT(*) FILTER (WHERE stato = 'completata') as completate,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as ultimo_mese,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as ultima_settimana
      FROM requests
    `);

    // Richieste per categoria
    const requestsByCategory = await query(`
      SELECT 
        categoria,
        COUNT(*) as totale,
        COUNT(*) FILTER (WHERE stato = 'completata') as completate
      FROM requests
      GROUP BY categoria
    `);

    // Messaggi non letti
    const unreadMessages = await query(`
      SELECT COUNT(*) as count
      FROM messages
      WHERE sender_type = 'user' AND read_by_admin = false
    `);

    // Utenti registrati
    const userStats = await query(`
      SELECT 
        COUNT(*) as totale,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as nuovi_mese
      FROM users
      WHERE ruolo = 'user'
    `);

    // Portfolio stats
    const portfolioStats = await query(`
      SELECT 
        COUNT(*) as totale,
        SUM(visualizzazioni) as visualizzazioni_totali
      FROM portfolio
      WHERE pubblicato = true
    `);

    // Revenue (completate ultimo mese)
    const revenueStats = await query(`
      SELECT 
        COALESCE(SUM(preventivo_importo), 0) as totale,
        COUNT(*) as numero_ordini
      FROM requests
      WHERE stato = 'completata' 
        AND completata_at >= CURRENT_DATE - INTERVAL '30 days'
        AND preventivo_importo IS NOT NULL
    `);

    res.json({
      success: true,
      data: {
        requests: requestStats.rows[0],
        requestsByCategory: requestsByCategory.rows,
        unreadMessages: parseInt(unreadMessages.rows[0].count),
        users: userStats.rows[0],
        portfolio: portfolioStats.rows[0],
        revenue: revenueStats.rows[0]
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero delle statistiche'
    });
  }
};

// ============================================
// RECENT ACTIVITY
// ============================================
const getRecentActivity = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const activity = await query(
      `SELECT * FROM activity_log
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );

    res.json({
      success: true,
      data: { activity: activity.rows }
    });
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero dell\'attività recente'
    });
  }
};

// ============================================
// REVENUE CHART DATA
// ============================================
const getRevenueChart = async (req, res) => {
  try {
    const { months = 6 } = req.query;

    const data = await query(`
      SELECT 
        DATE_TRUNC('month', completata_at) as mese,
        COUNT(*) as numero_ordini,
        COALESCE(SUM(preventivo_importo), 0) as totale
      FROM requests
      WHERE stato = 'completata' 
        AND completata_at >= CURRENT_DATE - INTERVAL '${months} months'
        AND preventivo_importo IS NOT NULL
      GROUP BY DATE_TRUNC('month', completata_at)
      ORDER BY mese DESC
    `);

    res.json({
      success: true,
      data: { chartData: data.rows }
    });
  } catch (error) {
    console.error('Get revenue chart error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero dei dati del grafico'
    });
  }
};

// ============================================
// TOP CUSTOMERS
// ============================================
const getTopCustomers = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const customers = await query(`
      SELECT 
        u.id,
        u.nome,
        u.cognome,
        u.email,
        COUNT(r.id) as totale_richieste,
        COUNT(*) FILTER (WHERE r.stato = 'completata') as ordini_completati,
        COALESCE(SUM(r.preventivo_importo) FILTER (WHERE r.stato = 'completata'), 0) as valore_totale
      FROM users u
      INNER JOIN requests r ON r.user_id = u.id
      WHERE u.ruolo = 'user'
      GROUP BY u.id, u.nome, u.cognome, u.email
      ORDER BY valore_totale DESC
      LIMIT $1
    `, [limit]);

    res.json({
      success: true,
      data: { customers: customers.rows }
    });
  } catch (error) {
    console.error('Get top customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero dei clienti top'
    });
  }
};

// ============================================
// EXPORT DATA (CSV)
// ============================================
const exportRequests = async (req, res) => {
  try {
    const { startDate, endDate, categoria, stato } = req.query;

    let queryText = `
      SELECT 
        r.*,
        u.nome as user_nome,
        u.cognome as user_cognome
      FROM requests r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (startDate) {
      queryText += ` AND r.created_at >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      queryText += ` AND r.created_at <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    if (categoria) {
      queryText += ` AND r.categoria = $${paramIndex}`;
      params.push(categoria);
      paramIndex++;
    }

    if (stato) {
      queryText += ` AND r.stato = $${paramIndex}`;
      params.push(stato);
      paramIndex++;
    }

    queryText += ` ORDER BY r.created_at DESC`;

    const result = await query(queryText, params);

    // Converti in CSV
    const csv = convertToCSV(result.rows);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=richieste_export.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nell\'esportazione dei dati'
    });
  }
};

// ============================================
// GET ALL USERS (admin)
// ============================================
const getAllUsers = async (req, res) => {
  try {
    const { limit = 50, offset = 0, search } = req.query;

    let queryText = `
      SELECT 
        id, email, nome, cognome, telefono, 
        ruolo, attivo, email_verified, created_at, last_login
      FROM users
    `;

    const params = [];
    let paramIndex = 1;

    if (search) {
      queryText += ` WHERE (nome ILIKE $${paramIndex} OR cognome ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    const countResult = await query(
      search 
        ? `SELECT COUNT(*) FROM users WHERE (nome ILIKE $1 OR cognome ILIKE $1 OR email ILIKE $1)`
        : 'SELECT COUNT(*) FROM users',
      search ? [`%${search}%`] : []
    );

    res.json({
      success: true,
      data: {
        users: result.rows,
        total: parseInt(countResult.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero degli utenti'
    });
  }
};

// ============================================
// UPDATE USER STATUS (admin)
// ============================================
const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { attivo } = req.body;

    const result = await query(
      'UPDATE users SET attivo = $1 WHERE id = $2 RETURNING id, email, attivo',
      [attivo, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utente non trovato'
      });
    }

    res.json({
      success: true,
      message: 'Stato utente aggiornato',
      data: { user: result.rows[0] }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nell\'aggiornamento dello stato utente'
    });
  }
};

// ============================================
// GET REQUEST BY ID (admin) - ✅ CON ALLEGATI
// ============================================
const getRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    // Recupera richiesta
    const requestResult = await query(
      `SELECT r.*, 
              u.nome as user_nome, 
              u.cognome as user_cognome, 
              u.email as user_email
       FROM requests r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.id = $1`,
      [id]
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Richiesta non trovata'
      });
    }

    // ✅ NUOVO: Recupera allegati
    const attachmentsResult = await query(
      `SELECT id, filename, original_filename, file_path, file_size, mime_type, descrizione
       FROM request_attachments
       WHERE request_id = $1
       ORDER BY ordine, created_at`,
      [id]
    );

    res.json({
      success: true,
      data: {
        request: requestResult.rows[0],
        attachments: attachmentsResult.rows // ✅ NUOVO
      }
    });
  } catch (error) {
    console.error('Get request by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero della richiesta'
    });
  }
};

// ============================================
// GET REQUEST MESSAGES (admin)
// ============================================
const getRequestMessages = async (req, res) => {
  try {
    const { requestId } = req.params;

    const result = await query(
      `SELECT m.*, 
              u.nome as sender_nome,
              u.cognome as sender_cognome
       FROM messages m
       LEFT JOIN users u ON m.sender_id = u.id
       WHERE m.request_id = $1
       ORDER BY m.created_at ASC`,
      [requestId]
    );

    res.json({
      success: true,
      data: { messages: result.rows }
    });
  } catch (error) {
    console.error('Get request messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero dei messaggi'
    });
  }
};

// ============================================
// SEND MESSAGE (admin)
// ============================================
const sendMessage = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { messaggio } = req.body;
    const adminId = req.user.id;

    if (!messaggio || !messaggio.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Messaggio obbligatorio'
      });
    }

    const result = await query(
      `INSERT INTO messages (request_id, sender_id, sender_type, messaggio, read_by_user)
       VALUES ($1, $2, 'admin', $3, false)
       RETURNING *`,
      [requestId, adminId, messaggio.trim()]
    );

    res.status(201).json({
      success: true,
      message: 'Messaggio inviato',
      data: { message: result.rows[0] }
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
// UPDATE REQUEST STATUS (admin)
// ============================================
const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Costruisci query dinamica
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.stato !== undefined) {
      fields.push(`stato = $${paramIndex}`);
      values.push(updates.stato);
      paramIndex++;
    }

    if (updates.preventivo_importo !== undefined) {
      fields.push(`preventivo_importo = $${paramIndex}`);
      values.push(updates.preventivo_importo);
      paramIndex++;
    }

    if (updates.preventivo_note !== undefined) {
      fields.push(`preventivo_note = $${paramIndex}`);
      values.push(updates.preventivo_note);
      paramIndex++;
    }

    if (updates.note_admin !== undefined) {
      fields.push(`note_admin = $${paramIndex}`);
      values.push(updates.note_admin);
      paramIndex++;
    }

    if (updates.data_consegna_prevista !== undefined) {
      fields.push(`data_consegna_prevista = $${paramIndex}`);
      values.push(updates.data_consegna_prevista);
      paramIndex++;
    }

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nessun campo da aggiornare'
      });
    }

    values.push(id);
    const queryText = `
      UPDATE requests 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(queryText, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Richiesta non trovata'
      });
    }

    res.json({
      success: true,
      message: 'Richiesta aggiornata',
      data: { request: result.rows[0] }
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
// HELPER: Convert to CSV
// ============================================
const convertToCSV = (data) => {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => 
    Object.values(row).map(val => 
      typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
    ).join(',')
  );

  return [headers, ...rows].join('\n');
};

module.exports = {
  getDashboardStats,
  getRecentActivity,
  getRevenueChart,
  getTopCustomers,
  exportRequests,
  getAllUsers,
  updateUserStatus,
  getRequestById, // ✅ AGGIUNTO
  getRequestMessages, // ✅ AGGIUNTO
  sendMessage, // ✅ AGGIUNTO
  updateRequestStatus // ✅ AGGIUNTO
};