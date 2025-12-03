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
  optionalAuth, // Permette sia guest che utenti autenticati
  [
    body('categoria').isIn(['incisioni', 'torte', 'eventi', 'altro']).withMessage('Categoria non valida'),
    body('email_contatto').isEmail().normalizeEmail().withMessage('Email non valida'),
    body('nome_contatto').notEmpty().trim().withMessage('Nome obbligatorio'),
    body('descrizione').notEmpty().withMessage('Descrizione obbligatoria'),
    body('telefono_contatto').optional().isMobilePhone('it-IT'),
    body('data_evento').optional().isISO8601()
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