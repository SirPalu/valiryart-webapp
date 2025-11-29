const { query } = require('../config/database');
const sharp = require('sharp');
const path = require('path');

// ============================================
// GET ALL DESIGNS (pubblico)
// ============================================
const getDesigns = async (req, res) => {
  try {
    const { categoria, complessita, popolare, limit = 100, offset = 0 } = req.query;
    
    let queryText = `
      SELECT * FROM design_gallery
      WHERE pubblicato = true
    `;
    
    const params = [];
    let paramIndex = 1;

    if (categoria) {
      queryText += ` AND categoria = $${paramIndex}`;
      params.push(categoria);
      paramIndex++;
    }

    if (complessita) {
      queryText += ` AND complessita = $${paramIndex}`;
      params.push(complessita);
      paramIndex++;
    }

    if (popolare === 'true') {
      queryText += ` AND popolare = true`;
    }

    queryText += ` ORDER BY ordine ASC, volte_scelto DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    res.json({
      success: true,
      data: { designs: result.rows }
    });
  } catch (error) {
    console.error('Get designs error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero dei disegni'
    });
  }
};

// ============================================
// GET SINGLE DESIGN
// ============================================
const getDesignById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM design_gallery WHERE id = $1 AND pubblicato = true',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Disegno non trovato'
      });
    }

    res.json({
      success: true,
      data: { design: result.rows[0] }
    });
  } catch (error) {
    console.error('Get design by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero del disegno'
    });
  }
};

// ============================================
// INCREMENT DESIGN USAGE
// ============================================
const incrementDesignUsage = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'UPDATE design_gallery SET volte_scelto = volte_scelto + 1 WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Disegno non trovato'
      });
    }

    res.json({
      success: true,
      data: { design: result.rows[0] }
    });
  } catch (error) {
    console.error('Increment design usage error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nell\'aggiornamento del disegno'
    });
  }
};

// ============================================
// CREATE DESIGN (admin)
// ============================================
const createDesign = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Immagine obbligatoria'
      });
    }

    const {
      titolo,
      descrizione,
      categoria,
      tags,
      complessita = 'media',
      pubblicato = true,
      popolare = false,
      ordine = 0
    } = req.body;

    // Genera thumbnail
    const parsedPath = path.parse(req.file.path);
    const thumbnailPath = path.join(
      parsedPath.dir,
      `${parsedPath.name}_thumb${parsedPath.ext}`
    );

    await sharp(req.file.path)
      .resize(300, 300, { fit: 'inside' })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    const result = await query(
      `INSERT INTO design_gallery (
        titolo, descrizione, immagine_url, immagine_thumbnail_url,
        categoria, tags, complessita, pubblicato, popolare, ordine
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        titolo,
        descrizione,
        `/uploads/designs/${req.file.filename}`,
        thumbnailPath.replace(/\\/g, '/').replace('uploads', '/uploads'),
        categoria,
        tags ? JSON.parse(tags) : null,
        complessita,
        pubblicato,
        popolare,
        ordine
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Disegno aggiunto con successo',
      data: { design: result.rows[0] }
    });
  } catch (error) {
    console.error('Create design error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nella creazione del disegno'
    });
  }
};

// ============================================
// UPDATE DESIGN (admin)
// ============================================
const updateDesign = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titolo,
      descrizione,
      categoria,
      tags,
      complessita,
      pubblicato,
      popolare,
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

    addField('titolo', titolo);
    addField('descrizione', descrizione);
    addField('categoria', categoria);
    addField('tags', tags ? JSON.parse(tags) : undefined);
    addField('complessita', complessita);
    addField('pubblicato', pubblicato);
    addField('popolare', popolare);
    addField('ordine', ordine);

    if (req.file) {
      const parsedPath = path.parse(req.file.path);
      const thumbnailPath = path.join(
        parsedPath.dir,
        `${parsedPath.name}_thumb${parsedPath.ext}`
      );

      await sharp(req.file.path)
        .resize(300, 300, { fit: 'inside' })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);

      addField('immagine_url', `/uploads/designs/${req.file.filename}`);
      addField('immagine_thumbnail_url', thumbnailPath.replace(/\\/g, '/').replace('uploads', '/uploads'));
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nessun campo da aggiornare'
      });
    }

    params.push(id);
    const queryText = `
      UPDATE design_gallery 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(queryText, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Disegno non trovato'
      });
    }

    res.json({
      success: true,
      message: 'Disegno aggiornato con successo',
      data: { design: result.rows[0] }
    });
  } catch (error) {
    console.error('Update design error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nell\'aggiornamento del disegno'
    });
  }
};

// ============================================
// DELETE DESIGN (admin)
// ============================================
const deleteDesign = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM design_gallery WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Disegno non trovato'
      });
    }

    res.json({
      success: true,
      message: 'Disegno eliminato con successo'
    });
  } catch (error) {
    console.error('Delete design error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nell\'eliminazione del disegno'
    });
  }
};

// ============================================
// GET DESIGN CATEGORIES (pubblico)
// ============================================
const getDesignCategories = async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        categoria, 
        COUNT(*) as totale
      FROM design_gallery
      WHERE pubblicato = true
      GROUP BY categoria
      ORDER BY categoria
    `);

    res.json({
      success: true,
      data: { categories: result.rows }
    });
  } catch (error) {
    console.error('Get design categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero delle categorie'
    });
  }
};

module.exports = {
  getDesigns,
  getDesignById,
  incrementDesignUsage,
  createDesign,
  updateDesign,
  deleteDesign,
  getDesignCategories
};