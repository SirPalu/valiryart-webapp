const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const messageController = require('../controllers/message.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// ============================================
// SEND MESSAGE
// ============================================
router.post('/:requestId',
  verifyToken,
  [
    body('messaggio').notEmpty().trim().withMessage('Messaggio obbligatorio')
  ],
  messageController.sendMessage
);

// ============================================
// GET MESSAGES FOR REQUEST
// ============================================
router.get('/:requestId',
  verifyToken,
  messageController.getMessages
);

// ============================================
// MARK MESSAGE AS READ
// ============================================
router.put('/:messageId/read',
  verifyToken,
  messageController.markAsRead
);

// ============================================
// GET UNREAD COUNT
// ============================================
router.get('/unread/count',
  verifyToken,
  messageController.getUnreadCount
);

module.exports = router;