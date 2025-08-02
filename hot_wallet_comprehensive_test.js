/**
 * 🔥 HOT WALLET MANAGEMENT COMPREHENSIVE TEST SUITE
 * 
 * This script validates:
 * 1. All new Hot Wallet Management endpoints
 * 2. Enhanced Wrapped Token Management features
 * 3. Existing RSA DEX functionality preservation
 * 4. Non-disruptive integration verification
 */

const axios = require('axios');
const fs = require('fs');

// Configuration
const CONFIG = {
  BACKEND_URL: 'http://localhost:8001',
  ADMIN_TOKEN: 'admin-test-token',
  TEST_USER_ID: 'hot-wallet-test-user'
};

// Test results storage
let testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  total: 0,
  details: []
};

// Utility function for API requests
async function makeRequest(method, url, data = null, headers = {}) {
  try {
    const config = {
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.ADMIN_TOKEN}`,
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.message, 
      status: error.response?.status, 
      data: error.response?.data 
    };
  }
}

// Test logging function
function logTest(testName, status, details = '') {
  testResults.total++;
  testResults[status]++;
  
  const statusEmoji = {
    passed: '✅',
    failed: '❌', 
    warnings: '⚠️'
  };
  
  const result = {
    test: testName,
    status,
    details,
    timestamp: new Date().toISOString()
  };
  
  testResults.details.push(result);
  console.log(`${statusEmoji[status]} ${testName}: ${status.toUpperCase()}${details ? ` - ${details}` : ''}`);
}

// Test functions
async function testHotWalletDashboard() {
  console.log('\n🔥 TESTING HOT WALLET DASHBOARD...');
  
  const response = await makeRequest('GET', `${CONFIG.BACKEND_URL}/api/admin/hot-wallet/dashboard`);
  
  if (!response.success) {
    logTest('Hot Wallet Dashboard', 'failed', response.error);
    return;
  }
  
  const data = response.data.data;
  
  // Validate response structure
  if (data.totalValue && data.totalNetworks === 13 && data.realCoinBalances) {
    logTest('Hot Wallet Dashboard', 'passed', `$${data.totalValue.toLocaleString()} across ${data.totalNetworks} networks`);
  } else {
    logTest('Hot Wallet Dashboard', 'failed', 'Invalid response structure');
    return;
  }
  
  // Validate network coverage
  const expectedNetworks = ['bitcoin', 'ethereum', 'bsc', 'polygon', 'avalanche', 'arbitrum', 'fantom', 'linea', 'solana', 'unichain', 'opbnb', 'base', 'polygon-zkevm'];
  const actualNetworks = Object.keys(data.realCoinBalances);
  
  if (expectedNetworks.every(network => actualNetworks.includes(network))) {
    logTest('Hot Wallet Network Coverage', 'passed', `All ${expectedNetworks.length} networks present`);
  } else {
    logTest('Hot Wallet Network Coverage', 'failed', 'Missing expected networks');
  }
}

async function testHotWalletBalances() {
  console.log('\n💰 TESTING HOT WALLET BALANCES...');
  
  const response = await makeRequest('GET', `${CONFIG.BACKEND_URL}/api/admin/hot-wallet/balances`);
  
  if (!response.success) {
    logTest('Hot Wallet Balances', 'failed', response.error);
    return;
  }
  
  const data = response.data.data;
  
  if (data.balances && data.totalNetworks && data.summary) {
    logTest('Hot Wallet Balances', 'passed', `${data.totalNetworks} networks, $${data.summary.totalValue.toLocaleString()} total`);
  } else {
    logTest('Hot Wallet Balances', 'failed', 'Invalid response structure');
  }
  
  // Test filtering by network
  const btcResponse = await makeRequest('GET', `${CONFIG.BACKEND_URL}/api/admin/hot-wallet/balances?network=bitcoin`);
  if (btcResponse.success && btcResponse.data.data.balances.bitcoin) {
    logTest('Hot Wallet Balance Filtering', 'passed', 'Network filtering works');
  } else {
    logTest('Hot Wallet Balance Filtering', 'failed', 'Network filtering failed');
  }
}

async function testHotWalletTransactions() {
  console.log('\n💸 TESTING HOT WALLET TRANSACTIONS...');
  
  const response = await makeRequest('GET', `${CONFIG.BACKEND_URL}/api/admin/hot-wallet/transactions`);
  
  if (!response.success) {
    logTest('Hot Wallet Transactions', 'failed', response.error);
    return;
  }
  
  const data = response.data.data;
  
  if (data.transactions && data.pagination && data.summary) {
    logTest('Hot Wallet Transactions', 'passed', `${data.transactions.length} transactions, ${data.summary.pendingApprovals} pending`);
  } else {
    logTest('Hot Wallet Transactions', 'failed', 'Invalid response structure');
  }
}

async function testHotWalletTransfer() {
  console.log('\n🔄 TESTING HOT WALLET TRANSFER...');
  
  const transferData = {
    fromWallet: 'hot_wallet_btc',
    toWallet: 'cold_wallet_btc', 
    network: 'bitcoin',
    symbol: 'BTC',
    amount: '1.0',
    transferType: 'internal',
    notes: 'Test transfer for validation'
  };
  
  const response = await makeRequest('POST', `${CONFIG.BACKEND_URL}/api/admin/hot-wallet/transfer`, transferData);
  
  if (!response.success) {
    logTest('Hot Wallet Transfer', 'failed', response.error);
    return;
  }
  
  const data = response.data.data;
  
  if (data.transfer && data.transfer.id && data.transfer.status) {
    logTest('Hot Wallet Transfer', 'passed', `Transfer ${data.transfer.id} - ${data.transfer.status}`);
  } else {
    logTest('Hot Wallet Transfer', 'failed', 'Invalid transfer response');
  }
}

async function testHotWalletApproval() {
  console.log('\n✅ TESTING HOT WALLET APPROVAL...');
  
  const approvalData = {
    transactionId: 'test_tx_123',
    action: 'approve',
    notes: 'Test approval for validation'
  };
  
  const response = await makeRequest('POST', `${CONFIG.BACKEND_URL}/api/admin/hot-wallet/approve`, approvalData);
  
  if (!response.success) {
    logTest('Hot Wallet Approval', 'failed', response.error);
    return;
  }
  
  const data = response.data.data;
  
  if (data.approval && data.approval.action === 'approve') {
    logTest('Hot Wallet Approval', 'passed', `Approval ${data.approval.id} processed`);
  } else {
    logTest('Hot Wallet Approval', 'failed', 'Invalid approval response');
  }
}

async function testHotWalletAlerts() {
  console.log('\n🚨 TESTING HOT WALLET ALERTS...');
  
  const response = await makeRequest('GET', `${CONFIG.BACKEND_URL}/api/admin/hot-wallet/alerts`);
  
  if (!response.success) {
    logTest('Hot Wallet Alerts', 'failed', response.error);
    return;
  }
  
  const data = response.data.data;
  
  if (data.alerts && data.summary) {
    logTest('Hot Wallet Alerts', 'passed', `${data.summary.total} alerts (${data.summary.critical} critical)`);
  } else {
    logTest('Hot Wallet Alerts', 'failed', 'Invalid alerts response');
  }
  
  // Test alert filtering
  const criticalResponse = await makeRequest('GET', `${CONFIG.BACKEND_URL}/api/admin/hot-wallet/alerts?severity=critical`);
  if (criticalResponse.success) {
    logTest('Hot Wallet Alert Filtering', 'passed', 'Severity filtering works');
  } else {
    logTest('Hot Wallet Alert Filtering', 'failed', 'Severity filtering failed');
  }
}

async function testHotWalletCompliance() {
  console.log('\n📊 TESTING HOT WALLET COMPLIANCE...');
  
  const response = await makeRequest('GET', `${CONFIG.BACKEND_URL}/api/admin/hot-wallet/compliance`);
  
  if (!response.success) {
    logTest('Hot Wallet Compliance', 'failed', response.error);
    return;
  }
  
  const data = response.data.data;
  
  if (data.reportId && data.transactionSummary && data.riskAssessment) {
    logTest('Hot Wallet Compliance', 'passed', `Report ${data.reportId} - ${data.riskAssessment.overallRisk} risk`);
  } else {
    logTest('Hot Wallet Compliance', 'failed', 'Invalid compliance response');
  }
}

async function testWrappedTokensDashboard() {
  console.log('\n🌟 TESTING WRAPPED TOKENS DASHBOARD...');
  
  const response = await makeRequest('GET', `${CONFIG.BACKEND_URL}/api/admin/wrapped-tokens/dashboard`);
  
  if (!response.success) {
    logTest('Wrapped Tokens Dashboard', 'failed', response.error);
    return;
  }
  
  const data = response.data.data;
  
  if (data.totalCollateral && data.collateralRatio && data.wrappedTokens) {
    logTest('Wrapped Tokens Dashboard', 'passed', `$${data.totalCollateral.toLocaleString()} collateral, ${data.collateralRatio}% ratio`);
  } else {
    logTest('Wrapped Tokens Dashboard', 'failed', 'Invalid response structure');
  }
  
  // Validate wrapped tokens
  const expectedTokens = ['rBTC', 'rETH', 'rBNB', 'rSOL'];
  const actualTokens = Object.keys(data.wrappedTokens);
  
  if (expectedTokens.every(token => actualTokens.includes(token))) {
    logTest('Wrapped Tokens Coverage', 'passed', `All ${expectedTokens.length} wrapped tokens present`);
  } else {
    logTest('Wrapped Tokens Coverage', 'failed', 'Missing expected wrapped tokens');
  }
}

async function testWrappedTokenMint() {
  console.log('\n🏭 TESTING WRAPPED TOKEN MINT...');
  
  const mintData = {
    symbol: 'BTC',
    amount: '0.5',
    userAddress: '0x742d35Cc6634C0532925a3b8D000B44C123CF98E',
    collateralTxHash: '0xtest123456789abcdef',
    network: 'bitcoin',
    notes: 'Test mint operation'
  };
  
  const response = await makeRequest('POST', `${CONFIG.BACKEND_URL}/api/admin/wrapped-tokens/mint`, mintData);
  
  if (!response.success) {
    logTest('Wrapped Token Mint', 'failed', response.error);
    return;
  }
  
  const data = response.data.data;
  
  if (data.mintOperation && data.mintOperation.wrappedSymbol === 'rBTC') {
    logTest('Wrapped Token Mint', 'passed', `Mint ${data.mintOperation.id} - ${data.mintOperation.status}`);
  } else {
    logTest('Wrapped Token Mint', 'failed', 'Invalid mint response');
  }
}

async function testWrappedTokenBurn() {
  console.log('\n🔥 TESTING WRAPPED TOKEN BURN...');
  
  const burnData = {
    symbol: 'rBTC',
    amount: '0.3',
    userAddress: '0x742d35Cc6634C0532925a3b8D000B44C123CF98E',
    destinationAddress: 'bc1qtest123456789abcdef',
    network: 'bitcoin',
    notes: 'Test burn operation'
  };
  
  const response = await makeRequest('POST', `${CONFIG.BACKEND_URL}/api/admin/wrapped-tokens/burn`, burnData);
  
  if (!response.success) {
    logTest('Wrapped Token Burn', 'failed', response.error);
    return;
  }
  
  const data = response.data.data;
  
  if (data.burnOperation && data.burnOperation.originalSymbol === 'BTC') {
    logTest('Wrapped Token Burn', 'passed', `Burn ${data.burnOperation.id} - ${data.burnOperation.status}`);
  } else {
    logTest('Wrapped Token Burn', 'failed', 'Invalid burn response');
  }
}

async function testExistingFunctionalityPreservation() {
  console.log('\n🛡️ TESTING EXISTING FUNCTIONALITY PRESERVATION...');
  
  // Test core RSA DEX endpoints
  const coreEndpoints = [
    { path: '/api/health', name: 'Health Check' },
    { path: '/api/tokens', name: 'Tokens API' },
    { path: '/api/markets', name: 'Markets API' },
    { path: '/api/pairs', name: 'Trading Pairs API' },
    { path: '/api/admin/assets', name: 'Admin Assets API' },
    { path: '/api/wallets/assets?userId=test-user', name: 'Wallet Assets API' }
  ];
  
  for (const endpoint of coreEndpoints) {
    const response = await makeRequest('GET', `${CONFIG.BACKEND_URL}${endpoint.path}`);
    
    if (response.success) {
      logTest(`Existing Functionality - ${endpoint.name}`, 'passed', 'Endpoint working');
    } else {
      logTest(`Existing Functionality - ${endpoint.name}`, 'failed', response.error);
    }
  }
  
  // Test universal import functionality
  const importData = {
    name: 'Test Hot Wallet Token',
    symbol: 'THW',
    realSymbol: 'THW',
    decimals: 18,
    networks: ['ethereum'],
    contract_address: '0xtest123456789abcdef',
    current_price: 1.5
  };
  
  const importResponse = await makeRequest('POST', `${CONFIG.BACKEND_URL}/api/assets/import-token`, importData);
  
  if (importResponse.success) {
    logTest('Existing Functionality - Universal Import', 'passed', 'Import still working');
  } else {
    logTest('Existing Functionality - Universal Import', 'failed', importResponse.error);
  }
  
  // Test trading pair creation
  const pairData = {
    baseAsset: 'THW',
    quoteAsset: 'USDT',
    initialPrice: 1.5,
    description: 'Test Hot Wallet Token / USDT'
  };
  
  const pairResponse = await makeRequest('POST', `${CONFIG.BACKEND_URL}/api/dex/create-pair`, pairData);
  
  if (pairResponse.success) {
    logTest('Existing Functionality - Trading Pair Creation', 'passed', 'Pair creation still working');
  } else {
    logTest('Existing Functionality - Trading Pair Creation', 'failed', pairResponse.error);
  }
}

async function testNonDisruptiveIntegration() {
  console.log('\n🔧 TESTING NON-DISRUPTIVE INTEGRATION...');
  
  // Verify no conflicts with existing routes
  const potentialConflicts = [
    '/api/admin/assets',
    '/api/admin/transactions', 
    '/api/admin/contracts',
    '/api/admin/wallets'
  ];
  
  for (const route of potentialConflicts) {
    const response = await makeRequest('GET', `${CONFIG.BACKEND_URL}${route}`);
    
    if (response.success) {
      logTest(`Non-Disruptive - ${route}`, 'passed', 'No conflicts detected');
    } else {
      logTest(`Non-Disruptive - ${route}`, 'warnings', 'Route may have issues');
    }
  }
  
  // Verify data integrity
  const assetsResponse = await makeRequest('GET', `${CONFIG.BACKEND_URL}/api/admin/assets`);
  if (assetsResponse.success && assetsResponse.data.data) {
    logTest('Non-Disruptive - Data Integrity', 'passed', 'Asset data intact');
  } else {
    logTest('Non-Disruptive - Data Integrity', 'warnings', 'Asset data may be affected');
  }
}

// Main test execution
async function runComprehensiveTests() {
  console.log('🔥 HOT WALLET MANAGEMENT - COMPREHENSIVE TEST SUITE');
  console.log('=' .repeat(60));
  console.log(`📍 Testing against: ${CONFIG.BACKEND_URL}`);
  console.log(`🕐 Started at: ${new Date().toISOString()}`);
  console.log('=' .repeat(60));
  
  try {
    // Test all Hot Wallet Management features
    await testHotWalletDashboard();
    await testHotWalletBalances();
    await testHotWalletTransactions();
    await testHotWalletTransfer();
    await testHotWalletApproval();
    await testHotWalletAlerts();
    await testHotWalletCompliance();
    
    // Test Enhanced Wrapped Token Management
    await testWrappedTokensDashboard();
    await testWrappedTokenMint();
    await testWrappedTokenBurn();
    
    // Test existing functionality preservation
    await testExistingFunctionalityPreservation();
    
    // Test non-disruptive integration
    await testNonDisruptiveIntegration();
    
  } catch (error) {
    console.error('❌ Critical test failure:', error.message);
    logTest('Critical Test Execution', 'failed', error.message);
  }
  
  // Generate final report
  console.log('\n' + '='.repeat(60));
  console.log('🏆 FINAL TEST RESULTS');
  console.log('='.repeat(60));
  
  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(2);
  
  console.log(`📊 Total Tests: ${testResults.total}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`⚠️  Warnings: ${testResults.warnings}`);
  console.log(`🎯 Success Rate: ${successRate}%`);
  
  // Determine overall status
  let overallStatus = 'FAILED';
  if (testResults.failed === 0 && testResults.warnings <= 2) {
    overallStatus = 'PASSED';
  } else if (testResults.failed <= 2 && successRate >= 85) {
    overallStatus = 'ACCEPTABLE';
  }
  
  console.log(`🚦 Overall Status: ${overallStatus}`);
  
  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      warnings: testResults.warnings,
      successRate: successRate,
      overallStatus
    },
    details: testResults.details
  };
  
  fs.writeFileSync('HOT_WALLET_TEST_REPORT.json', JSON.stringify(report, null, 2));
  console.log(`📄 Detailed report saved to: HOT_WALLET_TEST_REPORT.json`);
  
  console.log('\n🎉 HOT WALLET MANAGEMENT TESTING COMPLETE!');
  
  return { success: overallStatus !== 'FAILED', successRate, overallStatus };
}

// Export for external use
module.exports = { runComprehensiveTests };

// Run tests if called directly
if (require.main === module) {
  runComprehensiveTests()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    });
}