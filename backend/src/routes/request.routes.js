// backend/src/routes/request.routes.js

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const requestController = require('../controllers/request.controller');
const { verifyToken, optionalAuth, requireAdmin } = require('../middlewares/auth.middleware');
const { uploadMultiple } = require('../middlewares/upload.middleware');

// ============================================
// CREATE REQUEST (guest o autenticato)
// ============================================
router.post('/',
  optionalAuth,
  uploadMultiple('files', 5), // Upload PRIMA

  express.urlencoded({ extended: true }),
  express.json(),
  [
    // ✅ Validazioni più permissive per gestire campi opzionali
    body('categoria')
      .notEmpty().withMessage('Categoria obbligatoria')
      .isIn(['incisioni', 'torte', 'eventi', 'altro']).withMessage('Categoria non valida'),
    
    body('email_contatto')
      .notEmpty().withMessage('Email obbligatoria')
      .isEmail().withMessage('Email non valida')
      .normalizeEmail(),
    
    body('nome_contatto')
      .notEmpty().withMessage('Nome obbligatorio')
      .trim(),
    
    body('descrizione')
      .notEmpty().withMessage('Descrizione obbligatoria')
      .trim(),
    
    body('telefono_contatto')
      .optional({ nullable: true, checkFalsy: true })
      .isMobilePhone('it-IT').withMessage('Telefono non valido'),
    
    body('data_evento')
      .optional({ nullable: true, checkFalsy: true })
      .isISO8601().withMessage('Data non valida'),
    
    body('citta')
      .optional({ nullable: true, checkFalsy: true })
      .trim(),
    
    body('indirizzo_consegna')
      .optional({ nullable: true, checkFalsy: true })
      .trim(),
    
    // dati_specifici può essere stringa JSON o oggetto
    body('dati_specifici')
      .optional({ nullable: true, checkFalsy: true })
  ],
  requestController.createRequest
);


// ============================================
// GET ALL REQUESTS (admin vede tutte, user solo proprie)
// ============================================
router.get('/',
  verifyToken,
  requestController.getRequests
);

// ============================================
// GET MY REQUESTS (utente loggato)
// ============================================
router.get('/my-requests',
  verifyToken,
  requestController.getMyRequests
);

// ============================================
// GET SINGLE REQUEST
// ============================================
router.get('/:id',
  verifyToken,
  requestController.getRequestById
);

// ============================================
// UPDATE REQUEST STATUS (solo admin)
// ============================================
router.put('/:id/status',
  verifyToken,
  requireAdmin,
  [
    body('stato').optional().isIn([
      'nuova', 'in_valutazione', 'preventivo_inviato', 
      'accettata', 'in_lavorazione', 'completata', 
      'rifiutata', 'annullata'
    ]),
    body('preventivo_importo').optional().isDecimal(),
    body('data_consegna_prevista').optional().isISO8601()
  ],
  requestController.updateRequestStatus
);

// ============================================
// UPLOAD ATTACHMENT
// ============================================
router.post('/:id/attachments',
  verifyToken,
  uploadMultiple('files', 5),
  requestController.uploadAttachment
);

// ============================================
// DELETE REQUEST (solo admin)
// ============================================
router.delete('/:id',
  verifyToken,
  requireAdmin,
  requestController.deleteRequest
);

module.exports = router;