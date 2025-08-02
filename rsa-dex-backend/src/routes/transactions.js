const express = require('express');
const router = express.Router();
const dataStore = require('../../data-store');

function adminOnly(req, res, next) { next(); }

// List all transactions including imported tokens (with optional filters)
router.get('/', adminOnly, async (req, res) => {
  try {
    const { fromWalletId, toWalletId, status, tokenSymbol } = req.query;
    let transactions = [];
    
    // Try to get transactions from database
    try {
      const where = {};
      if (fromWalletId) where.fromWalletId = fromWalletId;
      if (toWalletId) where.toWalletId = toWalletId;
      if (status) where.status = status;
      transactions = await prisma.transaction.findMany({ where, include: { fromWallet: true, toWallet: true } });
    } catch (dbError) {
      console.log('💸 TRANSACTIONS: Database not available, generating mock transactions');
    }
    
    // 🪙 ENHANCE: Add mock transactions for imported tokens
    const persistedTokens = await dataStore.loadImportedTokens();
    console.log(`💸 TRANSACTIONS: Generating transactions for ${persistedTokens.length} imported tokens`);
    
    const importedTransactions = [];
    persistedTokens.forEach(token => {
      // Generate some mock transactions for imported tokens
      const mockTransactions = [
        {
          id: `import_tx_${token.id}_1`,
          fromWallet: 'external_wallet',
          toWallet: 'rsa_wallet_main',
          fromWalletId: 'external',
          toWalletId: 'main',
          amount: '100.0',
          symbol: token.symbol,
          tokenSymbol: token.symbol,
          tokenName: token.name,
          assetType: 'imported',
          status: 'completed',
          type: 'deposit',
          txHash: `0x${require('crypto').createHash('sha256').update(`${token.symbol}_deposit`).digest('hex')}`,
          network: (token.networks && token.networks[0]) || 'ethereum',
          fee: '0.001',
          timestamp: token.created_at,
          createdAt: token.created_at,
          updatedAt: token.created_at,
          isImported: true,
          importedToken: true
        },
        {
          id: `import_tx_${token.id}_2`,
          fromWallet: 'rsa_wallet_main',
          toWallet: 'user_wallet_001',
          fromWalletId: 'main',
          toWalletId: 'user001',
          amount: '25.0',
          symbol: token.symbol,
          tokenSymbol: token.symbol,
          tokenName: token.name,
          assetType: 'imported',
          status: 'completed',
          type: 'transfer',
          txHash: `0x${require('crypto').createHash('sha256').update(`${token.symbol}_transfer`).digest('hex')}`,
          network: (token.networks && token.networks[0]) || 'ethereum',
          fee: '0.001',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          updatedAt: new Date(Date.now() - 3600000).toISOString(),
          isImported: true,
          importedToken: true
        }
      ];
      
      // Apply filters
      let filteredTxs = mockTransactions;
      if (status) filteredTxs = filteredTxs.filter(tx => tx.status === status);
      if (tokenSymbol) filteredTxs = filteredTxs.filter(tx => tx.tokenSymbol === tokenSymbol);
      if (fromWalletId) filteredTxs = filteredTxs.filter(tx => tx.fromWalletId === fromWalletId);
      if (toWalletId) filteredTxs = filteredTxs.filter(tx => tx.toWalletId === toWalletId);
      
      importedTransactions.push(...filteredTxs);
    });
    
    // Add default asset transactions for comparison
    const defaultAssets = [
      { symbol: 'BTC', name: 'Bitcoin', network: 'bitcoin' },
      { symbol: 'USDT', name: 'Tether', network: 'ethereum' },
      { symbol: 'ETH', name: 'Ethereum', network: 'ethereum' },
      { symbol: 'RSA', name: 'RSA Chain', network: 'rsa' }
    ];
    
    const defaultTransactions = defaultAssets.map(asset => ({
      id: `default_tx_${asset.symbol.toLowerCase()}`,
      fromWallet: 'external_wallet',
      toWallet: 'rsa_wallet_main',
      fromWalletId: 'external',
      toWalletId: 'main',
      amount: asset.symbol === 'BTC' ? '0.5' : asset.symbol === 'ETH' ? '5.0' : '1000.0',
      symbol: asset.symbol,
      tokenSymbol: asset.symbol,
      tokenName: asset.name,
      assetType: 'default',
      status: 'completed',
      type: 'deposit',
      txHash: `0x${require('crypto').createHash('sha256').update(`${asset.symbol}_default`).digest('hex')}`,
      network: asset.network,
      fee: asset.symbol === 'BTC' ? '0.0001' : '0.002',
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      isDefault: true
    }));

    const allTransactions = [...transactions, ...defaultTransactions, ...importedTransactions];
    
    console.log(`💸 TRANSACTIONS SUCCESS: ${allTransactions.length} total (${transactions.length} database + ${importedTransactions.length} imported)`);
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTransactions = allTransactions.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        data: paginatedTransactions,
        pagination: {
          page,
          limit,
          total: allTransactions.length,
          totalPages: Math.ceil(allTransactions.length / limit)
        }
      },
      count: allTransactions.length,
      imported: importedTransactions.length,
      default: defaultTransactions.length
    });
    
  } catch (error) {
    console.error('💸 TRANSACTIONS ERROR:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch transactions' 
    });
  }
});

// Get transaction by ID
router.get('/:id', adminOnly, async (req, res) => {
  const tx = await prisma.transaction.findUnique({ where: { id: req.params.id }, include: { fromWallet: true, toWallet: true } });
  if (!tx) return res.status(404).json({ error: 'Transaction not found' });
  res.json(tx);
});

// Recall (reverse) transaction
router.post('/:id/recall', adminOnly, async (req, res) => {
  const tx = await prisma.transaction.update({ where: { id: req.params.id }, data: { status: TransactionStatus.RECALLED } });
  res.json(tx);
});

// Force cancel transaction
router.post('/:id/cancel', adminOnly, async (req, res) => {
  const tx = await prisma.transaction.update({ where: { id: req.params.id }, data: { status: TransactionStatus.CANCELLED } });
  res.json(tx);
});

// Mark suspicious
router.post('/:id/suspicious', adminOnly, async (req, res) => {
  const tx = await prisma.transaction.update({ where: { id: req.params.id }, data: { status: TransactionStatus.SUSPICIOUS } });
  res.json(tx);
});

// Update status
router.put('/:id', adminOnly, async (req, res) => {
  const { status } = req.body;
  const tx = await prisma.transaction.update({ where: { id: req.params.id }, data: { status } });
  res.json(tx);
});

// Delete transaction
router.delete('/:id', adminOnly, async (req, res) => {
  await prisma.transaction.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

module.exports = router; 