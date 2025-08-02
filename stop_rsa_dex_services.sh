#!/bin/bash

# 🛑 RSA DEX Services Stop Script
# Stops all RSA DEX services (Admin Panel, Frontend, Backend)

echo "🛑 Stopping RSA DEX Services..."
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to stop service by PID file
stop_service() {
    local service_name=$1
    local pid_file=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat $pid_file)
        if kill -0 $pid 2>/dev/null; then
            echo -e "${BLUE}🔄 Stopping $service_name (PID: $pid)...${NC}"
            kill -TERM $pid
            sleep 3
            if kill -0 $pid 2>/dev/null; then
                echo -e "${YELLOW}⚠️  Force killing $service_name...${NC}"
                kill -9 $pid
            fi
            echo -e "${GREEN}✅ $service_name stopped${NC}"
        else
            echo -e "${YELLOW}⚠️  $service_name process not found${NC}"
        fi
        rm -f $pid_file
    else
        echo -e "${YELLOW}⚠️  No PID file found for $service_name${NC}"
    fi
}

# Function to stop by port
stop_by_port() {
    local port=$1
    local service_name=$2
    
    local pids=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pids" ]; then
        echo -e "${BLUE}🔄 Stopping $service_name on port $port...${NC}"
        echo $pids | xargs kill -TERM 2>/dev/null
        sleep 2
        pids=$(lsof -ti:$port 2>/dev/null)
        if [ ! -z "$pids" ]; then
            echo -e "${YELLOW}⚠️  Force killing $service_name on port $port...${NC}"
            echo $pids | xargs kill -9 2>/dev/null
        fi
        echo -e "${GREEN}✅ $service_name on port $port stopped${NC}"
    else
        echo -e "${GREEN}✅ No process found on port $port${NC}"
    fi
}

echo "🔍 Stopping services by PID files..."

# Stop services using PID files
stop_service "Backend" "backend.pid"
stop_service "Admin Panel" "admin.pid"
stop_service "Frontend" "frontend.pid"

echo ""
echo "🔍 Checking for any remaining processes on ports..."

# Stop any remaining processes on the ports
stop_by_port 8001 "Backend"
stop_by_port 3000 "Admin Panel"
stop_by_port 3002 "Frontend"

echo ""
echo "🧹 Cleaning up log files..."

# Optional: Clean up log files (commented out by default)
# rm -f logs/backend.log logs/admin.log logs/frontend.log

echo ""
echo "🔍 Final port check..."

# Check if ports are now free
check_port_status() {
    local port=$1
    local service_name=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${RED}❌ Port $port ($service_name) is still in use${NC}"
        echo "   Manual cleanup: kill -9 \$(lsof -ti:$port)"
        return 1
    else
        echo -e "${GREEN}✅ Port $port ($service_name) is free${NC}"
        return 0
    fi
}

check_port_status 8001 "Backend"
check_port_status 3000 "Admin Panel"
check_port_status 3002 "Frontend"

echo ""
echo "🎉 RSA DEX Services Stop Complete!"
echo "=================================="
echo ""
echo "📋 To restart services, run:"
echo "   ./start_rsa_dex_services.sh"
echo ""
echo "🔍 To check if any Node.js processes are still running:"
echo "   ps aux | grep node"
echo ""
echo "🧹 To clean up all Node.js processes (use with caution):"
echo "   pkill -f node"