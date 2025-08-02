-- RSA DEX Database Initialization Script
-- This script is automatically run when PostgreSQL container starts

-- Create database if not exists (already created by Docker environment)
-- CREATE DATABASE IF NOT EXISTS rsa_dex;

-- Connect to the database
\c rsa_dex;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tokens table
CREATE TABLE IF NOT EXISTS tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  symbol VARCHAR(20) NOT NULL UNIQUE,
  decimals INTEGER NOT NULL DEFAULT 18,
  contract_address VARCHAR(255),
  wrapped_token_of VARCHAR(20),
  logo_url TEXT,
  description TEXT,
  is_visible BOOLEAN DEFAULT true,
  swap_enabled BOOLEAN DEFAULT true,
  trading_enabled BOOLEAN DEFAULT true,
  deposit_enabled BOOLEAN DEFAULT true,
  withdrawal_enabled BOOLEAN DEFAULT true,
  min_deposit DECIMAL(30,10) DEFAULT 0,
  max_deposit DECIMAL(30,10) DEFAULT 1000000,
  min_withdrawal DECIMAL(30,10) DEFAULT 0,
  max_withdrawal DECIMAL(30,10) DEFAULT 1000000,
  withdrawal_fee DECIMAL(30,10) DEFAULT 0,
  network VARCHAR(20) NOT NULL,
  is_native BOOLEAN DEFAULT false,
  price_source VARCHAR(20) DEFAULT 'coingecko',
  coingecko_id VARCHAR(100),
  manual_price DECIMAL(30,10),
  sort_order INTEGER DEFAULT 999,
  status VARCHAR(20) DEFAULT 'active',
  tags JSONB DEFAULT '[]',
  default_trading_pairs JSONB DEFAULT '[]',
  smart_contract_abi TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  updated_by UUID
);

-- Token price history table
CREATE TABLE IF NOT EXISTS token_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id UUID REFERENCES tokens(id) ON DELETE CASCADE,
  price DECIMAL(30,10) NOT NULL,
  source VARCHAR(20) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User deposit addresses table
CREATE TABLE IF NOT EXISTS user_deposit_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  network VARCHAR(20) NOT NULL,
  address VARCHAR(255) NOT NULL,
  encrypted_private_key TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, network)
);

-- Deposits table
CREATE TABLE IF NOT EXISTS deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  network VARCHAR(20) NOT NULL,
  from_address VARCHAR(255) NOT NULL,
  to_address VARCHAR(255) NOT NULL,
  token_symbol VARCHAR(20) NOT NULL,
  amount DECIMAL(30,10) NOT NULL,
  tx_hash VARCHAR(255) NOT NULL,
  block_height BIGINT,
  confirmations INTEGER DEFAULT 0,
  required_confirmations INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  wrapped_token_minted BOOLEAN DEFAULT false,
  wrapped_amount DECIMAL(30,10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMP,
  minted_at TIMESTAMP
);

-- Withdrawals table
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  network VARCHAR(20) NOT NULL,
  to_address VARCHAR(255) NOT NULL,
  token_symbol VARCHAR(20) NOT NULL,
  amount DECIMAL(30,10) NOT NULL,
  fee DECIMAL(30,10) DEFAULT 0,
  wrapped_tokens_burned BOOLEAN DEFAULT false,
  tx_hash VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP,
  completed_at TIMESTAMP
);

-- Trading pairs table
CREATE TABLE IF NOT EXISTS trading_pairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_token VARCHAR(20) NOT NULL,
  quote_token VARCHAR(20) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(base_token, quote_token)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  pair VARCHAR(20) NOT NULL,
  side VARCHAR(10) NOT NULL,
  type VARCHAR(20) NOT NULL,
  amount DECIMAL(30,10) NOT NULL,
  price DECIMAL(30,10),
  filled DECIMAL(30,10) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tokens_symbol ON tokens(symbol);
CREATE INDEX IF NOT EXISTS idx_tokens_network ON tokens(network);
CREATE INDEX IF NOT EXISTS idx_tokens_status ON tokens(status);
CREATE INDEX IF NOT EXISTS idx_tokens_visible ON tokens(is_visible);
CREATE INDEX IF NOT EXISTS idx_price_history_token_timestamp ON token_price_history(token_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_deposits_user_network ON deposits(user_id, network);
CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposits(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_status ON withdrawals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);

-- Insert default tokens
INSERT INTO tokens (name, symbol, decimals, network, is_native, wrapped_token_of, coingecko_id, manual_price, price_source, sort_order, description, tags, default_trading_pairs)
VALUES 
  ('RSA Crypto', 'RSA', 7, 'rsa', true, NULL, 'rsa-crypto', 0.85, 'manual', 1, 'Native token of the RSA Chain ecosystem', '["native", "governance"]', '["USDT", "BTC", "ETH"]'),
  ('Wrapped Bitcoin', 'rBTC', 8, 'rsa', false, 'BTC', 'bitcoin', NULL, 'coingecko', 2, 'Bitcoin wrapped on RSA Chain', '["wrapped", "bitcoin"]', '["RSA", "USDT"]'),
  ('Wrapped Ethereum', 'rETH', 18, 'rsa', false, 'ETH', 'ethereum', NULL, 'coingecko', 3, 'Ethereum wrapped on RSA Chain', '["wrapped", "ethereum"]', '["RSA", "USDT", "rBTC"]'),
  ('Wrapped Solana', 'rSOL', 9, 'rsa', false, 'SOL', 'solana', NULL, 'coingecko', 4, 'Solana wrapped on RSA Chain', '["wrapped", "solana"]', '["RSA", "USDT"]'),
  ('Wrapped Avalanche', 'rAVAX', 18, 'rsa', false, 'AVAX', 'avalanche-2', NULL, 'coingecko', 5, 'Avalanche wrapped on RSA Chain', '["wrapped", "avalanche"]', '["RSA", "USDT"]'),
  ('Wrapped BNB', 'rBNB', 18, 'rsa', false, 'BNB', 'binancecoin', NULL, 'coingecko', 6, 'BNB wrapped on RSA Chain', '["wrapped", "bnb"]', '["RSA", "USDT"]')
ON CONFLICT (symbol) DO NOTHING;

-- Insert initial price history for RSA token
INSERT INTO token_price_history (token_id, price, source)
SELECT id, 0.85, 'manual' FROM tokens WHERE symbol = 'RSA'
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'RSA DEX Database initialized successfully!' as message;