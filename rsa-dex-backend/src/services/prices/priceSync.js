const axios = require('axios');
const cron = require('node-cron');

/**
 * Price Synchronization Service
 * Fetches live USD prices from CoinGecko and manages price tracking for rTokens
 */

class PriceSyncService {
  constructor() {
    this.coinGeckoAPI = 'https://api.coingecko.com/api/v3';
    this.priceCache = new Map();
    this.trackedTokens = new Map();
    this.updateInterval = process.env.PRICE_UPDATE_INTERVAL || '*/5 * * * *'; // Every 5 minutes
    this.isRunning = false;
    this.lastUpdate = null;
  }

  /**
   * Initialize price sync service
   */
  async initialize() {
    try {
      console.log('📊 Initializing Price Sync Service');
      
      // Start price update cron job
      this.startPriceUpdates();
      
      // Initial price fetch
      await this.updateAllPrices();
      
      this.isRunning = true;
      console.log('✅ Price Sync Service initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize Price Sync Service:', error);
      throw error;
    }
  }

  /**
   * Register a token for price tracking
   * @param {string} coinGeckoId - CoinGecko ID (e.g., 'shiba-inu')
   * @param {string} rTokenSymbol - rToken symbol (e.g., 'rSHIB')
   * @param {Object} options - Additional tracking options
   * @returns {string} Tracking ID
   */
  registerToken(coinGeckoId, rTokenSymbol, options = {}) {
    try {
      const trackingId = `track_${rTokenSymbol}_${Date.now()}`;
      
      const tokenInfo = {
        trackingId,
        coinGeckoId,
        rTokenSymbol,
        originalSymbol: options.originalSymbol || rTokenSymbol.replace('r', ''),
        enabled: true,
        lastPrice: null,
        lastUpdate: null,
        priceHistory: [],
        alerts: options.alerts || [],
        metadata: options.metadata || {},
        createdAt: new Date().toISOString()
      };

      this.trackedTokens.set(rTokenSymbol, tokenInfo);
      console.log(`📈 Registered price tracking: ${rTokenSymbol} -> ${coinGeckoId}`);
      
      return trackingId;
      
    } catch (error) {
      console.error(`❌ Failed to register token ${rTokenSymbol}:`, error);
      throw error;
    }
  }

  /**
   * Start automated price updates
   */
  startPriceUpdates() {
    if (this.cronJob) {
      this.cronJob.stop();
    }

    this.cronJob = cron.schedule(this.updateInterval, async () => {
      try {
        await this.updateAllPrices();
      } catch (error) {
        console.error('❌ Scheduled price update failed:', error);
      }
    }, {
      scheduled: false
    });

    this.cronJob.start();
    console.log(`⏰ Price updates scheduled: ${this.updateInterval}`);
  }

  /**
   * Update prices for all tracked tokens
   */
  async updateAllPrices() {
    try {
      if (this.trackedTokens.size === 0) {
        console.log('📊 No tokens to track');
        return;
      }

      console.log(`📊 Updating prices for ${this.trackedTokens.size} tokens`);
      
      // Get all CoinGecko IDs
      const coinGeckoIds = Array.from(this.trackedTokens.values())
        .filter(token => token.enabled)
        .map(token => token.coinGeckoId);

      if (coinGeckoIds.length === 0) {
        console.log('📊 No enabled tokens to track');
        return;
      }

      // Fetch prices from CoinGecko
      const prices = await this.fetchPricesFromCoinGecko(coinGeckoIds);
      
      // Update tracked tokens
      for (const [rTokenSymbol, tokenInfo] of this.trackedTokens.entries()) {
        if (!tokenInfo.enabled) continue;

        const priceData = prices[tokenInfo.coinGeckoId];
        if (priceData) {
          await this.updateTokenPrice(rTokenSymbol, priceData);
        }
      }

      this.lastUpdate = new Date().toISOString();
      console.log(`✅ Price update completed at ${this.lastUpdate}`);
      
    } catch (error) {
      console.error('❌ Failed to update all prices:', error);
      throw error;
    }
  }

  /**
   * Fetch prices from CoinGecko API
   * @param {Array} coinGeckoIds - Array of CoinGecko IDs
   * @returns {Object} Price data mapped by CoinGecko ID
   */
  async fetchPricesFromCoinGecko(coinGeckoIds) {
    try {
      const idsString = coinGeckoIds.join(',');
      const url = `${this.coinGeckoAPI}/simple/price`;
      
      const response = await axios.get(url, {
        params: {
          ids: idsString,
          vs_currencies: 'usd',
          include_market_cap: true,
          include_24hr_vol: true,
          include_24hr_change: true,
          include_last_updated_at: true
        },
        timeout: 10000 // 10 second timeout
      });

      return response.data;
      
    } catch (error) {
      console.error('❌ CoinGecko API error:', error.message);
      
      // Fallback to mock data for demo
      return this.getMockPriceData(coinGeckoIds);
    }
  }

  /**
   * Get mock price data for demo/fallback
   * @param {Array} coinGeckoIds - Array of CoinGecko IDs
   * @returns {Object} Mock price data
   */
  getMockPriceData(coinGeckoIds) {
    const mockPrices = {
      'shiba-inu': {
        usd: 0.000012,
        usd_market_cap: 7000000000,
        usd_24h_vol: 200000000,
        usd_24h_change: -2.5,
        last_updated_at: Math.floor(Date.now() / 1000)
      },
      'ethereum': {
        usd: 3500.75,
        usd_market_cap: 420000000000,
        usd_24h_vol: 15000000000,
        usd_24h_change: 1.8,
        last_updated_at: Math.floor(Date.now() / 1000)
      },
      'bitcoin': {
        usd: 65000.50,
        usd_market_cap: 1280000000000,
        usd_24h_vol: 28000000000,
        usd_24h_change: 3.2,
        last_updated_at: Math.floor(Date.now() / 1000)
      },
      'rsa-chain': {
        usd: 0.85,
        usd_market_cap: 50000000,
        usd_24h_vol: 1250000,
        usd_24h_change: 2.5,
        last_updated_at: Math.floor(Date.now() / 1000)
      }
    };

    const result = {};
    for (const id of coinGeckoIds) {
      result[id] = mockPrices[id] || {
        usd: Math.random() * 100,
        usd_market_cap: Math.random() * 1000000000,
        usd_24h_vol: Math.random() * 10000000,
        usd_24h_change: (Math.random() - 0.5) * 20,
        last_updated_at: Math.floor(Date.now() / 1000)
      };
    }

    console.log('📊 Using mock price data for demo');
    return result;
  }

  /**
   * Update price for a specific token
   * @param {string} rTokenSymbol - rToken symbol
   * @param {Object} priceData - Price data from CoinGecko
   */
  async updateTokenPrice(rTokenSymbol, priceData) {
    try {
      const tokenInfo = this.trackedTokens.get(rTokenSymbol);
      if (!tokenInfo) {
        throw new Error(`Token not found: ${rTokenSymbol}`);
      }

      const previousPrice = tokenInfo.lastPrice;
      const newPrice = priceData.usd;
      const timestamp = new Date().toISOString();

      // Update token info
      tokenInfo.lastPrice = newPrice;
      tokenInfo.lastUpdate = timestamp;
      
      // Add to price history (keep last 100 entries)
      tokenInfo.priceHistory.push({
        price: newPrice,
        marketCap: priceData.usd_market_cap,
        volume24h: priceData.usd_24h_vol,
        change24h: priceData.usd_24h_change,
        timestamp
      });

      if (tokenInfo.priceHistory.length > 100) {
        tokenInfo.priceHistory = tokenInfo.priceHistory.slice(-100);
      }

      // Update cache
      this.priceCache.set(rTokenSymbol, {
        symbol: rTokenSymbol,
        price: newPrice,
        change24h: priceData.usd_24h_change,
        marketCap: priceData.usd_market_cap,
        volume24h: priceData.usd_24h_vol,
        lastUpdate: timestamp
      });

      // Check price alerts
      await this.checkPriceAlerts(rTokenSymbol, newPrice, previousPrice);

      console.log(`💰 Updated ${rTokenSymbol}: $${newPrice} (${priceData.usd_24h_change > 0 ? '+' : ''}${priceData.usd_24h_change?.toFixed(2)}%)`);
      
    } catch (error) {
      console.error(`❌ Failed to update price for ${rTokenSymbol}:`, error);
    }
  }

  /**
   * Check and trigger price alerts
   * @param {string} rTokenSymbol - rToken symbol
   * @param {number} currentPrice - Current price
   * @param {number} previousPrice - Previous price
   */
  async checkPriceAlerts(rTokenSymbol, currentPrice, previousPrice) {
    try {
      const tokenInfo = this.trackedTokens.get(rTokenSymbol);
      if (!tokenInfo || !tokenInfo.alerts.length) return;

      for (const alert of tokenInfo.alerts) {
        let triggered = false;
        
        switch (alert.type) {
          case 'price_above':
            triggered = currentPrice > alert.value;
            break;
          case 'price_below':
            triggered = currentPrice < alert.value;
            break;
          case 'change_above':
            if (previousPrice) {
              const changePercent = ((currentPrice - previousPrice) / previousPrice) * 100;
              triggered = changePercent > alert.value;
            }
            break;
          case 'change_below':
            if (previousPrice) {
              const changePercent = ((currentPrice - previousPrice) / previousPrice) * 100;
              triggered = changePercent < alert.value;
            }
            break;
        }

        if (triggered && !alert.triggered) {
          await this.triggerAlert(rTokenSymbol, alert, currentPrice);
          alert.triggered = true;
          alert.triggeredAt = new Date().toISOString();
        } else if (!triggered && alert.triggered) {
          alert.triggered = false;
        }
      }
      
    } catch (error) {
      console.error(`❌ Failed to check alerts for ${rTokenSymbol}:`, error);
    }
  }

  /**
   * Trigger a price alert
   * @param {string} rTokenSymbol - rToken symbol
   * @param {Object} alert - Alert configuration
   * @param {number} currentPrice - Current price
   */
  async triggerAlert(rTokenSymbol, alert, currentPrice) {
    try {
      console.log(`🚨 PRICE ALERT: ${rTokenSymbol} ${alert.type} ${alert.value} (Current: $${currentPrice})`);
      
      // In production, this would send notifications via:
      // - Email
      // - Slack/Discord webhooks
      // - Push notifications
      // - SMS
      
    } catch (error) {
      console.error(`❌ Failed to trigger alert for ${rTokenSymbol}:`, error);
    }
  }

  /**
   * Get current price for a token
   * @param {string} rTokenSymbol - rToken symbol
   * @returns {Object} Current price data
   */
  getPrice(rTokenSymbol) {
    return this.priceCache.get(rTokenSymbol) || null;
  }

  /**
   * Get price history for a token
   * @param {string} rTokenSymbol - rToken symbol
   * @param {number} limit - Number of entries to return
   * @returns {Array} Price history
   */
  getPriceHistory(rTokenSymbol, limit = 24) {
    const tokenInfo = this.trackedTokens.get(rTokenSymbol);
    if (!tokenInfo) return [];

    return tokenInfo.priceHistory.slice(-limit);
  }

  /**
   * Get all tracked tokens with current prices
   * @returns {Array} Array of tracked tokens with prices
   */
  getAllPrices() {
    return Array.from(this.priceCache.values());
  }

  /**
   * Add price alert for a token
   * @param {string} rTokenSymbol - rToken symbol
   * @param {Object} alert - Alert configuration
   * @returns {boolean} Success status
   */
  addAlert(rTokenSymbol, alert) {
    try {
      const tokenInfo = this.trackedTokens.get(rTokenSymbol);
      if (!tokenInfo) {
        throw new Error(`Token not found: ${rTokenSymbol}`);
      }

      const alertId = `alert_${Date.now()}`;
      const alertConfig = {
        id: alertId,
        type: alert.type, // 'price_above', 'price_below', 'change_above', 'change_below'
        value: alert.value,
        triggered: false,
        createdAt: new Date().toISOString(),
        ...alert
      };

      tokenInfo.alerts.push(alertConfig);
      console.log(`🔔 Added alert for ${rTokenSymbol}: ${alert.type} ${alert.value}`);
      
      return true;
      
    } catch (error) {
      console.error(`❌ Failed to add alert for ${rTokenSymbol}:`, error);
      return false;
    }
  }

  /**
   * Remove price alert
   * @param {string} rTokenSymbol - rToken symbol
   * @param {string} alertId - Alert ID
   * @returns {boolean} Success status
   */
  removeAlert(rTokenSymbol, alertId) {
    try {
      const tokenInfo = this.trackedTokens.get(rTokenSymbol);
      if (!tokenInfo) {
        throw new Error(`Token not found: ${rTokenSymbol}`);
      }

      const alertIndex = tokenInfo.alerts.findIndex(alert => alert.id === alertId);
      if (alertIndex === -1) {
        throw new Error(`Alert not found: ${alertId}`);
      }

      tokenInfo.alerts.splice(alertIndex, 1);
      console.log(`🔕 Removed alert ${alertId} for ${rTokenSymbol}`);
      
      return true;
      
    } catch (error) {
      console.error(`❌ Failed to remove alert for ${rTokenSymbol}:`, error);
      return false;
    }
  }

  /**
   * Enable/disable price tracking for a token
   * @param {string} rTokenSymbol - rToken symbol
   * @param {boolean} enabled - Enable status
   * @returns {boolean} Success status
   */
  setTrackingEnabled(rTokenSymbol, enabled) {
    try {
      const tokenInfo = this.trackedTokens.get(rTokenSymbol);
      if (!tokenInfo) {
        throw new Error(`Token not found: ${rTokenSymbol}`);
      }

      tokenInfo.enabled = enabled;
      console.log(`${enabled ? '▶️' : '⏸️'} Price tracking ${enabled ? 'enabled' : 'disabled'} for ${rTokenSymbol}`);
      
      return true;
      
    } catch (error) {
      console.error(`❌ Failed to set tracking status for ${rTokenSymbol}:`, error);
      return false;
    }
  }

  /**
   * Stop price sync service
   */
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
    }
    this.isRunning = false;
    console.log('⏹️ Price Sync Service stopped');
  }

  /**
   * Get service status
   * @returns {Object} Service status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      trackedTokens: this.trackedTokens.size,
      lastUpdate: this.lastUpdate,
      updateInterval: this.updateInterval,
      cacheSize: this.priceCache.size
    };
  }
}

module.exports = PriceSyncService;