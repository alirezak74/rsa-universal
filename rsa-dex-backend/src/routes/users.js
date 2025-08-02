const express = require('express');
const router = express.Router();

// Placeholder for admin-only middleware
function adminOnly(req, res, next) { next(); }

// List all users
router.get('/', adminOnly, async (req, res) => {
  try {
    const mockUsers = [
      {
        id: '1',
        username: 'admin',
        email: 'admin@rsachain.com',
        status: 'active',
        role: 'admin',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        totalOrders: 0,
        totalTrades: 0
      }
    ];
    res.json({ success: true, data: mockUsers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user by ID
router.get('/:id', adminOnly, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id }, include: { wallets: true, logs: true, actions: true } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// Create user
router.post('/', adminOnly, async (req, res) => {
  const { username, email, password, role } = req.body;
  const user = await prisma.user.create({ data: { username, email, password, role } });
  res.status(201).json(user);
});

// Update user
router.put('/:id', adminOnly, async (req, res) => {
  const { username, email, password, role } = req.body;
  const user = await prisma.user.update({ where: { id: req.params.id }, data: { username, email, password, role } });
  res.json(user);
});

// Delete user
router.delete('/:id', adminOnly, async (req, res) => {
  await prisma.user.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

module.exports = router; 