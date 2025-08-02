const EventEmitter = require('events');
const logger = require('../utils/logger');

class OrderMatchingEngine extends EventEmitter {
  constructor(io) {
    super();
    this.io = io;
    this.orderBooks = new Map(); // Map<tradingPair, {bids: [], asks: []}>
    this.orders = new Map(); // Map<orderId, order>
    this.trades = []; // Recent trades
    this.maxTradesHistory = 1000;
    
    // Initialize order books for supported pairs
    this.initializeOrderBooks();
    
    // Start periodic cleanup
    setInterval(() => this.cleanupExpiredOrders(), 60000); // Every minute
  }

  initializeOrderBooks() {
    const supportedPairs = ['RSA/USDT', 'RSA/BTC', 'RSA/ETH'];
    supportedPairs.forEach(pair => {
      this.orderBooks.set(pair, {
        bids: [], // Buy orders (highest price first)
        asks: []  // Sell orders (lowest price first)
      });
    });
  }

  // Add a new order to the order book
  addOrder(order) {
    const { id, pair, side, type, price, amount, userId, timestamp } = order;
    
    // Validate order
    if (!this.validateOrder(order)) {
      throw new Error('Invalid order');
    }

    // Store order
    this.orders.set(id, {
      ...order,
      status: 'pending',
      filled: 0,
      remaining: amount
    });

    // Add to order book
    const orderBook = this.orderBooks.get(pair);
    if (!orderBook) {
      throw new Error(`Unsupported trading pair: ${pair}`);
    }

    const orderEntry = {
      id,
      price,
      amount: order.remaining,
      userId,
      timestamp,
      side
    };

    if (side === 'buy') {
      this.insertBid(orderBook.bids, orderEntry);
    } else {
      this.insertAsk(orderBook.asks, orderEntry);
    }

    // Try to match orders
    this.matchOrders(pair);

    // Emit order book update
    this.emitOrderBookUpdate(pair);
    
    logger.info(`Order added: ${id} ${side} ${amount} ${pair} @ ${price}`);
    
    return order;
  }

  // Insert bid order (buy) - highest price first
  insertBid(bids, order) {
    const index = bids.findIndex(bid => bid.price < order.price);
    if (index === -1) {
      bids.push(order);
    } else {
      bids.splice(index, 0, order);
    }
  }

  // Insert ask order (sell) - lowest price first
  insertAsk(asks, order) {
    const index = asks.findIndex(ask => ask.price > order.price);
    if (index === -1) {
      asks.push(order);
    } else {
      asks.splice(index, 0, order);
    }
  }

  // Match orders for a specific trading pair
  matchOrders(pair) {
    const orderBook = this.orderBooks.get(pair);
    if (!orderBook) return;

    const { bids, asks } = orderBook;

    while (bids.length > 0 && asks.length > 0) {
      const bestBid = bids[0];
      const bestAsk = asks[0];

      // Check if orders can be matched
      if (bestBid.price >= bestAsk.price) {
        // Match orders
        const tradeAmount = Math.min(bestBid.amount, bestAsk.amount);
        const tradePrice = bestBid.timestamp < bestAsk.timestamp ? bestBid.price : bestAsk.price;

        // Execute trade
        this.executeTrade(pair, bestBid, bestAsk, tradeAmount, tradePrice);

        // Update order amounts
        bestBid.amount -= tradeAmount;
        bestAsk.amount -= tradeAmount;

        // Remove filled orders
        if (bestBid.amount === 0) {
          bids.shift();
          this.updateOrderStatus(bestBid.id, 'filled');
        }
        if (bestAsk.amount === 0) {
          asks.shift();
          this.updateOrderStatus(bestAsk.id, 'filled');
        }
      } else {
        // No more matches possible
        break;
      }
    }
  }

  // Execute a trade between two orders
  executeTrade(pair, bidOrder, askOrder, amount, price) {
    const trade = {
      id: this.generateTradeId(),
      pair,
      price,
      amount,
      side: 'buy', // From the perspective of the taker
      makerOrderId: bidOrder.timestamp < askOrder.timestamp ? bidOrder.id : askOrder.id,
      takerOrderId: bidOrder.timestamp < askOrder.timestamp ? askOrder.id : bidOrder.id,
      timestamp: Date.now()
    };

    // Add to trades history
    this.trades.push(trade);
    if (this.trades.length > this.maxTradesHistory) {
      this.trades.shift();
    }

    // Update order statuses
    this.updateOrderFilled(bidOrder.id, amount);
    this.updateOrderFilled(askOrder.id, amount);

    // Emit trade event
    this.emit('trade', trade);
    this.io.emit('trade', trade);

    logger.info(`Trade executed: ${trade.id} ${amount} ${pair} @ ${price}`);
  }

  // Update order filled amount
  updateOrderFilled(orderId, filledAmount) {
    const order = this.orders.get(orderId);
    if (order) {
      order.filled += filledAmount;
      order.remaining -= filledAmount;
      
      if (order.remaining === 0) {
        order.status = 'filled';
      } else {
        order.status = 'partial';
      }
    }
  }

  // Update order status
  updateOrderStatus(orderId, status) {
    const order = this.orders.get(orderId);
    if (order) {
      order.status = status;
    }
  }

  // Cancel an order
  cancelOrder(orderId, userId) {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.userId !== userId) {
      throw new Error('Unauthorized to cancel this order');
    }

    if (order.status === 'filled' || order.status === 'cancelled') {
      throw new Error('Order cannot be cancelled');
    }

    // Remove from order book
    const orderBook = this.orderBooks.get(order.pair);
    if (orderBook) {
      if (order.side === 'buy') {
        const index = orderBook.bids.findIndex(bid => bid.id === orderId);
        if (index !== -1) {
          orderBook.bids.splice(index, 1);
        }
      } else {
        const index = orderBook.asks.findIndex(ask => ask.id === orderId);
        if (index !== -1) {
          orderBook.asks.splice(index, 1);
        }
      }
    }

    // Update order status
    order.status = 'cancelled';

    // Emit order book update
    this.emitOrderBookUpdate(order.pair);

    logger.info(`Order cancelled: ${orderId}`);
    return order;
  }

  // Get order book for a trading pair
  getOrderBook(pair, depth = 20) {
    const orderBook = this.orderBooks.get(pair);
    if (!orderBook) {
      return { bids: [], asks: [] };
    }

    return {
      bids: orderBook.bids.slice(0, depth),
      asks: orderBook.asks.slice(0, depth)
    };
  }

  // Get recent trades
  getRecentTrades(pair, limit = 50) {
    return this.trades
      .filter(trade => trade.pair === pair)
      .slice(-limit)
      .reverse();
  }

  // Get user orders
  getUserOrders(userId, pair = null) {
    const userOrders = Array.from(this.orders.values())
      .filter(order => order.userId === userId);

    if (pair) {
      return userOrders.filter(order => order.pair === pair);
    }

    return userOrders;
  }

  // Validate order
  validateOrder(order) {
    const { pair, side, type, price, amount } = order;

    if (!this.orderBooks.has(pair)) {
      return false;
    }

    if (!['buy', 'sell'].includes(side)) {
      return false;
    }

    if (!['market', 'limit'].includes(type)) {
      return false;
    }

    if (type === 'limit' && (!price || price <= 0)) {
      return false;
    }

    if (!amount || amount <= 0) {
      return false;
    }

    return true;
  }

  // Generate unique trade ID
  generateTradeId() {
    return `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Cleanup expired orders
  cleanupExpiredOrders() {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [orderId, order] of this.orders) {
      if (order.status === 'pending' && (now - order.timestamp) > maxAge) {
        this.cancelOrder(orderId, order.userId);
      }
    }
  }

  // Emit order book update
  emitOrderBookUpdate(pair) {
    const orderBook = this.getOrderBook(pair);
    this.io.emit(`orderbook:${pair}`, orderBook);
  }

  // Get market statistics
  getMarketStats(pair) {
    const orderBook = this.getOrderBook(pair);
    const recentTrades = this.getRecentTrades(pair, 100);

    if (recentTrades.length === 0) {
      return {
        pair,
        lastPrice: 0,
        change24h: 0,
        volume24h: 0,
        high24h: 0,
        low24h: 0
      };
    }

    const lastPrice = recentTrades[0].price;
    const volume24h = recentTrades.reduce((sum, trade) => sum + trade.amount, 0);
    const prices = recentTrades.map(trade => trade.price);
    const high24h = Math.max(...prices);
    const low24h = Math.min(...prices);

    // Calculate 24h change (simplified)
    const change24h = recentTrades.length > 1 ? 
      ((lastPrice - recentTrades[recentTrades.length - 1].price) / recentTrades[recentTrades.length - 1].price) * 100 : 0;

    return {
      pair,
      lastPrice,
      change24h,
      volume24h,
      high24h,
      low24h
    };
  }
}

module.exports = OrderMatchingEngine; 