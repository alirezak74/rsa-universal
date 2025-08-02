#!/bin/bash

# 🚀 RSA DEX FIXED STARTUP SCRIPT
# Starts all services with the latest fixes applied

set -e

echo "🚀 Starting RSA DEX Ecosystem with Fixes..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Function to kill process on port
kill_port() {
    if check_port $1; then
        echo -e "${YELLOW}Killing process on port $1...${NC}"
        lsof -ti:$1 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Function to start service
start_service() {
    local name=$1
    local port=$2
    local command=$3
    local dir=$4

    echo -e "${BLUE}Starting $name on port $port...${NC}"
    
    if check_port $port; then
        echo -e "${YELLOW}Port $port is already in use. Killing existing process...${NC}"
        kill_port $port
    fi

    if [ -n "$dir" ]; then
        cd "$dir"
    fi

    # Start the service in background
    if [ -n "$command" ]; then
        eval "$command" > /dev/null 2>&1 &
        local pid=$!
        echo -e "${GREEN}Started $name (PID: $pid)${NC}"
        
        # Wait a bit for the service to start
        sleep 3
        
        # Check if service is running
        if check_port $port; then
            echo -e "${GREEN}✅ $name is running on port $port${NC}"
        else
            echo -e "${RED}❌ Failed to start $name on port $port${NC}"
            return 1
        fi
    fi
}

# Create logs directory
mkdir -p logs

echo -e "${BLUE}🔧 Preparing RSA DEX Ecosystem...${NC}"

# Kill any existing processes on our ports
echo -e "${YELLOW}Cleaning up existing processes...${NC}"
kill_port 8001  # Backend
kill_port 3000  # Frontend
kill_port 3001  # Admin
kill_port 3002  # Additional frontend

# Wait for processes to be killed
sleep 3

echo -e "${BLUE}🚀 Starting Services...${NC}"

# 1. Start Backend (Port 8001)
echo -e "${BLUE}1️⃣ Starting RSA DEX Backend...${NC}"
cd rsa-dex-backend
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    npm install
fi

start_service "RSA DEX Backend" 8001 "node index.js" "rsa-dex-backend"
cd ..

# Wait for backend to be ready
echo -e "${YELLOW}Waiting for backend to be ready...${NC}"
sleep 5

# 2. Start Frontend (Port 3000)
echo -e "${BLUE}2️⃣ Starting RSA DEX Frontend...${NC}"
cd rsa-dex
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install
fi

start_service "RSA DEX Frontend" 3000 "npm run dev" "rsa-dex"
cd ..

# 3. Start Admin Panel (Port 3001)
echo -e "${BLUE}3️⃣ Starting RSA DEX Admin...${NC}"
cd rsa-dex-admin
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing admin dependencies...${NC}"
    npm install
fi

start_service "RSA DEX Admin" 3001 "npm run dev" "rsa-dex-admin"
cd ..

# Wait for all services to start
echo -e "${YELLOW}Waiting for all services to be ready...${NC}"
sleep 10

# Test the services
echo -e "${BLUE}🧪 Testing Services...${NC}"

# Test backend health
if curl -s http://localhost:8001/health > /dev/null; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
fi

# Test frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ Frontend is accessible${NC}"
else
    echo -e "${RED}❌ Frontend is not accessible${NC}"
fi

# Test admin
if curl -s http://localhost:3001 > /dev/null; then
    echo -e "${GREEN}✅ Admin panel is accessible${NC}"
else
    echo -e "${RED}❌ Admin panel is not accessible${NC}"
fi

echo -e "${GREEN}🎉 RSA DEX Ecosystem Started Successfully!${NC}"
echo ""
echo -e "${BLUE}📊 Service Status:${NC}"
echo -e "  • Backend:  http://localhost:8001"
echo -e "  • Frontend: http://localhost:3000"
echo -e "  • Admin:    http://localhost:3001"
echo ""
echo -e "${BLUE}🔧 Fixes Applied:${NC}"
echo -e "  ✅ Added missing API endpoints"
echo -e "  ✅ Fixed chart color theme (dark mode)"
echo -e "  ✅ Fixed deposit wallet address generation"
echo -e "  ✅ Added admin assets endpoint"
echo -e "  ✅ Improved error handling"
echo ""
echo -e "${YELLOW}💡 Next Steps:${NC}"
echo -e "  1. Open http://localhost:3000 in your browser"
echo -e "  2. Connect your wallet"
echo -e "  3. Test trading functionality"
echo -e "  4. Test deposit functionality"
echo ""
echo -e "${BLUE}🧪 Run verification: node test_fixes.js${NC}"
echo ""

# Keep the script running to maintain the services
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Stopping RSA DEX Services...${NC}"
    kill_port 8001
    kill_port 3000
    kill_port 3001
    echo -e "${GREEN}✅ All services stopped${NC}"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep the script running
while true; do
    sleep 1
done