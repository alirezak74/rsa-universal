-- RSA DEX Cross-Chain Database Schema
-- PostgreSQL initialization script

-- Create database (run as superuser)
-- CREATE DATABASE rsa_dex;

-- Connect to the database
\c rsa_dex;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    two_factor_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

-- Create tokens table
CREATE TABLE IF NOT EXISTS tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Create token price history table
CREATE TABLE IF NOT EXISTS token_price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_id UUID REFERENCES tokens(id) ON DELETE CASCADE,
    price DECIMAL(30,10) NOT NULL,
    source VARCHAR(20) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user deposit addresses table
CREATE TABLE IF NOT EXISTS user_deposit_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    network VARCHAR(20) NOT NULL,
    address VARCHAR(255) NOT NULL,
    encrypted_private_key TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, network)
);

-- Create deposits table
CREATE TABLE IF NOT EXISTS deposits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    network VARCHAR(20) NOT NULL,
    from_address VARCHAR(255) NOT NULL,
    to_address VARCHAR(255) NOT NULL,
    tx_hash VARCHAR(255) NOT NULL UNIQUE,
    amount DECIMAL(30,10) NOT NULL,
    token_symbol VARCHAR(20) NOT NULL,
    confirmations INTEGER DEFAULT 0,
    required_confirmations INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    wrapped_token_minted BOOLEAN DEFAULT false,
    wrapped_amount DECIMAL(30,10),
    block_number BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP,
    minted_at TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

-- Create withdrawals table
CREATE TABLE IF NOT EXISTS withdrawals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    network VARCHAR(20) NOT NULL,
    from_address VARCHAR(255),
    to_address VARCHAR(255) NOT NULL,
    tx_hash VARCHAR(255),
    amount DECIMAL(30,10) NOT NULL,
    token_symbol VARCHAR(20) NOT NULL,
    wrapped_token_burned BOOLEAN DEFAULT false,
    burned_amount DECIMAL(30,10),
    fee DECIMAL(30,10) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    burned_at TIMESTAMP,
    sent_at TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

-- Create wrapped token contracts table
CREATE TABLE IF NOT EXISTS wrapped_token_contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) NOT NULL UNIQUE,
    original_network VARCHAR(20) NOT NULL,
    wrapped_network VARCHAR(20) NOT NULL DEFAULT 'rsa',
    contract_address VARCHAR(255),
    total_supply DECIMAL(30,10) DEFAULT 0,
    total_minted DECIMAL(30,10) DEFAULT 0,
    total_burned DECIMAL(30,10) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create network status table
CREATE TABLE IF NOT EXISTS network_status (
    network VARCHAR(20) PRIMARY KEY,
    is_online BOOLEAN DEFAULT false,
    block_height BIGINT DEFAULT 0,
    last_checked TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    error_message TEXT,
    maintenance_mode BOOLEAN DEFAULT false
);

-- Create trading pairs table
CREATE TABLE IF NOT EXISTS trading_pairs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    base_token_id UUID REFERENCES tokens(id),
    quote_token_id UUID REFERENCES tokens(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(base_token_id, quote_token_id)
);

-- Create orders table (for DEX functionality)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    trading_pair_id UUID REFERENCES trading_pairs(id),
    order_type VARCHAR(10) NOT NULL CHECK (order_type IN ('buy', 'sell')),
    price DECIMAL(30,10) NOT NULL,
    amount DECIMAL(30,10) NOT NULL,
    filled_amount DECIMAL(30,10) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'filled', 'cancelled', 'partial')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trades table
CREATE TABLE IF NOT EXISTS trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trading_pair_id UUID REFERENCES trading_pairs(id),
    buy_order_id UUID REFERENCES orders(id),
    sell_order_id UUID REFERENCES orders(id),
    price DECIMAL(30,10) NOT NULL,
    amount DECIMAL(30,10) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tokens_symbol ON tokens(symbol);
CREATE INDEX IF NOT EXISTS idx_tokens_network ON tokens(network);
CREATE INDEX IF NOT EXISTS idx_tokens_status ON tokens(status);
CREATE INDEX IF NOT EXISTS idx_tokens_visible ON tokens(is_visible);

CREATE INDEX IF NOT EXISTS idx_price_history_token_timestamp ON token_price_history(token_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_deposit_addresses_user_network ON user_deposit_addresses(user_id, network);
CREATE INDEX IF NOT EXISTS idx_deposits_user ON deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_network_status ON deposits(network, status);
CREATE INDEX IF NOT EXISTS idx_deposits_tx_hash ON deposits(tx_hash);
CREATE INDEX IF NOT EXISTS idx_deposits_created_at ON deposits(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_network_status ON withdrawals(network, status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_created_at ON withdrawals(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_network_status_online ON network_status(is_online);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_pair_status ON orders(trading_pair_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_trades_pair_timestamp ON trades(trading_pair_id, timestamp DESC);

-- Insert default admin user (password: admin123 - change in production!)
INSERT INTO users (email, username, password_hash, role) 
VALUES (
    'admin@rsacrypto.com', 
    'admin', 
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj7.k3eP.VXG', -- admin123
    'admin'
) ON CONFLICT (email) DO NOTHING;

-- Insert supported networks
INSERT INTO network_status (network, is_online, maintenance_mode) VALUES
    ('ethereum', false, false),
    ('solana', false, false),
    ('avalanche', false, false),
    ('bsc', false, false),
    ('bitcoin', false, false)
ON CONFLICT (network) DO NOTHING;

-- Insert wrapped token contracts
INSERT INTO wrapped_token_contracts (symbol, original_network, contract_address) VALUES
    ('rBTC', 'bitcoin', 'RSA_rBTC_CONTRACT'),
    ('rETH', 'ethereum', 'RSA_rETH_CONTRACT'),
    ('rSOL', 'solana', 'RSA_rSOL_CONTRACT'),
    ('rAVAX', 'avalanche', 'RSA_rAVAX_CONTRACT'),
    ('rBNB', 'bsc', 'RSA_rBNB_CONTRACT'),
    ('rUSDT', 'ethereum', 'RSA_rUSDT_CONTRACT'),
    ('rUSDC', 'ethereum', 'RSA_rUSDC_CONTRACT')
ON CONFLICT (symbol) DO NOTHING;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to relevant tables
CREATE TRIGGER update_tokens_updated_at BEFORE UPDATE ON tokens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wrapped_contracts_updated_at BEFORE UPDATE ON wrapped_token_contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rsa_dex_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO rsa_dex_user;