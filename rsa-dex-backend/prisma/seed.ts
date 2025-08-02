import { PrismaClient, WalletStatus, OrderType, OrderStatus, TransactionStatus, LogType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@rsachain.com',
      password: 'admin123', // In production, hash this!
      role: 'super_admin',
    },
  });

  // Create regular user
  const user = await prisma.user.create({
    data: {
      username: 'user1',
      email: 'user1@rsachain.com',
      password: 'user123',
      role: 'user',
    },
  });

  // Create wallets
  const wallet1 = await prisma.wallet.create({
    data: {
      address: 'rsa1walletaddress',
      publicKey: 'rsa1pubkey',
      secretKey: 'rsa1secret',
      status: WalletStatus.ACTIVE,
      userId: user.id,
    },
  });
  const wallet2 = await prisma.wallet.create({
    data: {
      address: 'rsa2walletaddress',
      publicKey: 'rsa2pubkey',
      secretKey: 'rsa2secret',
      status: WalletStatus.FROZEN,
      userId: user.id,
    },
  });

  // Create contract and tokens
  const contract = await prisma.contract.create({
    data: {
      address: '0xcontract1',
      name: 'RSA Main DEX',
      status: 'active',
    },
  });
  const token1 = await prisma.token.create({
    data: {
      symbol: 'RSA',
      name: 'RSA Token',
      contractId: contract.id,
      isWhitelisted: true,
    },
  });
  const token2 = await prisma.token.create({
    data: {
      symbol: 'USDT',
      name: 'Tether USD',
      contractId: contract.id,
      isWhitelisted: true,
    },
  });

  // Create orders
  const order1 = await prisma.order.create({
    data: {
      userId: user.id,
      type: OrderType.LIMIT,
      status: OrderStatus.ACTIVE,
      tokenPair: 'RSA/USDT',
      amount: 100,
      price: 1.5,
    },
  });
  const order2 = await prisma.order.create({
    data: {
      userId: user.id,
      type: OrderType.MARKET,
      status: OrderStatus.COMPLETED,
      tokenPair: 'RSA/USDT',
      amount: 50,
      price: 1.6,
    },
  });

  // Create trades
  await prisma.trade.create({
    data: {
      orderId: order1.id,
      amount: 50,
      price: 1.5,
    },
  });
  await prisma.trade.create({
    data: {
      orderId: order2.id,
      amount: 50,
      price: 1.6,
    },
  });

  // Create transactions
  await prisma.transaction.create({
    data: {
      hash: 'txhash1',
      fromWalletId: wallet1.id,
      toWalletId: wallet2.id,
      amount: 100,
      status: TransactionStatus.PENDING,
    },
  });
  await prisma.transaction.create({
    data: {
      hash: 'txhash2',
      fromWalletId: wallet2.id,
      toWalletId: wallet1.id,
      amount: 50,
      status: TransactionStatus.APPROVED,
    },
  });

  // Create logs
  await prisma.log.create({
    data: {
      type: LogType.INFO,
      message: 'Admin logged in',
      userId: admin.id,
    },
  });
  await prisma.log.create({
    data: {
      type: LogType.SECURITY,
      message: 'Wallet frozen',
      userId: admin.id,
    },
  });

  // Create admin actions
  await prisma.adminAction.create({
    data: {
      userId: admin.id,
      action: 'LOGIN',
      details: 'Admin logged in from 127.0.0.1',
    },
  });
  await prisma.adminAction.create({
    data: {
      userId: admin.id,
      action: 'FREEZE_WALLET',
      details: `Wallet ${wallet2.address} frozen`,
    },
  });

  console.log('Seed data created!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 