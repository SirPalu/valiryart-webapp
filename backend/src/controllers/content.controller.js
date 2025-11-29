const { query } = require('../config/database');

// ============================================
// GET ALL PAGES (pubblico)
// ============================================
const getAllPages = async (req, res) => {
  try {
    const result = await query(
      'SELECT slug, titolo FROM content_pages WHERE pubblicato = true ORDER BY titolo'
    );

    res.json({
      success: true,
      data: { pages: result.rows }
    });
  } catch (error) {
    console.error('Get all pages error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero delle pagine'
    });
  }
};

// ============================================
// GET PAGE BY SLUG (pubblico)
// ============================================
const getPageBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const result = await query(
      `SELECT * FROM content_pages 
       WHERE slug = $1 AND pubblicato = true`,
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pagina non trovata'
      });
    }

    res.json({
      success: true,
      data: { page: result.rows[0] }
    });
  } catch (error) {
    console.error('Get page by slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero della pagina'
    });
  }
};

// ============================================
// CREATE PAGE (admin)
// ============================================
const createPage = async (req, res) => {
  try {
    const {
      slug,
      titolo,
      contenuto,
      meta_description,
      meta_keywords,
      pubblicato = true
    } = req.body;

    // Verifica slug univoco
    const existing = await query(
      'SELECT id FROM content_pages WHERE slug = $1',
      [slug]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Slug già esistente'
      });
    }

    const result = await query(
      `INSERT INTO content_pages (
        slug, titolo, contenuto, meta_description, meta_keywords, pubblicato, updated_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [slug, titolo, contenuto, meta_description, meta_keywords, pubblicato, req.user.id]
    );

    res.status(201).json({
      success: true,
      message: 'Pagina creata con successo',
      data: { page: result.rows[0] }
    });
  } catch (error) {
    console.error('Create page error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nella creazione della pagina'
    });
  }
};

// ============================================
// UPDATE PAGE (admin)
// ============================================
const updatePage = async (req, res) => {
  try {
    const { slug } = req.params;
    const {
      titolo,
      contenuto,
      meta_description,
      meta_keywords,
      pubblicato
    } = req.body;

    let updateFields = [];
    let params = [];
    let paramIndex = 1;

    const addField = (field, value) => {
      if (value !== undefined) {
        updateFields.push(`${field} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    };

    addField('titolo', titolo);
    addField('contenuto', contenuto);
    addField('meta_description', meta_description);
    addField('meta_keywords', meta_keywords);
    addField('pubblicato', pubblicato);
    addField('updated_by', req.user.id);

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nessun campo da aggiornare'
      });
    }

    // Incrementa versione
    updateFields.push(`versione = versione + 1`);

    params.push(slug);
    const queryText = `
      UPDATE content_pages 
      SET ${updateFields.join(', ')}
      WHERE slug = $${paramIndex}
      RETURNING *
    `;

    const result = await query(queryText, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pagina non trovata'
      });
    }

    res.json({
      success: true,
      message: 'Pagina aggiornata con successo',
      data: { page: result.rows[0] }
    });
  } catch (error) {
    console.error('Update page error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nell\'aggiornamento della pagina'
    });
  }
};

// ============================================
// DELETE PAGE (admin)
// ============================================
const deletePage = async (req, res) => {
  try {
    const { slug } = req.params;

    const result = await query(
      'DELETE FROM content_pages WHERE slug = $1 RETURNING slug',
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pagina non trovata'
      });
    }

    res.json({
      success: true,
      message: 'Pagina eliminata con successo'
    });
  } catch (error) {
    console.error('Delete page error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nell\'eliminazione della pagina'
    });
  }
};

// ============================================
// GET SETTINGS (pubblico - solo alcune)
// ============================================
const getPublicSettings = async (req, res) => {
  try {
    const result = await query(`
      SELECT chiave, valore, tipo
      FROM settings
      WHERE chiave IN (
        'whatsapp_numero', 
        'instagram_username', 
        'email_notifiche',
        'spedizione_base_costo'
      )
    `);

    const settings = {};
    result.rows.forEach(row => {
      settings[row.chiave] = row.valore;
    });

    res.json({
      success: true,
      data: { settings }
    });
  } catch (error) {
    console.error('Get public settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero delle impostazioni'
    });
  }
};

// ============================================
// GET ALL SETTINGS (admin)
// ============================================
const getAllSettings = async (req, res) => {
  try {
    const result = await query('SELECT * FROM settings ORDER BY chiave');

    res.json({
      success: true,
      data: { settings: result.rows }
    });
  } catch (error) {
    console.error('Get all settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero delle impostazioni'
    });
  }
};

// ============================================
// UPDATE SETTING (admin)
// ============================================
const updateSetting = async (req, res) => {
  try {
    const { chiave } = req.params;
    const { valore } = req.body;

    const result = await query(
      `UPDATE settings 
       SET valore = $1, updated_by = $2
       WHERE chiave = $3
       RETURNING *`,
      [valore, req.user.id, chiave]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Impostazione non trovata'
      });
    }

    res.json({
      success: true,
      message: 'Impostazione aggiornata',
      data: { setting: result.rows[0] }
    });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nell\'aggiornamento dell\'impostazione'
    });
  }
};

module.exports = {
  getAllPages,
  getPageBySlug,
  createPage,
  updatePage,
  deletePage,
  getPublicSettings,
  getAllSettings,
  updateSetting
};