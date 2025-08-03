#!/bin/bash

# RSA DEX Real Endpoints Server Startup Script
# This script starts the comprehensive real endpoints implementation

echo "🚀 Starting RSA DEX Real Endpoints Server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Stop any existing server on port 8003
echo "🛑 Stopping existing server on port 8003..."
lsof -ti :8003 | xargs kill -9 2>/dev/null || true

# Install required dependencies if not exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install express cors nodemailer 2>/dev/null || {
        echo "⚠️  Installing dependencies individually..."
        npm install express
        npm install cors  
        npm install nodemailer
    }
fi

# Start the real endpoints server
echo "🎯 Starting Real Endpoints Server on port 8003..."
echo "📋 This server provides ALL the missing functionality:"
echo "   ✅ Real order data"
echo "   ✅ Trading pair management"
echo "   ✅ Cross-chain deposit addresses"
echo "   ✅ Hot wallet management"
echo "   ✅ Wrapped tokens"
echo "   ✅ Wallet generation"
echo "   ✅ KYC processing with email notifications"
echo "   ✅ User registration with email verification"
echo "   ✅ Live price feeds"
echo "   ✅ Auction management"
echo "   ✅ Asset management (edit/delete)"
echo "   ✅ Contract management"
echo ""

# Start server in background and log output
nohup node rsa-dex-backend/real_endpoints_implementation.js > real_endpoints.log 2>&1 &
REAL_ENDPOINTS_PID=$!

echo "✅ Real Endpoints Server started with PID: $REAL_ENDPOINTS_PID"
echo "📝 Server logs: real_endpoints.log"
echo "🌐 Server URL: http://localhost:8003"
echo ""

# Wait a moment for server to start
sleep 3

# Check if server is running
if curl -s http://localhost:8003/api/tokens > /dev/null; then
    echo "🎉 Real Endpoints Server is running successfully!"
    echo ""
    echo "🔧 Available endpoints:"
    echo "   📋 Orders: GET /api/orders"
    echo "   💱 Trading Pairs: GET/POST /api/trading/pairs"  
    echo "   🌐 Cross-chain: GET /api/crosschain/routes"
    echo "   🔥 Hot Wallet: GET /api/admin/hot-wallet/balance"
    echo "   🎁 Wrapped Tokens: GET /api/admin/wrapped-tokens/dashboard"
    echo "   👛 Wallets: GET /api/admin/wallets"
    echo "   🔍 Asset Search: GET /api/admin/assets/search"
    echo "   📋 KYC: GET /api/kyc/documents/:userId"
    echo "   🏛️ Auctions: GET /api/transactions/auction"
    echo "   📜 Contracts: GET /api/admin/contracts"
    echo "   🪙 Tokens: GET /api/tokens"
    echo "   ➕ Import Token: POST /api/assets/import-token"
    echo "   ✏️ Edit Token: PUT /api/admin/assets/:id"
    echo "   🗑️ Delete Token: DELETE /api/admin/assets/:id"
    echo "   🎉 Generate Wallet: POST /api/wallet/generate"
    echo "   💰 Deposit Address: POST /api/deposit/generate"
    echo "   📈 Live Prices: GET /api/prices/live"
    echo "   👤 User Registration: POST /api/users/register"
    echo "   📧 KYC Submit: POST /api/kyc/submit"
    echo ""
    echo "📊 To test all endpoints:"
    echo "   curl http://localhost:8003/api/tokens"
    echo "   curl http://localhost:8003/api/orders"
    echo "   curl http://localhost:8003/api/prices/live"
    echo ""
    echo "🏁 All real functionality is now available!"
    echo "🔗 Configure your frontend to use port 8003 for these endpoints"
else
    echo "❌ Failed to start Real Endpoints Server"
    echo "📝 Check logs: tail -f real_endpoints.log"
    exit 1
fi