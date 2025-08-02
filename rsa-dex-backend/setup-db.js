#!/usr/bin/env node

// Database Setup Script for RSA DEX Backend
// This script will create the database and initialize all required tables

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
};

const dbName = process.env.DB_NAME || 'rsa_dex';

async function setupDatabase() {
  console.log('🚀 Starting RSA DEX database setup...\n');

  // First, connect to PostgreSQL without specifying a database
  const adminPool = new Pool(dbConfig);

  try {
    // Check if database exists, create if not
    console.log('📊 Checking if database exists...');
    const dbCheckResult = await adminPool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (dbCheckResult.rows.length === 0) {
      console.log(`📊 Creating database: ${dbName}`);
      await adminPool.query(`CREATE DATABASE ${dbName}`);
      console.log('✅ Database created successfully!');
    } else {
      console.log('✅ Database already exists');
    }

    await adminPool.end();

    // Now connect to the specific database
    const pool = new Pool({
      ...dbConfig,
      database: dbName
    });

    console.log('🔗 Connected to database, creating tables...\n');

    // Create tables
    await createTables(pool);
    
    // Insert default data
    await insertDefaultData(pool);

    await pool.end();
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Make sure PostgreSQL is running');
    console.log('   2. Run: npm start');
    console.log('   3. Backend will be available at http://localhost:8001');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure PostgreSQL is installed and running');
    console.log('   2. Check your database credentials in .env file');
    console.log('   3. Ensure the PostgreSQL user has CREATE DATABASE privileges');
    process.exit(1);
  }
}

async function createTables(pool) {
  const tables = [
    // Users table
    `CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'user',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Tokens table
    `CREATE TABLE IF NOT EXISTS tokens (
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
    )`,

    // Token price history table
    `CREATE TABLE IF NOT EXISTS token_price_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      token_id UUID REFERENCES tokens(id) ON DELETE CASCADE,
      price DECIMAL(30,10) NOT NULL,
      source VARCHAR(20) NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // User deposit addresses table
    `CREATE TABLE IF NOT EXISTS user_deposit_addresses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      network VARCHAR(20) NOT NULL,
      address VARCHAR(255) NOT NULL,
      encrypted_private_key TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, network)
    )`,

    // Deposits table
    `CREATE TABLE IF NOT EXISTS deposits (
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
    )`,

    // Withdrawals table
    `CREATE TABLE IF NOT EXISTS withdrawals (
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
    )`,

    // Trading pairs table
    `CREATE TABLE IF NOT EXISTS trading_pairs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      base_token VARCHAR(20) NOT NULL,
      quote_token VARCHAR(20) NOT NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(base_token, quote_token)
    )`,

    // Orders table
    `CREATE TABLE IF NOT EXISTS orders (
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
    )`
  ];

  console.log('📊 Creating database tables...');
  for (const table of tables) {
    await pool.query(table);
  }

  // Create indexes
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_tokens_symbol ON tokens(symbol)',
    'CREATE INDEX IF NOT EXISTS idx_tokens_network ON tokens(network)',
    'CREATE INDEX IF NOT EXISTS idx_tokens_status ON tokens(status)',
    'CREATE INDEX IF NOT EXISTS idx_tokens_visible ON tokens(is_visible)',
    'CREATE INDEX IF NOT EXISTS idx_price_history_token_timestamp ON token_price_history(token_id, timestamp DESC)',
    'CREATE INDEX IF NOT EXISTS idx_deposits_user_network ON deposits(user_id, network)',
    'CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposits(status)',
    'CREATE INDEX IF NOT EXISTS idx_withdrawals_user_status ON withdrawals(user_id, status)',
    'CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status)'
  ];

  console.log('📊 Creating database indexes...');
  for (const index of indexes) {
    await pool.query(index);
  }

  console.log('✅ Tables and indexes created successfully!');
}

async function insertDefaultData(pool) {
  console.log('📊 Inserting default data...');

  // Check if tokens already exist
  const tokenCount = await pool.query('SELECT COUNT(*) FROM tokens');
  if (parseInt(tokenCount.rows[0].count) > 0) {
    console.log('✅ Default tokens already exist, skipping...');
    return;
  }

  // Default tokens
  const defaultTokens = [
    {
      name: 'RSA Crypto',
      symbol: 'RSA',
      decimals: 7,
      network: 'rsa',
      is_native: true,
      manual_price: 0.85,
      price_source: 'manual',
      sort_order: 1,
      description: 'Native token of the RSA Chain ecosystem'
    },
    {
      name: 'Wrapped Bitcoin',
      symbol: 'rBTC',
      decimals: 8,
      network: 'rsa',
      wrapped_token_of: 'BTC',
      coingecko_id: 'bitcoin',
      sort_order: 2,
      description: 'Bitcoin wrapped on RSA Chain'
    },
    {
      name: 'Wrapped Ethereum',
      symbol: 'rETH',
      decimals: 18,
      network: 'rsa',
      wrapped_token_of: 'ETH',
      coingecko_id: 'ethereum',
      sort_order: 3,
      description: 'Ethereum wrapped on RSA Chain'
    },
    {
      name: 'Wrapped Solana',
      symbol: 'rSOL',
      decimals: 9,
      network: 'rsa',
      wrapped_token_of: 'SOL',
      coingecko_id: 'solana',
      sort_order: 4,
      description: 'Solana wrapped on RSA Chain'
    },
    {
      name: 'Wrapped Avalanche',
      symbol: 'rAVAX',
      decimals: 18,
      network: 'rsa',
      wrapped_token_of: 'AVAX',
      coingecko_id: 'avalanche-2',
      sort_order: 5,
      description: 'Avalanche wrapped on RSA Chain'
    },
    {
      name: 'Wrapped BNB',
      symbol: 'rBNB',
      decimals: 18,
      network: 'rsa',
      wrapped_token_of: 'BNB',
      coingecko_id: 'binancecoin',
      sort_order: 6,
      description: 'BNB wrapped on RSA Chain'
    }
  ];

  for (const token of defaultTokens) {
    await pool.query(`
      INSERT INTO tokens (name, symbol, decimals, network, is_native, wrapped_token_of, 
                         coingecko_id, manual_price, price_source, sort_order, description,
                         tags, default_trading_pairs)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, [
      token.name, token.symbol, token.decimals, token.network, token.is_native || false,
      token.wrapped_token_of || null, token.coingecko_id || null, token.manual_price || null,
      token.price_source || 'coingecko', token.sort_order, token.description,
      JSON.stringify(['wrapped']), JSON.stringify(['RSA', 'USDT'])
    ]);
  }

  console.log('✅ Default tokens inserted successfully!');
}

// Run the setup
if (require.main === module) {
  require('dotenv').config();
  setupDatabase().catch(console.error);
}

module.exports = { setupDatabase };