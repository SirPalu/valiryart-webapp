const express = require('express');
const router = express.Router();
const contentController = require('../controllers/content.controller');
const { verifyToken, requireAdmin } = require('../middlewares/auth.middleware');

router.get('/pages', contentController.getAllPages);
router.get('/pages/:slug', contentController.getPageBySlug);
router.post('/pages', verifyToken, requireAdmin, contentController.createPage);
router.put('/pages/:slug', verifyToken, requireAdmin, contentController.updatePage);
router.delete('/pages/:slug', verifyToken, requireAdmin, contentController.deletePage);

router.get('/settings/public', contentController.getPublicSettings);
router.get('/settings', verifyToken, requireAdmin, contentController.getAllSettings);
router.put('/settings/:chiave', verifyToken, requireAdmin, contentController.updateSetting);

module.exports = router;