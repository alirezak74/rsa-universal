#!/bin/bash

echo "🚀 Starting RSA DEX Ecosystem..."
echo "=================================="

# Function to check if service is running
check_service() {
    local port=$1
    local name=$2
    if lsof -i :$port > /dev/null 2>&1; then
        echo "✅ $name is running on port $port"
        return 0
    else
        echo "❌ $name is not running on port $port"
        return 1
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local port=$1
    local name=$2
    local max_attempts=30
    local attempt=1
    
    echo "⏳ Waiting for $name to start on port $port..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "http://localhost:$port" > /dev/null 2>&1; then
            echo "✅ $name is ready!"
            return 0
        fi
        echo "   Attempt $attempt/$max_attempts..."
        sleep 2
        ((attempt++))
    done
    
    echo "❌ $name failed to start after $max_attempts attempts"
    return 1
}

# Step 1: Start Backend
echo "1. Starting RSA DEX Backend..."
cd rsa-dex-backend
if [ -f "standalone_enhanced_backend.js" ]; then
    node standalone_enhanced_backend.js &
    backend_pid=$!
    echo "Backend PID: $backend_pid"
    cd ..
    
    # Wait for backend to be ready
    if wait_for_service 8001 "Backend"; then
        echo "Backend started successfully"
    else
        echo "Failed to start backend"
        exit 1
    fi
else
    echo "❌ Backend file not found"
    cd ..
    exit 1
fi

# Step 2: Start RSA DEX Admin
echo "2. Starting RSA DEX Admin..."
cd rsa-admin-next
npm run dev &
admin_pid=$!
echo "Admin PID: $admin_pid"
cd ..

# Wait for admin to be ready
if wait_for_service 3000 "Admin"; then
    echo "Admin started successfully"
else
    echo "Failed to start admin"
fi

# Step 3: Start RSA DEX Frontend
echo "3. Starting RSA DEX Frontend..."
cd rsa-dex
npm run dev &
frontend_pid=$!
echo "Frontend PID: $frontend_pid"
cd ..

# Wait for frontend to be ready
if wait_for_service 3002 "Frontend"; then
    echo "Frontend started successfully"
else
    echo "Failed to start frontend"
fi

# Save PIDs for cleanup
echo $backend_pid > backend.pid
echo $admin_pid > admin.pid
echo $frontend_pid > frontend.pid

echo ""
echo "🎉 RSA DEX Ecosystem Started Successfully!"
echo "=========================================="
echo "📊 Backend API:     http://localhost:8001"
echo "🏛️  Admin Panel:    http://localhost:3000"
echo "💹 DEX Frontend:    http://localhost:3002"
echo ""
echo "To stop all services, run: ./stop_rsa_services.sh"
echo ""
echo "✅ All services are now synchronized and ready!"

# Keep script running to monitor services
while true; do
    sleep 30
    if ! check_service 8001 "Backend" > /dev/null; then
        echo "⚠️  Backend service down, restarting..."
        cd rsa-dex-backend && node standalone_enhanced_backend.js &
        echo $! > ../backend.pid
        cd ..
    fi
    if ! check_service 3000 "Admin" > /dev/null; then
        echo "⚠️  Admin service down, restarting..."
        cd rsa-admin-next && npm run dev &
        echo $! > ../admin.pid
        cd ..
    fi
    if ! check_service 3002 "Frontend" > /dev/null; then
        echo "⚠️  Frontend service down, restarting..."
        cd rsa-dex && npm run dev &
        echo $! > ../frontend.pid
        cd ..
    fi
done
