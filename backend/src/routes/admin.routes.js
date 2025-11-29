const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken, requireAdmin } = require('../middlewares/auth.middleware');

router.get('/dashboard', verifyToken, requireAdmin, adminController.getDashboardStats);
router.get('/activity', verifyToken, requireAdmin, adminController.getRecentActivity);
router.get('/revenue-chart', verifyToken, requireAdmin, adminController.getRevenueChart);
router.get('/top-customers', verifyToken, requireAdmin, adminController.getTopCustomers);
router.get('/export-requests', verifyToken, requireAdmin, adminController.exportRequests);
router.get('/users', verifyToken, requireAdmin, adminController.getAllUsers);
router.put('/users/:userId/status', verifyToken, requireAdmin, adminController.updateUserStatus);

module.exports = router;