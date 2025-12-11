const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Verifica token JWT
const verifyToken = async (req, res, next) => {
  try {
    // ✅ DEBUG LOG
    console.log('🔐 verifyToken chiamato per:', req.originalUrl);
    
    // Prendi token dall'header
    const authHeader = req.headers.authorization;
    
    console.log('🔑 Authorization Header:', authHeader ? 'PRESENTE' : 'ASSENTE');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Token mancante o formato errato');
      return res.status(401).json({
        success: false,
        message: 'Token mancante o non valido'
      });
    }

    const token = authHeader.split(' ')[1];
    console.log('🎫 Token estratto:', token.substring(0, 20) + '...');

    // Verifica token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decodificato, userId:', decoded.userId);

    // Recupera utente dal database
    const result = await query(
      'SELECT id, email, nome, cognome, ruolo, attivo FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      console.log('❌ Utente non trovato nel DB');
      return res.status(401).json({
        success: false,
        message: 'Utente non trovato'
      });
    }

    const user = result.rows[0];
    console.log('👤 Utente trovato:', user.email, 'ruolo:', user.ruolo);

    // Verifica utente attivo
    if (!user.attivo) {
      console.log('❌ Utente non attivo');
      return res.status(403).json({
        success: false,
        message: 'Account disabilitato'
      });
    }

    // Aggiungi user all'oggetto request
    req.user = user;
    console.log('✅ Autenticazione completata per:', user.email);
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error.message);
    
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

    return res.status(500).json({
      success: false,
      message: 'Errore di autenticazione'
    });
  }
};

// Verifica ruolo admin
const requireAdmin = (req, res, next) => {
  console.log('🔒 requireAdmin chiamato');
  
  if (!req.user) {
    console.log('❌ req.user non presente');
    return res.status(401).json({
      success: false,
      message: 'Autenticazione richiesta'
    });
  }

  console.log('👤 Verifica ruolo admin per:', req.user.email, 'ruolo:', req.user.ruolo);

  if (req.user.ruolo !== 'admin') {
    console.log('❌ Utente non è admin');
    return res.status(403).json({
      success: false,
      message: 'Accesso negato: permessi amministratore richiesti'
    });
  }

  console.log('✅ Utente è admin, accesso consentito');
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