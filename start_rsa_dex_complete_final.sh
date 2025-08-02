#!/bin/bash

echo "🚀 Starting Complete RSA DEX Ecosystem (FINAL VERSION)..."
echo "=================================================="
echo "This will start and test:"
echo "🔧 RSA DEX Backend (port 8001)"
echo "🖥️  RSA DEX Admin Panel (port 3001)"
echo "💹 RSA DEX Trading Interface (port 3000)"
echo "🧪 Comprehensive Test Suite"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    echo -e "${YELLOW}Waiting for $service_name to be ready...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ $service_name is ready!${NC}"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}❌ $service_name failed to start${NC}"
    return 1
}

# Kill any existing processes
echo -e "${YELLOW}Cleaning up existing processes...${NC}"
pkill -f "node.*index.js" 2>/dev/null || true
pkill -f "npm.*dev" 2>/dev/null || true
pkill -f "next.*dev" 2>/dev/null || true

sleep 2

# Start Backend
echo -e "${GREEN}1️⃣ Starting RSA DEX Backend...${NC}"
echo -e "${CYAN}📍 Backend directory: $(pwd)/rsa-dex-backend${NC}"

cd rsa-dex-backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
    npm install
fi

# Start backend in background
echo -e "${YELLOW}🚀 Starting backend server...${NC}"
node index.js > backend.log 2>&1 &
BACKEND_PID=$!

cd ..

# Wait for backend to be ready
if wait_for_service "http://localhost:8001/health" "Backend"; then
    echo -e "${GREEN}✅ Backend started successfully (PID: $BACKEND_PID)${NC}"
else
    echo -e "${RED}❌ Backend failed to start${NC}"
    echo -e "${YELLOW}📋 Backend logs:${NC}"
    tail -20 rsa-dex-backend/backend.log
    exit 1
fi

# Start Frontend
echo -e "${GREEN}2️⃣ Starting RSA DEX Frontend...${NC}"
echo -e "${CYAN}📍 Frontend directory: $(pwd)/rsa-dex${NC}"

cd rsa-dex

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    npm install
fi

# Start frontend in background
echo -e "${YELLOW}🚀 Starting frontend server...${NC}"
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!

cd ..

# Wait for frontend to be ready
if wait_for_service "http://localhost:3000" "Frontend"; then
    echo -e "${GREEN}✅ Frontend started successfully (PID: $FRONTEND_PID)${NC}"
else
    echo -e "${RED}❌ Frontend failed to start${NC}"
    echo -e "${YELLOW}📋 Frontend logs:${NC}"
    tail -20 rsa-dex/frontend.log
fi

# Start Admin
echo -e "${GREEN}3️⃣ Starting RSA DEX Admin Panel...${NC}"
echo -e "${CYAN}📍 Admin directory: $(pwd)/rsa-admin-next${NC}"

cd rsa-admin-next

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing admin dependencies...${NC}"
    npm install
fi

# Start admin in background
echo -e "${YELLOW}🚀 Starting admin server...${NC}"
npm run dev > admin.log 2>&1 &
ADMIN_PID=$!

cd ..

# Wait for admin to be ready
if wait_for_service "http://localhost:3001" "Admin Panel"; then
    echo -e "${GREEN}✅ Admin Panel started successfully (PID: $ADMIN_PID)${NC}"
else
    echo -e "${RED}❌ Admin Panel failed to start${NC}"
    echo -e "${YELLOW}📋 Admin logs:${NC}"
    tail -20 rsa-admin-next/admin.log
fi

echo ""
echo -e "${GREEN}🎉 All services started!${NC}"
echo ""
echo -e "${BLUE}📊 Services:${NC}"
echo -e "  • Backend:  http://localhost:8001"
echo -e "  • Frontend: http://localhost:3000"
echo -e "  • Admin:    http://localhost:3001"
echo ""
echo -e "${BLUE}🔑 Admin Login:${NC}"
echo -e "  • Username: admin"
echo -e "  • Password: admin123"
echo ""

# Wait a bit for all services to fully initialize
echo -e "${YELLOW}⏳ Waiting for services to fully initialize...${NC}"
sleep 10

# Run comprehensive test
echo -e "${GREEN}🧪 Running Comprehensive Test Suite...${NC}"
echo -e "${CYAN}This will test all features including:${NC}"
echo -e "  • Emergency controls and help pages"
echo -e "  • Live pricing APIs (Moralis, CoinDesk, CoinMarketCap, Binance, CoinLore)"
echo -e "  • Enhanced deposit address generation for all networks"
echo -e "  • Hot wallet limits configuration"
echo -e "  • System synchronization"
echo -e "  • All trading endpoints"
echo ""

# Install node-fetch if not available
if ! node -e "require('node-fetch')" 2>/dev/null; then
    echo -e "${YELLOW}📦 Installing node-fetch for testing...${NC}"
    npm install node-fetch@2
fi

# Run the comprehensive test
echo -e "${GREEN}🚀 Starting comprehensive test...${NC}"
node comprehensive_rsa_dex_test_final.js

# Test results
TEST_EXIT_CODE=$?

echo ""
echo -e "${CYAN}📋 Service Status:${NC}"
echo -e "  • Backend PID: $BACKEND_PID"
echo -e "  • Frontend PID: $FRONTEND_PID"
echo -e "  • Admin PID: $ADMIN_PID"
echo ""

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! RSA DEX ecosystem is fully operational.${NC}"
    echo ""
    echo -e "${BLUE}🔗 Quick Access:${NC}"
    echo -e "  • Admin Panel: http://localhost:3001"
    echo -e "  • Trading Interface: http://localhost:3000"
    echo -e "  • Backend API: http://localhost:8001"
    echo ""
    echo -e "${YELLOW}💡 Features Available:${NC}"
    echo -e "  ✅ Emergency controls with hot wallet limits"
    echo -e "  ✅ Help and documentation pages"
    echo -e "  ✅ Live pricing from multiple APIs"
    echo -e "  ✅ Realistic deposit addresses for all networks"
    echo -e "  ✅ System synchronization"
    echo -e "  ✅ Complete trading functionality"
    echo ""
    echo -e "${GREEN}🚀 RSA DEX Ecosystem is ready for use!${NC}"
else
    echo -e "${RED}⚠️  Some tests failed. Please check the output above.${NC}"
    echo ""
    echo -e "${YELLOW}📋 Service Logs:${NC}"
    echo -e "  • Backend: tail -f rsa-dex-backend/backend.log"
    echo -e "  • Frontend: tail -f rsa-dex/frontend.log"
    echo -e "  • Admin: tail -f rsa-admin-next/admin.log"
fi

echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

# Keep the script running and handle cleanup
trap 'echo -e "\n${RED}🛑 Stopping all services...${NC}"; kill $BACKEND_PID $FRONTEND_PID $ADMIN_PID 2>/dev/null; exit 0' INT

# Wait for user to stop
wait