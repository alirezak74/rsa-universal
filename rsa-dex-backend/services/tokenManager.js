// Dynamic Token Management Service
// Allows admins to add, edit, remove tokens without code redeployment

const winston = require('winston');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const sqliteDb = require('./sqliteDb');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()]
});

// Use SQLite database
const db = sqliteDb;

// Token validation schema
const tokenSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  symbol: Joi.string().min(1).max(20).required(),
  decimals: Joi.number().integer().min(0).max(18).required(),
  contract_address: Joi.string().allow(null, ''),
  wrapped_token_of: Joi.string().allow(null, ''),
  logo_url: Joi.string().uri().allow(null, ''),
  description: Joi.string().max(500).allow(null, ''),
  is_visible: Joi.boolean().default(true),
  swap_enabled: Joi.boolean().default(true),
  trading_enabled: Joi.boolean().default(true),
  deposit_enabled: Joi.boolean().default(true),
  withdrawal_enabled: Joi.boolean().default(true),
  min_deposit: Joi.string().default('0'),
  max_deposit: Joi.string().default('1000000'),
  min_withdrawal: Joi.string().default('0'),
  max_withdrawal: Joi.string().default('1000000'),
  withdrawal_fee: Joi.string().default('0'),
  network: Joi.string().valid('ethereum', 'solana', 'avalanche', 'bsc', 'bitcoin', 'rsa').required(),
  is_native: Joi.boolean().default(false),
  price_source: Joi.string().valid('coingecko', 'manual', 'dex').default('coingecko'),
  coingecko_id: Joi.string().allow(null, ''),
  manual_price: Joi.string().allow(null, ''),
  sort_order: Joi.number().integer().default(999),
  status: Joi.string().valid('active', 'inactive', 'deprecated').default('active'),
  tags: Joi.array().items(Joi.string()).default([]),
  default_trading_pairs: Joi.array().items(Joi.string()).default([]),
  smart_contract_abi: Joi.string().allow(null, ''),
  metadata: Joi.object().default({})
});

class TokenManager {
  constructor() {
    this.initializeDatabase();
  }

  // Initialize database tables
  async initializeDatabase() {
    try {
      // Initialize SQLite database
      await db.initialize();
      logger.info('✅ Token management database initialized');
    } catch (error) {
      logger.error('❌ Failed to initialize token management database:', error);
      throw error;
    }
  }

  // Insert default tokens
  async insertDefaultTokens() {
    try {
      const existingTokens = await db.query('SELECT COUNT(*) FROM tokens');
      if (parseInt(existingTokens.rows[0].count) > 0) {
        return; // Tokens already exist
      }

      const defaultTokens = [
        {
          name: 'RSA Crypto',
          symbol: 'RSA',
          decimals: 7,
          network: 'rsa',
          is_native: true,
          is_visible: true,
          swap_enabled: true,
          trading_enabled: true,
          coingecko_id: 'rsa-crypto',
          manual_price: '0.85',
          price_source: 'manual',
          sort_order: 1,
          default_trading_pairs: ['USDT', 'BTC', 'ETH'],
          tags: ['native', 'governance'],
          description: 'Native token of the RSA Chain ecosystem'
        },
        {
          name: 'Wrapped Bitcoin',
          symbol: 'rBTC',
          decimals: 8,
          network: 'rsa',
          wrapped_token_of: 'BTC',
          is_visible: true,
          swap_enabled: true,
          trading_enabled: true,
          deposit_enabled: true,
          withdrawal_enabled: true,
          coingecko_id: 'bitcoin',
          sort_order: 2,
          default_trading_pairs: ['RSA', 'USDT'],
          tags: ['wrapped', 'bitcoin'],
          description: 'Bitcoin wrapped on RSA Chain'
        },
        {
          name: 'Wrapped Ethereum',
          symbol: 'rETH',
          decimals: 18,
          network: 'rsa',
          wrapped_token_of: 'ETH',
          is_visible: true,
          swap_enabled: true,
          trading_enabled: true,
          deposit_enabled: true,
          withdrawal_enabled: true,
          coingecko_id: 'ethereum',
          sort_order: 3,
          default_trading_pairs: ['RSA', 'USDT', 'rBTC'],
          tags: ['wrapped', 'ethereum'],
          description: 'Ethereum wrapped on RSA Chain'
        },
        {
          name: 'Wrapped Solana',
          symbol: 'rSOL',
          decimals: 9,
          network: 'rsa',
          wrapped_token_of: 'SOL',
          is_visible: true,
          swap_enabled: true,
          trading_enabled: true,
          deposit_enabled: true,
          withdrawal_enabled: true,
          coingecko_id: 'solana',
          sort_order: 4,
          default_trading_pairs: ['RSA', 'USDT'],
          tags: ['wrapped', 'solana'],
          description: 'Solana wrapped on RSA Chain'
        },
        {
          name: 'Wrapped Avalanche',
          symbol: 'rAVAX',
          decimals: 18,
          network: 'rsa',
          wrapped_token_of: 'AVAX',
          is_visible: true,
          swap_enabled: true,
          trading_enabled: true,
          deposit_enabled: true,
          withdrawal_enabled: true,
          coingecko_id: 'avalanche-2',
          sort_order: 5,
          default_trading_pairs: ['RSA', 'USDT'],
          tags: ['wrapped', 'avalanche'],
          description: 'Avalanche wrapped on RSA Chain'
        },
        {
          name: 'Wrapped BNB',
          symbol: 'rBNB',
          decimals: 18,
          network: 'rsa',
          wrapped_token_of: 'BNB',
          is_visible: true,
          swap_enabled: true,
          trading_enabled: true,
          deposit_enabled: true,
          withdrawal_enabled: true,
          coingecko_id: 'binancecoin',
          sort_order: 6,
          default_trading_pairs: ['RSA', 'USDT'],
          tags: ['wrapped', 'bnb'],
          description: 'BNB wrapped on RSA Chain'
        },
        {
          name: 'Wrapped USDT',
          symbol: 'rUSDT',
          decimals: 6,
          network: 'rsa',
          wrapped_token_of: 'USDT',
          is_visible: true,
          swap_enabled: true,
          trading_enabled: true,
          deposit_enabled: true,
          withdrawal_enabled: true,
          coingecko_id: 'tether',
          sort_order: 7,
          default_trading_pairs: ['RSA', 'rBTC', 'rETH'],
          tags: ['wrapped', 'stablecoin'],
          description: 'USDT wrapped on RSA Chain'
        },
        {
          name: 'Wrapped USDC',
          symbol: 'rUSDC',
          decimals: 6,
          network: 'rsa',
          wrapped_token_of: 'USDC',
          is_visible: true,
          swap_enabled: true,
          trading_enabled: true,
          deposit_enabled: true,
          withdrawal_enabled: true,
          coingecko_id: 'usd-coin',
          sort_order: 8,
          default_trading_pairs: ['RSA', 'rBTC', 'rETH'],
          tags: ['wrapped', 'stablecoin'],
          description: 'USDC wrapped on RSA Chain'
        }
      ];

      for (const token of defaultTokens) {
        await this.createToken(token);
      }

      logger.info('✅ Default tokens inserted successfully');
    } catch (error) {
      logger.error('❌ Failed to insert default tokens:', error);
    }
  }

  // Get all tokens (admin view)
  async getAllTokens() {
    try {
      const result = await db.query(`
        SELECT 
          t.*,
          COUNT(ph.id) as price_history_count,
          MAX(ph.timestamp) as last_price_update
        FROM tokens t
        LEFT JOIN token_price_history ph ON t.id = ph.token_id
        GROUP BY t.id
        ORDER BY t.sort_order ASC, t.symbol ASC
      `);

      return result.rows.map(this.formatTokenData);
    } catch (error) {
      logger.error('Get all tokens error:', error);
      throw error;
    }
  }

  // Get active tokens (public view)
  async getActiveTokens() {
    try {
      // First try database query, fallback to default tokens if table doesn't exist
      let result;
      try {
        result = await db.query(`
          SELECT 
            t.id, t.name, t.symbol, t.decimals, t.contract_address, 
            t.wrapped_token_of, t.description, t.is_visible, t.swap_enabled, 
            t.trading_enabled, t.deposit_enabled, t.withdrawal_enabled, 
            t.network, t.is_native, t.price_source, t.coingecko_id, 
            t.manual_price, t.status, t.tags, t.default_trading_pairs, 
            t.metadata, t.created_by, t.created_at, t.updated_at,
            NULL as current_price,
            NULL as price_updated_at
          FROM tokens t
          WHERE t.status = 'active' AND t.is_visible = true
          ORDER BY t.symbol ASC
        `);
      } catch (dbError) {
        // If tokens table doesn't exist, return default tokens
        logger.warn('Tokens table not available, returning default tokens:', dbError.message);
        return this.getDefaultTokens();
      }

      if (!result.rows || result.rows.length === 0) {
        // Return default tokens if no data in database
        const defaultTokens = this.getDefaultTokens();
        // Include imported tokens from memory with proper trading format
        const importedTokens = this.formatImportedTokensForTrading(global.importedTokens || []);
        return [...defaultTokens, ...importedTokens];
      }

      const dbTokens = result.rows.map(this.formatTokenData);
      // Include imported tokens from memory with proper trading format
      const importedTokens = this.formatImportedTokensForTrading(global.importedTokens || []);
      return [...dbTokens, ...importedTokens];
          } catch (error) {
        logger.error('Get active tokens error:', error);
        // Return default tokens as fallback
        const defaultTokens = this.getDefaultTokens();
        const importedTokens = this.formatImportedTokensForTrading(global.importedTokens || []);
        return [...defaultTokens, ...importedTokens];
      }
  }

  // Format imported tokens for trading on RSA DEX frontend
  formatImportedTokensForTrading(importedTokens) {
    return importedTokens.map(token => ({
      id: token.id,
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals || 18,
      contract_address: token.contract_address,
      wrapped_token_of: token.wrapped_token_of || token.realSymbol,
      description: `Imported ${token.name} token`,
      is_visible: true,
      swap_enabled: token.swap_enabled !== false,
      trading_enabled: token.trading_enabled !== false,
      deposit_enabled: token.deposit_enabled !== false,
      withdrawal_enabled: token.withdrawal_enabled !== false,
      min_deposit: '0.001',
      max_deposit: '1000000',
      min_withdrawal: '0.001',
      max_withdrawal: '1000000',
      withdrawal_fee: '0.001',
      network: token.network || 'rsa',
      is_native: false,
      price_source: 'manual',
      coingecko_id: token.coinGeckoId || '',
      manual_price: token.current_price?.toString() || '1.0',
      sort_order: 1000,
      status: token.status || 'active',
      tags: ['imported', 'rtoken'],
      default_trading_pairs: ['USDT', 'BTC', 'ETH', 'RSA'],
      metadata: {
        imported: true,
        originalSymbol: token.realSymbol,
        importDate: token.created_at,
        tradingEnabled: true,
        crossChainSupported: true
      },
      created_by: 'universal_import',
      created_at: token.created_at,
      updated_at: token.updated_at || token.created_at,
      current_price: token.current_price || 1.0,
      price_updated_at: new Date().toISOString()
    }));
  }

  // Get default tokens as fallback
  getDefaultTokens() {
    return [
      {
        id: 'rsa',
        name: 'RSA Token',
        symbol: 'RSA',
        decimals: 18,
        contract_address: 'RSA_NATIVE_TOKEN',
        network: 'rsa',
        is_native: true,
        current_price: 1.0,
        status: 'active',
        is_visible: true,
        swap_enabled: true,
        trading_enabled: true,
        deposit_enabled: true,
        withdrawal_enabled: true
      },
      {
        id: 'rbtc',
        name: 'Wrapped Bitcoin',
        symbol: 'rBTC',
        decimals: 8,
        contract_address: 'RSA_rBTC_CONTRACT',
        wrapped_token_of: 'BTC',
        network: 'rsa',
        is_native: false,
        current_price: 50000.0,
        status: 'active',
        is_visible: true,
        swap_enabled: true,
        trading_enabled: true,
        deposit_enabled: true,
        withdrawal_enabled: true
      },
      {
        id: 'reth',
        name: 'Wrapped Ethereum',
        symbol: 'rETH',
        decimals: 18,
        contract_address: 'RSA_rETH_CONTRACT',
        wrapped_token_of: 'ETH',
        network: 'rsa',
        is_native: false,
        current_price: 3000.0,
        status: 'active',
        is_visible: true,
        swap_enabled: true,
        trading_enabled: true,
        deposit_enabled: true,
        withdrawal_enabled: true
      },
      {
        id: 'usdt',
        name: 'Tether USD',
        symbol: 'USDT',
        decimals: 6,
        contract_address: 'USDT_CONTRACT',
        network: 'ethereum',
        is_native: false,
        current_price: 1.0,
        status: 'active',
        is_visible: true,
        swap_enabled: true,
        trading_enabled: true,
        deposit_enabled: true,
        withdrawal_enabled: true
      }
    ];
  }

  // Get tokens by network
  async getTokensByNetwork(network) {
    try {
      const result = await db.query(`
        SELECT 
          t.*,
          ph.price as current_price,
          ph.timestamp as price_updated_at
        FROM tokens t
        LEFT JOIN LATERAL (
          SELECT price, timestamp 
          FROM token_price_history 
          WHERE token_id = t.id 
          ORDER BY timestamp DESC 
          LIMIT 1
        ) ph ON true
        WHERE t.network = $1 AND t.status = 'active' AND t.is_visible = true
        ORDER BY t.sort_order ASC, t.symbol ASC
      `, [network]);

      return result.rows.map(this.formatTokenData);
    } catch (error) {
      logger.error('Get tokens by network error:', error);
      throw error;
    }
  }

  // Get single token
  async getTokenById(id) {
    try {
      const result = await db.query(`
        SELECT 
          t.*,
          ph.price as current_price,
          ph.timestamp as price_updated_at
        FROM tokens t
        LEFT JOIN LATERAL (
          SELECT price, timestamp 
          FROM token_price_history 
          WHERE token_id = t.id 
          ORDER BY timestamp DESC 
          LIMIT 1
        ) ph ON true
        WHERE t.id = $1
      `, [id]);

      if (result.rows.length === 0) {
        throw new Error('Token not found');
      }

      return this.formatTokenData(result.rows[0]);
    } catch (error) {
      logger.error('Get token by ID error:', error);
      throw error;
    }
  }

  // Get token by symbol
  async getTokenBySymbol(symbol) {
    try {
      const result = await db.query(`
        SELECT 
          t.*,
          ph.price as current_price,
          ph.timestamp as price_updated_at
        FROM tokens t
        LEFT JOIN LATERAL (
          SELECT price, timestamp 
          FROM token_price_history 
          WHERE token_id = t.id 
          ORDER BY timestamp DESC 
          LIMIT 1
        ) ph ON true
        WHERE t.symbol = $1
      `, [symbol.toUpperCase()]);

      if (result.rows.length === 0) {
        throw new Error('Token not found');
      }

      return this.formatTokenData(result.rows[0]);
    } catch (error) {
      logger.error('Get token by symbol error:', error);
      throw error;
    }
  }

  // Create new token
  async createToken(tokenData) {
    try {
      // Validate token data
      const { error, value } = tokenSchema.validate(tokenData);
      if (error) {
        throw new Error(`Validation error: ${error.details[0].message}`);
      }

      // Check if symbol already exists
      const existingToken = await db.query('SELECT id FROM tokens WHERE symbol = $1', [value.symbol.toUpperCase()]);
      if (existingToken.rows.length > 0) {
        throw new Error('Token symbol already exists');
      }

      // Prepare insert data
      const insertData = {
        ...value,
        symbol: value.symbol.toUpperCase(),
        tags: JSON.stringify(value.tags),
        default_trading_pairs: JSON.stringify(value.default_trading_pairs),
        metadata: JSON.stringify(value.metadata)
      };

      // Build insert query
      const columns = Object.keys(insertData);
      const values = Object.values(insertData);
      const placeholders = values.map((_, index) => `$${index + 1}`);

      const query = `
        INSERT INTO tokens (${columns.join(', ')})
        VALUES (${placeholders.join(', ')})
        RETURNING *
      `;

      const result = await db.query(query, values);
      const newToken = this.formatTokenData(result.rows[0]);

      // Add initial price if manual price provided
      if (value.manual_price && value.price_source === 'manual') {
        await this.updateTokenPrice(newToken.id, value.manual_price, 'manual');
      }

      logger.info(`Token created: ${newToken.symbol}`);
      return newToken;

    } catch (error) {
      logger.error('Create token error:', error);
      throw error;
    }
  }

  // Update token
  async updateToken(id, tokenData) {
    try {
      // Get existing token
      const existingToken = await this.getTokenById(id);
      
      // Validate update data (partial schema)
      const updateSchema = tokenSchema.fork(Object.keys(tokenData), (schema) => schema.optional());
      const { error, value } = updateSchema.validate(tokenData);
      if (error) {
        throw new Error(`Validation error: ${error.details[0].message}`);
      }

      // Check symbol uniqueness if being updated
      if (value.symbol && value.symbol.toUpperCase() !== existingToken.symbol) {
        const existingSymbol = await db.query('SELECT id FROM tokens WHERE symbol = $1 AND id != $2', 
          [value.symbol.toUpperCase(), id]);
        if (existingSymbol.rows.length > 0) {
          throw new Error('Token symbol already exists');
        }
      }

      // Prepare update data
      const updateData = { ...value };
      if (updateData.symbol) updateData.symbol = updateData.symbol.toUpperCase();
      if (updateData.tags) updateData.tags = JSON.stringify(updateData.tags);
      if (updateData.default_trading_pairs) updateData.default_trading_pairs = JSON.stringify(updateData.default_trading_pairs);
      if (updateData.metadata) updateData.metadata = JSON.stringify(updateData.metadata);

      // Add updated_at timestamp
      updateData.updated_at = new Date();

      // Build update query
      const columns = Object.keys(updateData);
      const values = Object.values(updateData);
      const setClauses = columns.map((col, index) => `${col} = $${index + 1}`);

      const query = `
        UPDATE tokens 
        SET ${setClauses.join(', ')}
        WHERE id = $${columns.length + 1}
        RETURNING *
      `;

      const result = await db.query(query, [...values, id]);
      if (result.rows.length === 0) {
        throw new Error('Token not found');
      }

      const updatedToken = this.formatTokenData(result.rows[0]);

      // Update price if manual price provided
      if (value.manual_price && value.price_source === 'manual') {
        await this.updateTokenPrice(id, value.manual_price, 'manual');
      }

      logger.info(`Token updated: ${updatedToken.symbol}`);
      return updatedToken;

    } catch (error) {
      logger.error('Update token error:', error);
      throw error;
    }
  }

  // Delete token
  async deleteToken(id) {
    try {
      // Check if token exists
      await this.getTokenById(id);

      // Soft delete by setting status to deprecated
      const result = await db.query(`
        UPDATE tokens 
        SET status = 'deprecated', is_visible = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `, [id]);

      if (result.rows.length === 0) {
        throw new Error('Token not found');
      }

      logger.info(`Token deleted: ${result.rows[0].symbol}`);
      return { success: true, message: 'Token deleted successfully' };

    } catch (error) {
      logger.error('Delete token error:', error);
      throw error;
    }
  }

  // Update token price
  async updateTokenPrice(tokenId, price, source = 'manual') {
    try {
      // Insert price history
      await db.query(`
        INSERT INTO token_price_history (token_id, price, source)
        VALUES ($1, $2, $3)
      `, [tokenId, price, source]);

      // Update manual price in tokens table if source is manual
      if (source === 'manual') {
        await db.query(`
          UPDATE tokens 
          SET manual_price = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [price, tokenId]);
      }

      logger.info(`Token price updated: ${tokenId} = ${price} (${source})`);
      return { success: true };

    } catch (error) {
      logger.error('Update token price error:', error);
      throw error;
    }
  }

  // Get token price history
  async getTokenPriceHistory(tokenId, limit = 100) {
    try {
      const result = await db.query(`
        SELECT price, source, timestamp
        FROM token_price_history
        WHERE token_id = $1
        ORDER BY timestamp DESC
        LIMIT $2
      `, [tokenId, limit]);

      return result.rows;
    } catch (error) {
      logger.error('Get token price history error:', error);
      throw error;
    }
  }

  // Bulk update token prices (for price feeds)
  async bulkUpdatePrices(priceUpdates) {
    try {
      const client = await db.connect();
      
      try {
        await client.query('BEGIN');

        for (const update of priceUpdates) {
          const { symbol, price, source = 'coingecko' } = update;
          
          // Get token ID by symbol
          const tokenResult = await client.query('SELECT id FROM tokens WHERE symbol = $1', [symbol.toUpperCase()]);
          if (tokenResult.rows.length > 0) {
            const tokenId = tokenResult.rows[0].id;
            
            // Insert price history
            await client.query(`
              INSERT INTO token_price_history (token_id, price, source)
              VALUES ($1, $2, $3)
            `, [tokenId, price, source]);
          }
        }

        await client.query('COMMIT');
        logger.info(`Bulk price update completed: ${priceUpdates.length} tokens`);
        return { success: true, updated: priceUpdates.length };

      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }

    } catch (error) {
      logger.error('Bulk update prices error:', error);
      throw error;
    }
  }

  // Get trading pairs
  async getTradingPairs() {
    try {
      const result = await db.query(`
        SELECT 
          t1.symbol as base_symbol,
          t2.symbol as quote_symbol,
          t1.name as base_name,
          t2.name as quote_name,
          CONCAT(t1.symbol, '/', t2.symbol) as pair
        FROM tokens t1
        CROSS JOIN tokens t2
        WHERE t1.trading_enabled = true 
          AND t2.trading_enabled = true
          AND t1.status = 'active'
          AND t2.status = 'active'
          AND t1.is_visible = true
          AND t2.is_visible = true
          AND t1.id != t2.id
        ORDER BY t1.sort_order, t2.sort_order
      `);

      return result.rows;
    } catch (error) {
      logger.error('Get trading pairs error:', error);
      throw error;
    }
  }

  // Format token data for response
  formatTokenData(row) {
    return {
      ...row,
      tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags,
      default_trading_pairs: typeof row.default_trading_pairs === 'string' ? JSON.parse(row.default_trading_pairs) : row.default_trading_pairs,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
      // Convert string numbers to numbers for easier frontend handling
      min_deposit: parseFloat(row.min_deposit || 0),
      max_deposit: parseFloat(row.max_deposit || 1000000),
      min_withdrawal: parseFloat(row.min_withdrawal || 0),
      max_withdrawal: parseFloat(row.max_withdrawal || 1000000),
      withdrawal_fee: parseFloat(row.withdrawal_fee || 0),
      manual_price: row.manual_price ? parseFloat(row.manual_price) : null,
      current_price: row.current_price ? parseFloat(row.current_price) : null
    };
  }

  // Validate smart contract
  async validateSmartContract(network, contractAddress, abi) {
    try {
      // This would integrate with blockchain APIs to validate contracts
      // For now, return a basic validation
      
      if (!contractAddress) {
        throw new Error('Contract address required');
      }

      // Basic address format validation
      switch (network.toLowerCase()) {
        case 'ethereum':
        case 'avalanche':
        case 'bsc':
          if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
            throw new Error('Invalid EVM contract address format');
          }
          break;
        case 'solana':
          if (contractAddress.length < 32 || contractAddress.length > 44) {
            throw new Error('Invalid Solana contract address format');
          }
          break;
      }

      return {
        valid: true,
        contractAddress,
        network,
        verified: false // Would check with blockchain explorers
      };

    } catch (error) {
      logger.error('Smart contract validation error:', error);
      return {
        valid: false,
        error: error.message
      };
    }
  }
}

module.exports = new TokenManager();