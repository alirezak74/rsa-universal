const express = require('express');
const router = express.Router();

function adminOnly(req, res, next) { next(); }

// In-memory settings (replace with DB or .env as needed)
let settings = {
  tradingLimits: {
    minOrderSize: 1,
    maxOrderSize: 10000,
    slippage: 0.01,
  },
  gas: {
    fee: 0.001,
    reimbursement: false,
  },
  apiKeys: ["admin-key-123"],
  ipWhitelist: ["127.0.0.1"],
  maintenanceMode: false,
};

// Get all settings
router.get('/', adminOnly, (req, res) => {
  res.json(settings);
});

// Update settings
router.put('/', adminOnly, (req, res) => {
  settings = { ...settings, ...req.body };
  res.json(settings);
});

module.exports = router; 