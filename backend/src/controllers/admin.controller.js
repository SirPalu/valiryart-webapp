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
  updateUserStatus
};