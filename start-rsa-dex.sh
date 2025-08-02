#!/bin/bash

# RSA DEX Complete Startup Script
# This script will start PostgreSQL via Docker and then start all RSA DEX components

echo "🚀 Starting RSA DEX Complete System"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to wait for PostgreSQL to be ready
wait_for_postgres() {
    echo "⏳ Waiting for PostgreSQL to be ready..."
    max_attempts=30
    attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker exec rsa-dex-postgres pg_isready -U postgres >/dev/null 2>&1; then
            echo -e "${GREEN}✅ PostgreSQL is ready!${NC}"
            return 0
        fi
        
        echo "   Attempt $attempt/$max_attempts - PostgreSQL not ready yet..."
        sleep 2
        ((attempt++))
    done
    
    echo -e "${RED}❌ PostgreSQL failed to start after $max_attempts attempts${NC}"
    return 1
}

# Check if Docker is available
if ! command_exists docker; then
    echo -e "${RED}❌ Docker is not installed or not in PATH${NC}"
    echo "Please install Docker first:"
    echo "  macOS: Download from https://docker.com/products/docker-desktop"
    echo "  Linux: curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh"
    exit 1
fi

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running${NC}"
    echo "Please start Docker first:"
    echo "  macOS: Start Docker Desktop application"
    echo "  Linux: sudo systemctl start docker"
    exit 1
fi

echo -e "${BLUE}🐳 Docker is available and running${NC}"
echo ""

# Step 1: Start PostgreSQL container
echo "📊 Step 1: Starting PostgreSQL database..."

# Check if container already exists
if docker ps -a --format 'table {{.Names}}' | grep -q "^rsa-dex-postgres$"; then
    echo "   PostgreSQL container already exists"
    
    # Check if it's running
    if docker ps --format 'table {{.Names}}' | grep -q "^rsa-dex-postgres$"; then
        echo -e "${GREEN}   ✅ PostgreSQL container is already running${NC}"
    else
        echo "   Starting existing PostgreSQL container..."
        docker start rsa-dex-postgres
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}   ✅ PostgreSQL container started${NC}"
        else
            echo -e "${RED}   ❌ Failed to start PostgreSQL container${NC}"
            exit 1
        fi
    fi
else
    echo "   Creating new PostgreSQL container..."
    docker run -d \
        --name rsa-dex-postgres \
        -e POSTGRES_DB=rsa_dex \
        -e POSTGRES_USER=postgres \
        -e POSTGRES_PASSWORD=password \
        -e POSTGRES_HOST_AUTH_METHOD=trust \
        -p 5432:5432 \
        -v "$(pwd)/rsa-dex-backend/init.sql:/docker-entrypoint-initdb.d/init.sql" \
        postgres:13
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}   ✅ PostgreSQL container created and started${NC}"
    else
        echo -e "${RED}   ❌ Failed to create PostgreSQL container${NC}"
        exit 1
    fi
fi

# Wait for PostgreSQL to be ready
if ! wait_for_postgres; then
    exit 1
fi

echo ""

# Step 2: Start RSA DEX Backend
echo "⚙️  Step 2: Starting RSA DEX Backend..."

if [ ! -d "rsa-dex-backend" ]; then
    echo -e "${RED}❌ rsa-dex-backend directory not found${NC}"
    exit 1
fi

cd rsa-dex-backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "   Installing backend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install backend dependencies${NC}"
        exit 1
    fi
fi

echo "   Starting RSA DEX Backend server..."
echo -e "${BLUE}   Backend will run on: http://localhost:8001${NC}"
echo -e "${BLUE}   WebSocket will run on: ws://localhost:8002${NC}"
echo ""

# Start backend in background
npm start &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Check if backend is running
if kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${GREEN}   ✅ RSA DEX Backend started (PID: $BACKEND_PID)${NC}"
else
    echo -e "${RED}   ❌ RSA DEX Backend failed to start${NC}"
    exit 1
fi

cd ..
echo ""

# Step 3: Instructions for frontend and admin
echo "🌐 Step 3: Starting Frontend Applications"
echo ""
echo -e "${YELLOW}📋 To complete the setup, run these commands in separate terminals:${NC}"
echo ""
echo -e "${BLUE}Frontend (RSA DEX User Interface):${NC}"
echo "   cd rsa-dex"
echo "   npm install"
echo "   npm run dev"
echo "   → http://localhost:3001"
echo ""
echo -e "${BLUE}Admin Panel (Token Management):${NC}"
echo "   cd rsa-admin-next"  
echo "   npm install"
echo "   npm run dev"
echo "   → http://localhost:6000"
echo ""

# Step 4: System status
echo "🎯 System Status Summary"
echo "========================"
echo -e "${GREEN}✅ PostgreSQL Database: Running (Docker container)${NC}"
echo -e "${GREEN}✅ RSA DEX Backend: Running on port 8001${NC}"
echo -e "${YELLOW}⏳ RSA DEX Frontend: Ready to start on port 3001${NC}"
echo -e "${YELLOW}⏳ RSA DEX Admin: Ready to start on port 6000${NC}"
echo ""

# Step 5: Feature overview
echo "🚀 Available Features"
echo "===================="
echo "✅ Cross-chain integration with Alchemy API"
echo "✅ Dynamic token management (no redeployment needed)"
echo "✅ Wrapped tokens: rBTC, rETH, rSOL, rAVAX, rBNB"
echo "✅ Real-time deposit/withdrawal monitoring"
echo "✅ PostgreSQL database with full schema"
echo "✅ WebSocket support for real-time updates"
echo "✅ JWT authentication and rate limiting"
echo ""

# Step 6: Testing
echo "🧪 Quick Health Check"
echo "====================="
echo "Testing backend health endpoint..."

# Wait a bit more for backend to fully initialize
sleep 2

if curl -s http://localhost:8001/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend health check passed${NC}"
else
    echo -e "${YELLOW}⚠️  Backend health check failed (may still be starting)${NC}"
fi

echo ""
echo "🎉 RSA DEX Backend is now running!"
echo ""
echo -e "${BLUE}📖 Next steps:${NC}"
echo "1. Start the frontend and admin panel using the commands above"
echo "2. Open http://localhost:6000 to manage tokens dynamically"
echo "3. Open http://localhost:3001 to access the DEX interface"
echo "4. Check logs above for any errors"
echo ""
echo -e "${BLUE}🛑 To stop everything:${NC}"
echo "   docker stop rsa-dex-postgres"
echo "   kill $BACKEND_PID"
echo ""
echo "Press Ctrl+C to stop the backend server..."

# Keep script running and show backend logs
wait $BACKEND_PID