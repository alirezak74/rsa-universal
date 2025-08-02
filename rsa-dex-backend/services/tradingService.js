/**
 * Trading Service
 * Handles trading operations, order management, and market data
 */

const { tokenManager } = require('./tokenManager');
const { crossChainService } = require('./crossChainService');

class TradingService {
  constructor() {
    this.orders = new Map();
    this.trades = [];
    this.markets = new Map();
    this.orderBook = new Map();
    this.currentOrderId = 1;
    this.currentTradeId = 1;
    
    this.initializeDefaultMarkets();
  }

  /**
   * Initialize default trading markets
   */
  initializeDefaultMarkets() {
    const defaultMarkets = [
      {
        id: 'RSA_USDT',
        symbol: 'RSA/USDT',
        baseAsset: 'RSA',
        quoteAsset: 'USDT',
        price: 0.0245,
        volume24h: 1250000,
        change24h: 12.5,
        high24h: 0.0265,
        low24h: 0.0225,
        status: 'active'
      },
      {
        id: 'BTC_USDT',
        symbol: 'BTC/USDT',
        baseAsset: 'BTC',
        quoteAsset: 'USDT',
        price: 42500.00,
        volume24h: 25000000,
        change24h: 2.3,
        high24h: 43200.00,
        low24h: 41800.00,
        status: 'active'
      },
      {
        id: 'ETH_USDT',
        symbol: 'ETH/USDT',
        baseAsset: 'ETH',
        quoteAsset: 'USDT',
        price: 2650.00,
        volume24h: 15000000,
        change24h: -1.2,
        high24h: 2720.00,
        low24h: 2580.00,
        status: 'active'
      }
    ];

    defaultMarkets.forEach(market => {
      this.markets.set(market.id, market);
      this.initializeOrderBook(market.id);
    });
  }

  /**
   * Initialize order book for a market
   */
  initializeOrderBook(marketId) {
    this.orderBook.set(marketId, {
      bids: [
        { price: 42450.00, amount: 0.5, total: 21225.00 },
        { price: 42400.00, amount: 1.2, total: 50880.00 },
        { price: 42350.00, amount: 0.8, total: 33880.00 }
      ],
      asks: [
        { price: 42550.00, amount: 0.3, total: 12765.00 },
        { price: 42600.00, amount: 0.7, total: 29820.00 },
        { price: 42650.00, amount: 1.1, total: 46915.00 }
      ]
    });
  }

  /**
   * Get all markets
   */
  async getMarkets() {
    try {
      return {
        success: true,
        data: Array.from(this.markets.values())
      };
    } catch (error) {
      console.error('Error getting markets:', error);
      return {
        success: false,
        error: 'Failed to get markets'
      };
    }
  }

  /**
   * Get market by symbol
   */
  async getMarket(symbol) {
    try {
      const market = Array.from(this.markets.values()).find(m => m.symbol === symbol);
      if (!market) {
        return {
          success: false,
          error: 'Market not found'
        };
      }

      return {
        success: true,
        data: market
      };
    } catch (error) {
      console.error('Error getting market:', error);
      return {
        success: false,
        error: 'Failed to get market'
      };
    }
  }

  /**
   * Create a new order
   */
  async createOrder(orderData) {
    try {
      const {
        userId,
        marketId,
        type, // 'buy' or 'sell'
        orderType, // 'market' or 'limit'
        amount,
        price,
        clientOrderId
      } = orderData;

      const orderId = `order_${this.currentOrderId++}`;
      const order = {
        id: orderId,
        clientOrderId,
        userId,
        marketId,
        type,
        orderType,
        amount: parseFloat(amount),
        price: orderType === 'limit' ? parseFloat(price) : null,
        filled: 0,
        remaining: parseFloat(amount),
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.orders.set(orderId, order);

      // For market orders, fill immediately at current market price
      if (orderType === 'market') {
        await this.fillMarketOrder(order);
      }

      return {
        success: true,
        data: order
      };
    } catch (error) {
      console.error('Error creating order:', error);
      return {
        success: false,
        error: 'Failed to create order'
      };
    }
  }

  /**
   * Fill market order immediately
   */
  async fillMarketOrder(order) {
    try {
      const market = this.markets.get(order.marketId);
      if (!market) {
        throw new Error('Market not found');
      }

      const fillPrice = market.price;
      const fillAmount = order.remaining;
      
      // Create trade record
      const trade = {
        id: `trade_${this.currentTradeId++}`,
        orderId: order.id,
        marketId: order.marketId,
        userId: order.userId,
        type: order.type,
        amount: fillAmount,
        price: fillPrice,
        total: fillAmount * fillPrice,
        fee: (fillAmount * fillPrice) * 0.001, // 0.1% fee
        createdAt: new Date().toISOString()
      };

      this.trades.push(trade);

      // Update order status
      order.filled = fillAmount;
      order.remaining = 0;
      order.status = 'filled';
      order.updatedAt = new Date().toISOString();

      return trade;
    } catch (error) {
      console.error('Error filling market order:', error);
      throw error;
    }
  }

  /**
   * Get orders for a user
   */
  async getUserOrders(userId, options = {}) {
    try {
      const { status, marketId, limit = 50, offset = 0 } = options;
      
      let userOrders = Array.from(this.orders.values())
        .filter(order => order.userId === userId);

      if (status) {
        userOrders = userOrders.filter(order => order.status === status);
      }

      if (marketId) {
        userOrders = userOrders.filter(order => order.marketId === marketId);
      }

      // Sort by creation date (newest first)
      userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Apply pagination
      const paginatedOrders = userOrders.slice(offset, offset + limit);

      return {
        success: true,
        data: {
          orders: paginatedOrders,
          total: userOrders.length,
          hasMore: (offset + limit) < userOrders.length
        }
      };
    } catch (error) {
      console.error('Error getting user orders:', error);
      return {
        success: false,
        error: 'Failed to get user orders'
      };
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId, userId) {
    try {
      const order = this.orders.get(orderId);
      
      if (!order) {
        return {
          success: false,
          error: 'Order not found'
        };
      }

      if (order.userId !== userId) {
        return {
          success: false,
          error: 'Unauthorized to cancel this order'
        };
      }

      if (order.status !== 'open') {
        return {
          success: false,
          error: 'Order cannot be cancelled'
        };
      }

      order.status = 'cancelled';
      order.updatedAt = new Date().toISOString();

      return {
        success: true,
        data: order
      };
    } catch (error) {
      console.error('Error cancelling order:', error);
      return {
        success: false,
        error: 'Failed to cancel order'
      };
    }
  }

  /**
   * Get order book for a market
   */
  async getOrderBook(marketId) {
    try {
      const orderBook = this.orderBook.get(marketId);
      
      if (!orderBook) {
        return {
          success: false,
          error: 'Order book not found'
        };
      }

      return {
        success: true,
        data: orderBook
      };
    } catch (error) {
      console.error('Error getting order book:', error);
      return {
        success: false,
        error: 'Failed to get order book'
      };
    }
  }

  /**
   * Get recent trades for a market
   */
  async getRecentTrades(marketId, limit = 50) {
    try {
      const marketTrades = this.trades
        .filter(trade => trade.marketId === marketId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);

      return {
        success: true,
        data: marketTrades
      };
    } catch (error) {
      console.error('Error getting recent trades:', error);
      return {
        success: false,
        error: 'Failed to get recent trades'
      };
    }
  }

  /**
   * Get trading statistics
   */
  async getTradingStats(marketId = null) {
    try {
      let trades = this.trades;
      
      if (marketId) {
        trades = trades.filter(trade => trade.marketId === marketId);
      }

      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const trades24h = trades.filter(trade => new Date(trade.createdAt) >= yesterday);
      
      const volume24h = trades24h.reduce((sum, trade) => sum + trade.total, 0);
      const tradeCount24h = trades24h.length;

      const stats = {
        totalTrades: trades.length,
        volume24h,
        tradeCount24h,
        averageTradeSize: trades24h.length > 0 ? volume24h / trades24h.length : 0
      };

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error getting trading stats:', error);
      return {
        success: false,
        error: 'Failed to get trading stats'
      };
    }
  }

  /**
   * Update market prices (for simulation)
   */
  async updateMarketPrices() {
    try {
      this.markets.forEach((market, marketId) => {
        // Simulate price changes (-5% to +5%)
        const change = (Math.random() - 0.5) * 0.1;
        const newPrice = market.price * (1 + change);
        
        market.price = Math.max(0.0001, newPrice);
        market.change24h = ((newPrice - market.price) / market.price) * 100;
        
        // Update high/low
        market.high24h = Math.max(market.high24h, market.price);
        market.low24h = Math.min(market.low24h, market.price);
      });

      return {
        success: true,
        message: 'Market prices updated'
      };
    } catch (error) {
      console.error('Error updating market prices:', error);
      return {
        success: false,
        error: 'Failed to update market prices'
      };
    }
  }

  /**
   * Get all orders (admin function)
   */
  async getAllOrders(options = {}) {
    try {
      const { status, marketId, limit = 100, offset = 0 } = options;
      
      let allOrders = Array.from(this.orders.values());

      if (status) {
        allOrders = allOrders.filter(order => order.status === status);
      }

      if (marketId) {
        allOrders = allOrders.filter(order => order.marketId === marketId);
      }

      // Sort by creation date (newest first)
      allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Apply pagination
      const paginatedOrders = allOrders.slice(offset, offset + limit);

      return {
        success: true,
        data: {
          orders: paginatedOrders,
          total: allOrders.length,
          hasMore: (offset + limit) < allOrders.length
        }
      };
    } catch (error) {
      console.error('Error getting all orders:', error);
      return {
        success: false,
        error: 'Failed to get all orders'
      };
    }
  }

  /**
   * Get all trades (admin function)
   */
  async getAllTrades(options = {}) {
    try {
      const { marketId, limit = 100, offset = 0 } = options;
      
      let allTrades = [...this.trades];

      if (marketId) {
        allTrades = allTrades.filter(trade => trade.marketId === marketId);
      }

      // Sort by creation date (newest first)
      allTrades.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Apply pagination
      const paginatedTrades = allTrades.slice(offset, offset + limit);

      return {
        success: true,
        data: {
          trades: paginatedTrades,
          total: allTrades.length,
          hasMore: (offset + limit) < allTrades.length
        }
      };
    } catch (error) {
      console.error('Error getting all trades:', error);
      return {
        success: false,
        error: 'Failed to get all trades'
      };
    }
  }
}

// Create singleton instance
const tradingService = new TradingService();

module.exports = {
  tradingService
};