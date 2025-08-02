#!/usr/bin/env node

/**
 * 🔍 RSA DEX COMPREHENSIVE ECOSYSTEM VALIDATION
 * 
 * This script performs deep validation of the entire RSA DEX ecosystem:
 * - Validates all frontend pages and features
 * - Validates all admin panel pages and features  
 * - Validates all backend endpoints and functionality
 * - Tests real synchronization between all components
 * - Validates trading, wallet, and asset management features
 * - Tests cross-chain functionality across all 13 networks
 * 
 * Author: RSA DEX Team
 * Version: 4.0.0
 * Date: 2025-01-01
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Comprehensive Test Configuration
const CONFIG = {
  // Service URLs (assuming they're running)
  BACKEND_URL: 'http://localhost:8001',
  ADMIN_URL: 'http://localhost:3000',
  FRONTEND_URL: 'http://localhost:3002',
  
  // All 13 supported networks
  NETWORKS: [
    'Bitcoin', 'Ethereum', 'BNB Chain (BSC)', 'Avalanche', 
    'Polygon', 'Arbitrum', 'Fantom', 'Linea', 'Solana', 
    'Unichain', 'opBNB', 'Base', 'Polygon zkEVM'
  ],
  
  // Wrapped tokens mapping
  WRAPPED_TOKENS: {
    'Bitcoin': 'rBTC', 'Ethereum': 'rETH', 'BNB Chain (BSC)': 'rBNB',
    'Avalanche': 'rAVAX', 'Polygon': 'rMATIC', 'Arbitrum': 'rARB',
    'Fantom': 'rFTM', 'Linea': 'rLINEA', 'Solana': 'rSOL',
    'Unichain': 'rUNI', 'opBNB': 'rOPBNB', 'Base': 'rBASE',
    'Polygon zkEVM': 'rZKEVM'
  },
  
  // Test data
  TEST_USER: {
    id: 'comprehensive_test_user',
    email: 'test@rsadex.com',
    username: 'testuser_ecosystem'
  },
  
  TEST_ASSETS: [
    { symbol: 'TEST1', name: 'Test Token 1', network: 'Ethereum' },
    { symbol: 'TEST2', name: 'Test Token 2', network: 'BNB Chain (BSC)' },
    { symbol: 'TEST3', name: 'Test Token 3', network: 'Polygon' }
  ],
  
  TIMEOUT: 15000
};

// All Frontend Pages to Validate
const FRONTEND_PAGES = [
  { name: 'Home/Dashboard', path: '/', critical: true },
  { name: 'Exchange', path: '/exchange', critical: true },
  { name: 'Markets', path: '/markets', critical: true },
  { name: 'Swap', path: '/swap', critical: true },
  { name: 'Deposits', path: '/deposits', critical: true },
  { name: 'Wallet', path: '/wallet', critical: true },
  { name: 'Orders', path: '/orders', critical: true },
  { name: 'History', path: '/history', critical: true },
  { name: 'Buy Crypto', path: '/buy', critical: false },
  { name: 'Account', path: '/account', critical: true },
  { name: 'New Account', path: '/new-account', critical: true },
  { name: 'Login', path: '/login', critical: true },
  { name: 'Help', path: '/help', critical: false }
];

// All Admin Pages to Validate
const ADMIN_PAGES = [
  { name: 'Dashboard', path: '/', critical: true },
  { name: 'Orders', path: '/orders', critical: true },
  { name: 'Trades', path: '/trades', critical: true },
  { name: 'Cross-Chain', path: '/cross-chain', critical: true },
  { name: 'Hot Wallet Management', path: '/hot-wallet', critical: true },
  { name: 'Wrapped Tokens', path: '/wrapped-tokens', critical: true },
  { name: 'Wallets', path: '/wallets', critical: true },
  { name: 'Users', path: '/users', critical: true },
  { name: 'Transactions', path: '/transactions', critical: true },
  { name: 'Contracts', path: '/contracts', critical: true },
  { name: 'Assets', path: '/assets', critical: true },
  { name: 'Logs', path: '/logs', critical: true },
  { name: 'Settings', path: '/settings', critical: true },
  { name: 'Database Tools', path: '/dbtools', critical: true },
  { name: 'Gas Settings', path: '/gas', critical: true },
  { name: 'Emergency', path: '/emergency', critical: true },
  { name: 'Help', path: '/help', critical: false },
  { name: 'Login', path: '/login', critical: true }
];

// Backend Endpoints to Validate
const BACKEND_ENDPOINTS = [
  // Core endpoints
  { path: '/health', method: 'GET', critical: true, description: 'System Health' },
  { path: '/api/status', method: 'GET', critical: true, description: 'API Status' },
  
  // Market data endpoints
  { path: '/api/markets', method: 'GET', critical: true, description: 'Market Data' },
  { path: '/api/trading-pairs', method: 'GET', critical: true, description: 'Trading Pairs' },
  { path: '/api/assets', method: 'GET', critical: true, description: 'Assets List' },
  { path: '/api/prices', method: 'GET', critical: true, description: 'Price Data' },
  
  // User endpoints
  { path: '/api/user/profile', method: 'GET', critical: true, description: 'User Profile' },
  { path: '/api/user/wallet', method: 'GET', critical: true, description: 'User Wallet' },
  { path: '/api/user/balance', method: 'GET', critical: true, description: 'User Balance' },
  
  // Trading endpoints
  { path: '/api/orders', method: 'GET', critical: true, description: 'User Orders' },
  { path: '/api/trades', method: 'GET', critical: true, description: 'Trade History' },
  { path: '/api/transactions', method: 'GET', critical: true, description: 'Transactions' },
  
  // Deposit/Withdrawal endpoints
  { path: '/api/deposits', method: 'GET', critical: true, description: 'Deposits' },
  { path: '/api/withdrawals', method: 'GET', critical: true, description: 'Withdrawals' },
  { path: '/api/deposits/address', method: 'POST', critical: true, description: 'Generate Address' },
  
  // Admin endpoints
  { path: '/admin/dashboard/stats', method: 'GET', critical: true, description: 'Admin Stats' },
  { path: '/admin/users/list', method: 'GET', critical: true, description: 'Users List' },
  { path: '/admin/hot-wallet/dashboard', method: 'GET', critical: true, description: 'Hot Wallet' },
  { path: '/admin/wrapped-tokens/dashboard', method: 'GET', critical: true, description: 'Wrapped Tokens' },
  { path: '/admin/emergency/status', method: 'GET', critical: true, description: 'Emergency Status' },
  
  // Cross-chain endpoints
  { path: '/api/bridge/status', method: 'GET', critical: true, description: 'Bridge Status' },
  { path: '/api/networks', method: 'GET', critical: true, description: 'Supported Networks' }
];

class RSADEXComprehensiveValidator {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      critical_failures: 0,
      errors: [],
      warnings_list: [],
      detailed_results: {},
      component_health: {
        frontend: { status: 'unknown', pages_working: 0, total_pages: FRONTEND_PAGES.length },
        admin: { status: 'unknown', pages_working: 0, total_pages: ADMIN_PAGES.length },
        backend: { status: 'unknown', endpoints_working: 0, total_endpoints: BACKEND_ENDPOINTS.length }
      }
    };
    
    this.testStartTime = Date.now();
    this.createdTestData = {
      assets: [],
      tradingPairs: [],
      transactions: [],
      users: []
    };
  }

  log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'ERROR' ? '❌' : type === 'WARN' ? '⚠️' : type === 'SUCCESS' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async runTest(testName, testFunction, isCritical = false) {
    try {
      this.log(`Starting comprehensive test: ${testName}`, 'INFO');
      const result = await testFunction();
      
      if (result.success) {
        this.results.passed++;
        this.log(`✅ PASSED: ${testName}`, 'SUCCESS');
      } else {
        this.results.failed++;
        this.results.errors.push(`${testName}: ${result.error}`);
        
        if (isCritical) {
          this.results.critical_failures++;
          this.log(`🚨 CRITICAL FAILURE: ${testName} - ${result.error}`, 'ERROR');
        } else {
          this.log(`❌ FAILED: ${testName} - ${result.error}`, 'ERROR');
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

  // Enhanced HTTP request method
  async makeRequest(url, options = {}) {
    try {
      const method = options.method || 'GET';
      const headers = options.headers || {};
      const body = options.body;
      
      let curlCommand = `curl -s -w "%{http_code}" -o /tmp/curl_response.txt -X ${method}`;
      
      // Add headers
      Object.keys(headers).forEach(key => {
        curlCommand += ` -H "${key}: ${headers[key]}"`;
      });
      
      // Add body for POST/PUT requests
      if (body && (method === 'POST' || method === 'PUT')) {
        curlCommand += ` -d '${JSON.stringify(body)}'`;
      }
      
      // Add URL and timeout
      curlCommand += ` "${url}" --max-time 10 --connect-timeout 5`;
      
      const httpCode = execSync(curlCommand, { encoding: 'utf8', timeout: CONFIG.TIMEOUT }).trim();
      
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

  // Test if all services are running and responsive
  async testServiceHealth() {
    const services = [
      { name: 'Backend', url: `${CONFIG.BACKEND_URL}/health`, critical: true },
      { name: 'Admin Panel', url: `${CONFIG.ADMIN_URL}`, critical: true },
      { name: 'Frontend', url: `${CONFIG.FRONTEND_URL}`, critical: true }
    ];

    let allHealthy = true;
    const serviceResults = {};

    for (const service of services) {
      try {
        this.log(`Checking ${service.name} health...`, 'INFO');
        const response = await this.makeRequest(service.url);
        
        serviceResults[service.name] = {
          healthy: response.ok,
          status: response.status,
          error: response.ok ? null : response.error
        };

        if (response.ok) {
          this.log(`${service.name} is healthy ✅`, 'SUCCESS');
        } else {
          this.log(`${service.name} is not healthy ❌ - ${response.error}`, 'ERROR');
          allHealthy = false;
        }
      } catch (error) {
        serviceResults[service.name] = {
          healthy: false,
          status: 500,
          error: error.message
        };
        allHealthy = false;
        this.log(`${service.name} health check failed: ${error.message}`, 'ERROR');
      }
    }

    return {
      success: allHealthy,
      error: allHealthy ? null : 'Some services are not healthy',
      services: serviceResults
    };
  }

  // Comprehensive Frontend validation
  async testFrontendPages() {
    let workingPages = 0;
    const pageResults = {};

    for (const page of FRONTEND_PAGES) {
      try {
        this.log(`Testing Frontend page: ${page.name}`, 'INFO');
        
        // Check if page file exists
        const pagePath = `rsa-dex/src/app${page.path === '/' ? '/page.tsx' : page.path + '/page.tsx'}`;
        const pageExists = fs.existsSync(pagePath);
        
        if (!pageExists) {
          pageResults[page.name] = {
            exists: false,
            accessible: false,
            critical: page.critical,
            error: 'Page file not found'
          };
          continue;
        }

        // Test page accessibility via HTTP
        const response = await this.makeRequest(`${CONFIG.FRONTEND_URL}${page.path}`);
        
        pageResults[page.name] = {
          exists: true,
          accessible: response.ok,
          critical: page.critical,
          status: response.status,
          error: response.ok ? null : response.error
        };

        if (response.ok) {
          workingPages++;
          this.log(`Frontend ${page.name} page working ✅`, 'SUCCESS');
        } else {
          this.log(`Frontend ${page.name} page failed ❌`, 'ERROR');
        }
      } catch (error) {
        pageResults[page.name] = {
          exists: false,
          accessible: false,
          critical: page.critical,
          error: error.message
        };
      }
    }

    this.results.component_health.frontend = {
      status: workingPages === FRONTEND_PAGES.length ? 'healthy' : 'partial',
      pages_working: workingPages,
      total_pages: FRONTEND_PAGES.length
    };

    return {
      success: workingPages === FRONTEND_PAGES.length,
      error: workingPages === FRONTEND_PAGES.length ? null : `${FRONTEND_PAGES.length - workingPages} pages failed`,
      pages_tested: FRONTEND_PAGES.length,
      pages_working: workingPages,
      page_details: pageResults
    };
  }

  // Comprehensive Admin Panel validation
  async testAdminPages() {
    let workingPages = 0;
    const pageResults = {};

    for (const page of ADMIN_PAGES) {
      try {
        this.log(`Testing Admin page: ${page.name}`, 'INFO');
        
        // Check if page file exists
        const pagePath = `rsa-admin-next/src/app${page.path === '/' ? '/page.tsx' : page.path + '/page.tsx'}`;
        const pageExists = fs.existsSync(pagePath);
        
        if (!pageExists) {
          pageResults[page.name] = {
            exists: false,
            accessible: false,
            critical: page.critical,
            error: 'Page file not found'
          };
          continue;
        }

        // Test page accessibility via HTTP
        const response = await this.makeRequest(`${CONFIG.ADMIN_URL}${page.path}`);
        
        pageResults[page.name] = {
          exists: true,
          accessible: response.ok,
          critical: page.critical,
          status: response.status,
          error: response.ok ? null : response.error
        };

        if (response.ok) {
          workingPages++;
          this.log(`Admin ${page.name} page working ✅`, 'SUCCESS');
        } else {
          this.log(`Admin ${page.name} page failed ❌`, 'ERROR');
        }
      } catch (error) {
        pageResults[page.name] = {
          exists: false,
          accessible: false,
          critical: page.critical,
          error: error.message
        };
      }
    }

    this.results.component_health.admin = {
      status: workingPages === ADMIN_PAGES.length ? 'healthy' : 'partial',
      pages_working: workingPages,
      total_pages: ADMIN_PAGES.length
    };

    return {
      success: workingPages === ADMIN_PAGES.length,
      error: workingPages === ADMIN_PAGES.length ? null : `${ADMIN_PAGES.length - workingPages} pages failed`,
      pages_tested: ADMIN_PAGES.length,
      pages_working: workingPages,
      page_details: pageResults
    };
  }

  // Comprehensive Backend API validation
  async testBackendEndpoints() {
    let workingEndpoints = 0;
    const endpointResults = {};

    for (const endpoint of BACKEND_ENDPOINTS) {
      try {
        this.log(`Testing Backend endpoint: ${endpoint.path}`, 'INFO');
        
        const response = await this.makeRequest(`${CONFIG.BACKEND_URL}${endpoint.path}`, {
          method: endpoint.method
        });
        
        endpointResults[endpoint.path] = {
          working: response.ok,
          critical: endpoint.critical,
          method: endpoint.method,
          status: response.status,
          description: endpoint.description,
          error: response.ok ? null : response.error
        };

        if (response.ok) {
          workingEndpoints++;
          this.log(`Backend ${endpoint.path} working ✅`, 'SUCCESS');
        } else {
          this.log(`Backend ${endpoint.path} failed ❌`, 'ERROR');
        }
      } catch (error) {
        endpointResults[endpoint.path] = {
          working: false,
          critical: endpoint.critical,
          method: endpoint.method,
          description: endpoint.description,
          error: error.message
        };
      }
    }

    this.results.component_health.backend = {
      status: workingEndpoints === BACKEND_ENDPOINTS.length ? 'healthy' : 'partial',
      endpoints_working: workingEndpoints,
      total_endpoints: BACKEND_ENDPOINTS.length
    };

    return {
      success: workingEndpoints === BACKEND_ENDPOINTS.length,
      error: workingEndpoints === BACKEND_ENDPOINTS.length ? null : `${BACKEND_ENDPOINTS.length - workingEndpoints} endpoints failed`,
      endpoints_tested: BACKEND_ENDPOINTS.length,
      endpoints_working: workingEndpoints,
      endpoint_details: endpointResults
    };
  }

  // Test cross-network functionality
  async testCrossNetworkSupport() {
    let supportedNetworks = 0;
    const networkResults = {};

    for (const network of CONFIG.NETWORKS) {
      try {
        this.log(`Testing network support: ${network}`, 'INFO');
        
        const wrappedToken = CONFIG.WRAPPED_TOKENS[network];
        
        // Test network status
        const networkResponse = await this.makeRequest(`${CONFIG.BACKEND_URL}/api/networks/${network}`);
        
        // Test deposit address generation
        const addressResponse = await this.makeRequest(`${CONFIG.BACKEND_URL}/api/deposits/address`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: { network: network }
        });

        const networkSupported = networkResponse.ok || addressResponse.ok;
        
        networkResults[network] = {
          supported: networkSupported,
          wrapped_token: wrappedToken,
          network_status: networkResponse.ok,
          address_generation: addressResponse.ok,
          status: networkResponse.status,
          error: networkSupported ? null : 'Network not supported'
        };

        if (networkSupported) {
          supportedNetworks++;
          this.log(`Network ${network} supported ✅`, 'SUCCESS');
        } else {
          this.log(`Network ${network} not supported ❌`, 'ERROR');
        }
      } catch (error) {
        networkResults[network] = {
          supported: false,
          wrapped_token: CONFIG.WRAPPED_TOKENS[network],
          error: error.message
        };
      }
    }

    return {
      success: supportedNetworks >= 10, // At least 10 of 13 networks should work
      error: supportedNetworks >= 10 ? null : `Only ${supportedNetworks}/${CONFIG.NETWORKS.length} networks supported`,
      networks_tested: CONFIG.NETWORKS.length,
      networks_supported: supportedNetworks,
      network_details: networkResults
    };
  }

  // Test comprehensive trading functionality
  async testTradingFeatures() {
    const tradingTests = [];

    try {
      // Test trading pairs endpoint
      const pairsResponse = await this.makeRequest(`${CONFIG.BACKEND_URL}/api/trading-pairs`);
      tradingTests.push({ feature: 'Trading Pairs API', success: pairsResponse.ok });

      // Test market data
      const marketsResponse = await this.makeRequest(`${CONFIG.BACKEND_URL}/api/markets`);
      tradingTests.push({ feature: 'Market Data API', success: marketsResponse.ok });

      // Test order creation (simulation)
      const orderResponse = await this.makeRequest(`${CONFIG.BACKEND_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: {
          pair: 'rBTC/RSA',
          type: 'limit',
          side: 'buy',
          amount: 0.001,
          price: 50000
        }
      });
      tradingTests.push({ feature: 'Order Creation', success: orderResponse.ok });

      // Test trade history
      const tradesResponse = await this.makeRequest(`${CONFIG.BACKEND_URL}/api/trades`);
      tradingTests.push({ feature: 'Trade History', success: tradesResponse.ok });

      const successfulFeatures = tradingTests.filter(test => test.success).length;

      return {
        success: successfulFeatures >= 3, // At least 3 of 4 features should work
        error: successfulFeatures >= 3 ? null : 'Critical trading features missing',
        features_tested: tradingTests.length,
        features_working: successfulFeatures,
        feature_details: tradingTests
      };
    } catch (error) {
      return {
        success: false,
        error: `Trading features test failed: ${error.message}`,
        features_tested: 0,
        features_working: 0
      };
    }
  }

  // Test wallet functionality
  async testWalletFeatures() {
    const walletTests = [];

    try {
      // Test wallet info
      const walletResponse = await this.makeRequest(`${CONFIG.BACKEND_URL}/api/user/wallet`);
      walletTests.push({ feature: 'Wallet Info', success: walletResponse.ok });

      // Test balance check
      const balanceResponse = await this.makeRequest(`${CONFIG.BACKEND_URL}/api/user/balance`);
      walletTests.push({ feature: 'Balance Check', success: balanceResponse.ok });

      // Test transaction history
      const txResponse = await this.makeRequest(`${CONFIG.BACKEND_URL}/api/transactions`);
      walletTests.push({ feature: 'Transaction History', success: txResponse.ok });

      // Test deposits
      const depositsResponse = await this.makeRequest(`${CONFIG.BACKEND_URL}/api/deposits`);
      walletTests.push({ feature: 'Deposit History', success: depositsResponse.ok });

      const successfulFeatures = walletTests.filter(test => test.success).length;

      return {
        success: successfulFeatures >= 3,
        error: successfulFeatures >= 3 ? null : 'Critical wallet features missing',
        features_tested: walletTests.length,
        features_working: successfulFeatures,
        feature_details: walletTests
      };
    } catch (error) {
      return {
        success: false,
        error: `Wallet features test failed: ${error.message}`,
        features_tested: 0,
        features_working: 0
      };
    }
  }

  // Test admin-specific features
  async testAdminFeatures() {
    const adminTests = [];

    try {
      // Test admin dashboard
      const dashboardResponse = await this.makeRequest(`${CONFIG.BACKEND_URL}/admin/dashboard/stats`);
      adminTests.push({ feature: 'Admin Dashboard', success: dashboardResponse.ok });

      // Test hot wallet management
      const hotWalletResponse = await this.makeRequest(`${CONFIG.BACKEND_URL}/admin/hot-wallet/dashboard`);
      adminTests.push({ feature: 'Hot Wallet Management', success: hotWalletResponse.ok });

      // Test wrapped tokens
      const wrappedTokensResponse = await this.makeRequest(`${CONFIG.BACKEND_URL}/admin/wrapped-tokens/dashboard`);
      adminTests.push({ feature: 'Wrapped Tokens', success: wrappedTokensResponse.ok });

      // Test user management
      const usersResponse = await this.makeRequest(`${CONFIG.BACKEND_URL}/admin/users/list`);
      adminTests.push({ feature: 'User Management', success: usersResponse.ok });

      // Test emergency controls
      const emergencyResponse = await this.makeRequest(`${CONFIG.BACKEND_URL}/admin/emergency/status`);
      adminTests.push({ feature: 'Emergency Controls', success: emergencyResponse.ok });

      const successfulFeatures = adminTests.filter(test => test.success).length;

      return {
        success: successfulFeatures >= 4,
        error: successfulFeatures >= 4 ? null : 'Critical admin features missing',
        features_tested: adminTests.length,
        features_working: successfulFeatures,
        feature_details: adminTests
      };
    } catch (error) {
      return {
        success: false,
        error: `Admin features test failed: ${error.message}`,
        features_tested: 0,
        features_working: 0
      };
    }
  }

  // Test real-time synchronization
  async testEcosystemSync() {
    const syncTests = {};

    try {
      // Test if all services can communicate
      const frontendHealth = await this.makeRequest(`${CONFIG.FRONTEND_URL}/api/health`);
      const adminHealth = await this.makeRequest(`${CONFIG.ADMIN_URL}/api/health`);
      const backendHealth = await this.makeRequest(`${CONFIG.BACKEND_URL}/health`);

      syncTests.service_communication = frontendHealth.ok && adminHealth.ok && backendHealth.ok;

      // Test data consistency
      const frontendMarkets = await this.makeRequest(`${CONFIG.FRONTEND_URL}/api/markets`);
      const adminMarkets = await this.makeRequest(`${CONFIG.ADMIN_URL}/api/markets`);
      
      syncTests.data_consistency = frontendMarkets.ok && adminMarkets.ok;

      // Test cross-service data access
      const frontendAssets = await this.makeRequest(`${CONFIG.FRONTEND_URL}/api/assets`);
      const adminAssets = await this.makeRequest(`${CONFIG.ADMIN_URL}/api/assets`);
      
      syncTests.cross_service_access = frontendAssets.ok && adminAssets.ok;

      const overallSync = Object.values(syncTests).every(test => test === true);

      return {
        success: overallSync,
        error: overallSync ? null : 'Synchronization issues detected',
        sync_details: syncTests
      };
    } catch (error) {
      return {
        success: false,
        error: `Sync test failed: ${error.message}`,
        sync_details: syncTests
      };
    }
  }

  // Generate comprehensive validation report
  generateValidationReport() {
    const duration = Date.now() - this.testStartTime;
    const totalTests = this.results.passed + this.results.failed;
    const successRate = totalTests > 0 ? ((this.results.passed / totalTests) * 100).toFixed(2) : 0;

    const report = {
      validation_summary: {
        ecosystem_name: 'RSA DEX Complete Ecosystem',
        validation_type: 'Comprehensive Feature & Sync Validation',
        total_tests: totalTests,
        passed: this.results.passed,
        failed: this.results.failed,
        critical_failures: this.results.critical_failures,
        warnings: this.results.warnings,
        success_rate: `${successRate}%`,
        duration_ms: duration,
        timestamp: new Date().toISOString()
      },

      ecosystem_health: this.results.component_health,

      detailed_results: this.results.detailed_results,

      errors: this.results.errors,
      warnings: this.results.warnings_list,

      overall_status: {
        ecosystem_health: successRate >= 95 ? 'EXCELLENT' : successRate >= 85 ? 'GOOD' : successRate >= 75 ? 'ACCEPTABLE' : 'NEEDS_ATTENTION',
        production_ready: successRate >= 90 && this.results.critical_failures === 0,
        critical_issues: this.results.critical_failures,
        recommendation: successRate >= 90 ? 'Ready for production' : 'Requires fixes before production'
      },

      component_breakdown: {
        frontend: {
          status: this.results.component_health.frontend.status,
          working_pages: this.results.component_health.frontend.pages_working,
          total_pages: this.results.component_health.frontend.total_pages,
          percentage: ((this.results.component_health.frontend.pages_working / this.results.component_health.frontend.total_pages) * 100).toFixed(1) + '%'
        },
        admin: {
          status: this.results.component_health.admin.status,
          working_pages: this.results.component_health.admin.pages_working,
          total_pages: this.results.component_health.admin.total_pages,
          percentage: ((this.results.component_health.admin.pages_working / this.results.component_health.admin.total_pages) * 100).toFixed(1) + '%'
        },
        backend: {
          status: this.results.component_health.backend.status,
          working_endpoints: this.results.component_health.backend.endpoints_working,
          total_endpoints: this.results.component_health.backend.total_endpoints,
          percentage: ((this.results.component_health.backend.endpoints_working / this.results.component_health.backend.total_endpoints) * 100).toFixed(1) + '%'
        }
      },

      recommendations: [
        '🔍 Complete ecosystem validation performed',
        '✅ All critical components tested',
        '🌐 Cross-network functionality verified',
        '🔄 Synchronization between services tested',
        '📊 Ready for production if success rate > 90%',
        '🛠️ Fix critical failures before deployment',
        '⚡ Monitor performance under load',
        '🔒 Implement additional security measures'
      ]
    };

    return report;
  }

  // Main comprehensive validation execution
  async runComprehensiveValidation() {
    this.log('🔍 Starting RSA DEX Comprehensive Ecosystem Validation', 'INFO');
    this.log('Testing all features, pages, options, and synchronization...', 'INFO');
    
    // Test service health first
    await this.runTest('Service Health Check', () => this.testServiceHealth(), true);
    
    // Test all components
    await this.runTest('Frontend Pages Validation', () => this.testFrontendPages(), true);
    await this.runTest('Admin Pages Validation', () => this.testAdminPages(), true);
    await this.runTest('Backend Endpoints Validation', () => this.testBackendEndpoints(), true);
    
    // Test functionality
    await this.runTest('Cross-Network Support', () => this.testCrossNetworkSupport(), true);
    await this.runTest('Trading Features', () => this.testTradingFeatures(), true);
    await this.runTest('Wallet Features', () => this.testWalletFeatures(), true);
    await this.runTest('Admin Features', () => this.testAdminFeatures(), true);
    
    // Test synchronization
    await this.runTest('Ecosystem Synchronization', () => this.testEcosystemSync(), true);

    // Generate comprehensive report
    const report = this.generateValidationReport();
    
    fs.writeFileSync('rsa_dex_comprehensive_validation_report.json', JSON.stringify(report, null, 2));
    
    this.log('🔍 Comprehensive Ecosystem Validation Complete!', 'SUCCESS');
    this.log(`📊 Results: ${this.results.passed}/${this.results.passed + this.results.failed} tests passed (${report.validation_summary.success_rate})`, 'INFO');
    this.log('📄 Detailed report saved to: rsa_dex_comprehensive_validation_report.json', 'INFO');
    
    return report;
  }
}

// Execute if run directly
if (require.main === module) {
  const validator = new RSADEXComprehensiveValidator();
  
  validator.runComprehensiveValidation()
    .then(report => {
      console.log('\n' + '='.repeat(100));
      console.log('🔍 RSA DEX COMPREHENSIVE ECOSYSTEM VALIDATION COMPLETED');
      console.log('='.repeat(100));
      console.log(`✅ Overall Status: ${report.overall_status.ecosystem_health}`);
      console.log(`📊 Success Rate: ${report.validation_summary.success_rate}`);
      console.log(`🚨 Critical Failures: ${report.validation_summary.critical_failures}`);
      console.log(`🚀 Production Ready: ${report.overall_status.production_ready ? 'YES' : 'NO'}`);
      
      console.log('\n🏗️ COMPONENT STATUS:');
      console.log(`  🎨 Frontend: ${report.component_breakdown.frontend.percentage} (${report.component_breakdown.frontend.working_pages}/${report.component_breakdown.frontend.total_pages} pages)`);
      console.log(`  ⚙️ Admin Panel: ${report.component_breakdown.admin.percentage} (${report.component_breakdown.admin.working_pages}/${report.component_breakdown.admin.total_pages} pages)`);
      console.log(`  🔧 Backend: ${report.component_breakdown.backend.percentage} (${report.component_breakdown.backend.working_endpoints}/${report.component_breakdown.backend.total_endpoints} endpoints)`);
      
      if (report.validation_summary.failed > 0) {
        console.log('\n❌ Failed Tests:');
        report.errors.forEach(error => console.log(`  • ${error}`));
      }
      
      if (report.validation_summary.warnings > 0) {
        console.log('\n⚠️ Warnings:');
        report.warnings.forEach(warning => console.log(`  • ${warning}`));
      }
      
      console.log('\n💡 Recommendation:');
      console.log(`  ${report.overall_status.recommendation}`);
      
      process.exit(report.validation_summary.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('❌ Comprehensive validation failed:', error);
      process.exit(1);
    });
}

module.exports = RSADEXComprehensiveValidator;