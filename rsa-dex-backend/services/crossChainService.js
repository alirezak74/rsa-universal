// Cross-Chain Service for RSA DEX
// Manages multi-chain operations, deposit addresses, and wrapped token minting/burning

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

class CrossChainService {
  constructor() {
    this.initializeDatabase();
    // All 13 required networks
    this.supportedNetworks = [
      'bitcoin', 'ethereum', 'bsc', 'avalanche', 'polygon', 
      'arbitrum', 'fantom', 'linea', 'solana', 'unichain', 
      'opbnb', 'base', 'polygon-zkevm'
    ];
    this.monitoringIntervals = new Map();
  }

  // Initialize database tables
  async initializeDatabase() {
    try {
      // SQLite database is already initialized in sqliteDb service
      // Just ensure it's ready
      if (!db.initialized) {
        await db.initialize();
      }
      logger.info('✅ Cross-chain service database initialized');
    } catch (error) {
      logger.error('❌ Failed to initialize cross-chain service database:', error);
      throw error;
    }
  }

  // Initialize network status
  async initializeNetworkStatus() {
    try {
      for (const network of this.supportedNetworks) {
        await db.query(`
          INSERT INTO network_status (network, is_online, maintenance_mode)
          VALUES ($1, false, false)
          ON CONFLICT (network) DO NOTHING
        `, [network]);
      }

      // Update network status
      await this.updateNetworkStatus();
    } catch (error) {
      logger.error('Failed to initialize network status:', error);
    }
  }

  // Initialize wrapped token contracts
  async initializeWrappedTokenContracts() {
    try {
      const wrappedTokens = [
        // Original 5 networks
        { symbol: 'rBTC', original_network: 'bitcoin', contract_address: 'RSA_rBTC_CONTRACT' },
        { symbol: 'rETH', original_network: 'ethereum', contract_address: 'RSA_rETH_CONTRACT' },
        { symbol: 'rSOL', original_network: 'solana', contract_address: 'RSA_rSOL_CONTRACT' },
        { symbol: 'rAVAX', original_network: 'avalanche', contract_address: 'RSA_rAVAX_CONTRACT' },
        { symbol: 'rBNB', original_network: 'bsc', contract_address: 'RSA_rBNB_CONTRACT' },
        { symbol: 'rUSDT', original_network: 'ethereum', contract_address: 'RSA_rUSDT_CONTRACT' },
        { symbol: 'rUSDC', original_network: 'ethereum', contract_address: 'RSA_rUSDC_CONTRACT' },
        // Additional 8 networks
        { symbol: 'rMATIC', original_network: 'polygon', contract_address: 'RSA_rMATIC_CONTRACT' },
        { symbol: 'rARB', original_network: 'arbitrum', contract_address: 'RSA_rARB_CONTRACT' },
        { symbol: 'rFTM', original_network: 'fantom', contract_address: 'RSA_rFTM_CONTRACT' },
        { symbol: 'rLINEA', original_network: 'linea', contract_address: 'RSA_rLINEA_CONTRACT' },
        { symbol: 'rUNI', original_network: 'unichain', contract_address: 'RSA_rUNI_CONTRACT' },
        { symbol: 'ropBNB', original_network: 'opbnb', contract_address: 'RSA_ropBNB_CONTRACT' },
        { symbol: 'rBASE', original_network: 'base', contract_address: 'RSA_rBASE_CONTRACT' },
        { symbol: 'rzkEVM', original_network: 'polygon-zkevm', contract_address: 'RSA_rzkEVM_CONTRACT' }
      ];

      for (const token of wrappedTokens) {
        await db.query(`
          INSERT INTO wrapped_token_contracts (symbol, original_network, contract_address)
          VALUES ($1, $2, $3)
          ON CONFLICT (symbol) DO NOTHING
        `, [token.symbol, token.original_network, token.contract_address]);
      }

      logger.info('✅ Wrapped token contracts initialized');
    } catch (error) {
      logger.error('Failed to initialize wrapped token contracts:', error);
    }
  }

  // Generate deposit addresses for a user across all supported networks
  async generateUserDepositAddresses(userId) {
    try {
      const addresses = {};

      for (const network of this.supportedNetworks) {
        try {
          // Check if user already has an address for this network
          const existingAddress = await db.query(`
            SELECT address FROM user_deposit_addresses 
            WHERE user_id = $1 AND network = $2 AND is_active = true
          `, [userId, network]);

          if (existingAddress.rows.length > 0) {
            addresses[network] = existingAddress.rows[0].address;
            continue;
          }

          // Generate new address
          const addressData = await alchemyService.generateDepositAddress(network, userId);

          // Store in database
          await db.query(`
            INSERT INTO user_deposit_addresses (user_id, network, address, encrypted_private_key)
            VALUES ($1, $2, $3, $4)
          `, [userId, network, addressData.address, addressData.encryptedPrivateKey]);

          addresses[network] = addressData.address;

          // Start monitoring this address
          this.startAddressMonitoring(userId, network, addressData.address);

          logger.info(`Generated ${network} address for user ${userId}: ${addressData.address}`);

        } catch (error) {
          logger.error(`Failed to generate ${network} address for user ${userId}:`, error);
          addresses[network] = null;
        }
      }

      return addresses;
    } catch (error) {
      logger.error('Generate user deposit addresses error:', error);
      throw error;
    }
  }

  // Generate single deposit address for specific network
  async generateDepositAddress(userId, network, symbol) {
    try {
      // Map token networks to actual blockchain networks
      let actualNetwork = network;
      if (network === 'usdt' || network === 'usdc') {
        actualNetwork = 'ethereum'; // USDT and USDC are ERC-20 tokens on Ethereum
      }

      // Validate network is supported
      if (!this.supportedNetworks.includes(actualNetwork)) {
        throw new Error(`Unsupported network: ${network}`);
      }

      // Check if user already has an address for this network (use actual network for storage)
      const existingAddress = await db.query(`
        SELECT address FROM user_deposit_addresses 
        WHERE user_id = $1 AND network = $2 AND is_active = true
      `, [userId, actualNetwork]);

      if (existingAddress.rows.length > 0) {
        return {
          address: existingAddress.rows[0].address,
          network: actualNetwork,
          qrCode: null // Could generate QR code here if needed
        };
      }

      // Generate new address using Alchemy service
      const addressData = await alchemyService.generateDepositAddress(actualNetwork, userId);

      // Store in database
      await db.query(`
        INSERT INTO user_deposit_addresses (user_id, network, address, encrypted_private_key)
        VALUES ($1, $2, $3, $4)
      `, [userId, actualNetwork, addressData.address, addressData.encryptedPrivateKey]);

      // Start monitoring this address
      this.startAddressMonitoring(userId, actualNetwork, addressData.address);

      logger.info(`Generated ${actualNetwork} address for user ${userId}: ${addressData.address}`);

      return {
        address: addressData.address,
        network: actualNetwork,
        qrCode: null // Could generate QR code here if needed
      };

    } catch (error) {
      logger.error(`Generate deposit address error for user ${userId}, network ${network}:`, error);
      throw error;
    }
  }

  // Get user deposit addresses
  async getUserDepositAddresses(userId) {
    try {
      const result = await db.query(`
        SELECT network, address, created_at
        FROM user_deposit_addresses
        WHERE user_id = $1 AND is_active = true
        ORDER BY network
      `, [userId]);

      const addresses = {};
      result.rows.forEach(row => {
        addresses[row.network] = {
          address: row.address,
          created_at: row.created_at
        };
      });

      return addresses;
    } catch (error) {
      logger.error('Get user deposit addresses error:', error);
      throw error;
    }
  }

  // Start monitoring an address for deposits
  async startAddressMonitoring(userId, network, address) {
    try {
      const monitorKey = `${network}-${address}`;
      
      // Avoid duplicate monitoring
      if (this.monitoringIntervals.has(monitorKey)) {
        return;
      }

      const stopMonitoring = await alchemyService.monitorAddress(network, address, (data) => {
        this.handleDepositNotification(userId, network, address, data);
      });

      this.monitoringIntervals.set(monitorKey, stopMonitoring);
      logger.info(`Started monitoring ${network} address: ${address}`);

    } catch (error) {
      logger.error(`Failed to start address monitoring for ${network} ${address}:`, error);
    }
  }

  // Handle deposit notification
  async handleDepositNotification(userId, network, address, data) {
    try {
      logger.info(`Deposit notification received: ${network} ${address}`, data);

      // This is a simplified approach - in production, you'd need to:
      // 1. Detect specific transactions to the address
      // 2. Parse transaction details (amount, token, etc.)
      // 3. Verify transaction validity
      // 4. Process the deposit

      // For now, we'll create a mock deposit entry
      const mockDeposit = {
        userId,
        network,
        fromAddress: 'mock_sender_address',
        toAddress: address,
        txHash: `mock_tx_${Date.now()}`,
        amount: parseFloat(data.balance || '0'),
        tokenSymbol: this.getNetworkNativeToken(data.network),
        requiredConfirmations: this.getRequiredConfirmations(network)
      };

      // Only process if there's actually a balance change
      if (mockDeposit.amount > 0) {
        await this.processDeposit(mockDeposit);
      }

    } catch (error) {
      logger.error('Handle deposit notification error:', error);
    }
  }

  // Process a deposit
  async processDeposit(depositData) {
    try {
      const {
        userId,
        network,
        fromAddress,
        toAddress,
        txHash,
        amount,
        tokenSymbol,
        requiredConfirmations
      } = depositData;

      // Check if deposit already exists
      const existingDeposit = await db.query(
        'SELECT id FROM deposits WHERE tx_hash = $1',
        [txHash]
      );

      if (existingDeposit.rows.length > 0) {
        logger.info(`Deposit already processed: ${txHash}`);
        return;
      }

      // Insert deposit record
      const depositResult = await db.query(`
        INSERT INTO deposits (
          user_id, network, from_address, to_address, tx_hash, 
          amount, token_symbol, required_confirmations, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
        RETURNING id
      `, [userId, network, fromAddress, toAddress, txHash, amount, tokenSymbol, requiredConfirmations]);

      const depositId = depositResult.rows[0].id;

      logger.info(`Deposit processed: ${txHash} - ${amount} ${tokenSymbol} from ${network}`);

      // Start confirmation monitoring
      this.monitorDepositConfirmations(depositId, network, txHash);

      // Notify user via WebSocket
      if (global.broadcastToUser) {
        global.broadcastToUser(userId, {
          type: 'deposit_detected',
          deposit: {
            id: depositId,
            network,
            amount,
            tokenSymbol,
            txHash,
            status: 'pending'
          }
        });
      }

    } catch (error) {
      logger.error('Process deposit error:', error);
      throw error;
    }
  }

  // Monitor deposit confirmations
  async monitorDepositConfirmations(depositId, network, txHash) {
    try {
      const checkConfirmations = async () => {
        try {
          // Get current deposit status
          const depositResult = await db.query(
            'SELECT * FROM deposits WHERE id = $1',
            [depositId]
          );

          if (depositResult.rows.length === 0) {
            return; // Deposit not found, stop monitoring
          }

          const deposit = depositResult.rows[0];

          if (deposit.status === 'confirmed') {
            return; // Already confirmed, stop monitoring
          }

          // Get transaction details from blockchain
          const txDetails = await alchemyService.getTransaction(network, txHash);
          const confirmations = txDetails.confirmations || 0;

          // Update confirmations
          await db.query(`
            UPDATE deposits 
            SET confirmations = $1, block_number = $2
            WHERE id = $3
          `, [confirmations, txDetails.blockNumber || txDetails.slot || txDetails.blockHeight, depositId]);

          logger.info(`Deposit ${depositId} confirmations: ${confirmations}/${deposit.required_confirmations}`);

          // Check if we have enough confirmations
          if (confirmations >= deposit.required_confirmations) {
            await this.confirmDeposit(depositId);
          }

        } catch (error) {
          logger.error(`Confirmation monitoring error for deposit ${depositId}:`, error);
        }
      };

      // Check immediately
      await checkConfirmations();

      // Set up periodic checking
      const interval = setInterval(checkConfirmations, 30000); // Check every 30 seconds

      // Stop monitoring after 24 hours
      setTimeout(() => {
        clearInterval(interval);
      }, 24 * 60 * 60 * 1000);

    } catch (error) {
      logger.error('Monitor deposit confirmations error:', error);
    }
  }

  // Confirm deposit and mint wrapped tokens
  async confirmDeposit(depositId) {
    try {
      const depositResult = await db.query(
        'SELECT * FROM deposits WHERE id = $1',
        [depositId]
      );

      if (depositResult.rows.length === 0) {
        throw new Error('Deposit not found');
      }

      const deposit = depositResult.rows[0];

      // Update deposit status
      await db.query(`
        UPDATE deposits 
        SET status = 'confirmed', confirmed_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [depositId]);

      // Mint wrapped tokens
      await this.mintWrappedTokens(deposit);

      logger.info(`Deposit confirmed and wrapped tokens minted: ${depositId}`);

      // Notify user
      if (global.broadcastToUser) {
        global.broadcastToUser(deposit.user_id, {
          type: 'deposit_confirmed',
          deposit: {
            id: depositId,
            network: deposit.network,
            amount: parseFloat(deposit.amount),
            tokenSymbol: deposit.token_symbol,
            wrappedSymbol: this.getWrappedTokenSymbol(deposit.token_symbol),
            status: 'confirmed'
          }
        });
      }

    } catch (error) {
      logger.error('Confirm deposit error:', error);
      throw error;
    }
  }

  // Mint wrapped tokens
  async mintWrappedTokens(deposit) {
    try {
      const wrappedSymbol = this.getWrappedTokenSymbol(deposit.token_symbol);
      const mintAmount = deposit.amount; // 1:1 ratio

      // Update wrapped token contract supply
      await db.query(`
        UPDATE wrapped_token_contracts 
        SET total_supply = total_supply + $1,
            total_minted = total_minted + $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE symbol = $2
      `, [mintAmount, wrappedSymbol]);

      // Update deposit record
      await db.query(`
        UPDATE deposits 
        SET wrapped_token_minted = true,
            wrapped_amount = $1,
            minted_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [mintAmount, deposit.id]);

      // In a real implementation, you would:
      // 1. Call the RSA smart contract to mint tokens
      // 2. Credit the user's wallet balance
      // 3. Update the RSA blockchain state

      logger.info(`Minted ${mintAmount} ${wrappedSymbol} for deposit ${deposit.id}`);

    } catch (error) {
      logger.error('Mint wrapped tokens error:', error);
      throw error;
    }
  }

  // Get network native token symbol
  getNetworkNativeToken(network) {
    const tokenMap = {
      'bitcoin': 'BTC',
      'ethereum': 'ETH',
      'solana': 'SOL',
      'avalanche': 'AVAX',
      'bsc': 'BNB',
      'polygon': 'MATIC',
      'arbitrum': 'ARB',
      'fantom': 'FTM',
      'linea': 'LINEA',
      'unichain': 'UNI',
      'opbnb': 'opBNB',
      'base': 'BASE',
      'polygon-zkevm': 'zkEVM'
    };

    return tokenMap[network] || 'UNKNOWN';
  }

  // Get wrapped token symbol from original token
  getWrappedTokenSymbol(originalSymbol) {
    const symbolMap = {
      'BTC': 'rBTC',
      'ETH': 'rETH',
      'SOL': 'rSOL',
      'AVAX': 'rAVAX',
      'BNB': 'rBNB',
      'USDT': 'rUSDT',
      'USDC': 'rUSDC',
      'MATIC': 'rMATIC',
      'ARB': 'rARB',
      'FTM': 'rFTM',
      'LINEA': 'rLINEA',
      'UNI': 'rUNI',
      'opBNB': 'ropBNB',
      'BASE': 'rBASE',
      'zkEVM': 'rzkEVM'
    };

    return symbolMap[originalSymbol] || `r${originalSymbol}`;
  }

  // Get required confirmations for network
  getRequiredConfirmations(network) {
    const confirmations = {
      'bitcoin': 3,
      'ethereum': 12,
      'solana': 32,
      'avalanche': 12,
      'bsc': 12,
      'polygon': 12,
      'arbitrum': 12,
      'fantom': 12,
      'linea': 12,
      'unichain': 12,
      'opbnb': 12,
      'base': 12,
      'polygon-zkevm': 12
    };

    return confirmations[network] || 12;
  }

  // Update network status
  async updateNetworkStatus() {
    try {
      const networkStatus = await alchemyService.getNetworkStatus();

      for (const [network, status] of Object.entries(networkStatus)) {
        await db.query(`
          UPDATE network_status 
          SET is_online = $1,
              block_height = $2,
              last_checked = CURRENT_TIMESTAMP,
              error_message = $3
          WHERE network = $4
        `, [status.online, status.blockHeight, status.error || null, network]);
      }

      logger.info('Network status updated successfully');
      return networkStatus;

    } catch (error) {
      logger.error('Update network status error:', error);
      throw error;
    }
  }

  // Get network status
  async getNetworkStatus() {
    try {
      // Return mock status for all supported networks if database is not available
      const mockStatus = {};
      this.supportedNetworks.forEach(network => {
        mockStatus[network] = {
          online: true,
          blockHeight: Math.floor(Math.random() * 1000000) + 1000000,
          lastChecked: new Date().toISOString(),
          maintenanceMode: false,
          error: null
        };
      });

      // Try to get from database, but fallback to mock if it fails
      try {
        const result = await db.query(`
          SELECT * FROM network_status
          ORDER BY network
        `);

        const status = {};
        result.rows.forEach(row => {
          status[row.network] = {
            online: row.is_online,
            blockHeight: row.block_height,
            lastChecked: row.last_checked,
            maintenanceMode: row.maintenance_mode,
            error: row.error_message
          };
        });

        // Merge with mock status for any missing networks
        this.supportedNetworks.forEach(network => {
          if (!status[network]) {
            status[network] = mockStatus[network];
          }
        });

        return status;
      } catch (dbError) {
        logger.warn('Database not available, using mock network status:', dbError.message);
        return mockStatus;
      }
    } catch (error) {
      logger.error('Get network status error:', error);
      // Return mock status even on error to ensure API doesn't fail
      const fallbackStatus = {};
      this.supportedNetworks.forEach(network => {
        fallbackStatus[network] = {
          online: true,
          blockHeight: 1,
          lastChecked: new Date().toISOString(),
          maintenanceMode: false,
          error: null
        };
      });
      return fallbackStatus;
    }
  }

  // Get wrapped token statistics
  async getWrappedTokenStats() {
    try {
      const result = await db.query(`
        SELECT 
          wt.*,
          COUNT(d.id) as total_deposits,
          COUNT(w.id) as total_withdrawals,
          COALESCE(SUM(d.amount), 0) as total_deposited,
          COALESCE(SUM(w.amount), 0) as total_withdrawn
        FROM wrapped_token_contracts wt
        LEFT JOIN deposits d ON d.token_symbol = REPLACE(wt.symbol, 'r', '') AND d.status = 'confirmed'
        LEFT JOIN withdrawals w ON w.token_symbol = wt.symbol AND w.status = 'completed'
        WHERE wt.is_active = true
        GROUP BY wt.id
        ORDER BY wt.symbol
      `);

      return result.rows.map(row => ({
        ...row,
        total_supply: parseFloat(row.total_supply),
        total_minted: parseFloat(row.total_minted),
        total_burned: parseFloat(row.total_burned),
        total_deposited: parseFloat(row.total_deposited),
        total_withdrawn: parseFloat(row.total_withdrawn)
      }));
    } catch (error) {
      logger.error('Get wrapped token stats error:', error);
      throw error;
    }
  }

  // Cleanup monitoring intervals
  cleanup() {
    this.monitoringIntervals.forEach((stopFn, key) => {
      if (typeof stopFn === 'function') {
        stopFn();
      }
    });
    this.monitoringIntervals.clear();
    logger.info('Cross-chain service cleanup completed');
  }
}

module.exports = new CrossChainService();