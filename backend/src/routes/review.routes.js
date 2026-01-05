// backend/src/routes/review.routes.js - ✅ ORDINE CORRETTO

const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { verifyToken, requireAdmin } = require('../middlewares/auth.middleware');
const { uploadSingle } = require('../middlewares/upload.middleware');

// ============================================
// PUBLIC ROUTES - Recensioni approvate
// ============================================
router.get('/public', reviewController.getPublicReviews);

// Get tutte le recensioni (ADMIN - deve essere PRIMA di /my)
router.get('/', verifyToken, requireAdmin, reviewController.getAllReviews);

// Rispondi a recensione (ADMIN)
router.post('/:id/reply', verifyToken, requireAdmin, reviewController.replyToReview);

// Approva/disapprova recensione (ADMIN)
router.put('/:id/approve', verifyToken, requireAdmin, reviewController.approveReview);

// Pubblica/nascondi recensione (ADMIN)
router.put('/:id/publish', verifyToken, requireAdmin, reviewController.togglePublish);

// ============================================
// USER ROUTES - Autenticazione richiesta
// ============================================

// Get mie recensioni (USER)
router.get('/my', verifyToken, reviewController.getMyReviews);

// Check se può recensire (USER)
router.get('/can-review/:requestId', verifyToken, reviewController.canReview);

// Create review (USER - con upload foto opzionale)
router.post('/', verifyToken, uploadSingle('foto'), reviewController.createReview);

// Update propria recensione (USER)
router.put('/:id', verifyToken, reviewController.updateReview);

// Delete propria recensione (USER)
router.delete('/:id', verifyToken, reviewController.deleteReview);

module.exports = router;