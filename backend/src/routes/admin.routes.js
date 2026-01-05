const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const requestController = require('../controllers/request.controller');
const messageController = require('../controllers/message.controller');
const reviewController = require('../controllers/review.controller');
const { verifyToken, requireAdmin } = require('../middlewares/auth.middleware');

// ============================================
// TUTTE LE ROUTE ADMIN RICHIEDONO AUTENTICAZIONE
// ============================================
router.use(verifyToken);
router.use(requireAdmin);

// ============================================
// DEBUG TEST (RIMUOVI DOPO AVER VERIFICATO)
// ============================================
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Admin routes FUNZIONANO!',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// DASHBOARD & STATS
// ============================================
router.get('/dashboard', adminController.getDashboardStats);
router.get('/activity', adminController.getRecentActivity);
router.get('/revenue-chart', adminController.getRevenueChart);
router.get('/top-customers', adminController.getTopCustomers);
router.get('/export-requests', adminController.exportRequests);

// ============================================
// USERS
// ============================================
router.get('/users', adminController.getAllUsers);
router.put('/users/:userId/status', adminController.updateUserStatus);

// ============================================
// REQUESTS - ORDINE IMPORTANTE!
// ============================================

// Lista richieste (deve essere PRIMA di /:id)
router.get('/requests', requestController.getRequests);

// Singola richiesta
router.get('/requests/:id', requestController.getRequestById);

// Update stato
router.put('/requests/:id/status', requestController.updateRequestStatus);

// Delete
router.delete('/requests/:id', requestController.deleteRequest);

// ============================================
// ✨ FLUSSO STATI AVANZATO ✨
// ============================================

// Invia preventivo
router.post('/requests/:id/send-preventivo', adminController.sendPreventivo);

// Conferma pagamento
router.post('/requests/:id/conferma-pagamento', adminController.confermaPagamento);

// Avvia realizzazione
router.post('/requests/:id/avvia-realizzazione', adminController.avviaRealizzazione);

// Completa richiesta
router.post('/requests/:id/completa', adminController.completaRichiesta);

// ============================================
// MESSAGES
// ============================================

// Get messages di una richiesta
router.get('/requests/:requestId/messages', messageController.getMessages);

// Send message
router.post('/requests/:requestId/messages', messageController.sendMessage);

// ============================================
// ✨ REVIEWS ROUTES ✨
// ============================================

// Get tutte le recensioni
router.get('/reviews', reviewController.getAllReviews);

// Rispondi a recensione
router.post('/reviews/:id/reply', reviewController.replyToReview);

// Approva/disapprova
router.put('/reviews/:id/approve', reviewController.approveReview);

// Pubblica/nascondi
router.put('/reviews/:id/publish', reviewController.togglePublish);

console.log('✅ Admin routes loaded successfully');

module.exports = router;