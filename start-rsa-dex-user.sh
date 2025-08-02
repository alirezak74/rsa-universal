#!/bin/bash

echo "🚀 Starting RSA DEX User Frontend (Trading Interface)..."
echo "======================================================"

# Kill any existing processes on port 3002
echo "🔄 Stopping existing RSA DEX processes..."
pkill -f "next dev -p 3002" 2>/dev/null || true
pkill -f "next start -p 3002" 2>/dev/null || true
sleep 2

echo ""
echo "📍 Starting RSA DEX in: $(pwd)/rsa-dex"

# Navigate to RSA DEX directory
cd rsa-dex

# Install dependencies if needed
echo "📦 Checking RSA DEX dependencies..."
if [ ! -d "node_modules" ]; then
    echo "📦 Installing RSA DEX dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install RSA DEX dependencies"
        exit 1
    fi
    echo "✅ RSA DEX dependencies installed successfully"
else
    echo "✅ RSA DEX dependencies already installed"
fi

# Start RSA DEX in development mode
echo "🚀 Starting RSA DEX trading interface..."
npm run dev > rsa-dex.log 2>&1 &
RSA_DEX_PID=$!
echo "RSA DEX PID: $RSA_DEX_PID"

# Wait for RSA DEX to start
echo "⏳ Waiting for RSA DEX to start..."
sleep 8

# Test RSA DEX
if curl -s http://localhost:3002 >/dev/null 2>&1; then
    echo "✅ RSA DEX started successfully!"
else
    echo "❌ RSA DEX failed to start. Check rsa-dex.log for errors."
    echo "Last 10 lines of rsa-dex.log:"
    tail -10 rsa-dex.log 2>/dev/null || echo "No rsa-dex.log found"
    exit 1
fi

echo ""
echo "🎉 RSA DEX User Frontend Status"
echo "==============================="

# Check port
if lsof -i :3002 >/dev/null 2>&1; then
    echo "✅ RSA DEX running on port 3002"
elif curl -s http://localhost:3002 >/dev/null 2>&1; then
    echo "✅ RSA DEX responding on port 3002 (curl test passed)"
else
    echo "❌ RSA DEX NOT running on port 3002"
fi

echo ""
echo "📋 Service URLs:"
echo "   🔧 RSA DEX Backend: http://localhost:8001"
echo "   🖥️  RSA DEX Admin: http://localhost:3000"
echo "   💹 RSA DEX Trading: http://localhost:3002"
echo ""
echo "✅ RSA DEX trading interface is ready!"
echo "   Open http://localhost:3002 in your browser to start trading"
echo ""
echo "🛑 To stop RSA DEX later:"
echo "   pkill -f 'next dev -p 3002'"
echo ""
echo "📝 Log File:"
echo "   RSA DEX: $(pwd)/rsa-dex.log"
echo ""
echo "🔧 If you see issues, check the log:"
echo "   tail -f rsa-dex/rsa-dex.log"