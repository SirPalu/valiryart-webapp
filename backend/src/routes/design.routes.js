const express = require('express');
const router = express.Router();
const designController = require('../controllers/design.controller');
const { verifyToken, requireAdmin } = require('../middlewares/auth.middleware');
const { uploadSingle } = require('../middlewares/upload.middleware');

router.get('/', designController.getDesigns);
router.get('/categories', designController.getDesignCategories);
router.get('/:id', designController.getDesignById);
router.post('/:id/use', designController.incrementDesignUsage);
router.post('/', verifyToken, requireAdmin, uploadSingle('image'), designController.createDesign);
router.put('/:id', verifyToken, requireAdmin, uploadSingle('image'), designController.updateDesign);
router.delete('/:id', verifyToken, requireAdmin, designController.deleteDesign);

module.exports = router;