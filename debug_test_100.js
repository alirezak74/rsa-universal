const axios = require('axios');

const CONFIG = {
  BACKEND_URL: 'http://localhost:8001'
};

async function makeRequest(method, url, data = null) {
  try {
    const config = { method, url, timeout: 10000 };
    if (data) config.data = data;
    if (method === 'POST' || method === 'PUT') {
      config.headers = { 'Content-Type': 'application/json' };
    }
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message, status: error.response?.status };
  }
}

async function debugFailingTests() {
  console.log('🔍 DEBUGGING FINAL 3 FAILING TESTS\n');
  
  // First, import a test token
  console.log('1. Importing test token...');
  const testToken = {
    realSymbol: 'TEST',
    name: 'Test Token',
    contractAddress: '0x1234567890123456789012345678901234567890',
    network: 'ethereum',
    decimals: 18,
    coinGeckoId: 'test-token',
    selectedNetworks: ['ethereum', 'polygon', 'bsc'],
    automationSettings: {
      enableTrading: true,
      createTradingPair: true,
      trackLivePrice: true
    },
    visibilitySettings: {
      wallets: true,
      contracts: true,
      trading: true,
      transactions: true
    }
  };
  
  const importResult = await makeRequest('POST', `${CONFIG.BACKEND_URL}/api/assets/import-token`, testToken);
  console.log('   Import result:', importResult.success);
  
  if (importResult.success) {
    console.log('   Waiting 5 seconds for synchronization...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Test each failing endpoint
    const endpoints = [
      { path: '/api/admin/assets', name: 'Admin Assets', dataPath: 'data.data' },
      { path: '/api/wallets/assets', name: 'Wallet Assets', dataPath: 'data.assets' },
    ];
    
    for (const endpoint of endpoints) {
      console.log(`\n2. Testing ${endpoint.name}:`);
      const result = await makeRequest('GET', `${CONFIG.BACKEND_URL}${endpoint.path}`);
      
      if (result.success) {
        console.log('   ✅ Request successful');
        console.log('   📊 Response structure:', Object.keys(result.data));
        
        // Navigate to the correct data path
        let tokens = result.data;
        if (endpoint.dataPath === 'data.data') {
          tokens = result.data.data || [];
          console.log('   📍 Using data.data path');
        } else if (endpoint.dataPath === 'data.assets') {
          tokens = result.data.assets || [];
          console.log('   📍 Using data.assets path');
        }
        
        console.log(`   📈 Total items found: ${Array.isArray(tokens) ? tokens.length : 'NOT AN ARRAY'}`);
        console.log('   📊 Tokens data type:', typeof tokens);
        console.log('   📊 Tokens value:', tokens);
        
        if (Array.isArray(tokens)) {
          console.log('   🔍 All symbols:', tokens.map(t => t.symbol));
          console.log('   🔍 All names:', tokens.map(t => t.name));
          console.log('   🔍 All realSymbols:', tokens.map(t => t.realSymbol));
          
          // Test exact search logic
          const foundBySymbol = tokens.some(token => token.symbol === 'rTEST' || token.symbol === 'TEST');
          const foundByName = tokens.some(token => token.name?.includes('Test Token'));
          const foundByRealSymbol = tokens.some(token => token.realSymbol === 'TEST');
          const foundOverall = foundBySymbol || foundByName || foundByRealSymbol;
        
          console.log('   🎯 Search results:');
          console.log(`     - Found by symbol (rTEST/TEST): ${foundBySymbol}`);
          console.log(`     - Found by name (Test Token): ${foundByName}`);
          console.log(`     - Found by realSymbol (TEST): ${foundByRealSymbol}`);
          console.log(`     - OVERALL FOUND: ${foundOverall}`);
          
          if (!foundOverall) {
            console.log('   ⚠️ TOKEN NOT FOUND - Debugging each token:');
            tokens.forEach((token, i) => {
              console.log(`     Token ${i + 1}:`, {
                symbol: token.symbol,
                name: token.name,
                realSymbol: token.realSymbol,
                type: token.type
              });
            });
          }
        } else {
          console.log('   ❌ Tokens is not an array, cannot search');
        }
      } else {
        console.log('   ❌ Request failed:', result.error);
      }
    }
    
    // Test trading pairs
    console.log('\n3. Creating and testing trading pair...');
    const pairData = {
      baseToken: 'rTEST',
      quoteToken: 'USDT',
      initialPrice: 1.50,
      enableTrading: true
    };
    
    const createPairResult = await makeRequest('POST', `${CONFIG.BACKEND_URL}/api/dex/create-pair`, pairData);
    console.log('   Create pair result:', createPairResult.success);
    
    if (createPairResult.success) {
      console.log('   Waiting 5 seconds for pair synchronization...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      console.log('\n4. Testing Trading Pairs:');
      const pairsResult = await makeRequest('GET', `${CONFIG.BACKEND_URL}/api/pairs`);
      
      if (pairsResult.success) {
        console.log('   ✅ Pairs request successful');
        console.log('   📊 Response structure:', Object.keys(pairsResult.data));
        
        const pairs = pairsResult.data.pairs || pairsResult.data.data || [];
        console.log(`   📈 Total pairs found: ${pairs.length}`);
        console.log('   🔍 All pair symbols:', pairs.map(p => p.symbol));
        
        const foundPair = pairs.some(pair => 
          pair.symbol?.includes('rTEST/USDT') || pair.symbol?.includes('rTEST') ||
          (pair.baseToken === 'rTEST' && pair.quoteToken === 'USDT') ||
          pair.symbol === 'rTEST/USDT'
        );
        
        console.log(`   🎯 Found rTEST pair: ${foundPair}`);
        
        if (!foundPair) {
          console.log('   ⚠️ PAIR NOT FOUND - Debugging each pair:');
          pairs.forEach((pair, i) => {
            console.log(`     Pair ${i + 1}:`, {
              symbol: pair.symbol,
              baseToken: pair.baseToken,
              quoteToken: pair.quoteToken
            });
          });
        }
      } else {
        console.log('   ❌ Pairs request failed:', pairsResult.error);
      }
    }
  }
  
  console.log('\n🔍 DEBUG COMPLETE');
}

// Run the debug
debugFailingTests().catch(console.error);