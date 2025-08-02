const express = require('express');
const router = express.Router();

// Placeholder for admin-only middleware
function adminOnly(req, res, next) { next(); }

// List all wallets
router.get('/', adminOnly, async (req, res) => {
  const wallets = await prisma.wallet.findMany({ include: { user: true, transactions: true } });
  res.json(wallets);
});

// Get wallet by ID
router.get('/:id', adminOnly, async (req, res) => {
  const wallet = await prisma.wallet.findUnique({ where: { id: req.params.id }, include: { user: true, transactions: true } });
  if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
  res.json(wallet);
});

// Create wallet
router.post('/', adminOnly, async (req, res) => {
  const { address, publicKey, secretKey, status, userId } = req.body;
  const wallet = await prisma.wallet.create({ data: { address, publicKey, secretKey, status, userId } });
  res.status(201).json(wallet);
});

// Update wallet (freeze, blacklist, etc.)
router.put('/:id', adminOnly, async (req, res) => {
  const { status } = req.body;
  const wallet = await prisma.wallet.update({ where: { id: req.params.id }, data: { status } });
  res.json(wallet);
});

// Delete wallet
router.delete('/:id', adminOnly, async (req, res) => {
  await prisma.wallet.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

module.exports = router; 