const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// ============================================
// VALIDAZIONI
// ============================================

const registerValidation = [
  body('email').isEmail().withMessage('Email non valida'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password minimo 8 caratteri')
    .matches(/[A-Z]/).withMessage('Password deve contenere almeno una maiuscola')
    .matches(/[0-9]/).withMessage('Password deve contenere almeno un numero'),
  body('nome').notEmpty().withMessage('Nome obbligatorio'),
  body('cognome').notEmpty().withMessage('Cognome obbligatorio')
];

const loginValidation = [
  body('email').isEmail().withMessage('Email non valida'),
  body('password').notEmpty().withMessage('Password obbligatoria')
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Password corrente obbligatoria'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('Nuova password minimo 8 caratteri')
    .matches(/[A-Z]/).withMessage('Password deve contenere almeno una maiuscola')
    .matches(/[0-9]/).withMessage('Password deve contenere almeno un numero')
];

const updateProfileValidation = [
  body('nome').optional().notEmpty().withMessage('Nome non può essere vuoto'),
  body('cognome').optional().notEmpty().withMessage('Cognome non può essere vuoto'),
  body('telefono').optional().matches(/^[0-9+\s()-]+$/).withMessage('Numero di telefono non valido')
];

// ============================================
// ROUTES PUBBLICHE
// ============================================

// Registrazione con reCAPTCHA
router.post('/register', registerValidation, authController.register);

// Login
router.post('/login', loginValidation, authController.login);

// Google OAuth
router.post('/google', authController.googleAuth);

// Forgot/Reset Password
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Email verification
router.get('/verify-email/:token', authController.verifyEmail);

// ============================================
// ROUTES PROTETTE (richiedono autenticazione)
// ============================================

// Logout
router.post('/logout', verifyToken, authController.logout);

// Get current user
router.get('/me', verifyToken, authController.getCurrentUser);

// Update profile
router.patch('/profile', verifyToken, updateProfileValidation, authController.updateProfile);

// Change password
router.patch('/password', verifyToken, changePasswordValidation, authController.changePassword);

// ✅ DELETE ACCOUNT
router.delete('/account', verifyToken, authController.deleteAccount);

// Refresh token
router.post('/refresh', authController.refreshToken);

module.exports = router;