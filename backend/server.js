require('dotenv').config();
const app = require('./src/config/app');
const { testConnection, closePool } = require('./src/config/database');
const { closeTransporter } = require('./src/services/email.service');

const PORT = process.env.PORT || 5000;

let server = null;
let isShuttingDown = false;

// ============================================
// STARTUP
// ============================================
const startServer = async () => {
  try {
    console.log('🔄 Testing database connection...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Exiting...');
      process.exit(1);
    }

    server = app.listen(PORT, () => {
      console.log('========================================');
      console.log('🚀 ValiryArt Backend Server');
      console.log('========================================');
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV}`);
      console.log(`🗄️  Database: Connected`);
      console.log(`🌐 API: http://localhost:${PORT}/api`);
      console.log(`❤️  Health: http://localhost:${PORT}/health`);
      console.log('========================================');
    });

    // ✅ Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
      } else {
        console.error('❌ Server error:', error);
      }
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
const gracefulShutdown = async (signal) => {
  if (isShuttingDown) {
    console.log('⚠️  Shutdown already in progress...');
    return;
  }

  isShuttingDown = true;
  console.log(`\n⚠️  ${signal} signal received: starting graceful shutdown...`);

  // ✅ Stop accepting new connections
  if (server) {
    server.close(async () => {
      console.log('✅ HTTP server closed');

      try {
        // ✅ Close email transporter
        await closeTransporter();
        
        // ✅ Close database pool
        await closePool();
        
        console.log('✅ All connections closed gracefully');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    });

    // ✅ Force shutdown after timeout
    setTimeout(() => {
      console.error('❌ Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000); // 10 seconds timeout
  } else {
    process.exit(0);
  }
};

// ============================================
// SIGNAL HANDLERS
// ============================================
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ============================================
// ERROR HANDLERS
// ============================================
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // ✅ Non uscire immediatamente - log e continua
  if (process.env.NODE_ENV === 'production') {
    // In produzione, potrebbe essere meglio riavviare
    gracefulShutdown('UNHANDLED_REJECTION');
  }
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  // ✅ Questo è critico - fare shutdown
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// ✅ NUOVO: Handle warnings (memory leaks, etc)
process.on('warning', (warning) => {
  console.warn('⚠️  Node.js Warning:', warning.name, warning.message);
});

// ============================================
// START
// ============================================
startServer();