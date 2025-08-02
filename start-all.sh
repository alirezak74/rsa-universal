#!/bin/bash

echo "🚀 Starting RSA Chain Ecosystem..."
echo "=================================="

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $1 is already in use. Please stop the service using port $1 first."
        return 1
    fi
    return 0
}

# Check ports before starting
echo "🔍 Checking available ports..."
check_port 3000 || exit 1
check_port 3001 || exit 1
check_port 4000 || exit 1
check_port 5000 || exit 1
check_port 6000 || exit 1

echo "✅ All ports are available"
echo ""

# Start main website (port 3000)
echo "🌐 Starting main website..."
cd rsacrypto.com && npm run dev > ../logs/website.log 2>&1 &
WEBSITE_PID=$!
echo "✅ Main website: http://localhost:3000 (PID: $WEBSITE_PID)"

# Start web wallet (port 3001)
echo "👛 Starting web wallet..."
cd ../rsa-wallet-web && PORT=3001 npm start > ../logs/wallet.log 2>&1 &
WALLET_PID=$!
echo "✅ Web wallet: http://localhost:3001 (PID: $WALLET_PID)"

# Start explorer (port 4000)
echo "🔍 Starting blockchain explorer..."
cd ../rsa-explorer && PORT=4000 npm start > ../logs/explorer.log 2>&1 &
EXPLORER_PID=$!
echo "✅ Explorer: http://localhost:4000 (PID: $EXPLORER_PID)"

# Start faucet (port 5000)
echo "🚰 Starting faucet..."
cd ../rsa-faucet && PORT=5000 node index.js > ../logs/faucet.log 2>&1 &
FAUCET_PID=$!
echo "✅ Faucet: http://localhost:5000 (PID: $FAUCET_PID)"

# Start admin panel (port 6000)
echo "⚙️  Starting admin panel..."
cd ../rsa-admin-next && PORT=6000 npm run dev > ../logs/admin.log 2>&1 &
ADMIN_PID=$!
echo "✅ Admin panel: http://localhost:6000 (PID: $ADMIN_PID)"

# Create logs directory if it doesn't exist
mkdir -p logs

echo ""
echo "🎉 All services started successfully!"
echo "=================================="
echo "📱 Main Website: http://localhost:3000"
echo "👛 Web Wallet:   http://localhost:3001"
echo "🔍 Explorer:     http://localhost:4000"
echo "🚰 Faucet:       http://localhost:5000"
echo "⚙️  Admin Panel:  http://localhost:6000 (admin/admin123)"
echo ""
echo "📋 Logs are saved in the logs/ directory"
echo "🛑 Press Ctrl+C to stop all services"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill $WEBSITE_PID 2>/dev/null
    kill $WALLET_PID 2>/dev/null
    kill $EXPLORER_PID 2>/dev/null
    kill $FAUCET_PID 2>/dev/null
    kill $ADMIN_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for all background processes
wait 