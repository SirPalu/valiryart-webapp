// backend/src/routes/review.routes.js

const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { verifyToken, requireAdmin } = require('../middlewares/auth.middleware');
const { uploadSingle } = require('../middlewares/upload.middleware');

// ============================================
// PUBLIC ROUTES - Recensioni approvate
// ============================================
router.get('/public', reviewController.getPublicReviews);

// ============================================
// USER ROUTES - Autenticazione richiesta
// ============================================
router.use(verifyToken);

// Get mie recensioni
router.get('/my', reviewController.getMyReviews);

// Check se può recensire
router.get('/can-review/:requestId', reviewController.canReview);

// Create review (con upload foto opzionale)
router.post('/', uploadSingle('foto'), reviewController.createReview);

// Update propria recensione
router.put('/:id', reviewController.updateReview);

// Delete propria recensione
router.delete('/:id', reviewController.deleteReview);

// ============================================
// ADMIN ROUTES - Solo amministratori
// ============================================
router.use(requireAdmin);

// Get tutte le recensioni (con filtri)
router.get('/', reviewController.getAllReviews);

// Rispondi a recensione
router.post('/:id/reply', reviewController.replyToReview);

// Approva/disapprova recensione
router.put('/:id/approve', reviewController.approveReview);

// Pubblica/nascondi recensione
router.put('/:id/publish', reviewController.togglePublish);

module.exports = router;