// Deposit Service for Cross-Chain Deposits
// Manages deposit detection, confirmation, and wrapped token minting

const winston = require('winston');
const alchemyService = require('./alchemyService');
const crossChainService = require('./crossChainService');
const sqliteDb = require('./sqliteDb');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()]
});

// Use SQLite database
const db = sqliteDb;

class DepositService {
  constructor() {
    this.lastCheckedBlocks = new Map();
    this.isMonitoring = false;
  }

  // Get user deposit addresses
  async getUserDepositAddresses(userId) {
    try {
      return await crossChainService.getUserDepositAddresses(userId);
    } catch (error) {
      logger.error('Get user deposit addresses error:', error);
      throw error;
    }
  }

  // Get user deposits
  async getUserDeposits(userId, limit = 50, offset = 0) {
    try {
      const result = await db.query(`
        SELECT 
          d.*,
          wt.symbol as wrapped_symbol,
          wt.contract_address as wrapped_contract
        FROM deposits d
        LEFT JOIN wrapped_token_contracts wt ON wt.symbol = CONCAT('r', d.token_symbol)
        WHERE d.user_id = $1
        ORDER BY d.created_at DESC
        LIMIT $2 OFFSET $3
      `, [userId, limit, offset]);

      return result.rows.map(this.formatDepositData);
    } catch (error) {
      logger.error('Get user deposits error:', error);
      throw error;
    }
  }

  // Get all deposits (admin view)
  async getAllDeposits(limit = 100, offset = 0, status = null) {
    try {
      let query = `
        SELECT 
          d.*,
          u.email as user_email,
          u.username as username,
          wt.symbol as wrapped_symbol,
          wt.contract_address as wrapped_contract
        FROM deposits d
        LEFT JOIN users u ON d.user_id = u.id
        LEFT JOIN wrapped_token_contracts wt ON wt.symbol = CONCAT('r', d.token_symbol)
      `;

      const params = [];
      let paramCount = 0;

      if (status) {
        query += ` WHERE d.status = $${++paramCount}`;
        params.push(status);
      }

      query += ` ORDER BY d.created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
      params.push(limit, offset);

      const result = await db.query(query, params);
      return result.rows.map(this.formatDepositData);
    } catch (error) {
      logger.error('Get all deposits error:', error);
      throw error;
    }
  }

  // Get deposit by ID
  async getDepositById(depositId) {
    try {
      const result = await db.query(`
        SELECT 
          d.*,
          u.email as user_email,
          u.username as username,
          wt.symbol as wrapped_symbol,
          wt.contract_address as wrapped_contract
        FROM deposits d
        LEFT JOIN users u ON d.user_id = u.id
        LEFT JOIN wrapped_token_contracts wt ON wt.symbol = CONCAT('r', d.token_symbol)
        WHERE d.id = $1
      `, [depositId]);

      if (result.rows.length === 0) {
        throw new Error('Deposit not found');
      }

      return this.formatDepositData(result.rows[0]);
    } catch (error) {
      logger.error('Get deposit by ID error:', error);
      throw error;
    }
  }

  // Monitor deposits across all networks
  async monitorDeposits() {
    if (this.isMonitoring) {
      return; // Already monitoring
    }

    this.isMonitoring = true;

    try {
      logger.info('Starting deposit monitoring across all networks...');

      // Get all active user deposit addresses
      const addressesResult = await db.query(`
        SELECT DISTINCT user_id, network, address
        FROM user_deposit_addresses
        WHERE is_active = true
      `);

      const addressesByNetwork = {};
      addressesResult.rows.forEach(row => {
        if (!addressesByNetwork[row.network]) {
          addressesByNetwork[row.network] = [];
        }
        addressesByNetwork[row.network].push({
          userId: row.user_id,
          address: row.address
        });
      });

      // Monitor each network
      for (const [network, addresses] of Object.entries(addressesByNetwork)) {
        await this.monitorNetworkDeposits(network, addresses);
      }

      logger.info(`Monitoring ${Object.keys(addressesByNetwork).length} networks with ${addressesResult.rows.length} addresses`);

    } catch (error) {
      logger.error('Monitor deposits error:', error);
    } finally {
      this.isMonitoring = false;
    }
  }

  // Monitor deposits for a specific network
  async monitorNetworkDeposits(network, addresses) {
    try {
      const networkConfig = alchemyService.getNetwork(network);
      if (!networkConfig) {
        logger.warn(`Network not supported: ${network}`);
        return;
      }

      // Check each address for new transactions
      for (const { userId, address } of addresses) {
        await this.checkAddressForDeposits(userId, network, address);
      }

    } catch (error) {
      logger.error(`Monitor network deposits error for ${network}:`, error);
    }
  }

  // Check specific address for deposits
  async checkAddressForDeposits(userId, network, address) {
    try {
      // Get current balance
      const balanceData = await alchemyService.getBalance(network, address);
      const currentBalance = parseFloat(balanceData.balance);

      // Get last known balance from database
      const lastBalanceResult = await db.query(`
        SELECT amount FROM deposits 
        WHERE user_id = $1 AND network = $2 AND to_address = $3 
        ORDER BY created_at DESC LIMIT 1
      `, [userId, network, address]);

      const lastBalance = lastBalanceResult.rows.length > 0 
        ? parseFloat(lastBalanceResult.rows[0].amount) 
        : 0;

      // Check if balance increased (indicating a deposit)
      if (currentBalance > lastBalance) {
        const depositAmount = currentBalance - lastBalance;
        
        logger.info(`Potential deposit detected: ${depositAmount} ${balanceData.symbol} to ${address} on ${network}`);

        // Create mock deposit record for detected balance increase
        await this.createDepositFromBalanceChange(userId, network, address, depositAmount, balanceData.symbol);
      }

    } catch (error) {
      logger.error(`Check address deposits error for ${address} on ${network}:`, error);
    }
  }

  // Create deposit from balance change
  async createDepositFromBalanceChange(userId, network, address, amount, tokenSymbol) {
    try {
      // Generate a mock transaction hash (in production, you'd get this from blockchain)
      const txHash = `detected_${network}_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const depositData = {
        userId,
        network,
        fromAddress: 'unknown_sender', // In production, parse from actual transaction
        toAddress: address,
        txHash,
        amount,
        tokenSymbol,
        requiredConfirmations: this.getRequiredConfirmations(network)
      };

      // Check if we already processed this amount recently (avoid duplicates)
      const recentDeposit = await db.query(`
        SELECT id FROM deposits 
        WHERE user_id = $1 AND network = $2 AND to_address = $3 
          AND amount = $4 AND created_at > NOW() - INTERVAL '5 minutes'
      `, [userId, network, address, amount]);

      if (recentDeposit.rows.length > 0) {
        logger.info(`Duplicate deposit detected, skipping: ${txHash}`);
        return;
      }

      // Process the deposit
      await crossChainService.processDeposit(depositData);

    } catch (error) {
      logger.error('Create deposit from balance change error:', error);
    }
  }

  // Process deposit confirmation via webhook
  async processDepositConfirmation(network, txHash, confirmations) {
    try {
      // Find deposit by transaction hash
      const depositResult = await db.query(
        'SELECT * FROM deposits WHERE tx_hash = $1 AND network = $2',
        [txHash, network]
      );

      if (depositResult.rows.length === 0) {
        logger.warn(`Deposit not found for tx: ${txHash} on ${network}`);
        return;
      }

      const deposit = depositResult.rows[0];

      // Update confirmations
      await db.query(`
        UPDATE deposits 
        SET confirmations = $1
        WHERE id = $2
      `, [confirmations, deposit.id]);

      logger.info(`Updated confirmations for deposit ${deposit.id}: ${confirmations}/${deposit.required_confirmations}`);

      // Check if deposit should be confirmed
      if (confirmations >= deposit.required_confirmations && deposit.status === 'pending') {
        await crossChainService.confirmDeposit(deposit.id);
      }

      // Notify user of confirmation progress
      if (global.broadcastToUser) {
        global.broadcastToUser(deposit.user_id, {
          type: 'deposit_confirmation_update',
          deposit: {
            id: deposit.id,
            txHash,
            network,
            confirmations,
            requiredConfirmations: deposit.required_confirmations,
            status: confirmations >= deposit.required_confirmations ? 'confirmed' : 'pending'
          }
        });
      }

    } catch (error) {
      logger.error('Process deposit confirmation error:', error);
    }
  }

  // Get deposit status by transaction hash
  async getDepositStatus(txHash) {
    try {
      const result = await db.query(`
        SELECT 
          tx_hash,
          confirmations,
          required_confirmations,
          status,
          amount,
          token_symbol,
          network,
          wrapped_amount
        FROM deposits 
        WHERE tx_hash = $1
      `, [txHash]);

      if (result.rows.length === 0) {
        return null;
      }

      const deposit = result.rows[0];
      
      return {
        txHash: deposit.tx_hash,
        confirmations: deposit.confirmations || 0,
        requiredConfirmations: deposit.required_confirmations,
        status: deposit.status,
        amount: parseFloat(deposit.amount),
        wrappedAmount: deposit.wrapped_amount ? parseFloat(deposit.wrapped_amount) : null
      };

    } catch (error) {
      logger.error('Get deposit status error:', error);
      throw error;
    }
  }

  // Get deposit statistics
  async getDepositStatistics(timeframe = '24h') {
    try {
      let timeCondition;
      switch (timeframe) {
        case '1h':
          timeCondition = "created_at > NOW() - INTERVAL '1 hour'";
          break;
        case '24h':
          timeCondition = "created_at > NOW() - INTERVAL '24 hours'";
          break;
        case '7d':
          timeCondition = "created_at > NOW() - INTERVAL '7 days'";
          break;
        case '30d':
          timeCondition = "created_at > NOW() - INTERVAL '30 days'";
          break;
        default:
          timeCondition = "created_at > NOW() - INTERVAL '24 hours'";
      }

      const result = await db.query(`
        SELECT 
          network,
          token_symbol,
          status,
          COUNT(*) as count,
          SUM(amount) as total_amount,
          AVG(amount) as avg_amount,
          MIN(amount) as min_amount,
          MAX(amount) as max_amount
        FROM deposits
        WHERE ${timeCondition}
        GROUP BY network, token_symbol, status
        ORDER BY network, token_symbol, status
      `);

      // Also get overall statistics
      const overallResult = await db.query(`
        SELECT 
          COUNT(*) as total_deposits,
          COUNT(DISTINCT user_id) as unique_users,
          SUM(CASE WHEN status = 'confirmed' THEN amount ELSE 0 END) as confirmed_amount,
          SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount,
          AVG(CASE WHEN status = 'confirmed' THEN 
            EXTRACT(EPOCH FROM (confirmed_at - created_at))/60 
            ELSE NULL END) as avg_confirmation_time_minutes
        FROM deposits
        WHERE ${timeCondition}
      `);

      return {
        timeframe,
        byNetwork: result.rows.map(row => ({
          ...row,
          count: parseInt(row.count),
          total_amount: parseFloat(row.total_amount || 0),
          avg_amount: parseFloat(row.avg_amount || 0),
          min_amount: parseFloat(row.min_amount || 0),
          max_amount: parseFloat(row.max_amount || 0)
        })),
        overall: {
          total_deposits: parseInt(overallResult.rows[0].total_deposits),
          unique_users: parseInt(overallResult.rows[0].unique_users),
          confirmed_amount: parseFloat(overallResult.rows[0].confirmed_amount || 0),
          pending_amount: parseFloat(overallResult.rows[0].pending_amount || 0),
          avg_confirmation_time_minutes: parseFloat(overallResult.rows[0].avg_confirmation_time_minutes || 0)
        }
      };

    } catch (error) {
      logger.error('Get deposit statistics error:', error);
      throw error;
    }
  }

  // Get pending deposits requiring attention
  async getPendingDeposits() {
    try {
      const result = await db.query(`
        SELECT 
          d.*,
          u.email as user_email,
          u.username as username,
          (EXTRACT(EPOCH FROM (NOW() - d.created_at))/3600) as hours_pending
        FROM deposits d
        LEFT JOIN users u ON d.user_id = u.id
        WHERE d.status = 'pending'
          AND d.created_at < NOW() - INTERVAL '1 hour'
        ORDER BY d.created_at ASC
      `);

      return result.rows.map(row => ({
        ...this.formatDepositData(row),
        hours_pending: parseFloat(row.hours_pending)
      }));

    } catch (error) {
      logger.error('Get pending deposits error:', error);
      throw error;
    }
  }

  // Manually confirm a deposit (admin function)
  async manuallyConfirmDeposit(depositId, adminUserId) {
    try {
      const deposit = await this.getDepositById(depositId);

      if (deposit.status === 'confirmed') {
        throw new Error('Deposit already confirmed');
      }

      // Update deposit status
      await db.query(`
        UPDATE deposits 
        SET status = 'confirmed', 
            confirmed_at = CURRENT_TIMESTAMP,
            metadata = metadata || '{"manually_confirmed": true, "confirmed_by": "${adminUserId}"}'::jsonb
        WHERE id = $1
      `, [depositId]);

      // Mint wrapped tokens
      await crossChainService.confirmDeposit(depositId);

      logger.info(`Deposit ${depositId} manually confirmed by admin ${adminUserId}`);

      return { success: true, message: 'Deposit confirmed successfully' };

    } catch (error) {
      logger.error('Manually confirm deposit error:', error);
      throw error;
    }
  }

  // Get required confirmations for network
  getRequiredConfirmations(network) {
    const confirmations = {
      'bitcoin': 3,
      'ethereum': 12,
      'solana': 32,
      'avalanche': 12,
      'bsc': 12
    };

    return confirmations[network] || 12;
  }

  // Format deposit data for response
  formatDepositData(row) {
    return {
      ...row,
      amount: parseFloat(row.amount),
      wrapped_amount: row.wrapped_amount ? parseFloat(row.wrapped_amount) : null,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata
    };
  }

  // Get deposit by transaction hash
  async getDepositByTxHash(txHash) {
    try {
      const result = await db.query(`
        SELECT 
          d.*,
          u.email as user_email,
          u.username as username,
          wt.symbol as wrapped_symbol
        FROM deposits d
        LEFT JOIN users u ON d.user_id = u.id
        LEFT JOIN wrapped_token_contracts wt ON wt.symbol = CONCAT('r', d.token_symbol)
        WHERE d.tx_hash = $1
      `, [txHash]);

      if (result.rows.length === 0) {
        throw new Error('Deposit not found');
      }

      return this.formatDepositData(result.rows[0]);
    } catch (error) {
      logger.error('Get deposit by tx hash error:', error);
      throw error;
    }
  }

  // Retry failed deposit
  async retryDeposit(depositId) {
    try {
      const deposit = await this.getDepositById(depositId);

      if (deposit.status === 'confirmed') {
        throw new Error('Deposit already confirmed');
      }

      // Reset deposit status and retry processing
      await db.query(`
        UPDATE deposits 
        SET status = 'pending',
            confirmations = 0,
            metadata = metadata || '{"retried": true, "retry_timestamp": "${new Date().toISOString()}"}'::jsonb
        WHERE id = $1
      `, [depositId]);

      // Start monitoring confirmations again
      crossChainService.monitorDepositConfirmations(depositId, deposit.network, deposit.tx_hash);

      logger.info(`Deposit ${depositId} retry initiated`);

      return { success: true, message: 'Deposit retry initiated' };

    } catch (error) {
      logger.error('Retry deposit error:', error);
      throw error;
    }
  }
}

module.exports = new DepositService();