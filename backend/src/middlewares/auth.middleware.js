const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Verifica token JWT
const verifyToken = async (req, res, next) => {
  try {
    // Prendi token dall'header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token mancante o non valido'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verifica token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Recupera utente dal database
    const result = await query(
      'SELECT id, email, nome, cognome, ruolo, attivo FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Utente non trovato'
      });
    }

    const user = result.rows[0];

    // Verifica utente attivo
    if (!user.attivo) {
      return res.status(403).json({
        success: false,
        message: 'Account disabilitato'
      });
    }

    // Aggiungi user all'oggetto request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token scaduto'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token non valido'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Errore di autenticazione'
    });
  }
};

// Verifica ruolo admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Autenticazione richiesta'
    });
  }

  if (req.user.ruolo !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Accesso negato: permessi amministratore richiesti'
    });
  }

  next();
};

// Middleware opzionale (può passare anche senza token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Nessun token, continua senza user
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await query(
      'SELECT id, email, nome, cognome, ruolo, attivo FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length > 0 && result.rows[0].attivo) {
      req.user = result.rows[0];
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    // Errore nel token, continua senza user
    req.user = null;
    next();
  }
};

// Verifica che l'utente possa accedere alla risorsa
const checkResourceOwnership = (resourceUserIdField = 'user_id') => {
  return (req, res, next) => {
    // Admin può accedere a tutto
    if (req.user && req.user.ruolo === 'admin') {
      return next();
    }

    // Verifica che l'utente sia il proprietario
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (req.user && req.user.id === resourceUserId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Non hai i permessi per accedere a questa risorsa'
    });
  };
};

module.exports = {
  verifyToken,
  requireAdmin,
  optionalAuth,
  checkResourceOwnership
};