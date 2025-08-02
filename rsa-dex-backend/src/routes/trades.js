const express = require('express');
const router = express.Router();

function adminOnly(req, res, next) { next(); }

// List all trades
router.get('/', adminOnly, async (req, res) => {
  try {
    const mockTrades = [
      {
        id: '1',
        pair: 'RSA/USDT',
        price: 0.85,
        amount: 500,
        side: 'buy',
        timestamp: new Date().toISOString()
      }
    ];
    res.json({ success: true, data: mockTrades });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get trade by ID
router.get('/:id', adminOnly, async (req, res) => {
  try {
    res.json({ success: true, data: { id: req.params.id, status: 'completed' } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router; 