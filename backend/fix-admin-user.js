// ============================================
// SCRIPT: Fix Admin User Password
// Esegui: node fix-admin-user.js
// ============================================

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'valiryart',
  user: process.env.DB_USER || 'valiryart_user',
  password: process.env.DB_PASSWORD,
});

const createAdminUser = async () => {
  try {
    console.log('🔄 Connecting to database...');
    
    // Test connessione
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected');

    // Dati admin
    const email = 'valeria@valiryart.it';
    const password = 'Admin123!';
    const nome = 'Valeria';
    const cognome = 'Admin';

    // Hash password con bcrypt
    console.log('🔐 Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    console.log('✅ Password hashed');

    // Controlla se utente esiste
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      // AGGIORNA password esistente
      console.log('⚠️  User exists, updating password...');
      await pool.query(
        'UPDATE users SET password_hash = $1 WHERE email = $2',
        [passwordHash, email]
      );
      console.log('✅ Admin password updated successfully');
    } else {
      // CREA nuovo utente
      console.log('📝 Creating new admin user...');
      await pool.query(
        `INSERT INTO users (email, password_hash, nome, cognome, ruolo, email_verified, attivo)
         VALUES ($1, $2, $3, $4, 'admin', true, true)`,
        [email, passwordHash, nome, cognome]
      );
      console.log('✅ Admin user created successfully');
    }

    console.log('\n========================================');
    console.log('✅ ADMIN USER READY');
    console.log('========================================');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('========================================\n');

    // Verifica login
    console.log('🧪 Testing password verification...');
    const user = await pool.query('SELECT password_hash FROM users WHERE email = $1', [email]);
    const isValid = await bcrypt.compare(password, user.rows[0].password_hash);
    console.log('✅ Password verification:', isValid ? 'SUCCESS' : 'FAILED');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('👋 Connection closed');
  }
};

// Crea anche un utente test
const createTestUser = async () => {
  try {
    const email = 'test@valiryart.it';
    const password = 'Test123!';
    const nome = 'Test';
    const cognome = 'User';

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

    if (existing.rows.length > 0) {
      await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [passwordHash, email]);
      console.log('✅ Test user updated');
    } else {
      await pool.query(
        `INSERT INTO users (email, password_hash, nome, cognome, ruolo, email_verified, attivo)
         VALUES ($1, $2, $3, $4, 'user', true, true)`,
        [email, passwordHash, nome, cognome]
      );
      console.log('✅ Test user created');
    }

    console.log('📧 Test Email:', email);
    console.log('🔑 Test Password:', password);
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
  }
};

const run = async () => {
  await createAdminUser();
  await createTestUser();
};

run();
