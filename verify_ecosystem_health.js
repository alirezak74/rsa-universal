#!/usr/bin/env node

const http = require('http');

function checkService(url, name) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      if (res.statusCode === 200) {
        console.log(`✅ ${name} is running`);
        resolve(true);
      } else {
        console.log(`❌ ${name} returned status ${res.statusCode}`);
        resolve(false);
      }
    });
    
    req.on('error', () => {
      console.log(`❌ ${name} is not running`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log(`⏰ ${name} timed out`);
      req.destroy();
      resolve(false);
    });
  });
}

async function verifyServices() {
  console.log('🔍 Verifying RSA DEX Ecosystem Services...\n');
  
  const services = [
    { url: 'http://localhost:8001/api/status', name: 'RSA DEX Backend' },
    { url: 'http://localhost:3000', name: 'RSA DEX Admin' },
    { url: 'http://localhost:3002', name: 'RSA DEX Frontend' }
  ];
  
  const results = await Promise.all(
    services.map(service => checkService(service.url, service.name))
  );
  
  const allRunning = results.every(result => result);
  
  console.log('\n' + '='.repeat(50));
  if (allRunning) {
    console.log('🎉 ALL SERVICES ARE RUNNING!');
    console.log('✅ RSA DEX Ecosystem is fully operational');
  } else {
    console.log('⚠️  Some services are not running');
    console.log('💡 Make sure to start all services first');
  }
  console.log('='.repeat(50));
  
  return allRunning;
}

if (require.main === module) {
  verifyServices();
}

module.exports = { verifyServices };