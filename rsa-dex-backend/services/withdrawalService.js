// Withdrawal Service for Cross-Chain Withdrawals
// Manages withdrawal requests, token burning, and cross-chain transfers

const winston = require('winston');
const alchemyService = require('./alchemyService');
const tokenManager = require('./tokenManager');
const sqliteDb = require('./sqliteDb');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()]
});

// Use SQLite database
const db = sqliteDb;

class WithdrawalService {
  constructor() {
    this.processingQueue = new Map();
    this.isProcessing = false;
  }

  // Validate withdrawal request
  async validateWithdrawal(userId, network, token, amount, toAddress) {
    try {
      // Basic input validation
      if (!userId || !network || !token || !amount || !toAddress) {
        return { valid: false, error: 'Missing required fields' };
      }

      // Validate amount
      const withdrawalAmount = parseFloat(amount);
      if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
        return { valid: false, error: 'Invalid withdrawal amount' };
      }

      // Get token information
      let tokenInfo;
      try {
        tokenInfo = await tokenManager.getTokenBySymbol(token);
      } catch (error) {
        return { valid: false, error: 'Token not found' };
      }

      // Check if withdrawals are enabled for this token
      if (!tokenInfo.withdrawal_enabled) {
        return { valid: false, error: 'Withdrawals disabled for this token' };
      }

      // Check minimum/maximum withdrawal limits
      if (withdrawalAmount < tokenInfo.min_withdrawal) {
        return { valid: false, error: `Minimum withdrawal amount is ${tokenInfo.min_withdrawal} ${token}` };
      }

      if (withdrawalAmount > tokenInfo.max_withdrawal) {
        return { valid: false, error: `Maximum withdrawal amount is ${tokenInfo.max_withdrawal} ${token}` };
      }

      // Validate network
      const supportedNetworks = ['ethereum', 'solana', 'avalanche', 'bsc', 'bitcoin'];
      if (!supportedNetworks.includes(network.toLowerCase())) {
        return { valid: false, error: 'Unsupported network' };
      }

      // Validate destination address format
      const addressValidation = this.validateAddress(network, toAddress);
      if (!addressValidation.valid) {
        return { valid: false, error: addressValidation.error };
      }

      // Check user balance (mock check - in production, check actual wallet balance)
      const userBalance = await this.getUserBalance(userId, token);
      const totalWithdrawal = withdrawalAmount + parseFloat(tokenInfo.withdrawal_fee);

      if (userBalance < totalWithdrawal) {
        return { valid: false, error: 'Insufficient balance' };
      }

      // Check for recent withdrawal limits (anti-spam)
      const recentWithdrawals = await this.getRecentWithdrawals(userId, '1h');
      const recentAmount = recentWithdrawals.reduce((sum, w) => sum + parseFloat(w.amount), 0);
      const hourlyLimit = 10000; // Example limit

      if (recentAmount + withdrawalAmount > hourlyLimit) {
        return { valid: false, error: 'Hourly withdrawal limit exceeded' };
      }

      return { 
        valid: true, 
        tokenInfo,
        withdrawalAmount,
        fee: parseFloat(tokenInfo.withdrawal_fee),
        totalAmount: totalWithdrawal
      };

    } catch (error) {
      logger.error('Withdrawal validation error:', error);
      return { valid: false, error: 'Validation failed' };
    }
  }

  // Validate address format for specific networks
  validateAddress(network, address) {
    try {
      switch (network.toLowerCase()) {
        case 'ethereum':
        case 'avalanche':
        case 'bsc':
          // EVM address validation
          if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
            return { valid: false, error: 'Invalid EVM address format' };
          }
          break;

        case 'solana':
          // Solana address validation
          if (address.length < 32 || address.length > 44) {
            return { valid: false, error: 'Invalid Solana address format' };
          }
          break;

        case 'bitcoin':
          // Bitcoin address validation (simplified)
          if (!address.startsWith('bc1') && !address.startsWith('1') && !address.startsWith('3')) {
            return { valid: false, error: 'Invalid Bitcoin address format' };
          }
          break;

        default:
          return { valid: false, error: 'Unsupported network' };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: 'Address validation failed' };
    }
  }

  // Get user balance (mock implementation)
  async getUserBalance(userId, token) {
    try {
      // In production, this would query the user's actual wallet balance
      // For now, return a mock balance
      const mockBalances = {
        'rBTC': 1.5,
        'rETH': 10.0,
        'rSOL': 100.0,
        'rAVAX': 50.0,
        'rBNB': 25.0,
        'rUSDT': 5000.0,
        'rUSDC': 3000.0,
        'RSA': 10000.0
      };

      return mockBalances[token] || 0;
    } catch (error) {
      logger.error('Get user balance error:', error);
      return 0;
    }
  }

  // Get recent withdrawals for user
  async getRecentWithdrawals(userId, timeframe = '24h') {
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
        default:
          timeCondition = "created_at > NOW() - INTERVAL '24 hours'";
      }

      const result = await db.query(`
        SELECT * FROM withdrawals
        WHERE user_id = $1 AND ${timeCondition}
        ORDER BY created_at DESC
      `, [userId]);

      return result.rows.map(this.formatWithdrawalData);
    } catch (error) {
      logger.error('Get recent withdrawals error:', error);
      return [];
    }
  }

  // Create withdrawal request
  async createWithdrawal(withdrawalData) {
    try {
      const {
        userId,
        network,
        token,
        amount,
        toAddress,
        status = 'pending'
      } = withdrawalData;

      // Insert withdrawal record
      const result = await db.query(`
        INSERT INTO withdrawals (
          user_id, network, to_address, amount, token_symbol, status
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [userId, network, toAddress, amount, token, status]);

      const withdrawal = this.formatWithdrawalData(result.rows[0]);

      logger.info(`Withdrawal created: ${withdrawal.id} - ${amount} ${token} to ${network}`);

      // Add to processing queue
      this.processingQueue.set(withdrawal.id, withdrawal);

      // Notify user
      if (global.broadcastToUser) {
        global.broadcastToUser(userId, {
          type: 'withdrawal_created',
          withdrawal: {
            id: withdrawal.id,
            network,
            token,
            amount: parseFloat(amount),
            toAddress,
            status: 'pending'
          }
        });
      }

      return withdrawal;
    } catch (error) {
      logger.error('Create withdrawal error:', error);
      throw error;
    }
  }

  // Get user withdrawals
  async getUserWithdrawals(userId, limit = 50, offset = 0) {
    try {
      const result = await db.query(`
        SELECT 
          w.*,
          wt.original_network,
          wt.contract_address as wrapped_contract
        FROM withdrawals w
        LEFT JOIN wrapped_token_contracts wt ON wt.symbol = w.token_symbol
        WHERE w.user_id = $1
        ORDER BY w.created_at DESC
        LIMIT $2 OFFSET $3
      `, [userId, limit, offset]);

      return result.rows.map(this.formatWithdrawalData);
    } catch (error) {
      logger.error('Get user withdrawals error:', error);
      throw error;
    }
  }

  // Get all withdrawals (admin view)
  async getAllWithdrawals(limit = 100, offset = 0, status = null) {
    try {
      let query = `
        SELECT 
          w.*,
          u.email as user_email,
          u.username as username,
          wt.original_network,
          wt.contract_address as wrapped_contract
        FROM withdrawals w
        LEFT JOIN users u ON w.user_id = u.id
        LEFT JOIN wrapped_token_contracts wt ON wt.symbol = w.token_symbol
      `;

      const params = [];
      let paramCount = 0;

      if (status) {
        query += ` WHERE w.status = $${++paramCount}`;
        params.push(status);
      }

      query += ` ORDER BY w.created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
      params.push(limit, offset);

      const result = await db.query(query, params);
      return result.rows.map(this.formatWithdrawalData);
    } catch (error) {
      logger.error('Get all withdrawals error:', error);
      throw error;
    }
  }

  // Process pending withdrawals
  async processPendingWithdrawals() {
    if (this.isProcessing) {
      return; // Already processing
    }

    this.isProcessing = true;

    try {
      logger.info('Processing pending withdrawals...');

      // Get pending withdrawals
      const pendingWithdrawals = await db.query(`
        SELECT * FROM withdrawals
        WHERE status = 'pending'
          AND created_at < NOW() - INTERVAL '1 minute'
        ORDER BY created_at ASC
        LIMIT 10
      `);

      for (const withdrawal of pendingWithdrawals.rows) {
        await this.processWithdrawal(withdrawal.id);
      }

      logger.info(`Processed ${pendingWithdrawals.rows.length} pending withdrawals`);

    } catch (error) {
      logger.error('Process pending withdrawals error:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  // Process individual withdrawal
  async processWithdrawal(withdrawalId) {
    try {
      // Get withdrawal details
      const withdrawalResult = await db.query(
        'SELECT * FROM withdrawals WHERE id = $1',
        [withdrawalId]
      );

      if (withdrawalResult.rows.length === 0) {
        throw new Error('Withdrawal not found');
      }

      const withdrawal = withdrawalResult.rows[0];

      if (withdrawal.status !== 'pending') {
        logger.info(`Withdrawal ${withdrawalId} already processed (${withdrawal.status})`);
        return;
      }

      logger.info(`Processing withdrawal ${withdrawalId}: ${withdrawal.amount} ${withdrawal.token_symbol} to ${withdrawal.network}`);

      // Step 1: Burn wrapped tokens
      await this.burnWrappedTokens(withdrawal);

      // Step 2: Send native tokens
      await this.sendNativeTokens(withdrawal);

      // Step 3: Update withdrawal status
      await db.query(`
        UPDATE withdrawals 
        SET status = 'completed', sent_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [withdrawalId]);

      logger.info(`Withdrawal ${withdrawalId} completed successfully`);

      // Notify user
      if (global.broadcastToUser) {
        global.broadcastToUser(withdrawal.user_id, {
          type: 'withdrawal_completed',
          withdrawal: {
            id: withdrawalId,
            network: withdrawal.network,
            token: withdrawal.token_symbol,
            amount: parseFloat(withdrawal.amount),
            status: 'completed'
          }
        });
      }

      // Remove from processing queue
      this.processingQueue.delete(withdrawalId);

    } catch (error) {
      logger.error(`Process withdrawal ${withdrawalId} error:`, error);

      // Update withdrawal status to failed
      await db.query(`
        UPDATE withdrawals 
        SET status = 'failed',
            metadata = metadata || '{"error": "${error.message}", "failed_at": "${new Date().toISOString()}"}'::jsonb
        WHERE id = $1
      `, [withdrawalId]);

      // Notify user of failure
      if (global.broadcastToUser) {
        const withdrawal = await db.query('SELECT user_id FROM withdrawals WHERE id = $1', [withdrawalId]);
        if (withdrawal.rows.length > 0) {
          global.broadcastToUser(withdrawal.rows[0].user_id, {
            type: 'withdrawal_failed',
            withdrawal: {
              id: withdrawalId,
              error: error.message,
              status: 'failed'
            }
          });
        }
      }
    }
  }

  // Burn wrapped tokens
  async burnWrappedTokens(withdrawal) {
    try {
      const burnAmount = parseFloat(withdrawal.amount);

      // Update wrapped token contract supply
      await db.query(`
        UPDATE wrapped_token_contracts 
        SET total_supply = total_supply - $1,
            total_burned = total_burned + $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE symbol = $2
      `, [burnAmount, withdrawal.token_symbol]);

      // Update withdrawal record
      await db.query(`
        UPDATE withdrawals 
        SET wrapped_token_burned = true,
            burned_amount = $1,
            burned_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [burnAmount, withdrawal.id]);

      // In a real implementation, you would:
      // 1. Call the RSA smart contract to burn tokens
      // 2. Debit the user's wallet balance
      // 3. Update the RSA blockchain state

      logger.info(`Burned ${burnAmount} ${withdrawal.token_symbol} for withdrawal ${withdrawal.id}`);

    } catch (error) {
      logger.error('Burn wrapped tokens error:', error);
      throw error;
    }
  }

  // Send native tokens to external network
  async sendNativeTokens(withdrawal) {
    try {
      const network = withdrawal.network;
      const amount = parseFloat(withdrawal.amount);
      const toAddress = withdrawal.to_address;

      // Get original token symbol (remove 'r' prefix)
      const originalToken = withdrawal.token_symbol.startsWith('r') 
        ? withdrawal.token_symbol.substring(1) 
        : withdrawal.token_symbol;

      // Get user's deposit address for this network (to send from)
      const fromAddressResult = await db.query(`
        SELECT address, encrypted_private_key FROM user_deposit_addresses
        WHERE user_id = $1 AND network = $2 AND is_active = true
      `, [withdrawal.user_id, network]);

      if (fromAddressResult.rows.length === 0) {
        throw new Error(`No ${network} address found for user`);
      }

      const fromAddress = fromAddressResult.rows[0].address;
      const privateKey = fromAddressResult.rows[0].encrypted_private_key; // Should be decrypted in production

      // Send transaction via Alchemy
      const txResult = await alchemyService.sendTransaction(network, {
        from: fromAddress,
        to: toAddress,
        value: amount,
        privateKey: privateKey // In production, decrypt this first
      });

      // Update withdrawal with transaction hash
      await db.query(`
        UPDATE withdrawals 
        SET tx_hash = $1,
            metadata = metadata || '{"sent_tx": "${txResult.hash}"}'::jsonb
        WHERE id = $2
      `, [txResult.hash, withdrawal.id]);

      logger.info(`Sent ${amount} ${originalToken} to ${toAddress} on ${network}, tx: ${txResult.hash}`);

    } catch (error) {
      logger.error('Send native tokens error:', error);
      throw error;
    }
  }

  // Get withdrawal statistics
  async getWithdrawalStatistics(timeframe = '24h') {
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
        FROM withdrawals
        WHERE ${timeCondition}
        GROUP BY network, token_symbol, status
        ORDER BY network, token_symbol, status
      `);

      // Also get overall statistics
      const overallResult = await db.query(`
        SELECT 
          COUNT(*) as total_withdrawals,
          COUNT(DISTINCT user_id) as unique_users,
          SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as completed_amount,
          SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount,
          SUM(CASE WHEN status = 'failed' THEN amount ELSE 0 END) as failed_amount,
          AVG(CASE WHEN status = 'completed' THEN 
            EXTRACT(EPOCH FROM (sent_at - created_at))/60 
            ELSE NULL END) as avg_processing_time_minutes
        FROM withdrawals
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
          total_withdrawals: parseInt(overallResult.rows[0].total_withdrawals),
          unique_users: parseInt(overallResult.rows[0].unique_users),
          completed_amount: parseFloat(overallResult.rows[0].completed_amount || 0),
          pending_amount: parseFloat(overallResult.rows[0].pending_amount || 0),
          failed_amount: parseFloat(overallResult.rows[0].failed_amount || 0),
          avg_processing_time_minutes: parseFloat(overallResult.rows[0].avg_processing_time_minutes || 0)
        }
      };

    } catch (error) {
      logger.error('Get withdrawal statistics error:', error);
      throw error;
    }
  }

  // Cancel withdrawal (if still pending)
  async cancelWithdrawal(withdrawalId, userId) {
    try {
      const withdrawal = await db.query(
        'SELECT * FROM withdrawals WHERE id = $1 AND user_id = $2',
        [withdrawalId, userId]
      );

      if (withdrawal.rows.length === 0) {
        throw new Error('Withdrawal not found');
      }

      const withdrawalData = withdrawal.rows[0];

      if (withdrawalData.status !== 'pending') {
        throw new Error('Can only cancel pending withdrawals');
      }

      // Update withdrawal status
      await db.query(`
        UPDATE withdrawals 
        SET status = 'cancelled',
            metadata = metadata || '{"cancelled_at": "${new Date().toISOString()}", "cancelled_by_user": true}'::jsonb
        WHERE id = $1
      `, [withdrawalId]);

      // Remove from processing queue
      this.processingQueue.delete(withdrawalId);

      logger.info(`Withdrawal ${withdrawalId} cancelled by user ${userId}`);

      return { success: true, message: 'Withdrawal cancelled successfully' };

    } catch (error) {
      logger.error('Cancel withdrawal error:', error);
      throw error;
    }
  }

  // Format withdrawal data for response
  formatWithdrawalData(row) {
    return {
      ...row,
      amount: parseFloat(row.amount),
      burned_amount: row.burned_amount ? parseFloat(row.burned_amount) : null,
      fee: row.fee ? parseFloat(row.fee) : 0,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata
    };
  }
}

module.exports = new WithdrawalService();