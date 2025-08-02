const express = require('express');
const router = express.Router();

// Mock emergency action endpoint
router.post('/action', (req, res) => {
  const { actionId } = req.body;
  // Log the action for audit (optional)
  console.log(`[EMERGENCY ACTION] Received: ${actionId}`);
  // Respond with success
  res.json({ success: true, message: `Action '${actionId}' executed (mock).` });
});

module.exports = router; 