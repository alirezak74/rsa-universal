// SQLite Database Service for RSA DEX Backend
// This replaces PostgreSQL with SQLite for easier deployment

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const winston = require('winston');
const { v4: uuidv4 } = require('uuid');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()]
});

class SQLiteDatabase {
  constructor() {
    this.dbPath = path.join(__dirname, '..', 'data', 'rsa_dex.db');
    this.db = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      // Create data directory if it doesn't exist
      const dataDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Open database connection
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          logger.error('Failed to open SQLite database:', err);
          throw err;
        }
        logger.info('✅ SQLite database connected successfully');
      });

      // Create tables
      await this.createTables();
      
      // Insert default data
      await this.insertDefaultData();
      
      this.initialized = true;
      logger.info('✅ SQLite database initialized successfully');
      
    } catch (error) {
      logger.error('❌ Failed to initialize SQLite database:', error);
      throw error;
    }
  }

  async createTables() {
    const tables = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Tokens table
      `CREATE TABLE IF NOT EXISTS tokens (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        name TEXT NOT NULL,
        symbol TEXT NOT NULL UNIQUE,
        decimals INTEGER NOT NULL DEFAULT 18,
        contract_address TEXT,
        wrapped_token_of TEXT,
        logo_url TEXT,
        description TEXT,
        is_visible INTEGER DEFAULT 1,
        swap_enabled INTEGER DEFAULT 1,
        trading_enabled INTEGER DEFAULT 1,
        deposit_enabled INTEGER DEFAULT 1,
        withdrawal_enabled INTEGER DEFAULT 1,
        min_deposit REAL DEFAULT 0,
        max_deposit REAL DEFAULT 1000000,
        min_withdrawal REAL DEFAULT 0,
        max_withdrawal REAL DEFAULT 1000000,
        withdrawal_fee REAL DEFAULT 0,
        network TEXT NOT NULL,
        is_native INTEGER DEFAULT 0,
        price_source TEXT DEFAULT 'coingecko',
        coingecko_id TEXT,
        manual_price REAL,
        sort_order INTEGER DEFAULT 999,
        status TEXT DEFAULT 'active',
        tags TEXT DEFAULT '[]',
        default_trading_pairs TEXT DEFAULT '[]',
        smart_contract_abi TEXT,
        metadata TEXT DEFAULT '{}',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by TEXT,
        updated_by TEXT
      )`,

      // Token price history table
      `CREATE TABLE IF NOT EXISTS token_price_history (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        token_id TEXT REFERENCES tokens(id) ON DELETE CASCADE,
        price REAL NOT NULL,
        source TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // User deposit addresses table
      `CREATE TABLE IF NOT EXISTS user_deposit_addresses (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        network TEXT NOT NULL,
        address TEXT NOT NULL,
        encrypted_private_key TEXT,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, network)
      )`,

      // Deposits table
      `CREATE TABLE IF NOT EXISTS deposits (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        network TEXT NOT NULL,
        from_address TEXT NOT NULL,
        to_address TEXT NOT NULL,
        token_symbol TEXT NOT NULL,
        amount REAL NOT NULL,
        tx_hash TEXT NOT NULL,
        block_height INTEGER,
        confirmations INTEGER DEFAULT 0,
        required_confirmations INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        wrapped_token_minted INTEGER DEFAULT 0,
        wrapped_amount REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        confirmed_at DATETIME,
        minted_at DATETIME
      )`,

      // Withdrawals table
      `CREATE TABLE IF NOT EXISTS withdrawals (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        network TEXT NOT NULL,
        to_address TEXT NOT NULL,
        token_symbol TEXT NOT NULL,
        amount REAL NOT NULL,
        fee REAL DEFAULT 0,
        wrapped_tokens_burned INTEGER DEFAULT 0,
        tx_hash TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        processed_at DATETIME,
        completed_at DATETIME
      )`,

      // Trading pairs table
      `CREATE TABLE IF NOT EXISTS trading_pairs (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        base_token TEXT NOT NULL,
        quote_token TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(base_token, quote_token)
      )`,

      // Orders table
      `CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        pair TEXT NOT NULL,
        side TEXT NOT NULL,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        price REAL,
        filled REAL DEFAULT 0,
        status TEXT DEFAULT 'open',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const table of tables) {
      await this.run(table);
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

    for (const index of indexes) {
      await this.run(index);
    }
  }

  async insertDefaultData() {
    // Check if tokens already exist
    const tokenCount = await this.get('SELECT COUNT(*) as count FROM tokens');
    if (tokenCount.count > 0) {
      logger.info('✅ Default tokens already exist, skipping...');
      return;
    }

    // Default tokens
    const defaultTokens = [
      {
        id: uuidv4(),
        name: 'RSA Crypto',
        symbol: 'RSA',
        decimals: 7,
        network: 'rsa',
        is_native: 1,
        manual_price: 0.85,
        price_source: 'manual',
        sort_order: 1,
        description: 'Native token of the RSA Chain ecosystem',
        tags: '["native", "governance"]',
        default_trading_pairs: '["USDT", "BTC", "ETH"]'
      },
      {
        id: uuidv4(),
        name: 'Wrapped Bitcoin',
        symbol: 'rBTC',
        decimals: 8,
        network: 'rsa',
        is_native: 0,
        wrapped_token_of: 'BTC',
        coingecko_id: 'bitcoin',
        sort_order: 2,
        description: 'Bitcoin wrapped on RSA Chain',
        tags: '["wrapped", "bitcoin"]',
        default_trading_pairs: '["RSA", "USDT"]'
      },
      {
        id: uuidv4(),
        name: 'Wrapped Ethereum',
        symbol: 'rETH',
        decimals: 18,
        network: 'rsa',
        is_native: 0,
        wrapped_token_of: 'ETH',
        coingecko_id: 'ethereum',
        sort_order: 3,
        description: 'Ethereum wrapped on RSA Chain',
        tags: '["wrapped", "ethereum"]',
        default_trading_pairs: '["RSA", "USDT", "rBTC"]'
      },
      {
        id: uuidv4(),
        name: 'Wrapped Solana',
        symbol: 'rSOL',
        decimals: 9,
        network: 'rsa',
        is_native: 0,
        wrapped_token_of: 'SOL',
        coingecko_id: 'solana',
        sort_order: 4,
        description: 'Solana wrapped on RSA Chain',
        tags: '["wrapped", "solana"]',
        default_trading_pairs: '["RSA", "USDT"]'
      },
      {
        id: uuidv4(),
        name: 'Wrapped Avalanche',
        symbol: 'rAVAX',
        decimals: 18,
        network: 'rsa',
        is_native: 0,
        wrapped_token_of: 'AVAX',
        coingecko_id: 'avalanche-2',
        sort_order: 5,
        description: 'Avalanche wrapped on RSA Chain',
        tags: '["wrapped", "avalanche"]',
        default_trading_pairs: '["RSA", "USDT"]'
      },
      {
        id: uuidv4(),
        name: 'Wrapped BNB',
        symbol: 'rBNB',
        decimals: 18,
        network: 'rsa',
        is_native: 0,
        wrapped_token_of: 'BNB',
        coingecko_id: 'binancecoin',
        sort_order: 6,
        description: 'BNB wrapped on RSA Chain',
        tags: '["wrapped", "bnb"]',
        default_trading_pairs: '["RSA", "USDT"]'
      }
    ];

    for (const token of defaultTokens) {
      const placeholders = Object.keys(token).map(() => '?').join(', ');
      const columns = Object.keys(token).join(', ');
      const values = Object.values(token);
      
      await this.run(
        `INSERT INTO tokens (${columns}) VALUES (${placeholders})`,
        values
      );
    }

    // Insert initial price history for RSA token
    const rsaToken = await this.get('SELECT id FROM tokens WHERE symbol = ?', ['RSA']);
    if (rsaToken) {
      await this.run(
        'INSERT INTO token_price_history (token_id, price, source) VALUES (?, ?, ?)',
        [rsaToken.id, 0.85, 'manual']
      );
    }

    logger.info('✅ Default tokens inserted successfully');
  }

  // Promise wrapper for database operations
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // PostgreSQL-compatible query method for existing code
  async query(sql, params = []) {
    try {
      // Convert PostgreSQL syntax to SQLite
      let sqliteSql = sql
        .replace(/\$(\d+)/g, '?') // Convert $1, $2, etc. to ?
        .replace(/RETURNING \*/g, '') // Remove RETURNING clause
        .replace(/gen_random_uuid\(\)/g, 'hex(randomblob(16))') // Convert UUID function
        .replace(/CURRENT_TIMESTAMP/g, 'CURRENT_TIMESTAMP') // Keep as is
        .replace(/JSONB/g, 'TEXT') // Convert JSONB to TEXT
        .replace(/UUID/g, 'TEXT') // Convert UUID to TEXT
        .replace(/BOOLEAN/g, 'INTEGER') // Convert BOOLEAN to INTEGER
        .replace(/DECIMAL\(\d+,\d+\)/g, 'REAL') // Convert DECIMAL to REAL
                 // Convert PostgreSQL datetime functions to SQLite
         .replace(/NOW\(\)\s*-\s*INTERVAL\s+'(\d+)\s+(\w+)'/g, (match, num, unit) => {
           // Convert unit to SQLite format
           const unitMap = {
             'minute': 'minutes',
             'minutes': 'minutes',
             'hour': 'hours',
             'hours': 'hours', 
             'day': 'days',
             'days': 'days'
           };
           return `datetime("now", "-${num} ${unitMap[unit] || unit}")`;
         }) // Convert NOW() - INTERVAL
         .replace(/NOW\(\)\s*\+\s*INTERVAL\s+'(\d+)\s+(\w+)'/g, (match, num, unit) => {
           const unitMap = {
             'minute': 'minutes',
             'minutes': 'minutes',
             'hour': 'hours',
             'hours': 'hours',
             'day': 'days', 
             'days': 'days'
           };
           return `datetime("now", "+${num} ${unitMap[unit] || unit}")`;
         }) // Convert NOW() + INTERVAL
        .replace(/NOW\(\)/g, 'datetime("now")') // Convert remaining NOW() calls
        .replace(/created_at\s*<\s*datetime\("now",\s*"-(\d+)\s+(\w+)"\)/g, 'datetime(created_at) < datetime("now", "-$1 $2")')
        .replace(/created_at\s*>\s*datetime\("now",\s*"-(\d+)\s+(\w+)"\)/g, 'datetime(created_at) > datetime("now", "-$1 $2")');

      // Handle different query types
      if (sql.toLowerCase().includes('select')) {
        const rows = await this.all(sqliteSql, params);
        return { rows };
      } else {
        const result = await this.run(sqliteSql, params);
        return { rows: [{ id: result.id, changes: result.changes }] };
      }
    } catch (error) {
      logger.error('SQLite query error:', error);
      throw error;
    }
  }

  async close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
}

// Create singleton instance
const sqliteDb = new SQLiteDatabase();

module.exports = sqliteDb;