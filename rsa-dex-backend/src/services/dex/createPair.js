/**
 * DEX Trading Pair Creation Service
 * Creates and manages trading pairs for newly imported tokens
 */

class DEXPairService {
  constructor() {
    this.tradingPairs = new Map();
    this.pairRegistry = new Map();
    this.liquidityPools = new Map();
    this.feeStructure = {
      standard: 0.003, // 0.3%
      stable: 0.001,   // 0.1%
      exotic: 0.005    // 0.5%
    };
  }

  /**
   * Create default trading pairs for a new rToken
   * @param {string} baseToken - Base token symbol (e.g., 'rSHIB')
   * @param {Array} quoteTokens - Quote tokens (e.g., ['rUSDT', 'rETH', 'rBTC'])
   * @param {Object} options - Additional options
   * @returns {Array} Created trading pairs
   */
  async createDefaultPairs(baseToken, quoteTokens = ['rUSDT', 'rETH', 'rBTC'], options = {}) {
    try {
      console.log(`💱 Creating default trading pairs for ${baseToken}`);
      
      const createdPairs = [];
      
      for (const quoteToken of quoteTokens) {
        try {
          const pair = await this.createTradingPair(baseToken, quoteToken, options);
          createdPairs.push(pair);
          console.log(`✅ Created trading pair: ${baseToken}/${quoteToken}`);
        } catch (error) {
          console.error(`❌ Failed to create pair ${baseToken}/${quoteToken}:`, error);
        }
      }

      return createdPairs;
      
    } catch (error) {
      console.error(`❌ Failed to create default pairs for ${baseToken}:`, error);
      throw error;
    }
  }

  /**
   * Create a specific trading pair
   * @param {string} baseToken - Base token symbol
   * @param {string} quoteToken - Quote token symbol
   * @param {Object} options - Pair configuration options
   * @returns {Object} Created trading pair information
   */
  async createTradingPair(baseToken, quoteToken, options = {}) {
    try {
      const pairSymbol = `${baseToken}/${quoteToken}`;
      const pairId = this.generatePairId(baseToken, quoteToken);

      // Check if pair already exists
      if (this.tradingPairs.has(pairId)) {
        console.log(`⚠️ Trading pair already exists: ${pairSymbol}`);
        return this.tradingPairs.get(pairId);
      }

      // Determine fee tier
      const feeTier = this.determineFee(baseToken, quoteToken);
      
      // Create pair configuration
      const pairConfig = {
        id: pairId,
        symbol: pairSymbol,
        baseToken,
        quoteToken,
        status: 'active',
        feeTier,
        feeRate: this.feeStructure[feeTier],
        minTradeAmount: options.minTradeAmount || 0.000001,
        maxTradeAmount: options.maxTradeAmount || 1000000,
        priceDecimals: options.priceDecimals || 8,
        amountDecimals: options.amountDecimals || 6,
        tickSize: options.tickSize || 0.00000001,
        stepSize: options.stepSize || 0.000001,
        createdAt: new Date().toISOString(),
        lastPrice: null,
        volume24h: 0,
        high24h: null,
        low24h: null,
        change24h: 0,
        trades24h: 0,
        orderBook: {
          bids: [],
          asks: [],
          lastUpdate: new Date().toISOString()
        },
        metadata: {
          description: `${baseToken} to ${quoteToken} trading pair`,
          category: this.categorizePair(baseToken, quoteToken),
          tags: this.generatePairTags(baseToken, quoteToken),
          ...options.metadata
        }
      };

      // Register the trading pair
      this.tradingPairs.set(pairId, pairConfig);
      this.pairRegistry.set(pairSymbol, pairId);

      // Initialize liquidity pool if needed
      if (options.createLiquidityPool !== false) {
        await this.initializeLiquidityPool(pairId, pairConfig);
      }

      // Set up market making if enabled
      if (options.enableMarketMaking) {
        await this.setupMarketMaking(pairId, options.marketMakingConfig);
      }

      console.log(`✅ Created trading pair: ${pairSymbol} (ID: ${pairId})`);
      return pairConfig;

    } catch (error) {
      console.error(`❌ Failed to create trading pair ${baseToken}/${quoteToken}:`, error);
      throw error;
    }
  }

  /**
   * Generate unique pair ID
   * @param {string} baseToken - Base token symbol
   * @param {string} quoteToken - Quote token symbol
   * @returns {string} Pair ID
   */
  generatePairId(baseToken, quoteToken) {
    const combined = `${baseToken}_${quoteToken}`.toLowerCase();
    const timestamp = Date.now();
    return `pair_${combined}_${timestamp}`;
  }

  /**
   * Determine fee tier for a trading pair
   * @param {string} baseToken - Base token symbol
   * @param {string} quoteToken - Quote token symbol
   * @returns {string} Fee tier
   */
  determineFee(baseToken, quoteToken) {
    // Stable pairs (stablecoin to stablecoin)
    const stablecoins = ['rUSDT', 'rUSDC', 'rDAI', 'rBUSD'];
    if (stablecoins.includes(baseToken) && stablecoins.includes(quoteToken)) {
      return 'stable';
    }

    // Major pairs (with major cryptocurrencies)
    const majorTokens = ['rBTC', 'rETH', 'rBNB', 'rADA', 'rSOL'];
    if (majorTokens.includes(baseToken) || majorTokens.includes(quoteToken)) {
      return 'standard';
    }

    // Exotic pairs (new/unknown tokens)
    return 'exotic';
  }

  /**
   * Categorize trading pair
   * @param {string} baseToken - Base token symbol
   * @param {string} quoteToken - Quote token symbol
   * @returns {string} Pair category
   */
  categorizePair(baseToken, quoteToken) {
    const stablecoins = ['rUSDT', 'rUSDC', 'rDAI', 'rBUSD'];
    const majorTokens = ['rBTC', 'rETH', 'rBNB'];
    const memeTokens = ['rDOGE', 'rSHIB', 'rPEPE'];

    if (stablecoins.includes(baseToken) && stablecoins.includes(quoteToken)) {
      return 'stable';
    }
    
    if (majorTokens.includes(baseToken) || majorTokens.includes(quoteToken)) {
      return 'major';
    }
    
    if (memeTokens.includes(baseToken) || memeTokens.includes(quoteToken)) {
      return 'meme';
    }
    
    return 'altcoin';
  }

  /**
   * Generate tags for trading pair
   * @param {string} baseToken - Base token symbol
   * @param {string} quoteToken - Quote token symbol
   * @returns {Array} Pair tags
   */
  generatePairTags(baseToken, quoteToken) {
    const tags = [];
    
    // Network tags
    if (baseToken.startsWith('r') || quoteToken.startsWith('r')) {
      tags.push('rsa-chain');
    }
    
    // Category tags
    const category = this.categorizePair(baseToken, quoteToken);
    tags.push(category);
    
    // Special tags
    if (baseToken.includes('SHIB') || quoteToken.includes('SHIB')) {
      tags.push('meme', 'dog-token');
    }
    
    if (baseToken.includes('BTC') || quoteToken.includes('BTC')) {
      tags.push('bitcoin', 'store-of-value');
    }
    
    if (baseToken.includes('ETH') || quoteToken.includes('ETH')) {
      tags.push('ethereum', 'smart-contracts');
    }
    
    return tags;
  }

  /**
   * Initialize liquidity pool for trading pair
   * @param {string} pairId - Trading pair ID
   * @param {Object} pairConfig - Pair configuration
   */
  async initializeLiquidityPool(pairId, pairConfig) {
    try {
      const poolConfig = {
        pairId,
        symbol: pairConfig.symbol,
        baseToken: pairConfig.baseToken,
        quoteToken: pairConfig.quoteToken,
        totalLiquidity: 0,
        baseReserve: 0,
        quoteReserve: 0,
        lpTokenSupply: 0,
        feeRate: pairConfig.feeRate,
        providers: [],
        volume24h: 0,
        fees24h: 0,
        apr: 0,
        createdAt: new Date().toISOString(),
        lastUpdate: new Date().toISOString()
      };

      this.liquidityPools.set(pairId, poolConfig);
      console.log(`🏊 Initialized liquidity pool for ${pairConfig.symbol}`);

    } catch (error) {
      console.error(`❌ Failed to initialize liquidity pool for ${pairId}:`, error);
    }
  }

  /**
   * Set up market making for trading pair
   * @param {string} pairId - Trading pair ID
   * @param {Object} config - Market making configuration
   */
  async setupMarketMaking(pairId, config = {}) {
    try {
      const pairConfig = this.tradingPairs.get(pairId);
      if (!pairConfig) {
        throw new Error(`Trading pair not found: ${pairId}`);
      }

      const marketMakingConfig = {
        enabled: true,
        spread: config.spread || 0.01, // 1% spread
        depth: config.depth || 5, // 5 levels
        amount: config.amount || 1000, // Base amount per level
        refreshInterval: config.refreshInterval || 30000, // 30 seconds
        priceSource: config.priceSource || 'external', // 'external' or 'internal'
        ...config
      };

      // Store market making config
      pairConfig.marketMaking = marketMakingConfig;
      
      // Start market making bot (mock implementation)
      await this.startMarketMakingBot(pairId, marketMakingConfig);
      
      console.log(`🤖 Market making enabled for ${pairConfig.symbol}`);

    } catch (error) {
      console.error(`❌ Failed to setup market making for ${pairId}:`, error);
    }
  }

  /**
   * Start market making bot (mock implementation)
   * @param {string} pairId - Trading pair ID
   * @param {Object} config - Market making configuration
   */
  async startMarketMakingBot(pairId, config) {
    // Mock market making bot - in production, this would:
    // 1. Fetch current price from external sources
    // 2. Calculate bid/ask prices based on spread
    // 3. Place orders in the order book
    // 4. Monitor and adjust orders based on market conditions
    
    console.log(`🤖 Market making bot started for pair ${pairId}`);
    
    // Simulate initial order placement
    const pairConfig = this.tradingPairs.get(pairId);
    if (pairConfig) {
      // Mock price (in production, fetch from price oracle)
      const basePrice = 1.0; // $1 as example
      
      // Generate mock orders
      const bids = [];
      const asks = [];
      
      for (let i = 1; i <= config.depth; i++) {
        const bidPrice = basePrice * (1 - config.spread * i);
        const askPrice = basePrice * (1 + config.spread * i);
        
        bids.push({
          price: bidPrice,
          amount: config.amount * i,
          total: bidPrice * config.amount * i,
          type: 'market_maker'
        });
        
        asks.push({
          price: askPrice,
          amount: config.amount * i,
          total: askPrice * config.amount * i,
          type: 'market_maker'
        });
      }
      
      // Update order book
      pairConfig.orderBook.bids = bids.sort((a, b) => b.price - a.price);
      pairConfig.orderBook.asks = asks.sort((a, b) => a.price - b.price);
      pairConfig.orderBook.lastUpdate = new Date().toISOString();
      
      console.log(`📊 Initial orders placed for ${pairConfig.symbol}`);
    }
  }

  /**
   * Get trading pair information
   * @param {string} pairSymbol - Trading pair symbol (e.g., 'rSHIB/rUSDT')
   * @returns {Object} Trading pair information
   */
  getTradingPair(pairSymbol) {
    const pairId = this.pairRegistry.get(pairSymbol);
    return pairId ? this.tradingPairs.get(pairId) : null;
  }

  /**
   * List all trading pairs
   * @param {Object} filters - Optional filters
   * @returns {Array} Array of trading pairs
   */
  listTradingPairs(filters = {}) {
    let pairs = Array.from(this.tradingPairs.values());
    
    // Apply filters
    if (filters.baseToken) {
      pairs = pairs.filter(pair => pair.baseToken === filters.baseToken);
    }
    
    if (filters.quoteToken) {
      pairs = pairs.filter(pair => pair.quoteToken === filters.quoteToken);
    }
    
    if (filters.category) {
      pairs = pairs.filter(pair => pair.metadata.category === filters.category);
    }
    
    if (filters.status) {
      pairs = pairs.filter(pair => pair.status === filters.status);
    }
    
    // Sort by volume (descending)
    pairs.sort((a, b) => b.volume24h - a.volume24h);
    
    return pairs;
  }

  /**
   * Update pair status
   * @param {string} pairSymbol - Trading pair symbol
   * @param {string} status - New status ('active', 'paused', 'delisted')
   * @returns {boolean} Success status
   */
  updatePairStatus(pairSymbol, status) {
    try {
      const pairId = this.pairRegistry.get(pairSymbol);
      if (!pairId) {
        throw new Error(`Trading pair not found: ${pairSymbol}`);
      }

      const pairConfig = this.tradingPairs.get(pairId);
      pairConfig.status = status;
      pairConfig.lastUpdate = new Date().toISOString();

      console.log(`📊 Updated ${pairSymbol} status to: ${status}`);
      return true;

    } catch (error) {
      console.error(`❌ Failed to update pair status for ${pairSymbol}:`, error);
      return false;
    }
  }

  /**
   * Get liquidity pool information
   * @param {string} pairSymbol - Trading pair symbol
   * @returns {Object} Liquidity pool information
   */
  getLiquidityPool(pairSymbol) {
    const pairId = this.pairRegistry.get(pairSymbol);
    return pairId ? this.liquidityPools.get(pairId) : null;
  }

  /**
   * Update trading pair statistics
   * @param {string} pairSymbol - Trading pair symbol
   * @param {Object} stats - New statistics
   */
  updatePairStats(pairSymbol, stats) {
    try {
      const pairId = this.pairRegistry.get(pairSymbol);
      if (!pairId) return;

      const pairConfig = this.tradingPairs.get(pairId);
      if (!pairConfig) return;

      // Update statistics
      if (stats.lastPrice !== undefined) pairConfig.lastPrice = stats.lastPrice;
      if (stats.volume24h !== undefined) pairConfig.volume24h = stats.volume24h;
      if (stats.high24h !== undefined) pairConfig.high24h = stats.high24h;
      if (stats.low24h !== undefined) pairConfig.low24h = stats.low24h;
      if (stats.change24h !== undefined) pairConfig.change24h = stats.change24h;
      if (stats.trades24h !== undefined) pairConfig.trades24h = stats.trades24h;

      pairConfig.lastUpdate = new Date().toISOString();

    } catch (error) {
      console.error(`❌ Failed to update stats for ${pairSymbol}:`, error);
    }
  }

  /**
   * Remove trading pair
   * @param {string} pairSymbol - Trading pair symbol
   * @returns {boolean} Success status
   */
  removeTradingPair(pairSymbol) {
    try {
      const pairId = this.pairRegistry.get(pairSymbol);
      if (!pairId) {
        throw new Error(`Trading pair not found: ${pairSymbol}`);
      }

      // Remove from all registries
      this.tradingPairs.delete(pairId);
      this.pairRegistry.delete(pairSymbol);
      this.liquidityPools.delete(pairId);

      console.log(`🗑️ Removed trading pair: ${pairSymbol}`);
      return true;

    } catch (error) {
      console.error(`❌ Failed to remove trading pair ${pairSymbol}:`, error);
      return false;
    }
  }

  /**
   * Get service statistics
   * @returns {Object} Service statistics
   */
  getStats() {
    const pairs = Array.from(this.tradingPairs.values());
    
    return {
      totalPairs: pairs.length,
      activePairs: pairs.filter(p => p.status === 'active').length,
      totalVolume24h: pairs.reduce((sum, p) => sum + (p.volume24h || 0), 0),
      totalTrades24h: pairs.reduce((sum, p) => sum + (p.trades24h || 0), 0),
      pairsByCategory: this.groupPairsByCategory(pairs),
      topPairsByVolume: pairs
        .sort((a, b) => (b.volume24h || 0) - (a.volume24h || 0))
        .slice(0, 10)
        .map(p => ({ symbol: p.symbol, volume24h: p.volume24h }))
    };
  }

  /**
   * Group pairs by category
   * @param {Array} pairs - Array of trading pairs
   * @returns {Object} Pairs grouped by category
   */
  groupPairsByCategory(pairs) {
    const categories = {};
    
    for (const pair of pairs) {
      const category = pair.metadata.category || 'unknown';
      if (!categories[category]) {
        categories[category] = 0;
      }
      categories[category]++;
    }
    
    return categories;
  }
}

module.exports = DEXPairService;