#!/bin/bash

# RSA DEX Ecosystem Service Startup Script
# Version: August 2025
# Starts all RSA DEX services in the correct order with health checks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_PORT=8001
ADMIN_PORT=3000
FRONTEND_PORT=3002
MAX_WAIT_TIME=60
HEALTH_CHECK_INTERVAL=5

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}[$(date '+%Y-%m-%d %H:%M:%S')] ${message}${NC}"
}

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -i :$port >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local name=$1
    local url=$2
    local max_wait=$3
    local waited=0
    
    print_status $YELLOW "Waiting for $name to be ready..."
    
    while [ $waited -lt $max_wait ]; do
        if curl -s --max-time 5 "$url" >/dev/null 2>&1; then
            print_status $GREEN "$name is ready! ✅"
            return 0
        fi
        
        sleep $HEALTH_CHECK_INTERVAL
        waited=$((waited + HEALTH_CHECK_INTERVAL))
        print_status $BLUE "Waiting for $name... (${waited}s/${max_wait}s)"
    done
    
    print_status $RED "$name failed to start within ${max_wait}s ❌"
    return 1
}

# Function to kill process on port
kill_port() {
    local port=$1
    local name=$2
    
    if check_port $port; then
        print_status $YELLOW "Killing existing process on port $port ($name)..."
        lsof -ti :$port | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Function to start backend
start_backend() {
    print_status $BLUE "🚀 Starting RSA DEX Backend (Port $BACKEND_PORT)..."
    
    if [ ! -d "rsa-dex-backend" ]; then
        print_status $RED "Error: rsa-dex-backend directory not found!"
        return 1
    fi
    
    cd rsa-dex-backend
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_status $YELLOW "Installing backend dependencies..."
        npm install || {
            print_status $RED "Failed to install backend dependencies!"
            return 1
        }
    fi
    
    # Start backend in background
    nohup npm start > ../backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../backend.pid
    
    cd ..
    
    # Wait for backend to be ready
    if wait_for_service "Backend API" "http://localhost:$BACKEND_PORT/health" $MAX_WAIT_TIME; then
        print_status $GREEN "Backend started successfully! PID: $BACKEND_PID"
        return 0
    else
        print_status $RED "Backend failed to start!"
        return 1
    fi
}

# Function to start admin panel
start_admin() {
    print_status $BLUE "🎛️ Starting RSA DEX Admin Panel (Port $ADMIN_PORT)..."
    
    if [ ! -d "rsa-admin-next" ]; then
        print_status $RED "Error: rsa-admin-next directory not found!"
        return 1
    fi
    
    cd rsa-admin-next
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_status $YELLOW "Installing admin dependencies..."
        npm install || {
            print_status $RED "Failed to install admin dependencies!"
            return 1
        }
    fi
    
    # Start admin in background
    nohup npm run dev > ../admin.log 2>&1 &
    ADMIN_PID=$!
    echo $ADMIN_PID > ../admin.pid
    
    cd ..
    
    # Wait for admin to be ready
    if wait_for_service "Admin Panel" "http://localhost:$ADMIN_PORT" $MAX_WAIT_TIME; then
        print_status $GREEN "Admin Panel started successfully! PID: $ADMIN_PID"
        return 0
    else
        print_status $RED "Admin Panel failed to start!"
        return 1
    fi
}

# Function to start frontend
start_frontend() {
    print_status $BLUE "💹 Starting RSA DEX Frontend (Port $FRONTEND_PORT)..."
    
    if [ ! -d "rsa-dex" ]; then
        print_status $RED "Error: rsa-dex directory not found!"
        return 1
    fi
    
    cd rsa-dex
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_status $YELLOW "Installing frontend dependencies..."
        npm install || {
            print_status $RED "Failed to install frontend dependencies!"
            return 1
        }
    fi
    
    # Start frontend in background
    PORT=$FRONTEND_PORT nohup npm run dev > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../frontend.pid
    
    cd ..
    
    # Wait for frontend to be ready
    if wait_for_service "Frontend DEX" "http://localhost:$FRONTEND_PORT" $MAX_WAIT_TIME; then
        print_status $GREEN "Frontend started successfully! PID: $FRONTEND_PID"
        return 0
    else
        print_status $RED "Frontend failed to start!"
        return 1
    fi
}

# Function to check all services health
check_ecosystem_health() {
    print_status $BLUE "🏥 Checking RSA DEX Ecosystem Health..."
    
    local all_healthy=true
    
    # Check Backend
    if curl -s --max-time 5 "http://localhost:$BACKEND_PORT/health" >/dev/null 2>&1; then
        print_status $GREEN "✅ Backend API (Port $BACKEND_PORT) - HEALTHY"
    else
        print_status $RED "❌ Backend API (Port $BACKEND_PORT) - UNHEALTHY"
        all_healthy=false
    fi
    
    # Check Admin
    if curl -s --max-time 5 "http://localhost:$ADMIN_PORT" >/dev/null 2>&1; then
        print_status $GREEN "✅ Admin Panel (Port $ADMIN_PORT) - HEALTHY"
    else
        print_status $RED "❌ Admin Panel (Port $ADMIN_PORT) - UNHEALTHY"
        all_healthy=false
    fi
    
    # Check Frontend
    if curl -s --max-time 5 "http://localhost:$FRONTEND_PORT" >/dev/null 2>&1; then
        print_status $GREEN "✅ Frontend DEX (Port $FRONTEND_PORT) - HEALTHY"
    else
        print_status $RED "❌ Frontend DEX (Port $FRONTEND_PORT) - UNHEALTHY"
        all_healthy=false
    fi
    
    if [ "$all_healthy" = true ]; then
        print_status $GREEN "🎉 All RSA DEX services are healthy!"
        return 0
    else
        print_status $YELLOW "⚠️ Some services are not healthy. Check logs for details."
        return 1
    fi
}

# Function to display service URLs
show_service_urls() {
    print_status $BLUE "🌐 RSA DEX Service URLs:"
    echo ""
    echo -e "${GREEN}Backend API:${NC}     http://localhost:$BACKEND_PORT"
    echo -e "${GREEN}Admin Panel:${NC}     http://localhost:$ADMIN_PORT"
    echo -e "${GREEN}Frontend DEX:${NC}    http://localhost:$FRONTEND_PORT"
    echo ""
    echo -e "${YELLOW}Default Admin Login:${NC} admin / admin123"
    echo ""
}

# Function to show process information
show_process_info() {
    print_status $BLUE "📊 Process Information:"
    echo ""
    
    if [ -f "backend.pid" ]; then
        BACKEND_PID=$(cat backend.pid)
        echo -e "${GREEN}Backend PID:${NC}     $BACKEND_PID"
    fi
    
    if [ -f "admin.pid" ]; then
        ADMIN_PID=$(cat admin.pid)
        echo -e "${GREEN}Admin PID:${NC}       $ADMIN_PID"
    fi
    
    if [ -f "frontend.pid" ]; then
        FRONTEND_PID=$(cat frontend.pid)
        echo -e "${GREEN}Frontend PID:${NC}    $FRONTEND_PID"
    fi
    
    echo ""
    echo -e "${YELLOW}To stop services:${NC} ./rsa_dex_service_stop.sh"
    echo -e "${YELLOW}To check logs:${NC}    tail -f backend.log admin.log frontend.log"
}

# Function to cleanup on exit
cleanup() {
    print_status $YELLOW "Cleaning up..."
    # Don't kill services on script exit - let them run
}

# Trap cleanup function
trap cleanup EXIT

# Main execution
main() {
    print_status $BLUE "🚀 RSA DEX Ecosystem Startup"
    print_status $BLUE "=============================="
    echo ""
    
    # Parse command line arguments
    FORCE_RESTART=false
    SKIP_HEALTH_CHECK=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -f|--force)
                FORCE_RESTART=true
                shift
                ;;
            -s|--skip-health)
                SKIP_HEALTH_CHECK=true
                shift
                ;;
            -h|--help)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  -f, --force        Force restart of existing services"
                echo "  -s, --skip-health  Skip final health check"
                echo "  -h, --help         Show this help message"
                echo ""
                exit 0
                ;;
            *)
                print_status $RED "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Check prerequisites
    if ! command -v node >/dev/null 2>&1; then
        print_status $RED "Error: Node.js is not installed!"
        exit 1
    fi
    
    if ! command -v npm >/dev/null 2>&1; then
        print_status $RED "Error: npm is not installed!"
        exit 1
    fi
    
    if ! command -v curl >/dev/null 2>&1; then
        print_status $RED "Error: curl is not installed!"
        exit 1
    fi
    
    # Force restart if requested
    if [ "$FORCE_RESTART" = true ]; then
        print_status $YELLOW "Force restart requested - stopping existing services..."
        kill_port $BACKEND_PORT "Backend"
        kill_port $ADMIN_PORT "Admin"
        kill_port $FRONTEND_PORT "Frontend"
    fi
    
    # Check for existing services
    local existing_services=false
    
    if check_port $BACKEND_PORT; then
        print_status $YELLOW "Backend already running on port $BACKEND_PORT"
        existing_services=true
    fi
    
    if check_port $ADMIN_PORT; then
        print_status $YELLOW "Admin already running on port $ADMIN_PORT"
        existing_services=true
    fi
    
    if check_port $FRONTEND_PORT; then
        print_status $YELLOW "Frontend already running on port $FRONTEND_PORT"
        existing_services=true
    fi
    
    if [ "$existing_services" = true ] && [ "$FORCE_RESTART" = false ]; then
        print_status $YELLOW "Some services are already running. Use -f to force restart."
        print_status $BLUE "Checking health of existing services..."
        check_ecosystem_health
        show_service_urls
        exit 0
    fi
    
    # Start services in order
    print_status $BLUE "Starting services in order..."
    echo ""
    
    # Step 1: Start Backend
    if ! check_port $BACKEND_PORT; then
        if ! start_backend; then
            print_status $RED "Failed to start backend. Aborting startup."
            exit 1
        fi
    else
        print_status $GREEN "Backend already running on port $BACKEND_PORT"
    fi
    
    echo ""
    
    # Step 2: Start Admin Panel
    if ! check_port $ADMIN_PORT; then
        if ! start_admin; then
            print_status $RED "Failed to start admin panel. Backend is still running."
            exit 1
        fi
    else
        print_status $GREEN "Admin Panel already running on port $ADMIN_PORT"
    fi
    
    echo ""
    
    # Step 3: Start Frontend
    if ! check_port $FRONTEND_PORT; then
        if ! start_frontend; then
            print_status $RED "Failed to start frontend. Backend and Admin are still running."
            exit 1
        fi
    else
        print_status $GREEN "Frontend already running on port $FRONTEND_PORT"
    fi
    
    echo ""
    
    # Final health check
    if [ "$SKIP_HEALTH_CHECK" = false ]; then
        sleep 5  # Give services a moment to stabilize
        check_ecosystem_health
        echo ""
    fi
    
    # Show success information
    print_status $GREEN "🎉 RSA DEX Ecosystem Startup Complete!"
    echo ""
    show_service_urls
    show_process_info
    
    # Optional: Run QA test
    if [ -f "rsa_dex_unified_qa_comprehensive_test.js" ]; then
        echo ""
        print_status $BLUE "💡 Tip: Run comprehensive QA test with:"
        echo -e "${YELLOW}node rsa_dex_unified_qa_comprehensive_test.js${NC}"
    fi
}

# Execute main function
main "$@"