const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const app = express();
app.set('trust proxy', 1);
// ============================================
// SECURITY MIDDLEWARE
// ============================================
app.use(helmet({
  contentSecurityPolicy: false, // Disabilitiamo per sviluppo, abilitare in produzione
  crossOriginEmbedderPolicy: false
}));

// ============================================
// CORS CONFIGURATION
// ============================================
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// ============================================
// BODY PARSERS
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// COMPRESSION
// ============================================
app.use(compression());

// ============================================
// LOGGING
// ============================================
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ============================================
// RATE LIMITING
// ============================================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 100, // Max 100 richieste per IP
  message: 'Troppe richieste da questo IP, riprova tra 15 minuti',
  standardHeaders: true,
  legacyHeaders: false,
});

// Applica rate limiting solo alle API
app.use('/api/', limiter);

// Rate limiting più restrittivo per autenticazione
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Max 5 tentativi di login
  message: 'Troppi tentativi di login, riprova tra 15 minuti',
  skipSuccessfulRequests: true
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// ============================================
// API ROUTES
// ============================================
// Importeremo le routes qui
app.use('/api/auth', authLimiter, require('../routes/auth.routes'));
app.use('/api/users', require('../routes/user.routes'));
app.use('/api/requests', require('../routes/request.routes'));
app.use('/api/portfolio', require('../routes/portfolio.routes'));
app.use('/api/designs', require('../routes/design.routes'));
app.use('/api/messages', require('../routes/message.routes'));
app.use('/api/admin', require('../routes/admin.routes'));
app.use('/api/content', require('../routes/content.routes'));

// ============================================
// ERROR HANDLING
// ============================================

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint non trovato',
    path: req.originalUrl
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);

  // Errori di validazione
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Errore di validazione',
      errors: err.errors
    });
  }

  // Errori JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token non valido'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token scaduto'
    });
  }

  // Errori database
  if (err.code && err.code.startsWith('23')) {
    return res.status(400).json({
      success: false,
      message: 'Errore nei dati forniti',
      detail: process.env.NODE_ENV === 'development' ? err.detail : undefined
    });
  }

  // Errore generico
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Errore interno del server',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

module.exports = app;