// backend/scripts/create-admin.js

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'valiryart',
  user: process.env.DB_USER || 'valiryart_user',
  password: process.env.DB_PASSWORD,
});

async function createAdmin() {
  try {
    console.log('🔧 Creating admin user...');

    // Dati admin
    const adminEmail = 'admin@valiryart.it';
    const adminPassword = 'ValiryAdmin2024!'; // Cambia questa password!
    const nome = 'Valeria';
    const cognome = 'Admin';

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    // Controlla se admin già esiste
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [adminEmail]
    );

    if (existing.rows.length > 0) {
      console.log('⚠️  Admin user already exists!');
      console.log('📧 Email:', adminEmail);
      process.exit(0);
    }

    // Crea admin
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, nome, cognome, ruolo, email_verified, attivo)
       VALUES ($1, $2, $3, $4, 'admin', true, true)
       RETURNING id, email, nome, cognome, ruolo`,
      [adminEmail, passwordHash, nome, cognome]
    );

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('⚠️  IMPORTANT: Change this password after first login!');
    console.log('\nUser details:', result.rows[0]);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();