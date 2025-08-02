const express = require('express');
const router = express.Router();

function adminOnly(req, res, next) { next(); }

// List all orders (with optional filters)
router.get('/', adminOnly, async (req, res) => {
  try {
    // Mock orders data for now
    const mockOrders = [
      {
        id: '1',
        pair: 'RSA/USDT',
        side: 'buy',
        type: 'limit',
        amount: 1000,
        price: 0.85,
        status: 'open',
        createdAt: new Date().toISOString(),
        userId: 'user1',
        filledAmount: 0,
        remainingAmount: 1000
      }
    ];
    res.json({ success: true, data: mockOrders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get order by ID
router.get('/:id', adminOnly, async (req, res) => {
  try {
    res.json({ success: true, data: { id: req.params.id, status: 'open' } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create order (manual injection)
router.post('/', adminOnly, async (req, res) => {
  try {
    const newOrder = { id: Date.now().toString(), ...req.body };
    res.status(201).json({ success: true, data: newOrder });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update order (status/type/amount/price)
router.put('/:id', adminOnly, async (req, res) => {
  try {
    const updatedOrder = { id: req.params.id, ...req.body };
    res.json({ success: true, data: updatedOrder });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Delete order
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router; 