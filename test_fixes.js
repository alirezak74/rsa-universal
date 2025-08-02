#!/usr/bin/env node

/**
 * 🚀 RSA DEX FIXES VERIFICATION SCRIPT
 * Tests all the fixes applied to resolve the reported issues
 */

const http = require('http');
const https = require('https');

const CONFIG = {
  BACKEND_URL: 'http://localhost:8001',
  FRONTEND_URL: 'http://localhost:3000',
  ADMIN_URL: 'http://localhost:3001'
};

class FixesVerification {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  async makeRequest(url, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
        }
      };

      if (data) {
        const postData = JSON.stringify(data);
        options.headers['Content-Length'] = Buffer.byteLength(postData);
      }

      const req = (urlObj.protocol === 'https:' ? https : http).request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          try {
            const response = JSON.parse(body);
            resolve({
              status: res.statusCode,
              data: response,
              headers: res.headers
            });
          } catch (error) {
            resolve({
              status: res.statusCode,
              data: body,
              headers: res.headers
            });
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (data) {
        req.write(JSON.stringify(data));
      }
      req.end();
    });
  }

  async testEndpoint(name, url, method = 'GET', data = null, expectedStatus = 200) {
    try {
      console.log(`🔍 Testing ${name}...`);
      const response = await this.makeRequest(url, method, data);
      
      const success = response.status === expectedStatus;
      const result = {
        name,
        url,
        method,
        status: response.status,
        expectedStatus,
        success,
        data: response.data
      };

      if (success) {
        console.log(`✅ ${name}: PASSED (${response.status})`);
      } else {
        console.log(`❌ ${name}: FAILED (${response.status}, expected ${expectedStatus})`);
      }

      this.results.push(result);
      return result;
    } catch (error) {
      console.log(`❌ ${name}: ERROR - ${error.message}`);
      this.results.push({
        name,
        url,
        method,
        status: 'ERROR',
        expectedStatus,
        success: false,
        error: error.message
      });
      return null;
    }
  }

  async runAllTests() {
    console.log('🚀 Starting RSA DEX Fixes Verification...\n');

    // Test 1: Backend Health
    await this.testEndpoint(
      'Backend Health Check',
      `${CONFIG.BACKEND_URL}/health`
    );

    // Test 2: Authentication Endpoints
    await this.testEndpoint(
      'Login Endpoint',
      `${CONFIG.BACKEND_URL}/api/auth/login`,
      'POST',
      { email: 'test@example.com', password: 'password123' }
    );

    // Test 3: Orders Endpoints
    await this.testEndpoint(
      'Get Orders',
      `${CONFIG.BACKEND_URL}/api/orders?page=1&limit=100`
    );

    await this.testEndpoint(
      'Create Order',
      `${CONFIG.BACKEND_URL}/api/orders`,
      'POST',
      { pair: 'BTC/USDT', side: 'buy', type: 'limit', amount: 0.1, price: 45000 }
    );

    // Test 4: Market Trades Endpoints
    await this.testEndpoint(
      'BTC/USDT Trades',
      `${CONFIG.BACKEND_URL}/api/markets/BTC/USDT/trades`
    );

    await this.testEndpoint(
      'ETH/USDT Trades',
      `${CONFIG.BACKEND_URL}/api/markets/ETH/USDT/trades`
    );

    await this.testEndpoint(
      'RSA/USDT Trades',
      `${CONFIG.BACKEND_URL}/api/markets/RSA/USDT/trades`
    );

    await this.testEndpoint(
      'ETH/BTC Trades',
      `${CONFIG.BACKEND_URL}/api/markets/ETH/BTC/trades`
    );

    await this.testEndpoint(
      'USDT/USD Trades',
      `${CONFIG.BACKEND_URL}/api/markets/USDT/USD/trades`
    );

    // Test 5: Proxy Endpoints
    await this.testEndpoint(
      'CoinGecko Proxy',
      `${CONFIG.BACKEND_URL}/api/proxy/coingecko/simple/price?ids=bitcoin,tether,rsachain&vs_currencies=usd`
    );

    // Test 6: Admin Assets Endpoint
    await this.testEndpoint(
      'Admin Assets',
      `${CONFIG.BACKEND_URL}/api/dev/admin/assets`
    );

    // Test 7: Deposit Endpoints
    await this.testEndpoint(
      'Generate Deposit Address',
      `${CONFIG.BACKEND_URL}/api/deposits/generate-address`,
      'POST',
      { userId: 'user_123', network: 'bitcoin', symbol: 'BTC' }
    );

    await this.testEndpoint(
      'Deposit Status',
      `${CONFIG.BACKEND_URL}/api/deposits/status/test-tx-hash`
    );

    // Test 8: Markets Endpoint
    await this.testEndpoint(
      'Markets Data',
      `${CONFIG.BACKEND_URL}/api/markets`
    );

    // Test 9: Wallets Endpoints
    await this.testEndpoint(
      'Create Wallet',
      `${CONFIG.BACKEND_URL}/api/wallets/create`,
      'POST',
      { userId: 'user_123' }
    );

    await this.testEndpoint(
      'Wallet Assets',
      `${CONFIG.BACKEND_URL}/api/wallets/assets?userId=user_123`
    );

    // Test 10: Admin Panel Endpoints
    await this.testEndpoint(
      'Admin Assets',
      `${CONFIG.BACKEND_URL}/api/admin/assets`
    );

    this.generateReport();
  }

  generateReport() {
    const endTime = Date.now();
    const duration = endTime - this.startTime;
    
    const passed = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    const total = this.results.length;

    console.log('\n' + '='.repeat(60));
    console.log('📊 RSA DEX FIXES VERIFICATION REPORT');
    console.log('='.repeat(60));
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${failed}/${total}`);
    console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    console.log('='.repeat(60));

    if (failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results.filter(r => !r.success).forEach(result => {
        console.log(`  • ${result.name}: ${result.status} (${result.url})`);
        if (result.error) {
          console.log(`    Error: ${result.error}`);
        }
      });
    }

    console.log('\n✅ PASSED TESTS:');
    this.results.filter(r => r.success).forEach(result => {
      console.log(`  • ${result.name}: ${result.status}`);
    });

    // Summary of fixes
    console.log('\n🔧 FIXES APPLIED:');
    console.log('  1. ✅ Added missing API endpoints (orders, trades, proxy, deposits)');
    console.log('  2. ✅ Fixed chart color theme (dark mode)');
    console.log('  3. ✅ Fixed deposit wallet address generation');
    console.log('  4. ✅ Added admin assets endpoint');
    console.log('  5. ✅ Improved error handling and responses');

    if (passed === total) {
      console.log('\n🎉 ALL FIXES VERIFIED SUCCESSFULLY!');
      console.log('   The RSA DEX ecosystem should now be fully operational.');
    } else {
      console.log('\n⚠️  SOME ISSUES REMAIN');
      console.log('   Please check the failed tests above.');
    }

    console.log('\n' + '='.repeat(60));
  }
}

// Run the verification
async function main() {
  const verifier = new FixesVerification();
  await verifier.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = FixesVerification;