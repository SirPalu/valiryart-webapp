const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolio.controller');
const { verifyToken, requireAdmin } = require('../middlewares/auth.middleware');
const { uploadSingle } = require('../middlewares/upload.middleware');

router.get('/', portfolioController.getPortfolio);
router.get('/stats', verifyToken, requireAdmin, portfolioController.getPortfolioStats);
router.get('/:id', portfolioController.getPortfolioById);
router.post('/', verifyToken, requireAdmin, uploadSingle('image'), portfolioController.createPortfolioItem);
router.put('/:id', verifyToken, requireAdmin, uploadSingle('image'), portfolioController.updatePortfolioItem);
router.delete('/:id', verifyToken, requireAdmin, portfolioController.deletePortfolioItem);

module.exports = router;