#!/bin/bash

echo "🚀 Starting RSA DEX System (Simple Version)..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Kill any existing processes
echo -e "${YELLOW}Cleaning up existing processes...${NC}"
pkill -f "node.*index.js" 2>/dev/null || true
pkill -f "npm.*dev" 2>/dev/null || true

# Start Backend
echo -e "${GREEN}1️⃣ Starting Backend...${NC}"
cd rsa-dex-backend
npm install
node index.js &
BACKEND_PID=$!
cd ..

# Wait for backend
sleep 5

# Test backend
if curl -s http://localhost:8001/health > /dev/null; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${RED}❌ Backend failed to start${NC}"
    exit 1
fi

# Start Frontend
echo -e "${GREEN}2️⃣ Starting Frontend...${NC}"
cd rsa-dex
npm install
npm run dev &
FRONTEND_PID=$!
cd ..

# Start Admin
echo -e "${GREEN}3️⃣ Starting Admin...${NC}"
cd rsa-admin-next
npm install
npm run dev &
ADMIN_PID=$!
cd ..

echo -e "${GREEN}🎉 All services started!${NC}"
echo ""
echo -e "${YELLOW}📊 Services:${NC}"
echo -e "  • Backend:  http://localhost:8001"
echo -e "  • Frontend: http://localhost:3000"
echo -e "  • Admin:    http://localhost:3001"
echo ""
echo -e "${YELLOW}🔑 Admin Login:${NC}"
echo -e "  • Username: admin"
echo -e "  • Password: admin123"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

# Keep running
wait