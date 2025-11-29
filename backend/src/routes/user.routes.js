const express = require('express');
const router = express.Router();

// TODO: Implementare routes
router.get('/', (req, res) => {
  res.json({ message: 'Route non ancora implementata' });
});

module.exports = router;