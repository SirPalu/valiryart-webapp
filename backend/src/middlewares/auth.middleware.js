const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// ✅ CACHE IN-MEMORY per utenti (evita query ripetute)
const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minuti

// ✅ Helper per cache
const getCachedUser = (userId) => {
  const cached = userCache.get(userId);
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    userCache.delete(userId);
    return null;
  }
  
  return cached.user;
};

const setCachedUser = (userId, user) => {
  userCache.set(userId, {
    user,
    timestamp: Date.now()
  });
};

// ✅ Pulizia cache periodica
setInterval(() => {
  const now = Date.now();
  for (const [userId, data] of userCache.entries()) {
    if (now - data.timestamp > CACHE_TTL) {
      userCache.delete(userId);
    }
  }
}, 60000); // Ogni minuto

// ============================================
// VERIFY TOKEN - OTTIMIZZATO
// ============================================
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token mancante o non valido'
      });
    }

    const token = authHeader.split(' ')[1];

    // ✅ Verifica token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // ✅ Controlla cache prima di query DB
    let user = getCachedUser(decoded.userId);
    
    if (!user) {
      // Cache miss - query database
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

      user = result.rows[0];
      
      // ✅ Salva in cache
      setCachedUser(decoded.userId, user);
    }

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
    // ✅ Log SOLO errori critici (non spam)
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

    console.error('❌ Auth middleware critical error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Errore di autenticazione'
    });
  }
};

// ============================================
// REQUIRE ADMIN
// ============================================
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

// ============================================
// OPTIONAL AUTH
// ============================================
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Usa cache
    let user = getCachedUser(decoded.userId);
    
    if (!user) {
      const result = await query(
        'SELECT id, email, nome, cognome, ruolo, attivo FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (result.rows.length > 0 && result.rows[0].attivo) {
        user = result.rows[0];
        setCachedUser(decoded.userId, user);
      }
    }

    req.user = user && user.attivo ? user : null;
    next();
  } catch (error) {
    // ✅ Nessun log per errori token in optional auth
    req.user = null;
    next();
  }
};

// ============================================
// CHECK RESOURCE OWNERSHIP
// ============================================
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

// ============================================
// CLEAR CACHE (utility per logout/cambio dati)
// ============================================
const clearUserCache = (userId) => {
  userCache.delete(userId);
};

module.exports = {
  verifyToken,
  requireAdmin,
  optionalAuth,
  checkResourceOwnership,
  clearUserCache
};