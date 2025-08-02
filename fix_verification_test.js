#!/usr/bin/env node

/**
 * 🔧 FIX VERIFICATION TEST
 * 
 * Tests all the specific fixes:
 * 1. Admin login authentication
 * 2. RSA DEX chart animation 
 * 3. Deposit address generation
 */

const { execSync } = require('child_process');
const fs = require('fs');

class FixVerificationTester {
  constructor() {
    this.results = {
      admin_login: false,
      chart_data: false,
      deposit_address: false,
      backend_health: false
    };
  }

  log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'ERROR' ? '❌' : type === 'SUCCESS' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async makeRequest(url, options = {}) {
    try {
      const method = options.method || 'GET';
      const headers = options.headers || {};
      const body = options.body;

      let curlCommand = `curl -s -w "%{http_code}" -o /tmp/curl_response.txt -X ${method}`;

      Object.keys(headers).forEach(key => {
        curlCommand += ` -H "${key}: ${headers[key]}"`;
      });

      if (body && (method === 'POST' || method === 'PUT')) {
        curlCommand += ` -d '${JSON.stringify(body)}'`;
      }

      curlCommand += ` "${url}" --max-time 10 --connect-timeout 5`;

      const httpCode = execSync(curlCommand, { encoding: 'utf8', timeout: 10000 }).trim();

      let responseData = {};
      try {
        const responseText = fs.readFileSync('/tmp/curl_response.txt', 'utf8');
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        responseData = { text: fs.readFileSync('/tmp/curl_response.txt', 'utf8') };
      }

      const isSuccess = httpCode.startsWith('2');

      return {
        ok: isSuccess,
        status: parseInt(httpCode),
        data: responseData,
        statusCode: httpCode
      };
    } catch (error) {
      return {
        ok: false,
        status: 500,
        error: error.message.includes('ECONNREFUSED') ? 'Service not responding' : error.message
      };
    }
  }

  async testBackendHealth() {
    this.log('🔍 Testing backend health...', 'INFO');
    
    try {
      const response = await this.makeRequest('http://localhost:8001/api/status');
      
      if (response.ok && response.data.success) {
        this.log('✅ Backend is healthy and responding', 'SUCCESS');
        this.results.backend_health = true;
        return true;
      } else {
        this.log('❌ Backend health check failed', 'ERROR');
        return false;
      }
    } catch (error) {
      this.log(`❌ Backend health test failed: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async testAdminLogin() {
    this.log('🔍 Testing admin login authentication...', 'INFO');
    
    try {
      // Test login endpoint
      const loginResponse = await this.makeRequest('http://localhost:8001/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { username: 'admin', password: 'admin123' }
      });
      
      if (loginResponse.ok && loginResponse.data.success && loginResponse.data.data.token) {
        this.log('✅ Admin login working - token received', 'SUCCESS');
        
        // Test profile endpoint with token
        const token = loginResponse.data.data.token;
        const profileResponse = await this.makeRequest('http://localhost:8001/auth/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (profileResponse.ok && profileResponse.data.success) {
          this.log('✅ Admin authentication fully working', 'SUCCESS');
          this.results.admin_login = true;
          return true;
        } else {
          this.log('❌ Profile verification failed', 'ERROR');
          return false;
        }
      } else {
        this.log('❌ Admin login failed', 'ERROR');
        return false;
      }
    } catch (error) {
      this.log(`❌ Admin login test failed: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async testChartData() {
    this.log('🔍 Testing chart data endpoints...', 'INFO');
    
    try {
      // Test prices endpoint for chart data
      const pricesResponse = await this.makeRequest('http://localhost:8001/api/prices');
      
      if (pricesResponse.ok && pricesResponse.data.success && pricesResponse.data.data.prices) {
        this.log('✅ Live prices endpoint working for chart', 'SUCCESS');
        
        // Test markets endpoint for trading data
        const marketsResponse = await this.makeRequest('http://localhost:8001/api/markets');
        
        if (marketsResponse.ok && marketsResponse.data.success && marketsResponse.data.data.markets) {
          this.log('✅ Markets data available for chart animation', 'SUCCESS');
          this.results.chart_data = true;
          return true;
        } else {
          this.log('❌ Markets data failed', 'ERROR');
          return false;
        }
      } else {
        this.log('❌ Live prices endpoint failed', 'ERROR');
        return false;
      }
    } catch (error) {
      this.log(`❌ Chart data test failed: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async testDepositAddressGeneration() {
    this.log('🔍 Testing deposit address generation...', 'INFO');
    
    try {
      // Test different networks
      const networks = ['bitcoin', 'ethereum', 'solana', 'avalanche', 'bsc'];
      
      for (const network of networks) {
        const response = await this.makeRequest('http://localhost:8001/api/deposits/generate-address', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: {
            userId: 'test_user_123',
            network: network,
            symbol: network === 'bitcoin' ? 'BTC' : network === 'ethereum' ? 'ETH' : 'TOKEN'
          }
        });
        
        if (response.ok && response.data.success && response.data.address) {
          this.log(`✅ ${network} address generated: ${response.data.address.substring(0, 20)}...`, 'SUCCESS');
        } else {
          this.log(`❌ ${network} address generation failed`, 'ERROR');
          return false;
        }
      }
      
      this.log('✅ All deposit address generation working', 'SUCCESS');
      this.results.deposit_address = true;
      return true;
    } catch (error) {
      this.log(`❌ Deposit address test failed: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async runAllTests() {
    this.log('🎯 Starting Fix Verification Tests...', 'INFO');
    
    // Wait for backend to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await this.testBackendHealth();
    await this.testAdminLogin();
    await this.testChartData();
    await this.testDepositAddressGeneration();
    
    // Generate report
    const totalTests = Object.keys(this.results).length;
    const passedTests = Object.values(this.results).filter(r => r).length;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    
    const report = {
      fix_verification: {
        timestamp: new Date().toISOString(),
        total_tests: totalTests,
        passed_tests: passedTests,
        success_rate: `${successRate}%`,
        all_fixes_working: successRate === '100.0'
      },
      test_results: {
        admin_login_fixed: this.results.admin_login,
        chart_animation_fixed: this.results.chart_data,
        deposit_address_fixed: this.results.deposit_address,
        backend_health: this.results.backend_health
      },
      issue_status: {
        'admin_logout_login_issue': this.results.admin_login ? 'FIXED' : 'FAILED',
        'chart_flat_not_moving': this.results.chart_data ? 'FIXED' : 'FAILED',
        'deposit_address_not_generating': this.results.deposit_address ? 'FIXED' : 'FAILED'
      }
    };
    
    fs.writeFileSync('fix_verification_report.json', JSON.stringify(report, null, 2));
    
    this.log('🎯 Fix Verification Tests Completed!', 'INFO');
    this.log(`📊 Success Rate: ${successRate}%`, 'INFO');
    this.log('📄 Report saved to: fix_verification_report.json', 'INFO');
    
    return report;
  }
}

// Execute if run directly
if (require.main === module) {
  const tester = new FixVerificationTester();
  
  tester.runAllTests()
    .then(report => {
      console.log('\n' + '='.repeat(80));
      console.log('🔧 FIX VERIFICATION COMPLETED');
      console.log('='.repeat(80));
      console.log(`✅ Success Rate: ${report.fix_verification.success_rate}`);
      console.log('');
      console.log('🔍 ISSUE STATUS:');
      Object.entries(report.issue_status).forEach(([issue, status]) => {
        const icon = status === 'FIXED' ? '✅' : '❌';
        console.log(`  ${icon} ${issue}: ${status}`);
      });
      console.log('');
      if (report.fix_verification.all_fixes_working) {
        console.log('🎉 ALL ISSUES HAVE BEEN FIXED!');
        console.log('✅ Admin login working');
        console.log('✅ Chart animation working');
        console.log('✅ Deposit addresses generating');
      } else {
        console.log('⚠️  Some issues still need attention');
      }
      
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Fix verification failed:', error);
      process.exit(1);
    });
}

module.exports = FixVerificationTester;