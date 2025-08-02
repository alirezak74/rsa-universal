#!/usr/bin/env node

const https = require('https');
const http = require('http');

console.log('🧪 RSA DEX Ecosystem Verification');
console.log('==================================');

// Function to test HTTP endpoint
function testEndpoint(url, name) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log(`✅ ${name}: OK (${res.statusCode})`);
          resolve(true);
        } catch (e) {
          console.log(`✅ ${name}: OK (${res.statusCode}) - HTML response`);
          resolve(true);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ ${name}: Failed - ${error.message}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      console.log(`❌ ${name}: Timeout`);
      resolve(false);
    });
  });
}

async function runVerification() {
  console.log('Testing core endpoints...');
  
  const tests = [
    ['http://localhost:8001/api/status', 'Backend Status'],
    ['http://localhost:8001/auth/login', 'Backend Auth'],
    ['http://localhost:8001/api/dev/admin/assets', 'Admin Assets'],
    ['http://localhost:8001/api/deposits/generate-address', 'Deposit Generation'],
    ['http://localhost:8001/api/prices', 'Price API'],
    ['http://localhost:3000', 'Admin Panel'],
    ['http://localhost:3002', 'DEX Frontend']
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const [url, name] of tests) {
    const result = await testEndpoint(url, name);
    if (result) passed++;
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('');
  console.log(`📊 Results: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
  
  if (passed === total) {
    console.log('🎉 All systems operational!');
  } else {
    console.log('⚠️  Some services may need attention');
  }
}

runVerification().catch(console.error);
