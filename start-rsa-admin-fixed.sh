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

# Start backend in background
echo "🚀 Starting backend server..."
node index.js > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

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
else
    echo "❌ Backend failed to start. Check backend.log for errors."
    cat backend.log | tail -10
    exit 1
fi

echo ""
echo "2️⃣ Starting RSA DEX Admin Frontend..."
echo "------------------------------------"

# Start RSA DEX Admin Frontend
cd ../rsa-admin-next
echo "📍 Starting frontend in: $(pwd)"

# Start frontend in background
echo "🚀 Starting admin frontend..."
npm run dev > admin.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
sleep 8

# Test frontend
if curl -s http://localhost:3000 >/dev/null 2>&1; then
    echo "✅ Frontend started successfully!"
else
    echo "❌ Frontend failed to start. Check admin.log for errors."
    echo "Last few lines of admin.log:"
    tail -5 admin.log
fi

echo ""
echo "🎉 RSA DEX Admin System Status"
echo "==============================="

# Check ports
if netstat -an | grep -q ":8001.*LISTEN"; then
    echo "✅ Backend running on port 8001"
else
    echo "❌ Backend NOT running on port 8001"
fi

if netstat -an | grep -q ":3000.*LISTEN"; then
    echo "✅ Frontend running on port 3000"
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
ASSETS_RESPONSE=$(curl -s http://localhost:8001/api/admin/sync-status/assets 2>/dev/null)
if [ -n "$ASSETS_RESPONSE" ]; then
    ASSETS_STATUS=$(echo "$ASSETS_RESPONSE" | grep -o '"synced":[^,]*' | cut -d':' -f2)
    echo "   Assets: $ASSETS_STATUS"
else
    echo "   Assets: Error"
fi

echo ""
echo "✅ RSA DEX Admin system is ready!"
echo "   Open http://localhost:3000 in your browser"
echo "   The sync status should now show all green ✅"
echo ""
echo "🛑 To stop services later:"
echo "   pkill -f 'node index.js'"
echo "   pkill -f 'npm.*dev'"