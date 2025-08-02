#!/bin/bash

echo "🔍 Debugging RSA DEX Backend Startup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}1️⃣ Checking Node.js version...${NC}"
node --version

echo -e "${BLUE}2️⃣ Checking if dependencies are installed...${NC}"
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules directory exists${NC}"
else
    echo -e "${RED}❌ node_modules directory missing${NC}"
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
fi

echo -e "${BLUE}3️⃣ Checking for syntax errors...${NC}"
if node -c index.js; then
    echo -e "${GREEN}✅ No syntax errors found${NC}"
else
    echo -e "${RED}❌ Syntax errors found${NC}"
    exit 1
fi

echo -e "${BLUE}4️⃣ Testing basic Express server...${NC}"
node test-server.js &
TEST_PID=$!
sleep 3

if curl -s http://localhost:8001/health > /dev/null; then
    echo -e "${GREEN}✅ Test server is working${NC}"
    kill $TEST_PID 2>/dev/null
else
    echo -e "${RED}❌ Test server failed${NC}"
    kill $TEST_PID 2>/dev/null
    exit 1
fi

echo -e "${BLUE}5️⃣ Starting main backend server...${NC}"
echo -e "${YELLOW}Starting backend with verbose output...${NC}"
node index.js