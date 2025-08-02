const express = require('express');
const router = express.Router();

function adminOnly(req, res, next) { next(); }

// List all logs
router.get('/', adminOnly, async (req, res) => {
  try {
    const mockLogs = [
      {
        id: '1',
        type: 'INFO',
        message: 'System started',
        timestamp: new Date().toISOString()
      }
    ];
    res.json({ success: true, data: mockLogs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router; 