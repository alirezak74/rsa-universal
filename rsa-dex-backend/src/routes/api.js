const express = require('express');
const router = express.Router();

// --- MARKETS ---
router.get('/markets', async (req, res) => {
  try {
    // Simulate real-time price data with some variation
    const currentTime = Date.now();
    const baseBTCPrice = 45000; // Base BTC price
    const baseRSAPrice = 0.85; // Base RSA price
    const baseETHPrice = 2800; // Base ETH price
    
    // Add some realistic price variation based on time
    const timeVariation = Math.sin(currentTime / 1000000) * 0.1; // Small variation
    const btcPrice = baseBTCPrice * (1 + timeVariation);
    const rsaPrice = baseRSAPrice * (1 + timeVariation * 0.5);
    const ethPrice = baseETHPrice * (1 + timeVariation * 0.8);
    
    // Calculate cross-pair prices
    const rsaBTCPrice = rsaPrice / btcPrice;
    const ethBTCPrice = ethPrice / btcPrice;
    const rsaETHPrice = rsaPrice / ethPrice;
    
    res.json([
      { 
        id: 1, 
        pair: 'RSA/USDT', 
        baseAsset: 'RSA', 
        quoteAsset: 'USDT', 
        status: 'active', 
        price: parseFloat(rsaPrice.toFixed(6)),
        change24h: 2.5,
        volume24h: 1250000,
        lastUpdated: new Date().toISOString()
      },
      { 
        id: 2, 
        pair: 'BTC/USDT', 
        baseAsset: 'BTC', 
        quoteAsset: 'USDT', 
        status: 'active', 
        price: parseFloat(btcPrice.toFixed(2)),
        change24h: -1.2,
        volume24h: 25000000,
        lastUpdated: new Date().toISOString()
      },
      { 
        id: 3, 
        pair: 'RSA/BTC', 
        baseAsset: 'RSA', 
        quoteAsset: 'BTC', 
        status: 'active', 
        price: parseFloat(rsaBTCPrice.toFixed(8)),
        change24h: 3.8,
        volume24h: 50000,
        lastUpdated: new Date().toISOString()
      },
      { 
        id: 4, 
        pair: 'ETH/USDT', 
        baseAsset: 'ETH', 
        quoteAsset: 'USDT', 
        status: 'active', 
        price: parseFloat(ethPrice.toFixed(2)),
        change24h: 1.5,
        volume24h: 15000000,
        lastUpdated: new Date().toISOString()
      },
      { 
        id: 5, 
        pair: 'ETH/BTC', 
        baseAsset: 'ETH', 
        quoteAsset: 'BTC', 
        status: 'active', 
        price: parseFloat(ethBTCPrice.toFixed(6)),
        change24h: 2.1,
        volume24h: 800000,
        lastUpdated: new Date().toISOString()
      },
      { 
        id: 6, 
        pair: 'RSA/ETH', 
        baseAsset: 'RSA', 
        quoteAsset: 'ETH', 
        status: 'active', 
        price: parseFloat(rsaETHPrice.toFixed(6)),
        change24h: 4.2,
        volume24h: 75000,
        lastUpdated: new Date().toISOString()
      }
    ]);
  } catch (error) {
    console.error('Markets API error:', error);
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
});

router.get('/markets/:baseAsset/:quoteAsset/trades', async (req, res) => {
  const { baseAsset, quoteAsset } = req.params;
  // TODO: Replace with real DB logic
  res.json({
    success: true,
    data: [
      { 
        id: 1, 
        pair: `${baseAsset}/${quoteAsset}`, 
        price: 0.85, 
        amount: 100, 
        side: 'buy', 
        timestamp: Date.now(),
        createdAt: new Date(Date.now()).toISOString(),
        total: 85
      },
      { 
        id: 2, 
        pair: `${baseAsset}/${quoteAsset}`, 
        price: 0.84, 
        amount: 50, 
        side: 'sell', 
        timestamp: Date.now() - 60000,
        createdAt: new Date(Date.now() - 60000).toISOString(),
        total: 42
      }
    ]
  });
});

// --- USERS ---
router.get('/users', async (req, res) => {
  // TODO: Replace with real DB logic
  res.json([
    { id: 1, username: 'admin', role: 'admin', status: 'active' },
    { id: 2, username: 'user1', role: 'user', status: 'active' }
  ]);
});

// --- WALLETS ---
router.get('/wallets', async (req, res) => {
  // TODO: Replace with real DB logic
  res.json([
    { id: 1, address: '0x123...', status: 'active', userId: 1 },
    { id: 2, address: '0x456...', status: 'frozen', userId: 2 }
  ]);
});

// --- TRANSACTIONS ---
router.get('/transactions', async (req, res) => {
  const { page = 1, limit = 20, status, asset } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  
  // TODO: Replace with real DB logic
  const mockTransactions = [
    { 
      id: '1', 
      from: '0x1234567890abcdef', 
      to: '0xabcdef1234567890', 
      amount: 100, 
      asset: 'RSA',
      status: 'completed',
      type: 'transfer',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      gasUsed: 21000,
      gasPrice: 20
    },
    { 
      id: '2', 
      from: '0x4567890abcdef123', 
      to: '0x7890abcdef123456', 
      amount: 50, 
      asset: 'RSA',
      status: 'pending',
      type: 'transfer',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      gasUsed: 21000,
      gasPrice: 20
    },
    { 
      id: '3', 
      from: '0xabcdef1234567890', 
      to: '0x1234567890abcdef', 
      amount: 1000, 
      asset: 'USDT',
      status: 'pending',
      type: 'transfer',
      createdAt: new Date(Date.now() - 900000).toISOString(),
      gasUsed: 21000,
      gasPrice: 20
    },
    { 
      id: '4', 
      from: '0x7890abcdef123456', 
      to: '0x4567890abcdef123', 
      amount: 0.5, 
      asset: 'BTC',
      status: 'pending',
      type: 'transfer',
      createdAt: new Date(Date.now() - 600000).toISOString(),
      gasUsed: 21000,
      gasPrice: 20
    },
    { 
      id: '5', 
      from: '0x1234567890abcdef', 
      to: '0xabcdef1234567890', 
      amount: 200, 
      asset: 'RSA',
      status: 'frozen',
      type: 'transfer',
      createdAt: new Date(Date.now() - 300000).toISOString(),
      gasUsed: 21000,
      gasPrice: 20
    },
    { 
      id: '6', 
      from: '0x4567890abcdef123', 
      to: '0x7890abcdef123456', 
      amount: 500, 
      asset: 'USDT',
      status: 'rejected',
      type: 'transfer',
      createdAt: new Date(Date.now() - 120000).toISOString(),
      gasUsed: 21000,
      gasPrice: 20
    }
  ];
  
  // Apply filters
  let filteredTransactions = mockTransactions;
  if (status) {
    filteredTransactions = filteredTransactions.filter(tx => tx.status === status);
  }
  if (asset) {
    filteredTransactions = filteredTransactions.filter(tx => tx.asset === asset);
  }
  
  // Apply pagination
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);
  
  // Return paginated response
  res.json({
    success: true,
    data: {
      data: paginatedTransactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredTransactions.length,
        totalPages: Math.ceil(filteredTransactions.length / limitNum)
      }
    }
  });
});

// --- ADMIN ACTIONS / LOGS ---
router.get('/admin-actions', async (req, res) => {
  // TODO: Replace with real DB logic
  res.json([
    { id: 1, action: 'login', details: 'Admin logged in', timestamp: Date.now() },
    { id: 2, action: 'freeze_wallet', details: 'Wallet 0x456... frozen', timestamp: Date.now() }
  ]);
});

// --- ORDERS ---
router.get('/orders', async (req, res) => {
  const { page = 1, limit = 20, status, side, type } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  
  // TODO: Replace with real DB logic
  const mockOrders = [
    { 
      id: '1', 
      userId: 'admin',
      pair: 'RSA/USDT', 
      side: 'buy',
      type: 'limit', 
      amount: 100,
      price: 0.85,
      status: 'pending',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      filledAmount: 0,
      remainingAmount: 100
    },
    { 
      id: '2', 
      userId: 'user1',
      pair: 'BTC/USDT', 
      side: 'sell',
      type: 'market', 
      amount: 0.5,
      price: 45000,
      status: 'filled',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      filledAmount: 0.5,
      remainingAmount: 0
    },
    { 
      id: '3', 
      userId: 'user2',
      pair: 'RSA/BTC', 
      side: 'buy',
      type: 'limit', 
      amount: 500,
      price: 0.000019,
      status: 'partially_filled',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      filledAmount: 300,
      remainingAmount: 200
    }
  ];
  
  // Apply filters
  let filteredOrders = mockOrders;
  if (status) {
    filteredOrders = filteredOrders.filter(order => order.status === status);
  }
  if (side) {
    filteredOrders = filteredOrders.filter(order => order.side === side);
  }
  if (type) {
    filteredOrders = filteredOrders.filter(order => order.type === type);
  }
  
  // Apply pagination
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
  
  // Return paginated response
  res.json({
    success: true,
    data: {
      data: paginatedOrders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredOrders.length,
        totalPages: Math.ceil(filteredOrders.length / limitNum)
      }
    }
  });
});

// Update order
router.put('/orders/:id', async (req, res) => {
  const { id } = req.params;
  const { type, status, amount, price } = req.body;
  
  try {
    // In a real implementation, this would update the database
    // For now, we'll return success and let the frontend handle the state
    res.json({
      success: true,
      data: {
        id,
        type,
        status,
        amount,
        price,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Delete order
router.delete('/orders/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // In a real implementation, this would delete from the database
    res.json({
      success: true,
      message: `Order ${id} deleted successfully`
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// --- TRADES ---
router.get('/trades', async (req, res) => {
  // TODO: Replace with real DB logic
  res.json([
    { id: 1, orderId: 1, user: 'admin', pair: 'ETH/USDT', amount: 10 },
    { id: 2, orderId: 2, user: 'user1', pair: 'BTC/USDT', amount: 0.5 }
  ]);
});

// --- CONTRACTS ---
router.get('/contracts', async (req, res) => {
  // TODO: Replace with real DB logic
  res.json([
    { id: 1, name: 'Main DEX', status: 'active' },
    { id: 2, name: 'TokenA', status: 'paused' }
  ]);
});

// --- SETTINGS (stub) ---
router.get('/settings', async (req, res) => {
  res.json({
    tradingLimits: { minOrder: 1, maxOrder: 10000 },
    gasFee: 0.01,
    apiWhitelist: ['127.0.0.1'],
    maintenanceMode: false
  });
});

// --- DB TOOLS (stub) ---
router.get('/dbtools', async (req, res) => {
  res.json({ status: 'ok', message: 'DB tools endpoint stub' });
});

module.exports = router; 