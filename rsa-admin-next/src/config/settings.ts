// RSA Chain Admin Panel Configuration
export const CONFIG = {
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
  
  // Admin Credentials
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123',
  
  // RSA Chain Network URLs
  RSA_NETWORK_URL: process.env.RSA_NETWORK_URL || 'http://localhost:3000',
  RSA_HORIZON_URL: process.env.RSA_HORIZON_URL || 'http://localhost:4000',
  RSA_FAUCET_URL: process.env.RSA_FAUCET_URL || 'http://localhost:5000',
  
  // RSA DEX Backend URL (for admin operations)
  RSA_DEX_URL: process.env.RSA_DEX_URL || 'http://localhost:8001',
  
  // Feature Flags
  ENABLE_TX_RECALL: process.env.ENABLE_TX_RECALL === 'true',
  ENABLE_EMERGENCY: process.env.ENABLE_EMERGENCY === 'true',
  ENABLE_CONTRACT_GOV: process.env.ENABLE_CONTRACT_GOV === 'true',
  ENABLE_2FA: process.env.ENABLE_2FA === 'true',
  ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS === 'true',
  ENABLE_USER_MANAGEMENT: process.env.ENABLE_USER_MANAGEMENT === 'true',
  ENABLE_NODE_MANAGEMENT: process.env.ENABLE_NODE_MANAGEMENT === 'true',
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_DEVELOPMENT: process.env.NODE_ENV !== 'production',
};

// API Endpoints for RSA DEX Backend
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  VERIFY: '/auth/profile',
  REGISTER: '/auth/register',
  
  // Market Data
  MARKETS: '/api/markets',
  TICKER: '/api/markets/:pair/ticker',
  ORDERBOOK: '/api/markets/:pair/orderbook',
  TRADES: '/api/markets/:pair/trades',
  
  // Trading
  ORDERS: '/api/orders',
  ORDER_DETAIL: '/api/orders/:orderId',
  
  // Wallet
  WALLET_BALANCE: '/api/wallet/balance',
  WALLET_TRANSFER: '/api/wallet/transfer',
  
  // Admin-specific endpoints (to be implemented in RSA DEX backend)
  WALLETS: '/api/admin/wallets',
  TRANSACTIONS: '/api/admin/transactions',
  USERS: '/api/admin/users',
  LOGS: '/api/admin/logs',
  ANALYTICS: '/api/admin/analytics',
  EMERGENCY: '/api/admin/emergency',
  GAS_SETTINGS: '/api/admin/gas-settings',
  NODES: '/api/admin/nodes',
  CONTRACTS: '/api/admin/contracts',
  TX_RECALL: '/api/admin/tx-recall',
  DB_TOOLS: '/api/admin/dbtools',
  ASSETS: '/api/admin/assets',
  
  // Asset sync endpoints for module integration
  SYNC_WALLET: '/api/admin/sync-wallet',
  SYNC_CONTRACTS: '/api/admin/sync-contracts', 
  SYNC_TRADING: '/api/admin/sync-trading',
  SYNC_TRANSACTIONS: '/api/admin/sync-transactions',
  
  // Health check
  HEALTH: '/health',
};

// Feature flags for UI
export const FEATURES = {
  TX_RECALL: CONFIG.ENABLE_TX_RECALL,
  EMERGENCY: CONFIG.ENABLE_EMERGENCY,
  CONTRACT_GOV: CONFIG.ENABLE_CONTRACT_GOV,
  TWO_FACTOR: CONFIG.ENABLE_2FA,
  ANALYTICS: CONFIG.ENABLE_ANALYTICS,
  USER_MANAGEMENT: CONFIG.ENABLE_USER_MANAGEMENT,
  NODE_MANAGEMENT: CONFIG.ENABLE_NODE_MANAGEMENT,
};

// Trading pairs supported by RSA DEX
export const TRADING_PAIRS = [
  'RSA/USDT',
  'RSA/BTC',
  'RSA/ETH',
  'BTC/USDT',
  'ETH/USDT',
  'ETH/BTC',
  'USDT/USD',
];

// Supported assets (includes ETH for full integration)
export const SUPPORTED_ASSETS = [
  'RSA',
  'BTC', 
  'ETH',
  'USDT',
];

// Order types
export const ORDER_TYPES = {
  MARKET: 'market',
  LIMIT: 'limit',
};

// Order sides
export const ORDER_SIDES = {
  BUY: 'buy',
  SELL: 'sell',
};

// Order status
export const ORDER_STATUS = {
  PENDING: 'pending',
  FILLED: 'filled',
  PARTIALLY_FILLED: 'partially_filled',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
};