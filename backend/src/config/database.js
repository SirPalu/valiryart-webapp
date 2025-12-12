const { Pool } = require('pg');

// ============================================
// CONFIGURAZIONE POOL OTTIMIZZATA
// ============================================
const pool = new Pool({
  host: process.env.DB_HOST || 'valiryart-db',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'valiryart',
  user: process.env.DB_USER || 'valiryart_user',
  password: process.env.DB_PASSWORD,
  
  // ✅ OTTIMIZZAZIONI POOL
  max: 20,                      // Max connessioni simultanee
  min: 2,                       // ✅ NUOVO: mantieni 2 connessioni sempre aperte
  idleTimeoutMillis: 30000,     // Chiudi connessioni idle dopo 30s
  connectionTimeoutMillis: 5000, // ✅ Aumentato da 2s a 5s per evitare timeout
  
  // ✅ NUOVO: Statement timeout per query lente
  statement_timeout: 30000,      // Timeout query dopo 30s
  query_timeout: 30000,
  
  // ✅ NUOVO: Keep alive per connessioni persistenti
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

// ============================================
// MONITORING POOL
// ============================================
let lastPoolCheck = Date.now();
const POOL_CHECK_INTERVAL = 60000; // 1 minuto

const logPoolStats = () => {
  const now = Date.now();
  if (now - lastPoolCheck > POOL_CHECK_INTERVAL) {
    console.log('📊 Pool Stats:', {
      total: pool.totalCount,
      idle: pool.idleCount,
      waiting: pool.waitingCount
    });
    lastPoolCheck = now;
  }
};

// ============================================
// EVENT LISTENERS
// ============================================
pool.on('connect', (client) => {
  if (process.env.NODE_ENV === 'development' && process.env.DB_VERBOSE === 'true') {
    console.log('✅ New DB connection established');
  }
  logPoolStats();
});

pool.on('acquire', (client) => {
  if (process.env.DB_VERBOSE === 'true') {
    console.log('🔒 Client acquired from pool');
  }
});

pool.on('remove', (client) => {
  if (process.env.DB_VERBOSE === 'true') {
    console.log('🗑️  Client removed from pool');
  }
  logPoolStats();
});

pool.on('error', (err, client) => {
  console.error('❌ Unexpected pool error:', err);
  // Non uscire - lascia che il pool gestisca il recovery
});

// ============================================
// QUERY HELPER CON AUTO-RELEASE
// ============================================
const query = async (text, params) => {
  const start = Date.now();
  let client;
  
  try {
    // ✅ CRITICO: usa pool.query che rilascia automaticamente
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log solo query lente (>1000ms)
    if (duration > 1000) {
      console.warn('⚠️  Slow query detected', { 
        duration: `${duration}ms`, 
        rows: res.rowCount,
        query: text.substring(0, 100) + '...'
      });
    }
    
    return res;
  } catch (error) {
    const duration = Date.now() - start;
    console.error('❌ Query error:', {
      duration: `${duration}ms`,
      error: error.message,
      query: text.substring(0, 100)
    });
    throw error;
  }
};

// ============================================
// TRANSACTION HELPER CON TIMEOUT
// ============================================
const transaction = async (callback) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // ✅ NUOVO: Timeout per transazioni lunghe
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Transaction timeout')), 30000);
    });
    
    const result = await Promise.race([
      callback(client),
      timeoutPromise
    ]);
    
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release(); // ✅ CRITICO: sempre rilascia
  }
};

// ============================================
// TEST CONNECTION
// ============================================
const testConnection = async () => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query('SELECT NOW(), version()');
    console.log('✅ Database connection test successful');
    console.log('📅 Server time:', result.rows[0].now);
    console.log('🗄️  PostgreSQL:', result.rows[0].version.split(',')[0]);
    return true;
  } catch (err) {
    console.error('❌ Database connection test failed:', err.message);
    return false;
  } finally {
    if (client) client.release(); // ✅ CRITICO
  }
};

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
const closePool = async () => {
  console.log('🔄 Closing database pool...');
  try {
    await pool.end();
    console.log('✅ Database pool closed successfully');
  } catch (err) {
    console.error('❌ Error closing pool:', err);
  }
};

// ============================================
// HEALTH CHECK
// ============================================
const healthCheck = async () => {
  try {
    const result = await query('SELECT 1 as health');
    return {
      healthy: true,
      totalConnections: pool.totalCount,
      idleConnections: pool.idleCount,
      waitingRequests: pool.waitingCount
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message
    };
  }
};

module.exports = {
  pool,
  query,
  transaction,
  testConnection,
  closePool,
  healthCheck
};