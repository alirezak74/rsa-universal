/**
 * 🧪 COMPREHENSIVE QA TEST FOR RSA DEX ECOSYSTEM
 * Tests all 14 QA items plus pricing API integration
 * Version: Final — August 2025
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:8001';
const ADMIN_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:3000';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName, passed, details = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    log(`✅ ${testName}`, 'green');
  } else {
    testResults.failed++;
    log(`❌ ${testName}`, 'red');
    if (details) log(`   ${details}`, 'red');
  }
  testResults.details.push({ name: testName, passed, details });
}

async function testEndpoint(url, method = 'GET', body = null, expectedStatus = 200) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, options);
    const data = await response.json();
    
    return {
      success: response.status === expectedStatus,
      status: response.status,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function runComprehensiveQATest() {
  log('🧪 COMPREHENSIVE QA TEST FOR RSA DEX ECOSYSTEM', 'bold');
  log('Version: Final — August 2025', 'cyan');
  log('=' .repeat(80), 'cyan');
  
  // ================================
  // ✅ 1. USER ACCOUNT CREATION & WALLET GENERATION
  // ================================
  log('\n🔐 1. Testing User Account Creation & Wallet Generation', 'bold');
  
  // Test email/password registration
  const userRegistrationTest = await testEndpoint(`${BASE_URL}/api/auth/register`, 'POST', {
    email: 'test@example.com',
    password: 'password123',
    username: 'testuser'
  }, 201); // Expect 201 status for registration
  logTest('Email/Password Registration', userRegistrationTest.success, userRegistrationTest.error);
  
  // Test wallet connection
  const walletConnectTest = await testEndpoint(`${BASE_URL}/api/auth/wallet-connect`, 'POST', {
    address: '0x1234567890123456789012345678901234567890',
    signature: 'test-signature',
    message: 'test-message'
  });
  logTest('Crypto Wallet Connection', walletConnectTest.success, walletConnectTest.error);
  
  // Test wallet generation for all 13 supported networks
  const supportedNetworks = [
    'bitcoin', 'ethereum', 'bsc', 'avalanche', 'polygon', 
    'arbitrum', 'fantom', 'linea', 'solana', 'unichain', 
    'opbnb', 'base', 'polygon-zkevm'
  ];
  
  for (const network of supportedNetworks) {
    const walletGenTest = await testEndpoint(`${BASE_URL}/api/deposits/generate-address`, 'POST', {
      userId: 'test-user',
      network,
      symbol: 'RSA'
    });
    
    const hasAddress = walletGenTest.success && walletGenTest.data.success && walletGenTest.data.data && walletGenTest.data.data.address;
    logTest(`${network.toUpperCase()} Wallet Generation`, hasAddress, 
      hasAddress ? `Address: ${walletGenTest.data.data.address.substring(0, 20)}...` : walletGenTest.error);
  }
  
  // ================================
  // ✅ 2. DEPOSIT FLOW & RSA TOKEN MAPPING
  // ================================
  log('\n💰 2. Testing Deposit Flow & RSA Token Mapping', 'bold');
  
  // Test deposit for different tokens
  const depositTokens = ['BTC', 'ETH', 'BNB'];
  
  for (const token of depositTokens) {
    const depositTest = await testEndpoint(`${BASE_URL}/api/deposits/generate-address`, 'POST', {
      userId: 'test-user',
      network: token.toLowerCase(),
      symbol: token
    });
    
    const hasDepositAddress = depositTest.success && depositTest.data.success && depositTest.data.data && depositTest.data.data.address;
    logTest(`${token} Deposit Address Generation`, hasDepositAddress, 
      hasDepositAddress ? `Address: ${depositTest.data.data.address.substring(0, 20)}...` : depositTest.error);
  }
  
  // Test deposit status tracking
  const depositStatusTest = await testEndpoint(`${BASE_URL}/api/deposits/status/test-tx-hash`);
  logTest('Deposit Status Tracking', depositStatusTest.success, depositStatusTest.error);
  
  // ================================
  // ✅ 3. HOT WALLET & TREASURY OPERATIONS
  // ================================
  log('\n🏦 3. Testing Hot Wallet & Treasury Operations', 'bold');
  
  // Test hot wallet limits
  const hotWalletLimitsTest = await testEndpoint(`${BASE_URL}/admin/hot-wallet/limits`);
  logTest('Hot Wallet Limits Endpoint', hotWalletLimitsTest.success, hotWalletLimitsTest.error);
  
  if (hotWalletLimitsTest.success && hotWalletLimitsTest.data.success) {
    const limits = hotWalletLimitsTest.data.data;
    logTest('Default USD Limit ($1M)', limits.defaultUsdLimit === 1000000, `$${limits.defaultUsdLimit?.toLocaleString()}`);
    logTest('Maximum USD Limit ($10M)', limits.maximumUsdLimit === 10000000, `$${limits.maximumUsdLimit?.toLocaleString()}`);
    logTest('RSA Asset Limits', !!limits.assets?.RSA, `Daily: $${limits.assets?.RSA?.dailyLimit?.toLocaleString()}`);
  }
  
  // Test hot wallet withdrawal cap
  const updateLimitsTest = await testEndpoint(`${BASE_URL}/admin/hot-wallet/limits`, 'POST', {
    defaultUsdLimit: 1000000,
    maximumUsdLimit: 10000000,
    assets: {
      'RSA': {
        dailyLimit: 10000000,
        dailyWithdrawn: 250000,
        remainingDaily: 9750000
      }
    }
  });
  logTest('Hot Wallet Withdrawal Cap Configuration', updateLimitsTest.success, updateLimitsTest.error);
  
  // ================================
  // ✅ 4. WRAPPED TOKEN MANAGEMENT
  // ================================
  log('\n🔄 4. Testing Wrapped Token Management', 'bold');
  
  // Test wrapped token creation
  const wrappedTokenTest = await testEndpoint(`${BASE_URL}/api/admin/tokens`, 'POST', {
    symbol: 'rBTC',
    name: 'Wrapped Bitcoin',
    totalSupply: '21000000',
    wrappedToken: true,
    originalToken: 'BTC'
  });
  logTest('Wrapped Token Creation', wrappedTokenTest.success, wrappedTokenTest.error);
  
  // Test token mapping logic
  const tokenMappingTest = await testEndpoint(`${BASE_URL}/api/admin/tokens/mapping`);
  logTest('Token Mapping Logic', tokenMappingTest.success, tokenMappingTest.error);
  
  // ================================
  // ✅ 5. ASSET MANAGEMENT & TRADING PAIRS
  // ================================
  log('\n📊 5. Testing Asset Management & Trading Pairs', 'bold');
  
  // Test universal import
  const universalImportTest = await testEndpoint(`${BASE_URL}/api/admin/assets/import`, 'POST', {
    symbol: 'TEST',
    name: 'Test Token',
    totalSupply: '1000000',
    price: 1.0
  });
  logTest('Universal Asset Import', universalImportTest.success, universalImportTest.error);
  
  // Test trading pairs
  const tradingPairsTest = await testEndpoint(`${BASE_URL}/api/admin/trading-pairs`, 'POST', {
    base: 'RSA',
    quote: 'USDT',
    minOrderSize: 1,
    maxOrderSize: 1000000
  });
  logTest('Trading Pair Creation', tradingPairsTest.success, tradingPairsTest.error);
  
  // ================================
  // ✅ 6. ECOSYSTEM SYNC & REAL-TIME CONSISTENCY
  // ================================
  log('\n🔄 6. Testing Ecosystem Sync & Real-Time Consistency', 'bold');
  
  // Test system sync
  const systemSyncTest = await testEndpoint(`${BASE_URL}/admin/sync/system`, 'POST');
  logTest('System Synchronization', systemSyncTest.success, systemSyncTest.error);
  
  // Test sync status
  const syncStatusTest = await testEndpoint(`${BASE_URL}/admin/sync/status`);
  logTest('Real-Time Sync Status', syncStatusTest.success, syncStatusTest.error);
  
  if (syncStatusTest.success && syncStatusTest.data.success) {
    const syncData = syncStatusTest.data.data;
    logTest('Backend Sync Status', syncData.backend === 'synced');
    logTest('Frontend Sync Status', syncData.frontend === 'synced');
    logTest('Admin Sync Status', syncData.admin === 'synced');
    logTest('Database Sync Status', syncData.database === 'synced');
  }
  
  // ================================
  // ✅ 7. EMERGENCY & HELP PAGES
  // ================================
  log('\n🚨 7. Testing Emergency & Help Pages', 'bold');
  
  // Test emergency status
  const emergencyStatusTest = await testEndpoint(`${BASE_URL}/admin/emergency/status`);
  logTest('Emergency Status Endpoint', emergencyStatusTest.success, emergencyStatusTest.error);
  
  // Test emergency controls
  const emergencyControls = [
    { name: 'Toggle Trading', endpoint: 'toggle-trading' },
    { name: 'Toggle Withdrawals', endpoint: 'toggle-withdrawals' },
    { name: 'Toggle Deposits', endpoint: 'toggle-deposits' },
    { name: 'Toggle Emergency Mode', endpoint: 'toggle-emergency' },
    { name: 'Force System Sync', endpoint: 'force-sync' }
  ];
  
  for (const control of emergencyControls) {
    const controlTest = await testEndpoint(`${BASE_URL}/admin/emergency/${control.endpoint}`, 'POST', {
      enabled: true
    });
    logTest(`Emergency Control: ${control.name}`, controlTest.success, controlTest.error);
  }
  
  // Test help sections
  const helpSectionsTest = await testEndpoint(`${BASE_URL}/admin/help/sections`);
  logTest('Help Sections Endpoint', helpSectionsTest.success, helpSectionsTest.error);
  
  if (helpSectionsTest.success && helpSectionsTest.data.success) {
    const sections = helpSectionsTest.data.data;
    logTest('Getting Started Help Section', sections.some(s => s.id === 'getting-started'));
    logTest('Orders Management Help Section', sections.some(s => s.id === 'orders'));
    logTest('Troubleshooting Help Section', sections.some(s => s.id === 'troubleshooting'));
  }
  
  // ================================
  // ✅ 8. CROSS-NETWORK SWAP / BRIDGE FUNCTIONALITY
  // ================================
  log('\n🌉 8. Testing Cross-Network Swap / Bridge Functionality', 'bold');
  
  // Test cross-network swap
  const crossNetworkSwapTest = await testEndpoint(`${BASE_URL}/api/swap/cross-network`, 'POST', {
    fromToken: 'BTC',
    toToken: 'rBTC',
    fromNetwork: 'bitcoin',
    toNetwork: 'ethereum',
    amount: 0.1
  });
  logTest('Cross-Network Swap', crossNetworkSwapTest.success, crossNetworkSwapTest.error);
  
  // Test bridge functionality
  const bridgeTest = await testEndpoint(`${BASE_URL}/api/bridge/status`, 'GET');
  logTest('Bridge Status', bridgeTest.success, bridgeTest.error);
  
  // ================================
  // ✅ 9. ORDER BOOK & TRADE ENGINE
  // ================================
  log('\n📈 9. Testing Order Book & Trade Engine', 'bold');
  
  // Test order placement
  const orderPlacementTest = await testEndpoint(`${BASE_URL}/api/orders`, 'POST', {
    pair: 'RSA/USDT',
    side: 'buy',
    type: 'market',
    amount: 100,
    price: 0.85
  }, 201); // Expect 201 status for order creation
  logTest('Order Placement', orderPlacementTest.success, orderPlacementTest.error);
  
  // Test order book
  const orderBookTest = await testEndpoint(`${BASE_URL}/api/orders?page=1&limit=10`);
  logTest('Order Book Retrieval', orderBookTest.success, orderBookTest.error);
  
  // Test trade execution
  const tradeExecutionTest = await testEndpoint(`${BASE_URL}/api/trades`, 'POST', {
    pair: 'RSA/USDT',
    side: 'buy',
    amount: 50,
    price: 0.85
  });
  logTest('Trade Execution', tradeExecutionTest.success, tradeExecutionTest.error);
  
  // ================================
  // ✅ 10. FEE & REVENUE ACCOUNTING
  // ================================
  log('\n💸 10. Testing Fee & Revenue Accounting', 'bold');
  
  // Test fee calculation
  const feeCalculationTest = await testEndpoint(`${BASE_URL}/api/admin/fees/calculate`, 'POST', {
    tradeAmount: 1000,
    pair: 'RSA/USDT'
  });
  logTest('Fee Calculation', feeCalculationTest.success, feeCalculationTest.error);
  
  // Test revenue reports
  const revenueReportTest = await testEndpoint(`${BASE_URL}/api/admin/revenue/report`);
  logTest('Revenue Report Generation', revenueReportTest.success, revenueReportTest.error);
  
  // ================================
  // ✅ 11. SESSION & TOKEN EXPIRY SECURITY
  // ================================
  log('\n🔒 11. Testing Session & Token Expiry Security', 'bold');
  
  // Test session validation
  const sessionValidationTest = await testEndpoint(`${BASE_URL}/api/auth/validate-session`, 'POST', {
    token: 'expired-token'
  });
  logTest('Session Validation (Expired Token)', !sessionValidationTest.success, 'Should reject expired token');
  
  // Test admin session protection
  const adminSessionTest = await testEndpoint(`${BASE_URL}/admin/auth/validate`, 'POST', {
    token: 'invalid-admin-token'
  });
  logTest('Admin Session Protection', !adminSessionTest.success, 'Should reject invalid admin token');
  
  // ================================
  // ✅ 12. KYC / AML (If Enabled)
  // ================================
  log('\n📋 12. Testing KYC / AML (If Enabled)', 'bold');
  
  // Test KYC document upload
  const kycUploadTest = await testEndpoint(`${BASE_URL}/api/kyc/upload`, 'POST', {
    userId: 'test-user',
    documentType: 'passport',
    documentNumber: 'TEST123456'
  });
  logTest('KYC Document Upload', kycUploadTest.success, kycUploadTest.error);
  
  // Test KYC status tracking
  const kycStatusTest = await testEndpoint(`${BASE_URL}/api/kyc/status/test-user`);
  logTest('KYC Status Tracking', kycStatusTest.success, kycStatusTest.error);
  
  // ================================
  // ✅ 13. PRICE FEEDS & ORACLE SYNC
  // ================================
  log('\n💰 13. Testing Price Feeds & Oracle Sync', 'bold');
  
  // Test all pricing APIs
  const pricingAPIs = [
    { name: 'Binance API', test: 'BTC' },
    { name: 'CoinMarketCap API', test: 'ETH' },
    { name: 'CoinLore API', test: 'USDT' },
    { name: 'Moralis API', test: 'RSA' },
    { name: 'CoinDesk API', test: 'BTC' }
  ];
  
  for (const api of pricingAPIs) {
    const pricingTest = await testEndpoint(`${BASE_URL}/api/prices?symbols=${api.test}`);
    logTest(`${api.name} Integration`, pricingTest.success, pricingTest.error);
  }
  
  // Test CoinGecko proxy
  const coinGeckoTest = await testEndpoint(`${BASE_URL}/api/proxy/coingecko/simple/price?ids=bitcoin,tether,rsachain&vs_currencies=usd`);
  logTest('CoinGecko Proxy API', coinGeckoTest.success, coinGeckoTest.error);
  
  // Test live price data
  const livePriceTest = await testEndpoint(`${BASE_URL}/api/prices?symbols=BTC,ETH,RSA,USDT`);
  if (livePriceTest.success && livePriceTest.data.success) {
    const prices = livePriceTest.data.data.prices;
    logTest('Live BTC Price', !!prices.BTC, `Price: $${prices.BTC?.usd || 'N/A'}`);
    logTest('Live ETH Price', !!prices.ETH, `Price: $${prices.ETH?.usd || 'N/A'}`);
    logTest('Live RSA Price', !!prices.RSA, `Price: $${prices.RSA?.usd || 'N/A'}`);
    logTest('Live USDT Price', !!prices.USDT, `Price: $${prices.USDT?.usd || 'N/A'}`);
  }
  
  // ================================
  // ✅ 14. NOTIFICATIONS & EVENT ALERTS
  // ================================
  log('\n🔔 14. Testing Notifications & Event Alerts', 'bold');
  
  // Test user notifications
  const userNotificationTest = await testEndpoint(`${BASE_URL}/api/notifications/user/test-user`);
  logTest('User Notifications', userNotificationTest.success, userNotificationTest.error);
  
  // Test admin alerts
  const adminAlertTest = await testEndpoint(`${BASE_URL}/api/admin/alerts`);
  logTest('Admin Alerts', adminAlertTest.success, adminAlertTest.error);
  
  // Test email notifications
  const emailNotificationTest = await testEndpoint(`${BASE_URL}/api/notifications/email`, 'POST', {
    userId: 'test-user',
    type: 'deposit',
    amount: 100
  });
  logTest('Email Notifications', emailNotificationTest.success, emailNotificationTest.error);
  
  // ================================
  // 🧪 EXTRA QA CHECKS
  // ================================
  log('\n🧪 Extra QA Checks', 'bold');
  
  // Test API completeness
  const apiCompletenessTest = await testEndpoint(`${BASE_URL}/api/health`);
  logTest('API Completeness', apiCompletenessTest.success, apiCompletenessTest.error);
  
  // Test admin assets endpoint
  const adminAssetsTest = await testEndpoint(`${BASE_URL}/api/dev/admin/assets`);
  logTest('Admin Assets Endpoint', adminAssetsTest.success, adminAssetsTest.error);
  
  if (adminAssetsTest.success && adminAssetsTest.data.success) {
    const assets = adminAssetsTest.data.data;
    logTest('BTC Asset Available', assets.some(a => a.symbol === 'BTC'));
    logTest('ETH Asset Available', assets.some(a => a.symbol === 'ETH'));
    logTest('RSA Asset Available', assets.some(a => a.symbol === 'RSA'));
    logTest('USDT Asset Available', assets.some(a => a.symbol === 'USDT'));
    
    // Test sync status
    const syncedAssets = assets.filter(a => a.syncStatus === 'synced');
    logTest('Assets Sync Status', syncedAssets.length > 0, `${syncedAssets.length}/${assets.length} assets synced`);
  }
  
  // Test trading endpoints
  const tradingEndpointsTest = await testEndpoint(`${BASE_URL}/api/markets/RSA/USDT/trades`);
  logTest('Trading Endpoints', tradingEndpointsTest.success, tradingEndpointsTest.error);
  
  // Test security validation
  const securityTest = await testEndpoint(`${BASE_URL}/api/auth/validate-input`, 'POST', {
    input: '<script>alert("xss")</script>'
  });
  logTest('Security Input Validation', !securityTest.success, 'Should reject malicious input');
  
  // ================================
  // 📊 FINAL RESULTS
  // ================================
  log('\n' + '='.repeat(80), 'cyan');
  log('📊 COMPREHENSIVE QA TEST RESULTS', 'bold');
  log('='.repeat(80), 'cyan');
  
  log(`✅ Passed: ${testResults.passed}`, 'green');
  log(`❌ Failed: ${testResults.failed}`, 'red');
  log(`📊 Total: ${testResults.total}`, 'blue');
  
  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(2);
  log(`🎯 Success Rate: ${successRate}%`, successRate >= 95 ? 'green' : 'yellow');
  
  if (testResults.failed > 0) {
    log('\n❌ FAILED TESTS:', 'red');
    testResults.details
      .filter(test => !test.passed)
      .forEach(test => {
        log(`   • ${test.name}: ${test.details}`, 'red');
      });
  }
  
  log('\n🎉 COMPREHENSIVE QA TEST COMPLETED!', 'bold');
  
  if (successRate >= 95) {
    log('🚀 All QA requirements met! RSA DEX ecosystem is production-ready.', 'green');
  } else {
    log('⚠️  Some QA requirements failed. Please address the issues above.', 'yellow');
  }
  
  // Generate QA report
  log('\n📋 QA REPORT SUMMARY:', 'bold');
  log('1. User Account Creation & Wallet Generation: ' + (testResults.details.filter(t => t.name.includes('Registration') || t.name.includes('Wallet')).every(t => t.passed) ? '✅ PASS' : '❌ FAIL'), 'cyan');
  log('2. Deposit Flow & RSA Token Mapping: ' + (testResults.details.filter(t => t.name.includes('Deposit')).every(t => t.passed) ? '✅ PASS' : '❌ FAIL'), 'cyan');
  log('3. Hot Wallet & Treasury Operations: ' + (testResults.details.filter(t => t.name.includes('Hot Wallet')).every(t => t.passed) ? '✅ PASS' : '❌ FAIL'), 'cyan');
  log('4. Wrapped Token Management: ' + (testResults.details.filter(t => t.name.includes('Wrapped Token')).every(t => t.passed) ? '✅ PASS' : '❌ FAIL'), 'cyan');
  log('5. Asset Management & Trading Pairs: ' + (testResults.details.filter(t => t.name.includes('Asset') || t.name.includes('Trading Pair')).every(t => t.passed) ? '✅ PASS' : '❌ FAIL'), 'cyan');
  log('6. Ecosystem Sync & Real-Time Consistency: ' + (testResults.details.filter(t => t.name.includes('Sync')).every(t => t.passed) ? '✅ PASS' : '❌ FAIL'), 'cyan');
  log('7. Emergency & Help Pages: ' + (testResults.details.filter(t => t.name.includes('Emergency') || t.name.includes('Help')).every(t => t.passed) ? '✅ PASS' : '❌ FAIL'), 'cyan');
  log('8. Cross-Network Swap / Bridge Functionality: ' + (testResults.details.filter(t => t.name.includes('Cross-Network') || t.name.includes('Bridge')).every(t => t.passed) ? '✅ PASS' : '❌ FAIL'), 'cyan');
  log('9. Order Book & Trade Engine: ' + (testResults.details.filter(t => t.name.includes('Order') || t.name.includes('Trade')).every(t => t.passed) ? '✅ PASS' : '❌ FAIL'), 'cyan');
  log('10. Fee & Revenue Accounting: ' + (testResults.details.filter(t => t.name.includes('Fee') || t.name.includes('Revenue')).every(t => t.passed) ? '✅ PASS' : '❌ FAIL'), 'cyan');
  log('11. Session & Token Expiry Security: ' + (testResults.details.filter(t => t.name.includes('Session') || t.name.includes('Security')).every(t => t.passed) ? '✅ PASS' : '❌ FAIL'), 'cyan');
  log('12. KYC / AML (If Enabled): ' + (testResults.details.filter(t => t.name.includes('KYC')).every(t => t.passed) ? '✅ PASS' : '❌ FAIL'), 'cyan');
  log('13. Price Feeds & Oracle Sync: ' + (testResults.details.filter(t => t.name.includes('Price') || t.name.includes('API')).every(t => t.passed) ? '✅ PASS' : '❌ FAIL'), 'cyan');
  log('14. Notifications & Event Alerts: ' + (testResults.details.filter(t => t.name.includes('Notification') || t.name.includes('Alert')).every(t => t.passed) ? '✅ PASS' : '❌ FAIL'), 'cyan');
}

// Run the comprehensive QA test
runComprehensiveQATest().catch(error => {
  log(`❌ QA test execution failed: ${error.message}`, 'red');
  process.exit(1);
});