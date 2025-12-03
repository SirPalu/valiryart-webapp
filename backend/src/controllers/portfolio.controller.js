const { query } = require('../config/database');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

// ============================================
// GET ALL PORTFOLIO ITEMS (pubblico)
// ============================================
const getPortfolio = async (req, res) => {
  try {
    const { categoria, in_evidenza, limit = 50, offset = 0 } = req.query;
    
    let queryText = `
      SELECT * FROM portfolio
      WHERE pubblicato = true
    `;
    
    const params = [];
    let paramIndex = 1;

    if (categoria) {
      queryText += ` AND categoria = $${paramIndex}`;
      params.push(categoria);
      paramIndex++;
    }

    if (in_evidenza === 'true') {
      queryText += ` AND in_evidenza = true`;
    }

    queryText += ` ORDER BY ordine ASC, created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    res.json({
      success: true,
      data: { items: result.rows }
    });
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero del portfolio'
    });
  }
};

// ============================================
// GET SINGLE PORTFOLIO ITEM
// ============================================
const getPortfolioById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM portfolio WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Opera non trovata'
      });
    }

    // Incrementa visualizzazioni
    await query(
      'UPDATE portfolio SET visualizzazioni = visualizzazioni + 1 WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      data: { item: result.rows[0] }
    });
  } catch (error) {
    console.error('Get portfolio by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero dell\'opera'
    });
  }
};

// ============================================
// CREATE PORTFOLIO ITEM (admin)
// ============================================
const createPortfolioItem = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Immagine obbligatoria'
      });
    }

    const {
      categoria,
      titolo,
      descrizione,
      dimensioni,
      materiali,
      tempo_realizzazione,
      prezzo_riferimento,
      alt_text,
      tags,
      pubblicato = true,
      in_evidenza = false,
      ordine = 0
    } = req.body;

    // Genera thumbnail
    const thumbnailPath = await generateThumbnail(req.file.path);

    // Inserisci nel database
    const result = await query(
      `INSERT INTO portfolio (
        categoria, titolo, descrizione, immagine_url, immagine_thumbnail_url,
        dimensioni, materiali, tempo_realizzazione, prezzo_riferimento,
        alt_text, tags, pubblicato, in_evidenza, ordine
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        categoria,
        titolo,
        descrizione,
        `/uploads/portfolio/${req.file.filename}`,
        thumbnailPath,
        dimensioni,
        materiali,
        tempo_realizzazione,
        prezzo_riferimento,
        alt_text || titolo,
        tags ? JSON.parse(tags) : null,
        pubblicato,
        in_evidenza,
        ordine
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Opera aggiunta al portfolio',
      data: { item: result.rows[0] }
    });
  } catch (error) {
    console.error('Create portfolio item error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nella creazione dell\'opera'
    });
  }
};

// ============================================
// UPDATE PORTFOLIO ITEM (admin)
// ============================================
const updatePortfolioItem = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      categoria,
      titolo,
      descrizione,
      dimensioni,
      materiali,
      tempo_realizzazione,
      prezzo_riferimento,
      alt_text,
      tags,
      pubblicato,
      in_evidenza,
      ordine
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

    addField('categoria', categoria);
    addField('titolo', titolo);
    addField('descrizione', descrizione);
    addField('dimensioni', dimensioni);
    addField('materiali', materiali);
    addField('tempo_realizzazione', tempo_realizzazione);
    addField('prezzo_riferimento', prezzo_riferimento);
    addField('alt_text', alt_text);
    addField('tags', tags ? JSON.parse(tags) : undefined);
    addField('pubblicato', pubblicato);
    addField('in_evidenza', in_evidenza);
    addField('ordine', ordine);

    // Se c'è nuova immagine
    if (req.file) {
      const thumbnailPath = await generateThumbnail(req.file.path);
      addField('immagine_url', `/uploads/portfolio/${req.file.filename}`);
      addField('immagine_thumbnail_url', thumbnailPath);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nessun campo da aggiornare'
      });
    }

    params.push(id);
    const queryText = `
      UPDATE portfolio 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(queryText, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Opera non trovata'
      });
    }

    res.json({
      success: true,
      message: 'Opera aggiornata con successo',
      data: { item: result.rows[0] }
    });
  } catch (error) {
    console.error('Update portfolio item error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nell\'aggiornamento dell\'opera'
    });
  }
};

// ============================================
// DELETE PORTFOLIO ITEM (admin)
// ============================================
const deletePortfolioItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Recupera info per eliminare file
    const item = await query(
      'SELECT immagine_url, immagine_thumbnail_url FROM portfolio WHERE id = $1',
      [id]
    );

    if (item.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Opera non trovata'
      });
    }

    // Elimina dal database
    await query('DELETE FROM portfolio WHERE id = $1', [id]);

    // TODO: Elimina file fisici
    // deleteFile(item.rows[0].immagine_url);
    // deleteFile(item.rows[0].immagine_thumbnail_url);

    res.json({
      success: true,
      message: 'Opera eliminata con successo'
    });
  } catch (error) {
    console.error('Delete portfolio item error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nell\'eliminazione dell\'opera'
    });
  }
};

// ============================================
// GET PORTFOLIO STATS (admin)
// ============================================
const getPortfolioStats = async (req, res) => {
  try {
    const stats = await query(`
      SELECT 
        categoria,
        COUNT(*) as totale,
        SUM(visualizzazioni) as visualizzazioni_totali,
        AVG(visualizzazioni) as visualizzazioni_medie
      FROM portfolio
      WHERE pubblicato = true
      GROUP BY categoria
    `);

    const topViewed = await query(`
      SELECT id, titolo, categoria, visualizzazioni, immagine_thumbnail_url
      FROM portfolio
      WHERE pubblicato = true
      ORDER BY visualizzazioni DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        byCategory: stats.rows,
        topViewed: topViewed.rows
      }
    });
  } catch (error) {
    console.error('Get portfolio stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero delle statistiche'
    });
  }
};

// ============================================
// HELPER: Genera thumbnail
// ============================================
const generateThumbnail = async (imagePath) => {
  try {
    const parsedPath = path.parse(imagePath);
    const thumbnailPath = path.join(
      parsedPath.dir,
      `${parsedPath.name}_thumb${parsedPath.ext}`
    );

    await sharp(imagePath)
      .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    return thumbnailPath.replace(/\\/g, '/').replace('uploads', '/uploads');
  } catch (error) {
    console.error('Generate thumbnail error:', error);
    return null;
  }
};

module.exports = {
  getPortfolio,
  getPortfolioById,
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
  getPortfolioStats
};