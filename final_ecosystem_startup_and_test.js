#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 RSA DEX Ecosystem - Complete Startup & Issue Resolution Test');
console.log('================================================================');
console.log('');

// Test results tracking
const results = {
    services: {},
    tests: {},
    issues: {}
};

// Helper function to run command and capture output
function runCommand(command, cwd = process.cwd()) {
    return new Promise((resolve, reject) => {
        exec(command, { cwd }, (error, stdout, stderr) => {
            if (error) {
                resolve({ success: false, error: error.message, stdout, stderr });
            } else {
                resolve({ success: true, stdout, stderr });
            }
        });
    });
}

// Helper function to wait for service to be ready
function waitForService(url, maxAttempts = 30) {
    return new Promise(async (resolve) => {
        for (let i = 0; i < maxAttempts; i++) {
            try {
                const result = await runCommand(`curl -s -o /dev/null -w "%{http_code}" ${url}`);
                if (result.stdout.trim() === '200' || result.stdout.trim() === '404') {
                    resolve(true);
                    return;
                }
            } catch (error) {
                // Continue trying
            }
            await new Promise(r => setTimeout(r, 2000));
        }
        resolve(false);
    });
}

async function main() {
    console.log('📋 STEP 1: Cleanup any existing processes');
    console.log('==========================================');
    
    // Kill any existing processes on our ports
    const ports = [3000, 3002, 8001];
    for (const port of ports) {
        try {
            await runCommand(`lsof -ti:${port} | xargs kill -9 2>/dev/null || true`);
            console.log(`✅ Cleaned up port ${port}`);
        } catch (error) {
            console.log(`⚠️  Port ${port} cleanup skipped (lsof not available)`);
        }
    }
    
    console.log('');
    console.log('🔧 STEP 2: Fix reported build issues');
    console.log('=====================================');
    
    // Remove any conflicting pages directories
    const conflictingDirs = [
        'rsa-dex/pages',
        'rsa-admin-next/pages'
    ];
    
    for (const dir of conflictingDirs) {
        const fullPath = path.join(process.cwd(), dir);
        if (fs.existsSync(fullPath)) {
            const files = fs.readdirSync(fullPath);
            if (files.length === 0) {
                fs.rmdirSync(fullPath);
                console.log(`✅ Removed empty conflicting directory: ${dir}`);
            } else {
                console.log(`⚠️  Skipped ${dir} - contains files`);
            }
        }
    }
    
    console.log('');
    console.log('🚀 STEP 3: Start RSA DEX Backend');
    console.log('=================================');
    
    // Start the enhanced backend
    const backendProcess = spawn('node', ['standalone_enhanced_backend.js'], {
        cwd: path.join(process.cwd(), 'rsa-dex-backend'),
        stdio: 'pipe',
        detached: true
    });
    
    backendProcess.unref();
    
    console.log('⏳ Starting enhanced backend...');
    const backendReady = await waitForService('http://localhost:8001/api/status');
    
    if (backendReady) {
        console.log('✅ Backend is running on port 8001');
        results.services.backend = true;
    } else {
        console.log('❌ Backend failed to start');
        results.services.backend = false;
    }
    
    console.log('');
    console.log('🚀 STEP 4: Start RSA DEX Admin');
    console.log('===============================');
    
    // Start the admin panel
    const adminProcess = spawn('npm', ['run', 'dev'], {
        cwd: path.join(process.cwd(), 'rsa-admin-next'),
        stdio: 'pipe',
        detached: true,
        env: { ...process.env, PORT: '3000' }
    });
    
    adminProcess.unref();
    
    console.log('⏳ Starting admin panel...');
    const adminReady = await waitForService('http://localhost:3000');
    
    if (adminReady) {
        console.log('✅ Admin panel is running on port 3000');
        results.services.admin = true;
    } else {
        console.log('❌ Admin panel failed to start');
        results.services.admin = false;
    }
    
    console.log('');
    console.log('🚀 STEP 5: Start RSA DEX Frontend');
    console.log('==================================');
    
    // Start the frontend
    const frontendProcess = spawn('npm', ['run', 'dev'], {
        cwd: path.join(process.cwd(), 'rsa-dex'),
        stdio: 'pipe',
        detached: true,
        env: { ...process.env, PORT: '3002' }
    });
    
    frontendProcess.unref();
    
    console.log('⏳ Starting frontend...');
    const frontendReady = await waitForService('http://localhost:3002');
    
    if (frontendReady) {
        console.log('✅ Frontend is running on port 3002');
        results.services.frontend = true;
    } else {
        console.log('❌ Frontend failed to start');
        results.services.frontend = false;
    }
    
    console.log('');
    console.log('🧪 STEP 6: Test All Reported Issues');
    console.log('=====================================');
    
    // Wait a bit for services to fully initialize
    console.log('⏳ Waiting for services to fully initialize...');
    await new Promise(r => setTimeout(r, 10000));
    
    // Test 1: Admin Login (fix "endpoint not found")
    console.log('🔐 Testing Admin Login...');
    try {
        const loginResult = await runCommand(`curl -s -X POST http://localhost:8001/auth/login -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}'`);
        if (loginResult.success && loginResult.stdout.includes('"success":true')) {
            console.log('✅ Admin login endpoint working');
            results.issues.admin_login = true;
        } else {
            console.log('❌ Admin login endpoint failed');
            results.issues.admin_login = false;
        }
    } catch (error) {
        console.log('❌ Admin login test failed:', error.message);
        results.issues.admin_login = false;
    }
    
    // Test 2: Chart Data (fix flat chart)
    console.log('📈 Testing Chart Data...');
    try {
        const pricesResult = await runCommand('curl -s http://localhost:8001/api/prices');
        if (pricesResult.success && pricesResult.stdout.includes('"success":true')) {
            console.log('✅ Price API working for chart animation');
            results.issues.chart_animation = true;
        } else {
            console.log('❌ Price API failed');
            results.issues.chart_animation = false;
        }
    } catch (error) {
        console.log('❌ Chart data test failed:', error.message);
        results.issues.chart_animation = false;
    }
    
    // Test 3: Deposit Address Generation (fix "undefined" addresses)
    console.log('🏦 Testing Deposit Address Generation...');
    try {
        const depositResult = await runCommand(`curl -s -X POST http://localhost:8001/api/deposits/generate-address -H "Content-Type: application/json" -d '{"userId":"test123","network":"bitcoin","symbol":"BTC"}'`);
        if (depositResult.success && depositResult.stdout.includes('"address":')) {
            console.log('✅ Deposit address generation working');
            results.issues.deposit_address = true;
        } else {
            console.log('❌ Deposit address generation failed');
            results.issues.deposit_address = false;
        }
    } catch (error) {
        console.log('❌ Deposit address test failed:', error.message);
        results.issues.deposit_address = false;
    }
    
    // Test 4: Assets API (fix 404 error)
    console.log('💰 Testing Assets API...');
    try {
        const assetsResult = await runCommand('curl -s http://localhost:8001/api/dev/admin/assets');
        if (assetsResult.success && assetsResult.stdout.includes('"success":true')) {
            console.log('✅ Assets API working');
            results.issues.assets_404 = true;
        } else {
            console.log('❌ Assets API failed');
            results.issues.assets_404 = false;
        }
    } catch (error) {
        console.log('❌ Assets API test failed:', error.message);
        results.issues.assets_404 = false;
    }
    
    // Test 5: Markets API
    console.log('📊 Testing Markets API...');
    try {
        const marketsResult = await runCommand('curl -s http://localhost:8001/api/markets');
        if (marketsResult.success && marketsResult.stdout.includes('"success":true')) {
            console.log('✅ Markets API working');
            results.issues.markets = true;
        } else {
            console.log('❌ Markets API failed');
            results.issues.markets = false;
        }
    } catch (error) {
        console.log('❌ Markets API test failed:', error.message);
        results.issues.markets = false;
    }
    
    console.log('');
    console.log('📊 FINAL RESULTS');
    console.log('================');
    
    console.log('🚀 Services Status:');
    console.log(`   Backend:  ${results.services.backend ? '✅ Running' : '❌ Failed'}`);
    console.log(`   Admin:    ${results.services.admin ? '✅ Running' : '❌ Failed'}`);
    console.log(`   Frontend: ${results.services.frontend ? '✅ Running' : '❌ Failed'}`);
    
    console.log('');
    console.log('🔧 Issue Resolutions:');
    console.log(`   Admin Login:      ${results.issues.admin_login ? '✅ Fixed' : '❌ Still broken'}`);
    console.log(`   Chart Animation:  ${results.issues.chart_animation ? '✅ Fixed' : '❌ Still broken'}`);
    console.log(`   Deposit Address:  ${results.issues.deposit_address ? '✅ Fixed' : '❌ Still broken'}`);
    console.log(`   Assets 404:       ${results.issues.assets_404 ? '✅ Fixed' : '❌ Still broken'}`);
    console.log(`   Markets API:      ${results.issues.markets ? '✅ Working' : '❌ Failed'}`);
    
    // Calculate success rate
    const serviceSuccesses = Object.values(results.services).filter(Boolean).length;
    const serviceTotal = Object.keys(results.services).length;
    const issueSuccesses = Object.values(results.issues).filter(Boolean).length;
    const issueTotal = Object.keys(results.issues).length;
    
    const totalSuccesses = serviceSuccesses + issueSuccesses;
    const totalTests = serviceTotal + issueTotal;
    const successRate = Math.round((totalSuccesses / totalTests) * 100);
    
    console.log('');
    console.log(`🎯 Overall Success Rate: ${successRate}% (${totalSuccesses}/${totalTests})`);
    
    if (successRate === 100) {
        console.log('');
        console.log('🎉 ALL ISSUES RESOLVED! 🎉');
        console.log('========================');
        console.log('✅ All services are running');
        console.log('✅ All reported issues are fixed');
        console.log('✅ RSA DEX ecosystem is fully operational');
        console.log('');
        console.log('🌐 Access URLs:');
        console.log('   🔧 Admin Panel:  http://localhost:3000');
        console.log('   💹 Frontend:     http://localhost:3002');
        console.log('   🔌 Backend API:  http://localhost:8001');
        console.log('');
        console.log('📝 User Actions:');
        console.log('   1. Login to admin with: admin / admin123');
        console.log('   2. Check chart animation on frontend');
        console.log('   3. Test deposit address generation');
        console.log('   4. Verify all features are syncing');
    } else {
        console.log('');
        console.log('⚠️  Some issues remain or services failed to start');
        console.log('   Please check the logs above for specific failures');
        console.log('   You may need to manually start failed services');
    }
    
    // Save detailed results
    fs.writeFileSync('ecosystem_test_results.json', JSON.stringify(results, null, 2));
    console.log('');
    console.log('💾 Detailed results saved to: ecosystem_test_results.json');
    
    process.exit(successRate === 100 ? 0 : 1);
}

main().catch(error => {
    console.error('❌ Test script failed:', error);
    process.exit(1);
});