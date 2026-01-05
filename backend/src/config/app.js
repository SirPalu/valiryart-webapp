const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { healthCheck } = require('./database');

const app = express();

// ============================================
// SECURITY MIDDLEWARE
// ============================================
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// ============================================
// CORS CONFIGURATION
// ============================================
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:8081', 'http://localhost:3000'];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// ============================================
// COMPRESSION
// ============================================
app.use(compression());

// ============================================
// LOGGING (solo in development)
// ============================================
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  // ✅ In produzione: log minimalista
  app.use(morgan('combined', {
    skip: (req, res) => res.statusCode < 400
  }));
}

// ============================================
// BODY PARSERS
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// RATE LIMITING
// ============================================

// ✅ Rate limiter generale (100 richieste per 15 minuti)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 100,
  message: {
    success: false,
    message: 'Troppe richieste da questo IP, riprova tra qualche minuto'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // ✅ Skip rate limiting in development
  skip: (req) => process.env.NODE_ENV === 'development'
});

// ✅ Rate limiter per autenticazione (5 tentativi per 15 minuti)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Troppi tentativi di login, riprova tra 15 minuti'
  },
  skipSuccessfulRequests: true,
  skip: (req) => process.env.NODE_ENV === 'development'
});

// ✅ Rate limiter per richieste (10 per ora)
const requestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 ora
  max: 10,
  message: {
    success: false,
    message: 'Hai raggiunto il limite di richieste orarie, riprova più tardi'
  },
  skip: (req) => process.env.NODE_ENV === 'development'
});

// Applica rate limiting generale
app.use('/api/', generalLimiter);

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================
app.get('/health', async (req, res) => {
  const dbHealth = await healthCheck();
  
  res.status(dbHealth.healthy ? 200 : 503).json({
    status: dbHealth.healthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbHealth
  });
});

// ✅ NUOVO: Metrics endpoint (solo in development o con auth)
app.get('/api/metrics', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const dbHealth = await healthCheck();
  
  res.json({
    timestamp: new Date().toISOString(),
    process: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    },
    database: dbHealth
  });
});

// ============================================
// ROUTES
// ============================================
const authRoutes = require('../routes/auth.routes');
const userRoutes = require('../routes/user.routes');
const requestRoutes = require('../routes/request.routes');
const reviewRoutes = require('../routes/review.routes'); // ✅ NUOVO
const messageRoutes = require('../routes/message.routes');
const portfolioRoutes = require('../routes/portfolio.routes');
const designRoutes = require('../routes/design.routes');
const contentRoutes = require('../routes/content.routes');
const adminRoutes = require('../routes/admin.routes');

// Public routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/content', contentRoutes);

// Protected routes
app.use('/api/users', userRoutes);
app.use('/api/requests', requestLimiter, requestRoutes);
app.use('/api/reviews', reviewRoutes); // ✅ NUOVO
app.use('/api/messages', messageRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/designs', designRoutes);
app.use('/api/admin', adminRoutes);

// Static files (uploads)
app.use('/uploads', express.static('uploads', {
  maxAge: '30d',
  etag: true,
  lastModified: true
}));

// ============================================
// 404 HANDLER
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint non trovato'
  });
});

// ============================================
// ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
  console.error('❌ Error handler:', err.message);
  
  // ✅ Non esporre stack trace in produzione
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Errore interno del server',
    ...(isDevelopment && { stack: err.stack })
  });
});

module.exports = app;