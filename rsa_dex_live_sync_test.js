#!/usr/bin/env node

/**
 * 🔄 RSA DEX LIVE SYNCHRONIZATION TESTING SUITE
 * 
 * This script tests REAL synchronization between running RSA DEX components:
 * - Tests actual localhost services (Admin, Frontend, Backend)
 * - Creates trading pairs in Admin and verifies they appear in Frontend
 * - Tests Universal Asset Import synchronization
 * - Identifies actual sync issues and provides fixes
 * 
 * Author: RSA DEX Team
 * Version: 3.0.0
 * Date: 2025-01-01
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Live Test Configuration
const CONFIG = {
  // Actual localhost URLs
  ADMIN_URL: 'http://localhost:3000',
  FRONTEND_URL: 'http://localhost:3002', 
  BACKEND_URL: 'http://localhost:8001',
  
  // Test timeouts
  TIMEOUT: 10000,
  SYNC_WAIT_TIME: 3000, // Wait time for sync between operations
  
  // Test data for sync verification
  TEST_TRADING_PAIR: {
    baseAsset: 'rBTC',
    quoteAsset: 'RSA',
    symbol: 'rBTC/RSA',
    minOrderSize: 0.001,
    maxOrderSize: 100,
    priceStep: 0.01,
    quantityStep: 0.001,
    enabled: true
  },
  
  TEST_ASSET: {
    symbol: 'TEST',
    name: 'Test Token',
    decimals: 18,
    totalSupply: 1000000,
    contractAddress: '0x123456789abcdef',
    network: 'Ethereum',
    icon: 'https://example.com/test-icon.png'
  },
  
  // Mock authentication token
  ADMIN_TOKEN: 'test_admin_token_12345',
  USER_TOKEN: 'test_user_token_67890'
};

class RSADEXLiveSyncTest {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      errors: [],
      warnings_list: [],
      detailed_results: {},
      sync_issues: [],
      service_status: {
        admin: 'unknown',
        frontend: 'unknown',
        backend: 'unknown'
      }
    };
    
    this.testStartTime = Date.now();
    this.createdData = {
      tradingPairs: [],
      assets: [],
      users: []
    };
  }

  log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'ERROR' ? '❌' : type === 'WARN' ? '⚠️' : type === 'SUCCESS' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async runTest(testName, testFunction) {
    try {
      this.log(`Starting live test: ${testName}`, 'INFO');
      const result = await testFunction();
      
      if (result.success) {
        this.results.passed++;
        this.log(`✅ PASSED: ${testName}`, 'SUCCESS');
      } else {
        this.results.failed++;
        this.results.errors.push(`${testName}: ${result.error}`);
        this.log(`❌ FAILED: ${testName} - ${result.error}`, 'ERROR');
        
        if (result.sync_issue) {
          this.results.sync_issues.push({
            test: testName,
            issue: result.sync_issue,
            solution: result.suggested_fix
          });
        }
      }
      
      this.results.detailed_results[testName] = result;
      
    } catch (error) {
      this.results.failed++;
      this.results.errors.push(`${testName}: ${error.message}`);
      this.log(`❌ EXCEPTION: ${testName} - ${error.message}`, 'ERROR');
      
      this.results.detailed_results[testName] = {
        success: false,
        error: error.message,
        exception: true
      };
    }
  }

  // Make actual HTTP requests to running services
  async makeRequest(url, options = {}) {
    try {
      // For Node.js compatibility, we'll use a simple approach
      const { execSync } = require('child_process');
      
      const method = options.method || 'GET';
      const headers = options.headers || {};
      const body = options.body;
      
      let curlCommand = `curl -s -X ${method}`;
      
      // Add headers
      Object.keys(headers).forEach(key => {
        curlCommand += ` -H "${key}: ${headers[key]}"`;
      });
      
      // Add body for POST/PUT requests
      if (body && (method === 'POST' || method === 'PUT')) {
        curlCommand += ` -d '${JSON.stringify(body)}'`;
      }
      
      // Add URL
      curlCommand += ` "${url}"`;
      
      // Add timeout
      curlCommand += ` --max-time 10`;
      
      const response = execSync(curlCommand, { encoding: 'utf8', timeout: CONFIG.TIMEOUT });
      
      try {
        const data = JSON.parse(response);
        return { ok: true, status: 200, data };
      } catch (parseError) {
        return { ok: true, status: 200, data: { text: response } };
      }
    } catch (error) {
      return { 
        ok: false, 
        status: 500, 
        error: error.message.includes('ECONNREFUSED') ? 'Service not running' : error.message 
      };
    }
  }

  // Test if all services are actually running
  async testServiceAvailability() {
    const services = [
      { name: 'Admin Panel', url: `${CONFIG.ADMIN_URL}/api/health` },
      { name: 'Frontend', url: `${CONFIG.FRONTEND_URL}/api/health` },
      { name: 'Backend', url: `${CONFIG.BACKEND_URL}/health` }
    ];

    const serviceResults = {};
    let allRunning = true;

    for (const service of services) {
      try {
        this.log(`Checking ${service.name} at ${service.url}...`, 'INFO');
        const response = await this.makeRequest(service.url);
        
        serviceResults[service.name] = {
          url: service.url,
          running: response.ok,
          status: response.ok ? 'running' : 'not running',
          error: response.ok ? null : response.error
        };

        if (response.ok) {
          this.log(`${service.name} is running ✅`, 'SUCCESS');
        } else {
          this.log(`${service.name} is NOT running ❌ - ${response.error}`, 'ERROR');
          allRunning = false;
        }

        // Update service status
        const serviceName = service.name.toLowerCase().replace(' panel', '').replace(' ', '');
        this.results.service_status[serviceName] = response.ok ? 'running' : 'not_running';
        
      } catch (error) {
        serviceResults[service.name] = {
          url: service.url,
          running: false,
          status: 'error',
          error: error.message
        };
        allRunning = false;
        this.log(`${service.name} check failed: ${error.message}`, 'ERROR');
      }
    }

    return {
      success: allRunning,
      error: allRunning ? null : 'Some services are not running',
      services: serviceResults,
      sync_issue: allRunning ? null : 'Services not running - cannot test synchronization',
      suggested_fix: allRunning ? null : 'Start all services: npm run dev (in each directory)'
    };
  }

  // Test creating trading pair in Admin and checking if it appears in Frontend
  async testTradingPairSync() {
    try {
      this.log('Testing Trading Pair Synchronization...', 'INFO');
      
      // Step 1: Create trading pair via Admin API
      this.log('Step 1: Creating trading pair in Admin Panel...', 'INFO');
      const createResponse = await this.makeRequest(`${CONFIG.ADMIN_URL}/api/trading-pairs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CONFIG.ADMIN_TOKEN}`
        },
        body: CONFIG.TEST_TRADING_PAIR
      });

      if (!createResponse.ok) {
        return {
          success: false,
          error: `Failed to create trading pair: ${createResponse.error}`,
          sync_issue: 'Admin API not responding or authentication failed',
          suggested_fix: 'Check Admin Panel is running and API endpoints are configured'
        };
      }

      this.log('Trading pair created in Admin ✅', 'SUCCESS');
      this.createdData.tradingPairs.push(CONFIG.TEST_TRADING_PAIR.symbol);

      // Step 2: Wait for sync
      this.log(`Step 2: Waiting ${CONFIG.SYNC_WAIT_TIME}ms for synchronization...`, 'INFO');
      await new Promise(resolve => setTimeout(resolve, CONFIG.SYNC_WAIT_TIME));

      // Step 3: Check if trading pair appears in Frontend
      this.log('Step 3: Checking if trading pair appears in Frontend...', 'INFO');
      const frontendResponse = await this.makeRequest(`${CONFIG.FRONTEND_URL}/api/trading-pairs`);

      if (!frontendResponse.ok) {
        return {
          success: false,
          error: `Frontend API not accessible: ${frontendResponse.error}`,
          sync_issue: 'Frontend service not running or API not configured',
          suggested_fix: 'Start Frontend service and check API routing'
        };
      }

      // Step 4: Verify the trading pair exists in Frontend data
      const frontendPairs = frontendResponse.data.pairs || frontendResponse.data.tradingPairs || [];
      const pairExists = frontendPairs.some(pair => 
        pair.symbol === CONFIG.TEST_TRADING_PAIR.symbol ||
        pair.baseAsset === CONFIG.TEST_TRADING_PAIR.baseAsset
      );

      if (!pairExists) {
        return {
          success: false,
          error: `Trading pair ${CONFIG.TEST_TRADING_PAIR.symbol} not found in Frontend`,
          sync_issue: 'Data not syncing from Admin to Frontend',
          suggested_fix: 'Check database connections and real-time sync mechanisms (WebSocket/polling)',
          debug_info: {
            created_pair: CONFIG.TEST_TRADING_PAIR,
            frontend_pairs: frontendPairs
          }
        };
      }

      this.log('Trading pair found in Frontend ✅', 'SUCCESS');

      return {
        success: true,
        error: null,
        sync_verified: true,
        created_pair: CONFIG.TEST_TRADING_PAIR.symbol,
        sync_time: CONFIG.SYNC_WAIT_TIME
      };

    } catch (error) {
      return {
        success: false,
        error: `Trading pair sync test failed: ${error.message}`,
        sync_issue: 'Network or service communication error',
        suggested_fix: 'Check network connectivity and service health'
      };
    }
  }

  // Test Universal Asset Import sync between Admin and Frontend
  async testUniversalAssetImportSync() {
    try {
      this.log('Testing Universal Asset Import Synchronization...', 'INFO');
      
      // Step 1: Import asset via Admin Universal Import
      this.log('Step 1: Importing asset via Admin Universal Import...', 'INFO');
      const importResponse = await this.makeRequest(`${CONFIG.ADMIN_URL}/api/assets/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CONFIG.ADMIN_TOKEN}`
        },
        body: CONFIG.TEST_ASSET
      });

      if (!importResponse.ok) {
        return {
          success: false,
          error: `Failed to import asset: ${importResponse.error}`,
          sync_issue: 'Universal Asset Import API not working',
          suggested_fix: 'Check Admin Panel asset import endpoints and database connectivity'
        };
      }

      this.log('Asset imported via Universal Import ✅', 'SUCCESS');
      this.createdData.assets.push(CONFIG.TEST_ASSET.symbol);

      // Step 2: Wait for sync
      this.log(`Step 2: Waiting ${CONFIG.SYNC_WAIT_TIME}ms for synchronization...`, 'INFO');
      await new Promise(resolve => setTimeout(resolve, CONFIG.SYNC_WAIT_TIME));

      // Step 3: Check if asset appears in Frontend
      this.log('Step 3: Checking if asset appears in Frontend...', 'INFO');
      const frontendAssetsResponse = await this.makeRequest(`${CONFIG.FRONTEND_URL}/api/assets`);

      if (!frontendAssetsResponse.ok) {
        return {
          success: false,
          error: `Frontend assets API not accessible: ${frontendAssetsResponse.error}`,
          sync_issue: 'Frontend assets endpoint not configured',
          suggested_fix: 'Configure Frontend assets API endpoint'
        };
      }

      // Step 4: Verify the asset exists in Frontend
      const frontendAssets = frontendAssetsResponse.data.assets || frontendAssetsResponse.data || [];
      const assetExists = frontendAssets.some(asset => 
        asset.symbol === CONFIG.TEST_ASSET.symbol ||
        asset.name === CONFIG.TEST_ASSET.name
      );

      if (!assetExists) {
        return {
          success: false,
          error: `Asset ${CONFIG.TEST_ASSET.symbol} not found in Frontend`,
          sync_issue: 'Universal Asset Import not syncing to Frontend',
          suggested_fix: 'Check asset sync mechanism between Admin and Frontend databases',
          debug_info: {
            imported_asset: CONFIG.TEST_ASSET,
            frontend_assets: frontendAssets
          }
        };
      }

      this.log('Asset found in Frontend ✅', 'SUCCESS');

      // Step 5: Check if asset appears in trading pairs
      this.log('Step 4: Checking if asset is available for trading...', 'INFO');
      const tradingPairsResponse = await this.makeRequest(`${CONFIG.FRONTEND_URL}/api/trading-pairs`);
      
      if (tradingPairsResponse.ok) {
        const pairs = tradingPairsResponse.data.pairs || tradingPairsResponse.data.tradingPairs || [];
        const assetInPairs = pairs.some(pair => 
          pair.baseAsset === CONFIG.TEST_ASSET.symbol || 
          pair.quoteAsset === CONFIG.TEST_ASSET.symbol
        );
        
        if (!assetInPairs) {
          this.results.warnings_list.push(`Asset ${CONFIG.TEST_ASSET.symbol} imported but not available for trading`);
          this.log(`⚠️  Asset imported but not in trading pairs`, 'WARN');
        }
      }

      return {
        success: true,
        error: null,
        sync_verified: true,
        imported_asset: CONFIG.TEST_ASSET.symbol,
        sync_time: CONFIG.SYNC_WAIT_TIME
      };

    } catch (error) {
      return {
        success: false,
        error: `Universal Asset Import sync test failed: ${error.message}`,
        sync_issue: 'Asset import or sync mechanism error',
        suggested_fix: 'Check Universal Asset Import implementation and database triggers'
      };
    }
  }

  // Test real-time data sync (WebSocket or polling)
  async testRealTimeSync() {
    try {
      this.log('Testing Real-time Data Synchronization...', 'INFO');
      
      // Step 1: Create a transaction in Admin
      this.log('Step 1: Creating transaction via Admin...', 'INFO');
      const transactionData = {
        from: 'RSA1234567890abcdef',
        to: 'RSA9876543210fedcba',
        amount: 100,
        asset: 'RSA',
        type: 'transfer'
      };

      const createTxResponse = await this.makeRequest(`${CONFIG.ADMIN_URL}/api/transactions/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CONFIG.ADMIN_TOKEN}`
        },
        body: transactionData
      });

      if (!createTxResponse.ok) {
        return {
          success: false,
          error: `Failed to create transaction: ${createTxResponse.error}`,
          sync_issue: 'Admin transaction API not working',
          suggested_fix: 'Check Admin transaction endpoints'
        };
      }

      const transactionId = createTxResponse.data.transactionId || createTxResponse.data.id || 'test_tx_123';
      this.log('Transaction created in Admin ✅', 'SUCCESS');

      // Step 2: Wait for real-time sync
      this.log('Step 2: Waiting for real-time sync...', 'INFO');
      await new Promise(resolve => setTimeout(resolve, CONFIG.SYNC_WAIT_TIME));

      // Step 3: Check if transaction appears in Frontend
      this.log('Step 3: Checking transaction in Frontend...', 'INFO');
      const frontendTxResponse = await this.makeRequest(`${CONFIG.FRONTEND_URL}/api/transactions`);

      if (!frontendTxResponse.ok) {
        return {
          success: false,
          error: `Frontend transactions API not accessible: ${frontendTxResponse.error}`,
          sync_issue: 'Frontend transactions endpoint not configured',
          suggested_fix: 'Configure Frontend transactions API'
        };
      }

      const frontendTransactions = frontendTxResponse.data.transactions || frontendTxResponse.data || [];
      const txExists = frontendTransactions.some(tx => 
        tx.id === transactionId || 
        (tx.from === transactionData.from && tx.to === transactionData.to && tx.amount === transactionData.amount)
      );

      if (!txExists) {
        return {
          success: false,
          error: `Transaction not found in Frontend`,
          sync_issue: 'Real-time sync not working between Admin and Frontend',
          suggested_fix: 'Implement WebSocket connections or database triggers for real-time sync',
          debug_info: {
            created_transaction: transactionData,
            frontend_transactions: frontendTransactions.slice(0, 5) // Show first 5 for debugging
          }
        };
      }

      this.log('Transaction found in Frontend ✅', 'SUCCESS');

      return {
        success: true,
        error: null,
        sync_verified: true,
        transaction_id: transactionId,
        sync_time: CONFIG.SYNC_WAIT_TIME
      };

    } catch (error) {
      return {
        success: false,
        error: `Real-time sync test failed: ${error.message}`,
        sync_issue: 'Real-time synchronization mechanism error',
        suggested_fix: 'Implement proper real-time sync (WebSocket, SSE, or polling)'
      };
    }
  }

  // Test database connectivity and shared data
  async testDatabaseSync() {
    try {
      this.log('Testing Database Synchronization...', 'INFO');
      
      // Test if all services use the same database
      const adminDbStatus = await this.makeRequest(`${CONFIG.ADMIN_URL}/api/db/status`);
      const frontendDbStatus = await this.makeRequest(`${CONFIG.FRONTEND_URL}/api/db/status`);
      const backendDbStatus = await this.makeRequest(`${CONFIG.BACKEND_URL}/api/db/status`);

      const dbResults = {
        admin_db: adminDbStatus.ok,
        frontend_db: frontendDbStatus.ok,
        backend_db: backendDbStatus.ok
      };

      // Test if services can read the same data
      const adminUsers = await this.makeRequest(`${CONFIG.ADMIN_URL}/api/users/count`);
      const frontendUsers = await this.makeRequest(`${CONFIG.FRONTEND_URL}/api/users/count`);

      if (adminUsers.ok && frontendUsers.ok) {
        const adminCount = adminUsers.data.count || 0;
        const frontendCount = frontendUsers.data.count || 0;
        
        if (adminCount !== frontendCount) {
          return {
            success: false,
            error: `User count mismatch: Admin=${adminCount}, Frontend=${frontendCount}`,
            sync_issue: 'Services using different databases or data not syncing',
            suggested_fix: 'Ensure all services connect to the same database',
            debug_info: dbResults
          };
        }
      }

      return {
        success: Object.values(dbResults).some(status => status),
        error: Object.values(dbResults).some(status => status) ? null : 'Database connectivity issues',
        database_status: dbResults,
        sync_issue: Object.values(dbResults).some(status => status) ? null : 'Database not accessible from services',
        suggested_fix: 'Check database server is running and connection strings are correct'
      };

    } catch (error) {
      return {
        success: false,
        error: `Database sync test failed: ${error.message}`,
        sync_issue: 'Database connectivity or configuration error',
        suggested_fix: 'Check database server status and connection configuration'
      };
    }
  }

  // Clean up test data
  async cleanupTestData() {
    this.log('Cleaning up test data...', 'INFO');
    
    try {
      // Delete created trading pairs
      for (const pairSymbol of this.createdData.tradingPairs) {
        await this.makeRequest(`${CONFIG.ADMIN_URL}/api/trading-pairs/${pairSymbol}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${CONFIG.ADMIN_TOKEN}` }
        });
      }

      // Delete created assets
      for (const assetSymbol of this.createdData.assets) {
        await this.makeRequest(`${CONFIG.ADMIN_URL}/api/assets/${assetSymbol}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${CONFIG.ADMIN_TOKEN}` }
        });
      }

      this.log('Test data cleanup completed ✅', 'SUCCESS');
    } catch (error) {
      this.log(`Cleanup warning: ${error.message}`, 'WARN');
    }
  }

  // Generate comprehensive sync report
  generateSyncReport() {
    const duration = Date.now() - this.testStartTime;
    const totalTests = this.results.passed + this.results.failed;
    const successRate = totalTests > 0 ? ((this.results.passed / totalTests) * 100).toFixed(2) : 0;

    const report = {
      test_summary: {
        test_type: 'Live Synchronization Testing',
        total_tests: totalTests,
        passed: this.results.passed,
        failed: this.results.failed,
        warnings: this.results.warnings,
        success_rate: `${successRate}%`,
        duration_ms: duration,
        timestamp: new Date().toISOString()
      },
      
      service_status: this.results.service_status,
      
      sync_issues_found: this.results.sync_issues,
      
      detailed_results: this.results.detailed_results,
      
      errors: this.results.errors,
      warnings: this.results.warnings_list,
      
      sync_recommendations: [
        '🔄 Ensure all services (Admin, Frontend, Backend) are running on localhost',
        '🗄️ Verify all services connect to the same database',
        '⚡ Implement real-time sync using WebSocket or database triggers',
        '🔄 Add API endpoints for cross-service data verification',
        '📊 Monitor sync latency and implement retry mechanisms',
        '🧪 Add automated sync tests to CI/CD pipeline'
      ],

      troubleshooting_steps: [
        '1. Start all services: npm run dev (in each project directory)',
        '2. Check localhost ports: 3000 (Admin), 3002 (Frontend), 8001 (Backend)',
        '3. Verify database is running and accessible',
        '4. Check API endpoints respond correctly',
        '5. Test CORS configuration for cross-origin requests',
        '6. Monitor network requests in browser dev tools'
      ]
    };

    return report;
  }

  // Main test execution
  async runLiveSyncTests() {
    this.log('🔄 Starting RSA DEX Live Synchronization Testing', 'INFO');
    this.log('Testing actual localhost services for real sync issues...', 'INFO');
    
    // Test service availability first
    await this.runTest('Service Availability', () => this.testServiceAvailability());
    
    // Only proceed with sync tests if services are running
    const servicesRunning = Object.values(this.results.service_status).every(status => status === 'running');
    
    if (servicesRunning) {
      this.log('All services are running. Proceeding with synchronization tests...', 'SUCCESS');
      
      // Test specific sync scenarios
      await this.runTest('Trading Pair Sync', () => this.testTradingPairSync());
      await this.runTest('Universal Asset Import Sync', () => this.testUniversalAssetImportSync());
      await this.runTest('Real-time Sync', () => this.testRealTimeSync());
      await this.runTest('Database Sync', () => this.testDatabaseSync());
      
      // Cleanup test data
      await this.cleanupTestData();
    } else {
      this.log('Some services are not running. Cannot test synchronization.', 'ERROR');
      this.log('Please start all services and run the test again.', 'INFO');
    }

    // Generate and save report
    const report = this.generateSyncReport();
    
    fs.writeFileSync('rsa_dex_live_sync_test_report.json', JSON.stringify(report, null, 2));
    
    this.log('🔄 Live Synchronization Testing Complete!', 'SUCCESS');
    this.log(`📊 Results: ${this.results.passed}/${this.results.passed + this.results.failed} tests passed (${report.test_summary.success_rate})`, 'INFO');
    this.log('📄 Detailed report saved to: rsa_dex_live_sync_test_report.json', 'INFO');
    
    return report;
  }
}

// Execute if run directly
if (require.main === module) {
  const syncTest = new RSADEXLiveSyncTest();
  
  syncTest.runLiveSyncTests()
    .then(report => {
      console.log('\n' + '='.repeat(80));
      console.log('🔄 RSA DEX LIVE SYNCHRONIZATION TEST COMPLETED');
      console.log('='.repeat(80));
      console.log(`✅ Overall Status: ${report.test_summary.success_rate}`);
      console.log(`🔧 Services Status:`);
      console.log(`  Admin Panel: ${report.service_status.admin}`);
      console.log(`  Frontend: ${report.service_status.frontend}`);
      console.log(`  Backend: ${report.service_status.backend}`);
      
      if (report.sync_issues_found.length > 0) {
        console.log('\n🚨 SYNC ISSUES FOUND:');
        report.sync_issues_found.forEach((issue, index) => {
          console.log(`\n${index + 1}. ${issue.test}:`);
          console.log(`   Issue: ${issue.issue}`);
          console.log(`   Solution: ${issue.solution}`);
        });
      }
      
      if (report.errors.length > 0) {
        console.log('\n❌ Errors:');
        report.errors.forEach(error => console.log(`  • ${error}`));
      }
      
      if (report.warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        report.warnings.forEach(warning => console.log(`  • ${warning}`));
      }
      
      console.log('\n🔧 Troubleshooting Steps:');
      report.troubleshooting_steps.forEach(step => console.log(`  ${step}`));
      
      process.exit(report.test_summary.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('❌ Live sync testing failed:', error);
      process.exit(1);
    });
}

module.exports = RSADEXLiveSyncTest;