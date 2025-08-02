#!/bin/bash

# RSA DEX Complete Startup Script
# Starts all services: Backend, Frontend, and Admin Panel

echo "🚀 Starting RSA DEX Complete Platform..."
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to start a service
start_service() {
    local service_name=$1
    local directory=$2
    local command=$3
    local port=$4
    local log_file=$5

    echo -e "${BLUE}Starting $service_name...${NC}"
    
    if check_port $port; then
        echo -e "${YELLOW}⚠️  Port $port is already in use. $service_name may already be running.${NC}"
        return 1
    fi
    
    cd $directory
    
    # Check if node_modules exists, if not run npm install
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installing dependencies for $service_name...${NC}"
        npm install
    fi
    
    # Start the service in background
    nohup $command > $log_file 2>&1 &
    local pid=$!
    
    # Wait a moment and check if the process is still running
    sleep 3
    if kill -0 $pid 2>/dev/null; then
        echo -e "${GREEN}✅ $service_name started successfully (PID: $pid, Port: $port)${NC}"
        echo $pid > "${service_name,,}.pid"
        return 0
    else
        echo -e "${RED}❌ Failed to start $service_name${NC}"
        return 1
    fi
}

# Create logs directory
mkdir -p logs

echo -e "${BLUE}🔧 Checking system requirements...${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js and npm are available${NC}"

# Start Backend
echo -e "\n${BLUE}1️⃣  Starting RSA DEX Backend...${NC}"
if start_service "Backend" "rsa-dex-backend" "npm start" 8001 "logs/backend.log"; then
    BACKEND_STARTED=true
else
    BACKEND_STARTED=false
fi

# Wait for backend to be fully ready
if [ "$BACKEND_STARTED" = true ]; then
    echo -e "${YELLOW}⏳ Waiting for backend to be ready...${NC}"
    for i in {1..30}; do
        if curl -s http://localhost:8001/health > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Backend is ready and responding${NC}"
            break
        fi
        sleep 1
        if [ $i -eq 30 ]; then
            echo -e "${RED}❌ Backend failed to start within 30 seconds${NC}"
            BACKEND_STARTED=false
        fi
    done
fi

# Start Frontend
echo -e "\n${BLUE}2️⃣  Starting RSA DEX Frontend...${NC}"
if start_service "Frontend" "rsa-dex" "npm run dev" 3002 "logs/frontend.log"; then
    FRONTEND_STARTED=true
else
    FRONTEND_STARTED=false
fi

# Start Admin Panel
echo -e "\n${BLUE}3️⃣  Starting RSA DEX Admin Panel...${NC}"
if start_service "Admin" "rsa-admin-next" "npm run dev" 3000 "logs/admin.log"; then
    ADMIN_STARTED=true
else
    ADMIN_STARTED=false
fi

# Summary
echo -e "\n${BLUE}📊 RSA DEX Platform Status Summary${NC}"
echo "=========================================="

if [ "$BACKEND_STARTED" = true ]; then
    echo -e "${GREEN}✅ Backend:    http://localhost:8001 (Running)${NC}"
else
    echo -e "${RED}❌ Backend:    Failed to start${NC}"
fi

if [ "$FRONTEND_STARTED" = true ]; then
    echo -e "${GREEN}✅ Frontend:   http://localhost:3002 (Running)${NC}"
else
    echo -e "${RED}❌ Frontend:   Failed to start${NC}"
fi

if [ "$ADMIN_STARTED" = true ]; then
    echo -e "${GREEN}✅ Admin Panel: http://localhost:3000 (Running)${NC}"
else
    echo -e "${RED}❌ Admin Panel: Failed to start${NC}"
fi

echo -e "\n${BLUE}🔧 Available Commands:${NC}"
echo "=========================================="
echo "• Backend Health Check:  curl http://localhost:8001/health"
echo "• Admin Login:          Username: admin, Password: admin123"
echo "• Stop All Services:    ./stop-rsa-dex.sh"
echo "• View Logs:           tail -f logs/backend.log"
echo "                       tail -f logs/frontend.log"
echo "                       tail -f logs/admin.log"

# Test functionality
if [ "$BACKEND_STARTED" = true ]; then
    echo -e "\n${BLUE}🧪 Testing Core Functionality...${NC}"
    
    # Test admin login
    echo -e "${YELLOW}Testing admin authentication...${NC}"
    if curl -s -X POST http://localhost:8001/auth/login \
        -H "Content-Type: application/json" \
        -d '{"username":"admin","password":"admin123"}' | grep -q "success"; then
        echo -e "${GREEN}✅ Admin authentication working${NC}"
    else
        echo -e "${RED}❌ Admin authentication failed${NC}"
    fi
    
    # Test deposit address generation
    echo -e "${YELLOW}Testing deposit address generation...${NC}"
    if curl -s -X POST http://localhost:8001/api/deposits/generate-address \
        -H "Content-Type: application/json" \
        -d '{"userId":"test-user","network":"ethereum","symbol":"ETH"}' | grep -q "success"; then
        echo -e "${GREEN}✅ Deposit address generation working${NC}"
    else
        echo -e "${RED}❌ Deposit address generation failed${NC}"
    fi
fi

echo -e "\n${GREEN}🎉 RSA DEX Platform Setup Complete!${NC}"
echo "=========================================="

if [ "$BACKEND_STARTED" = true ] && [ "$FRONTEND_STARTED" = true ] && [ "$ADMIN_STARTED" = true ]; then
    echo -e "${GREEN}All services are running successfully!${NC}"
    echo -e "${BLUE}You can now access:${NC}"
    echo "• RSA DEX Trading Platform: http://localhost:3002"
    echo "• RSA DEX Admin Panel:      http://localhost:3000"
    echo "• RSA DEX Backend API:      http://localhost:8001"
    echo ""
    echo -e "${YELLOW}💡 Tip: Keep this terminal open to see service status.${NC}"
    echo -e "${YELLOW}💡 Use Ctrl+C to stop all services gracefully.${NC}"
    
    # Keep the script running and monitor services
    echo -e "\n${BLUE}🔍 Monitoring services... (Press Ctrl+C to stop all)${NC}"
    
    trap 'echo -e "\n${YELLOW}🛑 Stopping all RSA DEX services...${NC}"; ./stop-rsa-dex.sh; exit 0' INT
    
    while true; do
        sleep 10
        # Check if services are still running
        if ! check_port 8001; then
            echo -e "${RED}⚠️  Backend stopped unexpectedly${NC}"
        fi
        if ! check_port 3002; then
            echo -e "${RED}⚠️  Frontend stopped unexpectedly${NC}"
        fi
        if ! check_port 3000; then
            echo -e "${RED}⚠️  Admin Panel stopped unexpectedly${NC}"
        fi
    done
else
    echo -e "${RED}Some services failed to start. Check the logs for details:${NC}"
    echo "• Backend logs:  tail -f logs/backend.log"
    echo "• Frontend logs: tail -f logs/frontend.log"
    echo "• Admin logs:    tail -f logs/admin.log"
    exit 1
fi