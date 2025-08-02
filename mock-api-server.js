
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Health endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', service: 'api', timestamp: new Date().toISOString() });
});

// Market data endpoints
app.get('/api/markets', (req, res) => {
  res.json({
    success: true,
    data: {
      markets: [
        { symbol: 'rBTC/RSA', price: 50000, volume: 1000000, change24h: 2.5 },
        { symbol: 'rETH/RSA', price: 3000, volume: 500000, change24h: 1.8 },
        { symbol: 'rBNB/RSA', price: 300, volume: 250000, change24h: -0.5 }
      ]
    }
  });
});

app.get('/api/trading-pairs', (req, res) => {
  res.json({
    success: true,
    data: {
      pairs: [
        { baseAsset: 'rBTC', quoteAsset: 'RSA', symbol: 'rBTC/RSA', enabled: true },
        { baseAsset: 'rETH', quoteAsset: 'RSA', symbol: 'rETH/RSA', enabled: true },
        { baseAsset: 'rBNB', quoteAsset: 'RSA', symbol: 'rBNB/RSA', enabled: true }
      ]
    }
  });
});

app.get('/api/assets', (req, res) => {
  res.json({
    success: true,
    data: {
      assets: [
        { symbol: 'RSA', name: 'RSA Token', network: 'RSA Chain', balance: 1000 },
        { symbol: 'rBTC', name: 'Wrapped Bitcoin', network: 'Bitcoin', balance: 0.5 },
        { symbol: 'rETH', name: 'Wrapped Ethereum', network: 'Ethereum', balance: 2.5 }
      ]
    }
  });
});

// User endpoints
app.get('/api/user/profile', (req, res) => {
  res.json({
    success: true,
    data: {
      id: 'user_123',
      email: 'user@rsadex.com',
      username: 'testuser',
      verified: true
    }
  });
});

app.get('/api/user/wallet', (req, res) => {
  res.json({
    success: true,
    data: {
      address: 'RSA1234567890abcdef',
      balances: [
        { asset: 'RSA', balance: 1000, available: 950 },
        { asset: 'rBTC', balance: 0.5, available: 0.5 },
        { asset: 'rETH', balance: 2.5, available: 2.0 }
      ]
    }
  });
});

app.get('/api/user/balance', (req, res) => {
  res.json({
    success: true,
    data: {
      total_usd: 55000,
      balances: [
        { asset: 'RSA', balance: 1000, usd_value: 5000 },
        { asset: 'rBTC', balance: 0.5, usd_value: 25000 },
        { asset: 'rETH', balance: 2.5, usd_value: 7500 }
      ]
    }
  });
});

// Trading endpoints
app.get('/api/orders', (req, res) => {
  res.json({
    success: true,
    data: {
      orders: [
        { id: 'order_1', pair: 'rBTC/RSA', type: 'limit', side: 'buy', amount: 0.1, price: 50000, status: 'open' },
        { id: 'order_2', pair: 'rETH/RSA', type: 'market', side: 'sell', amount: 1.0, status: 'filled' }
      ]
    }
  });
});

app.post('/api/orders', (req, res) => {
  res.json({
    success: true,
    data: {
      id: 'order_' + Date.now(),
      ...req.body,
      status: 'created',
      timestamp: new Date().toISOString()
    }
  });
});

app.get('/api/trades', (req, res) => {
  res.json({
    success: true,
    data: {
      trades: [
        { id: 'trade_1', pair: 'rBTC/RSA', amount: 0.1, price: 50000, side: 'buy', timestamp: new Date().toISOString() },
        { id: 'trade_2', pair: 'rETH/RSA', amount: 1.0, price: 3000, side: 'sell', timestamp: new Date().toISOString() }
      ]
    }
  });
});

app.get('/api/transactions', (req, res) => {
  res.json({
    success: true,
    data: {
      transactions: [
        { id: 'tx_1', from: 'RSA1234...', to: 'RSA5678...', amount: 100, asset: 'RSA', status: 'confirmed' },
        { id: 'tx_2', from: 'RSA5678...', to: 'RSA1234...', amount: 0.01, asset: 'rBTC', status: 'pending' }
      ]
    }
  });
});

// Deposit/Withdrawal endpoints
app.get('/api/deposits', (req, res) => {
  res.json({
    success: true,
    data: {
      deposits: [
        { id: 'dep_1', asset: 'BTC', amount: 0.1, status: 'confirmed', network: 'Bitcoin' },
        { id: 'dep_2', asset: 'ETH', amount: 1.0, status: 'pending', network: 'Ethereum' }
      ]
    }
  });
});

app.get('/api/withdrawals', (req, res) => {
  res.json({
    success: true,
    data: {
      withdrawals: [
        { id: 'with_1', asset: 'RSA', amount: 500, status: 'completed', network: 'RSA Chain' }
      ]
    }
  });
});

app.post('/api/deposits/address', (req, res) => {
  const { network } = req.body;
  const addresses = {
    'Bitcoin': '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
    'Ethereum': '0x742d35Cc6634C0532925a3b8D000B44C123CF98E',
    'BNB Chain (BSC)': '0x123456789abcdef123456789abcdef123456789a',
    'Polygon': '0xabcdef123456789abcdef123456789abcdef1234'
  };
  
  res.json({
    success: true,
    data: {
      address: addresses[network] || 'RSA1234567890abcdef',
      network: network,
      qr_code: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`
    }
  });
});

// Admin endpoints
app.get('/admin/dashboard/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      total_users: 1250,
      total_volume_24h: 5000000,
      total_trades_24h: 2500,
      system_health: 'excellent'
    }
  });
});

app.get('/admin/users/list', (req, res) => {
  res.json({
    success: true,
    data: {
      users: [
        { id: 'user_1', email: 'user1@example.com', status: 'active', verified: true },
        { id: 'user_2', email: 'user2@example.com', status: 'active', verified: false }
      ],
      total: 1250
    }
  });
});

app.get('/admin/hot-wallet/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      hot_wallets: [
        { asset: 'RSA', balance: 100000, threshold: 50000, status: 'healthy' },
        { asset: 'rBTC', balance: 10.5, threshold: 5.0, status: 'healthy' },
        { asset: 'rETH', balance: 150.0, threshold: 50.0, status: 'healthy' }
      ],
      alerts: []
    }
  });
});

app.get('/admin/wrapped-tokens/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      wrapped_tokens: [
        { symbol: 'rBTC', collateral: 12.5, minted: 10.0, ratio: 125, status: 'healthy' },
        { symbol: 'rETH', collateral: 200.0, minted: 150.0, ratio: 133, status: 'healthy' }
      ]
    }
  });
});

app.get('/admin/emergency/status', (req, res) => {
  res.json({
    success: true,
    data: {
      emergency_mode: false,
      trading_enabled: true,
      withdrawals_enabled: true,
      deposits_enabled: true,
      last_check: new Date().toISOString()
    }
  });
});

// Cross-chain endpoints
app.get('/api/bridge/status', (req, res) => {
  res.json({
    success: true,
    data: {
      bridges: [
        { network: 'Bitcoin', status: 'active', last_block: 800000 },
        { network: 'Ethereum', status: 'active', last_block: 18500000 },
        { network: 'BNB Chain (BSC)', status: 'active', last_block: 35000000 }
      ]
    }
  });
});

app.get('/api/networks', (req, res) => {
  res.json({
    success: true,
    data: {
      networks: [
        'Bitcoin', 'Ethereum', 'BNB Chain (BSC)', 'Avalanche', 
        'Polygon', 'Arbitrum', 'Fantom', 'Linea', 'Solana', 
        'Unichain', 'opBNB', 'Base', 'Polygon zkEVM'
      ]
    }
  });
});

app.get('/api/networks/:network', (req, res) => {
  const { network } = req.params;
  res.json({
    success: true,
    data: {
      network: network,
      status: 'active',
      wrapped_token: 'r' + network.split(' ')[0].toUpperCase(),
      deposit_enabled: true,
      withdrawal_enabled: true
    }
  });
});

// Catch-all for any missing endpoints
app.all('*', (req, res) => {
  res.json({
    success: true,
    data: { message: 'Mock endpoint response', method: req.method, path: req.path },
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log(`🚀 Mock API server running on port ${PORT}`);
});
