#!/bin/bash

echo "🚀 Starting Complete RSA Chain Ecosystem..."
echo "==========================================="
echo "This will start:"
echo "  🔧 RSA DEX Backend (port 8001)"
echo "  🖥️  RSA DEX Admin Panel (port 3000)"
echo "  💹 RSA DEX Trading Interface (port 3002)"
echo ""

# Kill any existing processes
echo "🔄 Stopping all existing RSA processes..."
pkill -f "node index.js" 2>/dev/null || true
pkill -f "nodemon" 2>/dev/null || true
pkill -f "npm.*dev" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
sleep 3

echo ""
echo "1️⃣ Starting RSA DEX Backend..."
echo "------------------------------"

# Start RSA DEX Backend
cd rsa-dex-backend
echo "📍 Backend directory: $(pwd)"

# Install backend dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Start backend
echo "🚀 Starting backend server..."
node index.js > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait and test backend
sleep 8
if curl -s http://localhost:8001/health >/dev/null 2>&1; then
    echo "✅ Backend started successfully!"
else
    echo "❌ Backend failed to start"
    exit 1
fi

echo ""
echo "2️⃣ Starting RSA DEX Admin Panel..."
echo "----------------------------------"

# Start RSA DEX Admin
cd ../rsa-admin-next
echo "📍 Admin directory: $(pwd)"

# Install admin dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing admin dependencies..."
    npm install
fi

# Start admin panel
echo "🚀 Starting admin panel..."
npm run dev > admin.log 2>&1 &
ADMIN_PID=$!
echo "Admin PID: $ADMIN_PID"

# Wait and test admin
sleep 10
if curl -s http://localhost:3000 >/dev/null 2>&1; then
    echo "✅ Admin panel started successfully!"
else
    echo "❌ Admin panel failed to start"
fi

echo ""
echo "3️⃣ Starting RSA DEX Trading Interface..."
echo "----------------------------------------"

# Start RSA DEX Trading Interface
cd ../rsa-dex
echo "📍 Trading interface directory: $(pwd)"

# Install trading interface dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing trading interface dependencies..."
    npm install
fi

# Start trading interface
echo "🚀 Starting trading interface..."
npm run dev > trading.log 2>&1 &
TRADING_PID=$!
echo "Trading PID: $TRADING_PID"

# Wait and test trading interface
sleep 10
if curl -s http://localhost:3002 >/dev/null 2>&1; then
    echo "✅ Trading interface started successfully!"
else
    echo "❌ Trading interface failed to start"
fi

echo ""
echo "🎉 Complete RSA Chain Ecosystem Status"
echo "======================================"

# Check all services
echo "Service Status:"
if curl -s http://localhost:8001/health >/dev/null 2>&1; then
    echo "  ✅ Backend (port 8001): Running"
else
    echo "  ❌ Backend (port 8001): Not responding"
fi

if curl -s http://localhost:3000 >/dev/null 2>&1; then
    echo "  ✅ Admin Panel (port 3000): Running"
else
    echo "  ❌ Admin Panel (port 3000): Not responding"
fi

if curl -s http://localhost:3002 >/dev/null 2>&1; then
    echo "  ✅ Trading Interface (port 3002): Running"
else
    echo "  ❌ Trading Interface (port 3002): Not responding"
fi

echo ""
echo "📋 Access URLs:"
echo "  🔧 Backend API: http://localhost:8001"
echo "  🖥️  Admin Panel: http://localhost:3000"
echo "  💹 Trading Interface: http://localhost:3002"
echo ""

# Test sync status
echo "🔄 Sync Status:"
ASSETS_STATUS=$(curl -s http://localhost:8001/api/admin/sync-status/assets 2>/dev/null | grep -o '"synced":[^,]*' | cut -d':' -f2)
echo "  Assets: $ASSETS_STATUS"

echo ""
echo "✅ Complete RSA Chain ecosystem is ready!"
echo ""
echo "🎯 What to do next:"
echo "  1. Open http://localhost:3000 for admin functions"
echo "  2. Open http://localhost:3002 for trading"
echo "  3. Check sync status in admin panel (should be all green)"
echo "  4. Test token import in admin panel"
echo ""
echo "🛑 To stop all services:"
echo "  pkill -f 'node index.js'"
echo "  pkill -f 'npm.*dev'"
echo ""
echo "📝 Log Files:"
echo "  Backend: $(pwd)/../rsa-dex-backend/backend.log"
echo "  Admin: $(pwd)/../rsa-admin-next/admin.log"
echo "  Trading: $(pwd)/trading.log"