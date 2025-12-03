const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// ============================================
// REGISTRAZIONE
// ============================================
router.post('/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Email non valida'),
    body('password').isLength({ min: 8 }).withMessage('Password minimo 8 caratteri'),
    body('nome').notEmpty().trim().withMessage('Nome obbligatorio'),
    body('cognome').notEmpty().trim().withMessage('Cognome obbligatorio'),
    body('telefono').optional().isMobilePhone('it-IT').withMessage('Numero telefono non valido')
  ],
  authController.register
);

// ============================================
// LOGIN
// ============================================
router.post('/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Email non valida'),
    body('password').notEmpty().withMessage('Password obbligatoria')
  ],
  authController.login
);

// ============================================
// GOOGLE OAUTH
// ============================================
router.post('/google',
  [
    body('credential').notEmpty().withMessage('Google credential mancante')
  ],
  authController.googleAuth
);

// ============================================
// LOGOUT
// ============================================
router.post('/logout', verifyToken, authController.logout);

// ============================================
// REFRESH TOKEN
// ============================================
router.post('/refresh',
  [
    body('refreshToken').notEmpty().withMessage('Refresh token mancante')
  ],
  authController.refreshToken
);

// ============================================
// VERIFICA EMAIL
// ============================================
router.get('/verify-email/:token', authController.verifyEmail);

// ============================================
// RESET PASSWORD
// ============================================
router.post('/forgot-password',
  [
    body('email').isEmail().normalizeEmail().withMessage('Email non valida')
  ],
  authController.forgotPassword
);

router.post('/reset-password',
  [
    body('token').notEmpty().withMessage('Token mancante'),
    body('password').isLength({ min: 8 }).withMessage('Password minimo 8 caratteri')
  ],
  authController.resetPassword
);

// ============================================
// PROFILO UTENTE CORRENTE
// ============================================
router.get('/me', verifyToken, authController.getCurrentUser);

// ============================================
// AGGIORNA PROFILO
// ============================================
router.put('/me', verifyToken,
  [
    body('nome').optional().trim().notEmpty().withMessage('Nome non valido'),
    body('cognome').optional().trim().notEmpty().withMessage('Cognome non valido'),
    body('telefono').optional().isMobilePhone('it-IT').withMessage('Numero telefono non valido')
  ],
  authController.updateProfile
);

// ============================================
// CAMBIA PASSWORD
// ============================================
router.put('/change-password', verifyToken,
  [
    body('currentPassword').notEmpty().withMessage('Password corrente obbligatoria'),
    body('newPassword').isLength({ min: 8 }).withMessage('Nuova password minimo 8 caratteri')
  ],
  authController.changePassword
);

module.exports = router;