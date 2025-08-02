const express = require('express');
const router = express.Router();

function adminOnly(req, res, next) { next(); }

// List all tokens
router.get('/', adminOnly, async (req, res) => {
  try {
    const mockTokens = [
      {
        id: '1',
        symbol: 'RSA',
        name: 'RSA Token',
        isWhitelisted: true,
        contract: { address: '0x123...' }
      }
    ];
    res.json({ success: true, data: mockTokens });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get token by ID
router.get('/:id', adminOnly, async (req, res) => {
  try {
    res.json({ success: true, data: { id: req.params.id, symbol: 'RSA' } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create token
router.post('/', adminOnly, async (req, res) => {
  try {
    const newToken = { id: Date.now().toString(), ...req.body };
    res.status(201).json({ success: true, data: newToken });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update token (whitelist, name, etc.)
router.put('/:id', adminOnly, async (req, res) => {
  try {
    const updatedToken = { id: req.params.id, ...req.body };
    res.json({ success: true, data: updatedToken });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete token
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    res.json({ success: true, message: 'Token deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router; 