const { sequelize } = require('./index');
const User = require('./User');
const Order = require('./Order');
const Trade = require('./Trade');

async function seed() {
  await sequelize.sync({ force: true });

  // Seed users
  const users = await User.bulkCreate([
    { id: '1', username: 'admin', password: 'admin123', walletAddress: 'RSAadminwallet', createdAt: new Date() },
    { id: '2', username: 'alice', password: 'alicepw', walletAddress: 'RSAalicewallet', createdAt: new Date() },
    { id: '3', username: 'bob', password: 'bobpw', walletAddress: 'RSAbobwallet', createdAt: new Date() },
  ]);

  // Seed orders
  const orders = await Order.bulkCreate([
    { id: '101', userId: '2', pair: 'RSA/USDT', side: 'buy', type: 'limit', amount: 100, price: 1.5, status: 'open', filled: 0, remaining: 100, createdAt: new Date(), updatedAt: new Date() },
    { id: '102', userId: '3', pair: 'RSA/USDT', side: 'sell', type: 'limit', amount: 50, price: 1.6, status: 'open', filled: 0, remaining: 50, createdAt: new Date(), updatedAt: new Date() },
  ]);

  // Seed trades
  await Trade.bulkCreate([
    { id: '201', buyOrderId: '101', sellOrderId: '102', pair: 'RSA/USDT', amount: 25, price: 1.55, timestamp: new Date() },
  ]);

  console.log('Seed data inserted.');
  process.exit(0);
}

seed(); 