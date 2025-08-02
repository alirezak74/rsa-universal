#!/bin/bash

# RSA DEX Stop Script
# Stops all running RSA DEX services

echo "🛑 Stopping RSA DEX Platform Services..."
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to stop a service by port
stop_service_by_port() {
    local service_name=$1
    local port=$2
    
    echo -e "${BLUE}Stopping $service_name (port $port)...${NC}"
    
    # Find process using the port
    local pid=$(lsof -ti:$port)
    
    if [ -n "$pid" ]; then
        echo -e "${YELLOW}Found $service_name process (PID: $pid)${NC}"
        kill -TERM $pid 2>/dev/null
        
        # Wait for graceful shutdown
        for i in {1..10}; do
            if ! kill -0 $pid 2>/dev/null; then
                echo -e "${GREEN}✅ $service_name stopped gracefully${NC}"
                return 0
            fi
            sleep 1
        done
        
        # Force kill if still running
        echo -e "${YELLOW}Force stopping $service_name...${NC}"
        kill -KILL $pid 2>/dev/null
        
        if ! kill -0 $pid 2>/dev/null; then
            echo -e "${GREEN}✅ $service_name force stopped${NC}"
        else
            echo -e "${RED}❌ Failed to stop $service_name${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}$service_name is not running${NC}"
    fi
    
    return 0
}

# Function to stop service by PID file
stop_service_by_pid() {
    local service_name=$1
    local pid_file="${service_name,,}.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        echo -e "${BLUE}Stopping $service_name (PID from file: $pid)...${NC}"
        
        if kill -0 $pid 2>/dev/null; then
            kill -TERM $pid 2>/dev/null
            
            # Wait for graceful shutdown
            for i in {1..10}; do
                if ! kill -0 $pid 2>/dev/null; then
                    echo -e "${GREEN}✅ $service_name stopped gracefully${NC}"
                    rm -f "$pid_file"
                    return 0
                fi
                sleep 1
            done
            
            # Force kill if still running
            echo -e "${YELLOW}Force stopping $service_name...${NC}"
            kill -KILL $pid 2>/dev/null
            echo -e "${GREEN}✅ $service_name force stopped${NC}"
        else
            echo -e "${YELLOW}$service_name process not found${NC}"
        fi
        
        rm -f "$pid_file"
    fi
}

# Stop services by port (more reliable)
stop_service_by_port "Backend" 8001
stop_service_by_port "Frontend" 3002
stop_service_by_port "Admin Panel" 3000

# Also try to stop by PID files if they exist
stop_service_by_pid "Backend"
stop_service_by_pid "Frontend" 
stop_service_by_pid "Admin"

# Kill any remaining Node.js processes related to RSA DEX
echo -e "\n${BLUE}Cleaning up any remaining RSA DEX processes...${NC}"

# Find and kill processes running from RSA DEX directories
pkill -f "rsa-dex-backend" 2>/dev/null && echo -e "${GREEN}✅ Stopped remaining backend processes${NC}"
pkill -f "rsa-dex/node_modules" 2>/dev/null && echo -e "${GREEN}✅ Stopped remaining frontend processes${NC}"
pkill -f "rsa-admin-next/node_modules" 2>/dev/null && echo -e "${GREEN}✅ Stopped remaining admin processes${NC}"

# Clean up PID files
rm -f backend.pid frontend.pid admin.pid

echo -e "\n${BLUE}📊 Final Status Check${NC}"
echo "=========================================="

# Check if ports are now free
if ! lsof -Pi :8001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Port 8001 (Backend) is now free${NC}"
else
    echo -e "${RED}❌ Port 8001 (Backend) is still in use${NC}"
fi

if ! lsof -Pi :3002 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Port 3002 (Frontend) is now free${NC}"
else
    echo -e "${RED}❌ Port 3002 (Frontend) is still in use${NC}"
fi

if ! lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Port 3000 (Admin Panel) is now free${NC}"
else
    echo -e "${RED}❌ Port 3000 (Admin Panel) is still in use${NC}"
fi

echo -e "\n${GREEN}🎉 RSA DEX Platform Shutdown Complete!${NC}"
echo "=========================================="
echo -e "${BLUE}All RSA DEX services have been stopped.${NC}"
echo ""
echo "To start the platform again, run:"
echo "  ./start-rsa-dex-complete.sh"
echo ""
echo "To check if any processes are still running:"
echo "  ps aux | grep -E '(rsa-dex|node)'"