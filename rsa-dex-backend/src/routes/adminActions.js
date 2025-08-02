const express = require('express');
const router = express.Router();

function adminOnly(req, res, next) { next(); }

// List all admin actions
router.get('/', adminOnly, async (req, res) => {
  try {
    const mockActions = [
      {
        id: '1',
        action: 'USER_SUSPENDED',
        adminId: 'admin',
        timestamp: new Date().toISOString()
      }
    ];
    res.json({ success: true, data: mockActions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router; 