const EventEmitter = require('events');

class OrderService extends EventEmitter {
  constructor() {
    super();
    this.orders = new Map(); // orderId -> order
    this.orderBooks = new Map(); // pair -> { bids: [], asks: [] }
    this.trades = []; // recent trades
    this.nextOrderId = 1;
    this.nextTradeId = 1;
    
    // Initialize default trading pairs
    this.initializeMarkets();
  }

  initializeMarkets() {
    const defaultPairs = ['RSA/USDT', 'RSA/BTC', 'BTC/USDT'];
    defaultPairs.forEach(pair => {
      this.orderBooks.set(pair, {
        bids: [], // sorted by price desc
        asks: []  // sorted by price asc
      });
    });
  }

  getMarkets() {
    return Array.from(this.orderBooks.keys()).map(pair => ({
      pair,
      baseAsset: pair.split('/')[0],
      quoteAsset: pair.split('/')[1],
      minOrderSize: 0.001,
      pricePrecision: 8,
      amountPrecision: 6
    }));
  }

  getTicker(pair) {
    const orderBook = this.orderBooks.get(pair);
    if (!orderBook) {
      throw new Error(`Market ${pair} not found`);
    }

    const lastTrade = this.trades
      .filter(trade => trade.pair === pair)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

    const bestBid = orderBook.bids[0];
    const bestAsk = orderBook.asks[0];

    return {
      pair,
      lastPrice: lastTrade ? lastTrade.price : 0,
      bestBid: bestBid ? bestBid.price : 0,
      bestAsk: bestAsk ? bestAsk.price : 0,
      volume24h: this.get24hVolume(pair),
      change24h: this.get24hChange(pair),
      high24h: this.get24hHigh(pair),
      low24h: this.get24hLow(pair)
    };
  }

  getOrderBook(pair, limit = 20) {
    const orderBook = this.orderBooks.get(pair);
    if (!orderBook) {
      throw new Error(`Market ${pair} not found`);
    }

    return {
      pair,
      bids: orderBook.bids.slice(0, limit),
      asks: orderBook.asks.slice(0, limit),
      timestamp: new Date().toISOString()
    };
  }

  getRecentTrades(pair, limit = 50) {
    return this.trades
      .filter(trade => trade.pair === pair)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  async placeOrder(orderData) {
    const { userId, pair, side, type, amount, price } = orderData;
    
    if (!this.orderBooks.has(pair)) {
      throw new Error(`Market ${pair} not found`);
    }

    const orderId = this.nextOrderId++;
    const order = {
      id: orderId.toString(),
      userId,
      pair,
      side, // 'buy' or 'sell'
      type, // 'market' or 'limit'
      amount: parseFloat(amount),
      price: price ? parseFloat(price) : null,
      filled: 0,
      remaining: parseFloat(amount),
      status: 'open',
      timestamp: new Date().toISOString()
    };

    this.orders.set(orderId.toString(), order);

    if (type === 'market') {
      // Execute market order immediately
      await this.executeMarketOrder(order);
    } else {
      // Add limit order to order book
      this.addToOrderBook(order);
      // Try to match the order
      await this.matchOrder(order);
    }

    return order;
  }

  async executeMarketOrder(order) {
    const orderBook = this.orderBooks.get(order.pair);
    let remaining = order.amount;

    if (order.side === 'buy') {
      // Buy at best ask prices
      while (remaining > 0 && orderBook.asks.length > 0) {
        const bestAsk = orderBook.asks[0];
        const tradeAmount = Math.min(remaining, bestAsk.remaining);
        
        await this.executeTrade(order, bestAsk, tradeAmount, bestAsk.price);
        remaining -= tradeAmount;
        
        if (bestAsk.remaining <= 0) {
          orderBook.asks.shift();
        }
      }
    } else {
      // Sell at best bid prices
      while (remaining > 0 && orderBook.bids.length > 0) {
        const bestBid = orderBook.bids[0];
        const tradeAmount = Math.min(remaining, bestBid.remaining);
        
        await this.executeTrade(bestBid, order, tradeAmount, bestBid.price);
        remaining -= tradeAmount;
        
        if (bestBid.remaining <= 0) {
          orderBook.bids.shift();
        }
      }
    }

    // Update order status
    order.filled = order.amount - remaining;
    order.remaining = remaining;
    order.status = remaining > 0 ? 'partial' : 'filled';
  }

  async matchOrder(order) {
    const orderBook = this.orderBooks.get(order.pair);
    
    if (order.side === 'buy') {
      // Try to match with asks
      while (order.remaining > 0 && orderBook.asks.length > 0) {
        const bestAsk = orderBook.asks[0];
        
        if (order.price >= bestAsk.price) {
          const tradeAmount = Math.min(order.remaining, bestAsk.remaining);
          await this.executeTrade(order, bestAsk, tradeAmount, bestAsk.price);
          
          if (bestAsk.remaining <= 0) {
            orderBook.asks.shift();
          }
        } else {
          break;
        }
      }
    } else {
      // Try to match with bids
      while (order.remaining > 0 && orderBook.bids.length > 0) {
        const bestBid = orderBook.bids[0];
        
        if (order.price <= bestBid.price) {
          const tradeAmount = Math.min(order.remaining, bestBid.remaining);
          await this.executeTrade(bestBid, order, tradeAmount, bestBid.price);
          
          if (bestBid.remaining <= 0) {
            orderBook.bids.shift();
          }
        } else {
          break;
        }
      }
    }
  }

  async executeTrade(buyOrder, sellOrder, amount, price) {
    const tradeId = this.nextTradeId++;
    const trade = {
      id: tradeId.toString(),
      pair: buyOrder.pair,
      price: parseFloat(price),
      amount: parseFloat(amount),
      side: buyOrder.side,
      buyOrderId: buyOrder.id,
      sellOrderId: sellOrder.id,
      timestamp: new Date().toISOString()
    };

    this.trades.push(trade);

    // Update orders
    buyOrder.filled += amount;
    buyOrder.remaining -= amount;
    sellOrder.filled += amount;
    sellOrder.remaining -= amount;

    // Update order status
    if (buyOrder.remaining <= 0) {
      buyOrder.status = 'filled';
      this.removeFromOrderBook(buyOrder);
    }
    if (sellOrder.remaining <= 0) {
      sellOrder.status = 'filled';
      this.removeFromOrderBook(sellOrder);
    }

    // Emit trade event
    this.emit('trade', trade);
    
    return trade;
  }

  addToOrderBook(order) {
    const orderBook = this.orderBooks.get(order.pair);
    
    if (order.side === 'buy') {
      this.insertBid(orderBook.bids, order);
    } else {
      this.insertAsk(orderBook.asks, order);
    }
  }

  removeFromOrderBook(order) {
    const orderBook = this.orderBooks.get(order.pair);
    
    if (order.side === 'buy') {
      const index = orderBook.bids.findIndex(bid => bid.id === order.id);
      if (index !== -1) {
        orderBook.bids.splice(index, 1);
      }
    } else {
      const index = orderBook.asks.findIndex(ask => ask.id === order.id);
      if (index !== -1) {
        orderBook.asks.splice(index, 1);
      }
    }
  }

  insertBid(bids, order) {
    // Insert in descending price order
    let i = 0;
    while (i < bids.length && bids[i].price > order.price) {
      i++;
    }
    bids.splice(i, 0, order);
  }

  insertAsk(asks, order) {
    // Insert in ascending price order
    let i = 0;
    while (i < asks.length && asks[i].price < order.price) {
      i++;
    }
    asks.splice(i, 0, order);
  }

  async cancelOrder(orderId, userId) {
    const order = this.orders.get(orderId);
    
    if (!order || order.userId !== userId) {
      return null;
    }

    if (order.status === 'filled' || order.status === 'cancelled') {
      return null;
    }

    order.status = 'cancelled';
    this.removeFromOrderBook(order);
    
    return order;
  }

  getUserOrders(userId, filters = {}) {
    let orders = Array.from(this.orders.values())
      .filter(order => order.userId === userId);

    if (filters.status) {
      orders = orders.filter(order => order.status === filters.status);
    }
    if (filters.pair) {
      orders = orders.filter(order => order.pair === filters.pair);
    }

    // Sort by timestamp desc
    orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Apply pagination
    const start = filters.offset || 0;
    const end = start + (filters.limit || 50);
    
    return orders.slice(start, end);
  }

  getOrder(orderId, userId) {
    const order = this.orders.get(orderId);
    return order && order.userId === userId ? order : null;
  }

  getUserTrades(userId, filters = {}) {
    let trades = this.trades.filter(trade => {
      const buyOrder = this.orders.get(trade.buyOrderId);
      const sellOrder = this.orders.get(trade.sellOrderId);
      return buyOrder?.userId === userId || sellOrder?.userId === userId;
    });

    if (filters.pair) {
      trades = trades.filter(trade => trade.pair === filters.pair);
    }

    // Sort by timestamp desc
    trades.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Apply pagination
    const start = filters.offset || 0;
    const end = start + (filters.limit || 50);
    
    return trades.slice(start, end);
  }

  // Helper methods for ticker data
  get24hVolume(pair) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.trades
      .filter(trade => trade.pair === pair && new Date(trade.timestamp) > oneDayAgo)
      .reduce((sum, trade) => sum + trade.amount, 0);
  }

  get24hChange(pair) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const trades24h = this.trades
      .filter(trade => trade.pair === pair && new Date(trade.timestamp) > oneDayAgo)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    if (trades24h.length < 2) return 0;

    const firstPrice = trades24h[0].price;
    const lastPrice = trades24h[trades24h.length - 1].price;
    
    return ((lastPrice - firstPrice) / firstPrice) * 100;
  }

  get24hHigh(pair) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const trades24h = this.trades
      .filter(trade => trade.pair === pair && new Date(trade.timestamp) > oneDayAgo);
    
    return trades24h.length > 0 ? Math.max(...trades24h.map(t => t.price)) : 0;
  }

  get24hLow(pair) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const trades24h = this.trades
      .filter(trade => trade.pair === pair && new Date(trade.timestamp) > oneDayAgo);
    
    return trades24h.length > 0 ? Math.min(...trades24h.map(t => t.price)) : 0;
  }
}

module.exports = new OrderService(); 