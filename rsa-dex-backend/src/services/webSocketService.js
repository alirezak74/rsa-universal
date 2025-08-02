class WebSocketService {
  constructor(io, orderMatchingEngine, blockchainService) {
    this.io = io;
    this.orderMatchingEngine = orderMatchingEngine;
    this.blockchainService = blockchainService;
  }

  handleConnection(socket) {
    // Subscribe to order book updates
    socket.on('subscribeOrderBook', (pair) => {
      const orderBook = this.orderMatchingEngine.getOrderBook(pair);
      socket.emit(`orderbook:${pair}`, orderBook);
    });

    // Subscribe to recent trades
    socket.on('subscribeTrades', (pair) => {
      const trades = this.orderMatchingEngine.getRecentTrades(pair);
      socket.emit(`trades:${pair}`, trades);
    });

    // Place order
    socket.on('placeOrder', async (order, callback) => {
      try {
        const result = this.orderMatchingEngine.addOrder(order);
        callback({ success: true, order: result });
      } catch (err) {
        callback({ success: false, error: err.message });
      }
    });

    // Cancel order
    socket.on('cancelOrder', (orderId, userId, callback) => {
      try {
        const result = this.orderMatchingEngine.cancelOrder(orderId, userId);
        callback({ success: true, order: result });
      } catch (err) {
        callback({ success: false, error: err.message });
      }
    });

    // Get user orders
    socket.on('getUserOrders', (userId, pair, callback) => {
      try {
        const orders = this.orderMatchingEngine.getUserOrders(userId, pair);
        callback({ success: true, orders });
      } catch (err) {
        callback({ success: false, error: err.message });
      }
    });

    // Get wallet balance
    socket.on('getBalance', async (address, asset, callback) => {
      try {
        const balance = await this.blockchainService.getBalance(address, asset);
        callback({ success: true, balance });
      } catch (err) {
        callback({ success: false, error: err.message });
      }
    });
  }

  handleDisconnection(socket) {
  }
}

module.exports = WebSocketService; 