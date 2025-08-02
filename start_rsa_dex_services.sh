#!/bin/bash

# 🚀 RSA DEX Services Startup Script
# Simple script to start Admin Panel, Frontend, and Backend for sync testing

echo "🚀 Starting RSA DEX Services for Sync Testing..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${RED}❌ Port $port is already in use${NC}"
        echo "   Use: kill -9 \$(lsof -ti:$port) to free the port"
        return 1
    else
        echo -e "${GREEN}✅ Port $port is available${NC}"
        return 0
    fi
}

# Check if directories exist
check_directory() {
    local dir=$1
    if [ ! -d "$dir" ]; then
        echo -e "${RED}❌ Directory $dir not found${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Directory $dir exists${NC}"
        return 0
    fi
}

echo "🔍 Checking directories..."
check_directory "rsa-dex-backend" || exit 1
check_directory "rsa-admin-next" || exit 1  
check_directory "rsa-dex" || exit 1
echo ""

echo "🔍 Checking ports..."
check_port 8001 || exit 1  # Backend
check_port 3000 || exit 1  # Admin Panel
check_port 3002 || exit 1  # Frontend
echo ""

# Create logs directory if it doesn't exist
mkdir -p logs

echo "🔄 Installing dependencies (if needed)..."

# Install backend dependencies
if [ ! -d "rsa-dex-backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd rsa-dex-backend && npm install && cd ..
fi

# Install admin dependencies
if [ ! -d "rsa-admin-next/node_modules" ]; then
    echo "📦 Installing admin dependencies..."
    cd rsa-admin-next && npm install && cd ..
fi

# Install frontend dependencies
if [ ! -d "rsa-dex/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd rsa-dex && npm install && cd ..
fi

echo ""
echo "🚀 Starting services..."

# Start Backend (Port 8001)
echo -e "${BLUE}🔄 Starting RSA DEX Backend on port 8001...${NC}"
cd rsa-dex-backend
npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../backend.pid
echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"
cd ..

sleep 3

# Start Admin Panel (Port 3000)
echo -e "${BLUE}🔄 Starting RSA DEX Admin Panel on port 3000...${NC}"
cd rsa-admin-next
npm run dev > ../logs/admin.log 2>&1 &
ADMIN_PID=$!
echo $ADMIN_PID > ../admin.pid
echo -e "${GREEN}✅ Admin Panel started (PID: $ADMIN_PID)${NC}"
cd ..

sleep 3

# Start Frontend (Port 3002)
echo -e "${BLUE}🔄 Starting RSA DEX Frontend on port 3002...${NC}"
cd rsa-dex
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../frontend.pid
echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"
cd ..

echo ""
echo "⏱️  Waiting for services to initialize..."
sleep 10

echo ""
echo "🔍 Testing service availability..."

# Test Backend
if curl -s http://localhost:8001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is responding at http://localhost:8001${NC}"
else
    echo -e "${YELLOW}⚠️  Backend may still be starting up at http://localhost:8001${NC}"
fi

# Test Admin Panel
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Admin Panel is responding at http://localhost:3000${NC}"
else
    echo -e "${YELLOW}⚠️  Admin Panel may still be starting up at http://localhost:3000${NC}"
fi

# Test Frontend
if curl -s http://localhost:3002 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is responding at http://localhost:3002${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend may still be starting up at http://localhost:3002${NC}"
fi

echo ""
echo "🎉 RSA DEX Services Startup Complete!"
echo "================================================"
echo "📋 Service URLs:"
echo "   🔧 Backend:     http://localhost:8001"
echo "   ⚙️  Admin Panel: http://localhost:3000"  
echo "   🎨 Frontend:    http://localhost:3002"
echo ""
echo "📝 Process IDs saved to:"
echo "   backend.pid, admin.pid, frontend.pid"
echo ""
echo "📋 Log files:"
echo "   logs/backend.log, logs/admin.log, logs/frontend.log"
echo ""
echo "🧪 To test synchronization, run:"
echo "   node rsa_dex_live_sync_test.js"
echo ""
echo "⏹️  To stop all services, run:"
echo "   ./stop_rsa_dex_services.sh"
echo ""
echo "🔍 To check service status:"
echo "   curl http://localhost:8001/health     # Backend"
echo "   curl http://localhost:3000/api/health # Admin"  
echo "   curl http://localhost:3002/api/health # Frontend"