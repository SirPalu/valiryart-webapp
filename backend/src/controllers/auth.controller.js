const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { query, transaction } = require('../config/database');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper: genera JWT token
const generateToken = (userId, expiresIn = process.env.JWT_EXPIRES_IN) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

// ============================================
// REGISTRAZIONE
// ============================================
const register = async (req, res) => {
  try {
    // Validazione input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password, nome, cognome, telefono } = req.body;

    // Verifica email già esistente
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email già registrata'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Inserisci utente
    const result = await query(
      `INSERT INTO users (email, password_hash, nome, cognome, telefono, ruolo)
       VALUES ($1, $2, $3, $4, $5, 'user')
       RETURNING id, email, nome, cognome, telefono, ruolo, created_at`,
      [email, passwordHash, nome, cognome, telefono]
    );

    const user = result.rows[0];

    // Genera token
    const token = generateToken(user.id);

    // TODO: Invia email di verifica (implementare dopo)

    res.status(201).json({
      success: true,
      message: 'Registrazione completata con successo',
      data: {
        user: {
          id: user.id,
          email: user.email,
          nome: user.nome,
          cognome: user.cognome,
          telefono: user.telefono,
          ruolo: user.ruolo
        },
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante la registrazione'
    });
  }
};

// ============================================
// LOGIN
// ============================================
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Trova utente
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenziali non valide'
      });
    }

    const user = result.rows[0];

    // Verifica account attivo
    if (!user.attivo) {
      return res.status(403).json({
        success: false,
        message: 'Account disabilitato'
      });
    }

    // Verifica password (solo se non è OAuth)
    if (!user.password_hash) {
      return res.status(400).json({
        success: false,
        message: 'Account registrato con Google. Usa il login Google.'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenziali non valide'
      });
    }

    // Aggiorna last_login
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Genera token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login effettuato con successo',
      data: {
        user: {
          id: user.id,
          email: user.email,
          nome: user.nome,
          cognome: user.cognome,
          telefono: user.telefono,
          ruolo: user.ruolo,
          google_avatar_url: user.google_avatar_url
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante il login'
    });
  }
};

// ============================================
// GOOGLE OAUTH
// ============================================
const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    // Verifica token Google
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, given_name, family_name, picture } = payload;

    // Verifica se utente già esistente
    let result = await query(
      'SELECT * FROM users WHERE google_id = $1 OR email = $2',
      [googleId, email]
    );

    let user;

    if (result.rows.length === 0) {
      // Nuovo utente - registra
      result = await query(
        `INSERT INTO users (email, google_id, nome, cognome, google_avatar_url, ruolo, email_verified)
         VALUES ($1, $2, $3, $4, $5, 'user', true)
         RETURNING id, email, nome, cognome, telefono, ruolo, google_avatar_url`,
        [email, googleId, given_name, family_name, picture]
      );
      user = result.rows[0];
    } else {
      user = result.rows[0];

      // Aggiorna google_id se mancante
      if (!user.google_id) {
        await query(
          'UPDATE users SET google_id = $1, google_avatar_url = $2, email_verified = true WHERE id = $3',
          [googleId, picture, user.id]
        );
        user.google_avatar_url = picture;
      }

      // Aggiorna last_login
      await query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );
    }

    // Verifica account attivo
    if (!user.attivo) {
      return res.status(403).json({
        success: false,
        message: 'Account disabilitato'
      });
    }

    // Genera token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login Google completato',
      data: {
        user: {
          id: user.id,
          email: user.email,
          nome: user.nome,
          cognome: user.cognome,
          telefono: user.telefono,
          ruolo: user.ruolo,
          google_avatar_url: user.google_avatar_url
        },
        token
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante autenticazione Google'
    });
  }
};

// ============================================
// LOGOUT
// ============================================
const logout = async (req, res) => {
  try {
    // Con JWT stateless, il logout è gestito client-side
    // Qui possiamo loggare l'evento o invalidare il token (con blacklist)
    
    res.json({
      success: true,
      message: 'Logout effettuato con successo'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante il logout'
    });
  }
};

// ============================================
// REFRESH TOKEN
// ============================================
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // Verifica refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    // Genera nuovo access token
    const newToken = generateToken(decoded.userId);

    res.json({
      success: true,
      data: { token: newToken }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Refresh token non valido'
    });
  }
};

// ============================================
// VERIFICA EMAIL
// ============================================
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Verifica token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Aggiorna stato verifica
    await query(
      'UPDATE users SET email_verified = true WHERE id = $1',
      [decoded.userId]
    );

    res.json({
      success: true,
      message: 'Email verificata con successo'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Token di verifica non valido o scaduto'
    });
  }
};

// ============================================
// FORGOT PASSWORD
// ============================================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const result = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    // Non rivelare se email esiste (security)
    if (result.rows.length === 0) {
      return res.json({
        success: true,
        message: 'Se l\'email esiste, riceverai un link per resettare la password'
      });
    }

    const user = result.rows[0];

    // Genera token reset (valido 1 ora)
    const resetToken = generateToken(user.id, '1h');

    // TODO: Invia email con link reset
    // Link: http://frontend.com/reset-password?token=resetToken

    res.json({
      success: true,
      message: 'Se l\'email esiste, riceverai un link per resettare la password',
      // REMOVE IN PRODUCTION - solo per debug
      debug_token: resetToken
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante richiesta reset password'
    });
  }
};

// ============================================
// RESET PASSWORD
// ============================================
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Verifica token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Hash nuova password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Aggiorna password
    await query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [passwordHash, decoded.userId]
    );

    res.json({
      success: true,
      message: 'Password resettata con successo'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Token non valido o scaduto'
    });
  }
};

// ============================================
// GET CURRENT USER
// ============================================
const getCurrentUser = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, email, nome, cognome, telefono, indirizzo, citta, cap, provincia,
              google_avatar_url, ruolo, email_verified, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utente non trovato'
      });
    }

    res.json({
      success: true,
      data: { user: result.rows[0] }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero dati utente'
    });
  }
};

// ============================================
// UPDATE PROFILE
// ============================================
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { nome, cognome, telefono, indirizzo, citta, cap, provincia } = req.body;

    const result = await query(
      `UPDATE users 
       SET nome = COALESCE($1, nome),
           cognome = COALESCE($2, cognome),
           telefono = COALESCE($3, telefono),
           indirizzo = COALESCE($4, indirizzo),
           citta = COALESCE($5, citta),
           cap = COALESCE($6, cap),
           provincia = COALESCE($7, provincia)
       WHERE id = $8
       RETURNING id, email, nome, cognome, telefono, indirizzo, citta, cap, provincia, google_avatar_url`,
      [nome, cognome, telefono, indirizzo, citta, cap, provincia, req.user.id]
    );

    res.json({
      success: true,
      message: 'Profilo aggiornato con successo',
      data: { user: result.rows[0] }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nell\'aggiornamento del profilo'
    });
  }
};

// ============================================
// CHANGE PASSWORD
// ============================================
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Recupera password attuale
    const result = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    );

    if (!result.rows[0].password_hash) {
      return res.status(400).json({
        success: false,
        message: 'Account creato con Google. Impossibile cambiare password.'
      });
    }

    // Verifica password corrente
    const isValid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Password corrente non valida'
      });
    }

    // Hash nuova password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Aggiorna
    await query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [passwordHash, req.user.id]
    );

    res.json({
      success: true,
      message: 'Password cambiata con successo'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel cambio password'
    });
  }
};

module.exports = {
  register,
  login,
  googleAuth,
  logout,
  refreshToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  updateProfile,
  changePassword
};