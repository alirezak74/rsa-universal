#!/bin/bash

# RSA DEX Cross-Chain Platform Startup Script
# Launches all services required for the full RSA DEX ecosystem

set -e

echo "🚀 Starting RSA DEX Cross-Chain Platform..."
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
        return 1
    else
        echo -e "${GREEN}✅ Port $port is available${NC}"
        return 0
    fi
}

# Function to start service in background
start_service() {
    local name=$1
    local directory=$2
    local port=$3
    local command=$4
    
    echo -e "${BLUE}🔄 Starting $name on port $port...${NC}"
    
    if check_port $port; then
        cd $directory
        eval $command &
        local pid=$!
        echo $pid > "../$name.pid"
        echo -e "${GREEN}✅ $name started (PID: $pid)${NC}"
        cd ..
    else
        echo -e "${RED}❌ Failed to start $name - port $port unavailable${NC}"
        exit 1
    fi
}

# Function to check if dependencies are installed
check_dependencies() {
    echo -e "${BLUE}🔍 Checking dependencies...${NC}"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Node.js $(node --version)${NC}"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm is not installed${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ npm $(npm --version)${NC}"
    
    # Check PostgreSQL
    if ! command -v psql &> /dev/null; then
        echo -e "${YELLOW}⚠️  PostgreSQL client not found - you may need to install it${NC}"
    else
        echo -e "${GREEN}✅ PostgreSQL client available${NC}"
    fi
}

# Function to install dependencies if needed
install_dependencies() {
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    
    for dir in rsa-dex-backend rsa-dex-admin rsa-dex rsa-wallet-web; do
        if [ -d "$dir" ]; then
            echo -e "${BLUE}Installing dependencies for $dir...${NC}"
            cd $dir
            if [ ! -d "node_modules" ]; then
                npm install
            else
                echo -e "${GREEN}✅ Dependencies already installed for $dir${NC}"
            fi
            cd ..
        else
            echo -e "${YELLOW}⚠️  Directory $dir not found, skipping...${NC}"
        fi
    done
}

# Function to setup database
setup_database() {
    echo -e "${BLUE}🗄️  Setting up database...${NC}"
    
    if command -v psql &> /dev/null; then
        echo "Creating database and tables..."
        
        # Check if database exists
        if psql -lqt | cut -d \| -f 1 | grep -qw rsa_dex; then
            echo -e "${GREEN}✅ Database 'rsa_dex' already exists${NC}"
        else
            echo -e "${BLUE}Creating database 'rsa_dex'...${NC}"
            createdb rsa_dex 2>/dev/null || echo -e "${YELLOW}⚠️  Database creation failed - may already exist${NC}"
        fi
        
        # Initialize schema if script exists
        if [ -f "rsa-dex-backend/scripts/initDb.sql" ]; then
            echo -e "${BLUE}Initializing database schema...${NC}"
            psql -d rsa_dex -f rsa-dex-backend/scripts/initDb.sql > /dev/null 2>&1 || echo -e "${YELLOW}⚠️  Schema initialization may have failed${NC}"
            echo -e "${GREEN}✅ Database schema initialized${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  PostgreSQL not available - manual database setup required${NC}"
    fi
}

# Function to create environment files if they don't exist
setup_environment() {
    echo -e "${BLUE}🔧 Setting up environment...${NC}"
    
    # Backend environment
    if [ ! -f "rsa-dex-backend/.env" ]; then
        echo -e "${BLUE}Creating backend environment file...${NC}"
        cat > rsa-dex-backend/.env << 'EOF'
NODE_ENV=development
PORT=8001
JWT_SECRET=rsa_dex_super_secure_secret_key_2024
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rsa_dex
DB_USER=postgres
DB_PASSWORD=password
ALCHEMY_API_KEY=VSDZI0dFEh6shTS4qYsKd
EOF
        echo -e "${GREEN}✅ Backend environment file created${NC}"
    else
        echo -e "${GREEN}✅ Backend environment file exists${NC}"
    fi
}

# Function to cleanup PIDs on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down services...${NC}"
    
    for pidfile in *.pid; do
        if [ -f "$pidfile" ]; then
            pid=$(cat "$pidfile")
            service_name=$(basename "$pidfile" .pid)
            echo -e "${BLUE}Stopping $service_name (PID: $pid)...${NC}"
            kill $pid 2>/dev/null || echo -e "${YELLOW}⚠️  Process $pid may have already stopped${NC}"
            rm "$pidfile"
        fi
    done
    
    echo -e "${GREEN}✅ All services stopped${NC}"
    exit 0
}

# Function to show service status
show_status() {
    echo -e "\n${BLUE}📊 Service Status:${NC}"
    echo "================================================"
    
    services=(
        "rsa-dex-backend:8001:RSA DEX Backend API"
        "rsa-dex-admin:6000:RSA DEX Admin Panel"
        "rsa-dex:3001:RSA DEX Frontend"
        "rsa-wallet-web:3000:RSA Wallet"
    )
    
    for service in "${services[@]}"; do
        IFS=':' read -r name port description <<< "$service"
        if [ -f "$name.pid" ]; then
            pid=$(cat "$name.pid")
            if ps -p $pid > /dev/null 2>&1; then
                echo -e "${GREEN}✅ $description: http://localhost:$port (PID: $pid)${NC}"
            else
                echo -e "${RED}❌ $description: Not running${NC}"
            fi
        else
            echo -e "${RED}❌ $description: Not started${NC}"
        fi
    done
    
    echo "================================================"
}

# Function to show URLs
show_urls() {
    echo -e "\n${GREEN}🌐 Access URLs:${NC}"
    echo "================================================"
    echo -e "${BLUE}🔗 RSA DEX Backend API:${NC}    http://localhost:8001"
    echo -e "${BLUE}🔗 RSA DEX Admin Panel:${NC}    http://localhost:6000"
    echo -e "${BLUE}🔗 RSA DEX Frontend:${NC}       http://localhost:3001"
    echo -e "${BLUE}🔗 RSA Wallet:${NC}             http://localhost:3000"
    echo "================================================"
    echo -e "${YELLOW}📚 Admin Login: admin@rsacrypto.com / admin123${NC}"
    echo -e "${YELLOW}📱 API Documentation: http://localhost:8001/health${NC}"
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Main execution
main() {
    echo -e "${GREEN}"
    cat << "EOF"
    ____  _____ ___       ____  _______  __
   / __ \/ ___//   |     / __ \/ ____/ |/ /
  / /_/ /\__ \/ /| |    / / / / __/  |   / 
 / _, _/___/ / ___ |   / /_/ / /___ /   |  
/_/ |_|/____/_/  |_|  /_____/_____//_/|_|  
                                           
Cross-Chain Integration Platform
EOF
    echo -e "${NC}"
    
    # Check dependencies
    check_dependencies
    
    # Setup environment
    setup_environment
    
    # Install dependencies
    install_dependencies
    
    # Setup database
    setup_database
    
    echo -e "\n${BLUE}🚀 Launching services...${NC}"
    
    # Start services
    start_service "rsa-dex-backend" "rsa-dex-backend" "8001" "npm run dev"
    sleep 3
    
    start_service "rsa-dex-admin" "rsa-dex-admin" "6000" "npm run dev"
    sleep 2
    
    start_service "rsa-dex" "rsa-dex" "3001" "npm run dev"
    sleep 2
    
    start_service "rsa-wallet-web" "rsa-wallet-web" "3000" "npm start"
    sleep 2
    
    # Show status and URLs
    show_status
    show_urls
    
    echo -e "\n${GREEN}🎉 RSA DEX Cross-Chain Platform is now running!${NC}"
    echo -e "${BLUE}Press Ctrl+C to stop all services${NC}"
    
    # Wait for all background processes
    wait
}

# Handle command line arguments
case "${1:-}" in
    "stop")
        echo -e "${BLUE}Stopping all RSA DEX services...${NC}"
        cleanup
        ;;
    "status")
        show_status
        ;;
    "urls")
        show_urls
        ;;
    "restart")
        echo -e "${BLUE}Restarting RSA DEX services...${NC}"
        cleanup
        sleep 2
        main
        ;;
    *)
        main
        ;;
esac