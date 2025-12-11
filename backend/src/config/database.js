const { Pool } = require('pg');

// Configurazione pool connessioni PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'valiryart-db',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'valiryart',
  user: process.env.DB_USER || 'valiryart_user',
  password: process.env.DB_PASSWORD,
  max: 20, // Max connessioni nel pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Event listeners per debug
pool.on('connect', () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Database connected');
  }
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  process.exit(-1);
});

// Test connessione
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database connection test successful:', result.rows[0].now);
    client.release();
    return true;
  } catch (err) {
    console.error('❌ Database connection test failed:', err.message);
    return false;
  }
};

// ✅ Query helper OTTIMIZZATO - Log solo se lento o in sviluppo verbose
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log solo query lente (>1000ms) o in modalità verbose
    if (duration > 1000 || process.env.DB_VERBOSE === 'true') {
      console.log('⚠️  Slow query detected', { 
        duration: `${duration}ms`, 
        rows: res.rowCount,
        query: text.substring(0, 100) + '...'
      });
    }
    
    return res;
  } catch (error) {
    console.error('❌ Query error:', error);
    throw error;
  }
};

// Transaction helper
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  query,
  transaction,
  testConnection
};