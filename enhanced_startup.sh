#!/bin/bash
# Enhanced Frontend/Admin Startup Script for 100% Success

echo "🚀 ENHANCED STARTUP FOR 100% SUCCESS..."
echo "📊 Target: Fix remaining 33.33% to reach 100%"
echo ""

# Kill any existing processes
echo "🔧 Cleaning up existing processes..."
pkill -f "next.*3000" 2>/dev/null || true
pkill -f "next.*3001" 2>/dev/null || true
sleep 2

# Start Backend if not running
if ! curl -s http://localhost:8001/health > /dev/null; then
    echo "🔧 Starting Backend..."
    cd rsa-dex-backend
    npm start > /dev/null 2>&1 &
    cd ..
    sleep 5
fi

# Start Frontend with enhanced error handling
echo "📱 Starting RSA DEX Frontend on port 3000..."
if [ -d "rsa-dex" ]; then
    cd rsa-dex
    
    # Install dependencies quietly
    npm install --silent > /dev/null 2>&1
    
    # Start with explicit port and error handling
    PORT=3000 NODE_ENV=development npm run dev > frontend.log 2>&1 &
    FRONTEND_PID=$!
    
    cd ..
    echo "✅ Frontend started (PID: $FRONTEND_PID)"
else
    echo "❌ RSA DEX Frontend directory not found"
fi

# Start Admin Panel with enhanced error handling
echo "🔧 Starting RSA DEX Admin Panel on port 3001..."
if [ -d "rsa-admin-next" ]; then
    cd rsa-admin-next
    
    # Install dependencies quietly
    npm install --silent > /dev/null 2>&1
    
    # Start with explicit port and error handling
    PORT=3001 NODE_ENV=development npm run dev > admin.log 2>&1 &
    ADMIN_PID=$!
    
    cd ..
    echo "✅ Admin Panel started (PID: $ADMIN_PID)"
else
    echo "❌ RSA DEX Admin directory not found"
fi

echo ""
echo "⏳ Waiting 15 seconds for services to fully initialize..."
for i in {15..1}; do
    echo -ne "\r⏱️  $i seconds remaining..."
    sleep 1
done
echo -e "\n"

echo "🎯 Testing service availability..."

# Test Backend
if curl -s http://localhost:8001/health > /dev/null; then
    echo "✅ Backend health OK (port 8001)"
else
    echo "❌ Backend not responding"
fi

# Test Frontend with multiple attempts
FRONTEND_OK=false
for attempt in {1..5}; do
    if curl -s http://localhost:3000/api/health > /dev/null; then
        echo "✅ Frontend health OK (port 3000)"
        FRONTEND_OK=true
        break
    else
        echo "⏳ Frontend attempt $attempt/5..."
        sleep 2
    fi
done

if [ "$FRONTEND_OK" = false ]; then
    echo "❌ Frontend not responding after 5 attempts"
    echo "📋 Frontend log:"
    tail -10 frontend.log 2>/dev/null || echo "No log available"
fi

# Test Admin Panel with multiple attempts
ADMIN_OK=false
for attempt in {1..5}; do
    if curl -s http://localhost:3001/api/health > /dev/null; then
        echo "✅ Admin Panel health OK (port 3001)"
        ADMIN_OK=true
        break
    else
        echo "⏳ Admin Panel attempt $attempt/5..."
        sleep 2
    fi
done

if [ "$ADMIN_OK" = false ]; then
    echo "❌ Admin Panel not responding after 5 attempts"
    echo "📋 Admin Panel log:"
    tail -10 admin.log 2>/dev/null || echo "No log available"
fi

echo ""
echo "🚀 Enhanced startup script completed!"
echo "📊 Ready for 100% success test!"
