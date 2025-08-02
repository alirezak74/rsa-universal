#!/bin/bash

echo "🚀 Starting RSA DEX Admin System..."
echo "=================================="

# Function to check if a port is in use
check_port() {
    local port=$1
    local service=$2
    if lsof -i :$port >/dev/null 2>&1; then
        echo "✅ $service is running on port $port"
        return 0
    else
        echo "❌ $service is NOT running on port $port"
        return 1
    fi
}

# Function to wait for service to start
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    echo "⏳ Waiting for $service_name to start..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            echo "✅ $service_name is ready!"
            return 0
        fi
        echo "   Attempt $attempt/$max_attempts - waiting..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "❌ $service_name failed to start after $max_attempts attempts"
    return 1
}

# Kill any existing processes
echo "🔄 Stopping existing processes..."
pkill -f "node index.js" 2>/dev/null || true
pkill -f "npm.*dev" 2>/dev/null || true
pkill -f "next.*dev" 2>/dev/null || true
sleep 2

echo ""
echo "1️⃣ Starting RSA DEX Backend..."
echo "------------------------------"

# Start RSA DEX Backend
cd rsa-dex-backend
echo "📍 Current directory: $(pwd)"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Start backend in background
echo "🚀 Starting backend server..."
nohup node index.js > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to start
if wait_for_service "http://localhost:8001/health" "RSA DEX Backend"; then
    echo "✅ Backend started successfully!"
    
    # Test sync endpoints
    echo "🔍 Testing sync endpoints..."
    curl -s http://localhost:8001/api/admin/sync-status/assets >/dev/null && echo "   ✅ Assets sync endpoint working"
    curl -s http://localhost:8001/api/admin/sync-status/trading-pairs >/dev/null && echo "   ✅ Trading pairs sync endpoint working"
    curl -s http://localhost:8001/api/admin/sync-status/wallets >/dev/null && echo "   ✅ Wallets sync endpoint working"
    curl -s http://localhost:8001/api/admin/sync-status/contracts >/dev/null && echo "   ✅ Contracts sync endpoint working"
    curl -s http://localhost:8001/api/admin/sync-status/transactions >/dev/null && echo "   ✅ Transactions sync endpoint working"
else
    echo "❌ Backend failed to start. Check backend.log for errors."
    exit 1
fi

echo ""
echo "2️⃣ Starting RSA DEX Admin Frontend..."
echo "------------------------------------"

# Start RSA DEX Admin Frontend
cd ../rsa-admin-next
echo "📍 Current directory: $(pwd)"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Start frontend in background
echo "🚀 Starting admin frontend..."
nohup npm run dev > admin.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Wait for frontend to start
if wait_for_service "http://localhost:3000" "RSA DEX Admin Frontend"; then
    echo "✅ Frontend started successfully!"
else
    echo "❌ Frontend failed to start. Check admin.log for errors."
    echo "ℹ️  Backend is still running on port 8001"
fi

echo ""
echo "🎉 RSA DEX Admin System Status"
echo "==============================="
check_port 8001 "RSA DEX Backend"
check_port 3000 "RSA DEX Admin Frontend"

echo ""
echo "📋 Service URLs:"
echo "   🔧 Backend API: http://localhost:8001"
echo "   🖥️  Admin Panel: http://localhost:3000"
echo ""
echo "📊 Backend Health Check:"
curl -s http://localhost:8001/health | head -c 100
echo ""
echo ""
echo "🔄 Sync Status Test:"
echo "   Assets: $(curl -s http://localhost:8001/api/admin/sync-status/assets | grep -o '"synced":[^,]*' | cut -d':' -f2)"
echo "   Trading Pairs: $(curl -s http://localhost:8001/api/admin/sync-status/trading-pairs | grep -o '"synced":[^,]*' | cut -d':' -f2)"
echo "   Wallets: $(curl -s http://localhost:8001/api/admin/sync-status/wallets | grep -o '"synced":[^,]*' | cut -d':' -f2)"
echo "   Contracts: $(curl -s http://localhost:8001/api/admin/sync-status/contracts | grep -o '"synced":[^,]*' | cut -d':' -f2)"
echo "   Transactions: $(curl -s http://localhost:8001/api/admin/sync-status/transactions | grep -o '"synced":[^,]*' | cut -d':' -f2)"

echo ""
echo "📝 Log Files:"
echo "   Backend: $(pwd)/../rsa-dex-backend/backend.log"
echo "   Frontend: $(pwd)/admin.log"
echo ""
echo "🛑 To stop services:"
echo "   pkill -f 'node index.js'"
echo "   pkill -f 'npm.*dev'"
echo ""
echo "✅ RSA DEX Admin system is ready!"
echo "   Open http://localhost:3000 in your browser"
echo "   The sync status should now show all green ✅"