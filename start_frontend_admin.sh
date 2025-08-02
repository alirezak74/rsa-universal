#!/bin/bash
# Quick Frontend/Admin Startup Script

echo "🚀 Starting Frontend and Admin Panel..."

# Start Frontend (RSA DEX)
if [ -d "rsa-dex" ]; then
    echo "📱 Starting RSA DEX Frontend on port 3000..."
    cd rsa-dex
    npm install --silent > /dev/null 2>&1
    PORT=3000 npm run dev > /dev/null 2>&1 &
    cd ..
    echo "✅ Frontend started"
else
    echo "⚠️  RSA DEX Frontend directory not found"
fi

# Start Admin Panel
if [ -d "rsa-admin-next" ]; then
    echo "🔧 Starting RSA DEX Admin Panel on port 3001..."
    cd rsa-admin-next
    npm install --silent > /dev/null 2>&1
    PORT=3001 npm run dev > /dev/null 2>&1 &
    cd ..
    echo "✅ Admin Panel started"
else
    echo "⚠️  RSA DEX Admin directory not found"
fi

echo "⏳ Waiting 10 seconds for services to initialize..."
sleep 10

echo "🎯 Testing service availability..."
curl -s http://localhost:3000/api/health > /dev/null && echo "✅ Frontend health OK" || echo "❌ Frontend not responding"
curl -s http://localhost:3001/api/health > /dev/null && echo "✅ Admin health OK" || echo "❌ Admin not responding"

echo "🚀 Startup script completed!"
