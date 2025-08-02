// RSA DEX Frontend Configuration - Synced with RSA DEX ADMIN
export const CONFIG = {
  // RSA DEX Admin API URL for syncing assets and data
  ADMIN_API_URL: process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:6000',
  
  // RSA DEX Backend API URL
  DEX_API_URL: process.env.NEXT_PUBLIC_DEX_API_URL || 'http://localhost:8001',
  
  // RSA Chain Network URLs - Updated for production
  RSA_NETWORK_URL: process.env.NEXT_PUBLIC_RSA_NETWORK_URL || 'http://localhost:8001',
  RSA_HORIZON_URL: process.env.NEXT_PUBLIC_RSA_HORIZON_URL || 'http://localhost:8001',
  
  // Production RSA Network URLs (for rsacrypto.com deployment)
  PRODUCTION: {
    RSA_NETWORK_URL: 'https://network.rsacrypto.com',
    RSA_HORIZON_URL: 'https://horizon.rsacrypto.com',
    RSA_EXPLORER_URL: 'https://explorer.rsacrypto.com',
    RSA_FAUCET_URL: 'https://faucet.rsacrypto.com'
  },
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_DEVELOPMENT: process.env.NODE_ENV !== 'production',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
};

export const FEATURES = {
  ENABLE_CREDIT_CARD: process.env.NEXT_PUBLIC_ENABLE_CREDIT_CARD === 'true',
  ENABLE_YIELD_PRODUCTS: process.env.NEXT_PUBLIC_ENABLE_YIELD_PRODUCTS === 'true',
  ENABLE_APPLE_PAY: process.env.NEXT_PUBLIC_ENABLE_APPLE_PAY === 'true',
  ENABLE_LEDGER: process.env.NEXT_PUBLIC_ENABLE_LEDGER === 'true',
  ENABLE_FREIGHTER: process.env.NEXT_PUBLIC_ENABLE_FREIGHTER === 'true',
  ENABLE_ALBEDO: process.env.NEXT_PUBLIC_ENABLE_ALBEDO === 'true',
  ENABLE_LIVE_PRICES: true,
  ENABLE_LIVE_CHARTS: true,
  ENABLE_REAL_TIME_TRADING: true,
  ENABLE_RSA_SDK: true, // New feature flag for RSA SDK
};

export const NETWORKS = {
  RSA_CHAIN: {
    name: 'RSA Chain',
    horizonUrl: CONFIG.IS_PRODUCTION ? CONFIG.PRODUCTION.RSA_HORIZON_URL : CONFIG.RSA_HORIZON_URL,
    networkUrl: CONFIG.IS_PRODUCTION ? CONFIG.PRODUCTION.RSA_NETWORK_URL : CONFIG.RSA_NETWORK_URL,
    networkPassphrase: process.env.NEXT_PUBLIC_RSA_NETWORK_PASSPHRASE || 'RSA Chain Mainnet ; July 2024',
    icon: '🔗',
    nativeAsset: {
      code: 'RSA',
      issuer: null,
      name: 'RSA Crypto',
      decimals: 7
    }
  },
  STELLAR: {
    name: 'Stellar',
    horizonUrl: process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org',
    networkPassphrase: process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015',
    icon: '⭐',
    nativeAsset: {
      code: 'XLM',
      issuer: null,
      name: 'Stellar Lumens',
      decimals: 7
    }
  },
};

export const DEFAULT_NETWORK = 'RSA_CHAIN';

// RSA SDK Configuration
export const RSA_SDK_CONFIG = {
  SERVER_URL: NETWORKS.RSA_CHAIN.horizonUrl,
  NETWORK_PASSPHRASE: NETWORKS.RSA_CHAIN.networkPassphrase,
  BASE_FEE: '100', // 100 stroops = 0.00001 RSA
  TIMEOUT: 30000,
  
  // Transaction settings
  TRANSACTION_TIMEOUT: 30, // seconds
  MAX_FEE: '10000', // Maximum fee in stroops
  
  // Asset settings
  NATIVE_ASSET_CODE: 'RSA',
  PRECISION: 7, // 7 decimal places for RSA
};

// This will be dynamically populated from Admin API
export const SUPPORTED_ASSETS = [
  {
    id: '1',
    symbol: 'RSA',
    name: 'RSA Crypto',
    type: 'native',
    icon: '🔗',
    decimals: 7,
    price: 0.85, // Updated to $0.85 USD
    status: 'active',
    contractAddress: undefined,
    issuer: null,
    network: 'RSA_CHAIN',
    syncWithDex: true,
    visibilitySettings: {
      wallets: true,
      contracts: true,
      trading: true,
      transactions: true
    }
  },
  {
    id: '2',
    symbol: 'BTC',
    name: 'Bitcoin',
    type: 'crypto',
    icon: '₿',
    decimals: 8,
    price: 65000.50,
    status: 'active',
    contractAddress: undefined,
    issuer: 'GARDNV3Q7YGT...MMXJTEDL5',
    network: 'RSA_CHAIN',
    syncWithDex: true,
    visibilitySettings: {
      wallets: true,
      contracts: true,
      trading: true,
      transactions: true
    }
  },
  {
    id: '3',
    symbol: 'ETH',
    name: 'Ethereum',
    type: 'crypto',
    icon: 'Ξ',
    decimals: 18,
    price: 3456.78,
    status: 'active',
    contractAddress: undefined,
    issuer: 'GA7FCCMTTSUIC...MMXJTEDL5',
    network: 'RSA_CHAIN',
    syncWithDex: true,
    visibilitySettings: {
      wallets: true,
      contracts: true,
      trading: true,
      transactions: true
    }
  },
  {
    id: '4',
    symbol: 'USDT',
    name: 'Tether USD',
    type: 'stablecoin',
    icon: '$',
    decimals: 6,
    price: 1.00,
    status: 'active',
    contractAddress: undefined,
    issuer: 'GCQFBVR3QDBC...MMXJTEDL5',
    network: 'RSA_CHAIN',
    syncWithDex: true,
    visibilitySettings: {
      wallets: true,
      contracts: true,
      trading: true,
      transactions: true
    }
  },
  {
    id: '5',
    symbol: 'USDC',
    name: 'USD Coin',
    type: 'stablecoin',
    icon: '$',
    decimals: 6,
    price: 1.00,
    status: 'active',
    contractAddress: undefined,
    issuer: 'GA5ZSEJYB37J...MMXJTEDL5',
    network: 'RSA_CHAIN',
    syncWithDex: true,
    visibilitySettings: {
      wallets: true,
      contracts: true,
      trading: true,
      transactions: true
    }
  }
];

// Trading pairs configuration
export const TRADING_PAIRS = [
  {
    id: 'RSA/USD',
    base: 'RSA',
    quote: 'USD',
    symbol: 'RSA/USD',
    price: 0.85,
    change24h: 2.5,
    volume24h: 1200000,
    high24h: 0.87,
    low24h: 0.83,
    status: 'active'
  },
  {
    id: 'BTC/USD',
    base: 'BTC',
    quote: 'USD',
    symbol: 'BTC/USD',
    price: 65000.50,
    change24h: -1.2,
    volume24h: 2500000000,
    high24h: 66000,
    low24h: 64500,
    status: 'active'
  },
  {
    id: 'ETH/USD',
    base: 'ETH',
    quote: 'USD',
    symbol: 'ETH/USD',
    price: 3456.78,
    change24h: 0.8,
    volume24h: 1800000000,
    high24h: 3500,
    low24h: 3400,
    status: 'active'
  },
  {
    id: 'RSA/BTC',
    base: 'RSA',
    quote: 'BTC',
    symbol: 'RSA/BTC',
    price: 0.00001308, // 0.85 / 65000
    change24h: 3.8,
    volume24h: 850000,
    high24h: 0.00001340,
    low24h: 0.00001280,
    status: 'active'
  },
  {
    id: 'RSA/ETH',
    base: 'RSA',
    quote: 'ETH',
    symbol: 'RSA/ETH',
    price: 0.000246, // 0.85 / 3456.78
    change24h: 1.6,
    volume24h: 650000,
    high24h: 0.000252,
    low24h: 0.000241,
    status: 'active'
  }
];

// API endpoints
export const API_ENDPOINTS = {
  // RSA Horizon API endpoints
  HORIZON: {
    ROOT: NETWORKS.RSA_CHAIN.horizonUrl,
    ACCOUNTS: `${NETWORKS.RSA_CHAIN.horizonUrl}/accounts`,
    TRANSACTIONS: `${NETWORKS.RSA_CHAIN.horizonUrl}/transactions`,
    PAYMENTS: `${NETWORKS.RSA_CHAIN.horizonUrl}/payments`,
    ASSETS: `${NETWORKS.RSA_CHAIN.horizonUrl}/assets`,
    LEDGERS: `${NETWORKS.RSA_CHAIN.horizonUrl}/ledgers`,
    OFFERS: `${NETWORKS.RSA_CHAIN.horizonUrl}/offers`,
    HEALTH: `${NETWORKS.RSA_CHAIN.horizonUrl}/health`
  },
  
  // DEX specific endpoints
  DEX: {
    ORDERS: `${CONFIG.DEX_API_URL}/orders`,
    TRADES: `${CONFIG.DEX_API_URL}/trades`,
    ORDERBOOK: `${CONFIG.DEX_API_URL}/orderbook`,
    PRICES: `${CONFIG.DEX_API_URL}/prices`,
    CHARTS: `${CONFIG.DEX_API_URL}/charts`
  },
  
  // Admin API endpoints
  ADMIN: {
    ASSETS: `${CONFIG.ADMIN_API_URL}/api/admin/assets`,
    SETTINGS: `${CONFIG.ADMIN_API_URL}/api/admin/settings`,
    USERS: `${CONFIG.ADMIN_API_URL}/api/admin/users`,
    TRANSACTIONS: `${CONFIG.ADMIN_API_URL}/api/admin/transactions`
  }
};

// Validation settings
export const VALIDATION = {
  MIN_TRADE_AMOUNT: 0.0000001, // Minimum trade amount
  MAX_TRADE_AMOUNT: 1000000,   // Maximum trade amount
  PRICE_PRECISION: 8,          // Price decimal places
  AMOUNT_PRECISION: 7,         // Amount decimal places
  
  // Account validation
  MIN_ACCOUNT_ID_LENGTH: 56,
  MAX_ACCOUNT_ID_LENGTH: 56,
  
  // Transaction validation
  MIN_FEE: 100,                // Minimum fee in stroops
  MAX_FEE: 10000,              // Maximum fee in stroops
  TRANSACTION_TIMEOUT: 30,     // Transaction timeout in seconds
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  ACCOUNT_NOT_FOUND: 'Account not found on the RSA network.',
  INSUFFICIENT_BALANCE: 'Insufficient balance for this transaction.',
  INVALID_AMOUNT: 'Please enter a valid amount.',
  INVALID_ACCOUNT: 'Please enter a valid RSA account ID.',
  TRANSACTION_FAILED: 'Transaction failed. Please try again.',
  SDK_NOT_LOADED: 'RSA SDK is not loaded. Please refresh the page.',
  WALLET_NOT_CONNECTED: 'Please connect your wallet first.',
  SIGNING_FAILED: 'Transaction signing failed.',
  SUBMISSION_FAILED: 'Transaction submission failed.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  TRANSACTION_SUBMITTED: 'Transaction submitted successfully!',
  WALLET_CONNECTED: 'Wallet connected successfully!',
  ACCOUNT_CREATED: 'Account created successfully!',
  ORDER_PLACED: 'Order placed successfully!',
  ORDER_CANCELLED: 'Order cancelled successfully!',
};

export const settings = {
  // Network configuration
  NETWORK: NETWORKS.RSA_CHAIN,
  
  // API URLs
  RSA_NETWORK_URL: CONFIG.RSA_NETWORK_URL,
  RSA_HORIZON_URL: CONFIG.RSA_HORIZON_URL,
  ADMIN_API_URL: CONFIG.ADMIN_API_URL,
  
  // Feature flags
  FEATURES,
  
  // Assets (for backward compatibility)
  assets: SUPPORTED_ASSETS,
  
  // Trading pairs
  tradingPairs: TRADING_PAIRS,
  
  // API endpoints
  endpoints: API_ENDPOINTS,
  
  // Validation rules
  validation: VALIDATION,
  
  // Messages
  errorMessages: ERROR_MESSAGES,
  successMessages: SUCCESS_MESSAGES
};
