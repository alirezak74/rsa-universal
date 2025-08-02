#!/bin/bash

echo "🚀 Starting RSA DEX Admin System (macOS)..."
echo "========================================="

# Kill any existing processes
echo "🔄 Stopping existing processes..."
pkill -f "node index.js" 2>/dev/null || true
pkill -f "nodemon" 2>/dev/null || true
pkill -f "npm.*dev" 2>/dev/null || true
sleep 3

echo ""
echo "1️⃣ Starting RSA DEX Backend..."
echo "------------------------------"

# Start RSA DEX Backend
cd rsa-dex-backend
echo "📍 Starting backend in: $(pwd)"

# Install dependencies if needed
echo "📦 Checking backend dependencies..."
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install backend dependencies"
        exit 1
    fi
    echo "✅ Backend dependencies installed successfully"
else
    echo "✅ Backend dependencies already installed"
fi

# Start backend in background
echo "🚀 Starting backend server..."
node index.js > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 8

# Test backend
if curl -s http://localhost:8001/health >/dev/null 2>&1; then
    echo "✅ Backend started successfully!"
    echo "🔍 Testing sync endpoints..."
    
    if curl -s http://localhost:8001/api/admin/sync-status/assets >/dev/null 2>&1; then
        echo "   ✅ Assets sync endpoint working"
    else
        echo "   ❌ Assets sync endpoint not working"
    fi
    
    if curl -s http://localhost:8001/api/admin/sync-status/trading-pairs >/dev/null 2>&1; then
        echo "   ✅ Trading pairs sync endpoint working"
    else
        echo "   ❌ Trading pairs sync endpoint not working"
    fi
    
    if curl -s http://localhost:8001/api/admin/sync-status/wallets >/dev/null 2>&1; then
        echo "   ✅ Wallets sync endpoint working"
    else
        echo "   ❌ Wallets sync endpoint not working"
    fi
    
    if curl -s http://localhost:8001/api/admin/sync-status/contracts >/dev/null 2>&1; then
        echo "   ✅ Contracts sync endpoint working"
    else
        echo "   ❌ Contracts sync endpoint not working"
    fi
    
    if curl -s http://localhost:8001/api/admin/sync-status/transactions >/dev/null 2>&1; then
        echo "   ✅ Transactions sync endpoint working"
    else
        echo "   ❌ Transactions sync endpoint not working"
    fi
    
    # Test token import endpoint
    echo "🔍 Testing token import endpoint..."
    TOKEN_RESPONSE=$(curl -s -X POST http://localhost:8001/api/assets/import-token \
      -H "Content-Type: application/json" \
      -d '{"name":"TestToken","symbol":"TEST","selectedNetworks":["ethereum"],"chainContracts":{"ethereum":"0x123"}}' 2>/dev/null)
    
    if echo "$TOKEN_RESPONSE" | grep -q "Endpoint not found"; then
        echo "   ❌ Token import endpoint not working (404 error)"
    elif echo "$TOKEN_RESPONSE" | grep -q "success"; then
        echo "   ✅ Token import endpoint working"
    elif echo "$TOKEN_RESPONSE" | grep -q "Missing required fields"; then
        echo "   ✅ Token import endpoint working (validation working)"
    else
        echo "   ⚠️  Token import endpoint response unclear: $(echo "$TOKEN_RESPONSE" | head -c 50)"
    fi
else
    echo "❌ Backend failed to start. Check backend.log for errors."
    echo "Last 10 lines of backend.log:"
    tail -10 backend.log 2>/dev/null || echo "No backend.log found"
    echo ""
    echo "🔍 Checking for common issues..."
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        echo "❌ package.json not found in backend directory"
    fi
    
    # Check Node.js version
    echo "Node.js version: $(node --version)"
    echo "NPM version: $(npm --version)"
    
    # Show first few lines of index.js to see what's being required
    echo "First 10 lines of index.js:"
    head -10 index.js 2>/dev/null || echo "Could not read index.js"
    
    exit 1
fi

echo ""
echo "2️⃣ Starting RSA DEX Admin Frontend..."
echo "------------------------------------"

# Start RSA DEX Admin Frontend
cd ../rsa-admin-next
echo "📍 Starting frontend in: $(pwd)"

# Install dependencies if needed
echo "📦 Checking frontend dependencies..."
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install frontend dependencies"
        echo "ℹ️  Backend is still running on port 8001"
        exit 1
    fi
    echo "✅ Frontend dependencies installed successfully"
else
    echo "✅ Frontend dependencies already installed"
fi

# Start frontend in background
echo "🚀 Starting admin frontend..."
npm run dev > admin.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
sleep 10

# Test frontend
if curl -s http://localhost:3000 >/dev/null 2>&1; then
    echo "✅ Frontend started successfully!"
else
    echo "❌ Frontend failed to start. Check admin.log for errors."
    echo "Last 5 lines of admin.log:"
    tail -5 admin.log 2>/dev/null || echo "No admin.log found"
    echo ""
    echo "🔍 Checking for common frontend issues..."
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        echo "❌ package.json not found in frontend directory"
    fi
    
    # Check if Next.js is installed
    if [ -d "node_modules" ]; then
        if [ -d "node_modules/next" ]; then
            echo "✅ Next.js is installed"
        else
            echo "❌ Next.js not found in node_modules"
        fi
    fi
fi

echo ""
echo "🎉 RSA DEX Admin System Status"
echo "==============================="

# Better port checking using lsof (more reliable than netstat)
if lsof -i :8001 >/dev/null 2>&1; then
    echo "✅ Backend running on port 8001"
elif curl -s http://localhost:8001/health >/dev/null 2>&1; then
    echo "✅ Backend responding on port 8001 (health check passed)"
else
    echo "❌ Backend NOT running on port 8001"
fi

if lsof -i :3000 >/dev/null 2>&1; then
    echo "✅ Frontend running on port 3000"
elif curl -s http://localhost:3000 >/dev/null 2>&1; then
    echo "✅ Frontend responding on port 3000 (curl test passed)"
else
    echo "❌ Frontend NOT running on port 3000"
fi

echo ""
echo "📋 Service URLs:"
echo "   🔧 Backend API: http://localhost:8001"
echo "   🖥️  Admin Panel: http://localhost:3000"
echo ""
echo "📊 Backend Health Check:"
HEALTH_RESPONSE=$(curl -s http://localhost:8001/health 2>/dev/null)
if [ -n "$HEALTH_RESPONSE" ]; then
    echo "$HEALTH_RESPONSE" | head -c 100
    echo ""
else
    echo "Backend not responding"
fi

echo ""
echo "🔄 Sync Status Test:"
echo "Testing all sync endpoints..."

ASSETS_RESPONSE=$(curl -s http://localhost:8001/api/admin/sync-status/assets 2>/dev/null)
if [ -n "$ASSETS_RESPONSE" ]; then
    ASSETS_STATUS=$(echo "$ASSETS_RESPONSE" | grep -o '"synced":[^,]*' | cut -d':' -f2)
    echo "   Assets: $ASSETS_STATUS"
else
    echo "   Assets: Error"
fi

TRADING_RESPONSE=$(curl -s http://localhost:8001/api/admin/sync-status/trading-pairs 2>/dev/null)
if [ -n "$TRADING_RESPONSE" ]; then
    TRADING_STATUS=$(echo "$TRADING_RESPONSE" | grep -o '"synced":[^,]*' | cut -d':' -f2)
    echo "   Trading Pairs: $TRADING_STATUS"
else
    echo "   Trading Pairs: Error"
fi

WALLETS_RESPONSE=$(curl -s http://localhost:8001/api/admin/sync-status/wallets 2>/dev/null)
if [ -n "$WALLETS_RESPONSE" ]; then
    WALLETS_STATUS=$(echo "$WALLETS_RESPONSE" | grep -o '"synced":[^,]*' | cut -d':' -f2)
    echo "   Wallets: $WALLETS_STATUS"
else
    echo "   Wallets: Error"
fi

CONTRACTS_RESPONSE=$(curl -s http://localhost:8001/api/admin/sync-status/contracts 2>/dev/null)
if [ -n "$CONTRACTS_RESPONSE" ]; then
    CONTRACTS_STATUS=$(echo "$CONTRACTS_RESPONSE" | grep -o '"synced":[^,]*' | cut -d':' -f2)
    echo "   Contracts: $CONTRACTS_STATUS"
else
    echo "   Contracts: Error"
fi

TRANSACTIONS_RESPONSE=$(curl -s http://localhost:8001/api/admin/sync-status/transactions 2>/dev/null)
if [ -n "$TRANSACTIONS_RESPONSE" ]; then
    TRANSACTIONS_STATUS=$(echo "$TRANSACTIONS_RESPONSE" | grep -o '"synced":[^,]*' | cut -d':' -f2)
    echo "   Transactions: $TRANSACTIONS_STATUS"
else
    echo "   Transactions: Error"
fi

echo ""
echo "✅ RSA DEX Admin system is ready!"
echo "   Open http://localhost:3000 in your browser"
echo "   The sync status should now show all green ✅"
echo ""
echo "🔧 Quick Test Commands:"
echo "   Backend Health: curl http://localhost:8001/health"
echo "   Assets Sync: curl http://localhost:8001/api/admin/sync-status/assets"
echo "   Token Import Test: curl -X POST http://localhost:8001/api/assets/import-token -H 'Content-Type: application/json' -d '{\"name\":\"TestToken\",\"symbol\":\"TEST\",\"selectedNetworks\":[\"ethereum\"],\"chainContracts\":{\"ethereum\":\"0x123\"}}'"
echo ""
echo "🛑 To stop services later:"
echo "   pkill -f 'node index.js'"
echo "   pkill -f 'npm.*dev'"
echo ""
echo "📝 Log Files:"
echo "   Backend: $(pwd)/../rsa-dex-backend/backend.log"
echo "   Frontend: $(pwd)/admin.log"
echo ""
echo "🔧 If you see dependency errors, manually run:"
echo "   cd rsa-dex-backend && npm install"
echo "   cd ../rsa-admin-next && npm install"
echo ""
echo "🧪 To debug token import issues, run:"
echo "   ./test-token-import.sh"