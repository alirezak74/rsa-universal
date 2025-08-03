#!/bin/bash

# RSA DEX Ecosystem Service Stop Script
# Version: August 2025
# Safely stops all RSA DEX services

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

# Function to stop service by PID file
stop_service_by_pid() {
    local name=$1
    local pid_file=$2
    local port=$3
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        print_status $YELLOW "Stopping $name (PID: $pid)..."
        
        if kill -0 "$pid" 2>/dev/null; then
            # Try graceful shutdown first
            kill -TERM "$pid" 2>/dev/null || true
            
            # Wait for graceful shutdown
            local count=0
            while kill -0 "$pid" 2>/dev/null && [ $count -lt 10 ]; do
                sleep 1
                count=$((count + 1))
            done
            
            # Force kill if still running
            if kill -0 "$pid" 2>/dev/null; then
                print_status $YELLOW "Force killing $name..."
                kill -KILL "$pid" 2>/dev/null || true
            fi
            
            print_status $GREEN "$name stopped successfully"
        else
            print_status $YELLOW "$name process not found (PID: $pid)"
        fi
        
        rm -f "$pid_file"
    else
        print_status $YELLOW "No PID file found for $name"
    fi
    
    # Double-check by port
    if check_port $port; then
        print_status $YELLOW "Process still running on port $port, killing by port..."
        lsof -ti :$port | xargs kill -9 2>/dev/null || true
        sleep 1
        
        if check_port $port; then
            print_status $RED "Failed to stop process on port $port"
            return 1
        else
            print_status $GREEN "Process on port $port stopped"
        fi
    fi
    
    return 0
}

# Function to stop all services
stop_all_services() {
    print_status $BLUE "🛑 Stopping RSA DEX Ecosystem Services..."
    echo ""
    
    local all_stopped=true
    
    # Stop Frontend first (reverse order of startup)
    if check_port $FRONTEND_PORT || [ -f "frontend.pid" ]; then
        if ! stop_service_by_pid "Frontend DEX" "frontend.pid" $FRONTEND_PORT; then
            all_stopped=false
        fi
    else
        print_status $GREEN "Frontend DEX is not running"
    fi
    
    echo ""
    
    # Stop Admin Panel
    if check_port $ADMIN_PORT || [ -f "admin.pid" ]; then
        if ! stop_service_by_pid "Admin Panel" "admin.pid" $ADMIN_PORT; then
            all_stopped=false
        fi
    else
        print_status $GREEN "Admin Panel is not running"
    fi
    
    echo ""
    
    # Stop Backend last
    if check_port $BACKEND_PORT || [ -f "backend.pid" ]; then
        if ! stop_service_by_pid "Backend API" "backend.pid" $BACKEND_PORT; then
            all_stopped=false
        fi
    else
        print_status $GREEN "Backend API is not running"
    fi
    
    echo ""
    
    if [ "$all_stopped" = true ]; then
        print_status $GREEN "🎉 All RSA DEX services stopped successfully!"
    else
        print_status $YELLOW "⚠️ Some services may still be running. Check manually."
    fi
    
    return 0
}

# Function to check service status
check_service_status() {
    print_status $BLUE "📊 RSA DEX Service Status:"
    echo ""
    
    # Check Backend
    if check_port $BACKEND_PORT; then
        print_status $RED "❌ Backend API (Port $BACKEND_PORT) - RUNNING"
    else
        print_status $GREEN "✅ Backend API (Port $BACKEND_PORT) - STOPPED"
    fi
    
    # Check Admin
    if check_port $ADMIN_PORT; then
        print_status $RED "❌ Admin Panel (Port $ADMIN_PORT) - RUNNING"
    else
        print_status $GREEN "✅ Admin Panel (Port $ADMIN_PORT) - STOPPED"
    fi
    
    # Check Frontend
    if check_port $FRONTEND_PORT; then
        print_status $RED "❌ Frontend DEX (Port $FRONTEND_PORT) - RUNNING"
    else
        print_status $GREEN "✅ Frontend DEX (Port $FRONTEND_PORT) - STOPPED"
    fi
    
    echo ""
}

# Function to clean up log files
cleanup_logs() {
    print_status $BLUE "🧹 Cleaning up log files..."
    
    local cleaned=false
    
    if [ -f "backend.log" ]; then
        print_status $YELLOW "Archiving backend.log..."
        mv backend.log "backend_$(date +%Y%m%d_%H%M%S).log"
        cleaned=true
    fi
    
    if [ -f "admin.log" ]; then
        print_status $YELLOW "Archiving admin.log..."
        mv admin.log "admin_$(date +%Y%m%d_%H%M%S).log"
        cleaned=true
    fi
    
    if [ -f "frontend.log" ]; then
        print_status $YELLOW "Archiving frontend.log..."
        mv frontend.log "frontend_$(date +%Y%m%d_%H%M%S).log"
        cleaned=true
    fi
    
    if [ "$cleaned" = true ]; then
        print_status $GREEN "Log files archived with timestamp"
    else
        print_status $GREEN "No log files to clean up"
    fi
}

# Main execution
main() {
    print_status $BLUE "🛑 RSA DEX Ecosystem Stop"
    print_status $BLUE "========================="
    echo ""
    
    # Parse command line arguments
    FORCE_KILL=false
    CLEANUP_LOGS=false
    STATUS_ONLY=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -f|--force)
                FORCE_KILL=true
                shift
                ;;
            -c|--cleanup)
                CLEANUP_LOGS=true
                shift
                ;;
            -s|--status)
                STATUS_ONLY=true
                shift
                ;;
            -h|--help)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  -f, --force      Force kill all processes (use kill -9)"
                echo "  -c, --cleanup    Archive log files after stopping services"
                echo "  -s, --status     Show service status only (don't stop)"
                echo "  -h, --help       Show this help message"
                echo ""
                exit 0
                ;;
            *)
                print_status $RED "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Show status only if requested
    if [ "$STATUS_ONLY" = true ]; then
        check_service_status
        exit 0
    fi
    
    # Check if any services are running
    local services_running=false
    
    if check_port $BACKEND_PORT; then
        services_running=true
    fi
    
    if check_port $ADMIN_PORT; then
        services_running=true
    fi
    
    if check_port $FRONTEND_PORT; then
        services_running=true
    fi
    
    if [ "$services_running" = false ]; then
        print_status $GREEN "No RSA DEX services are currently running"
        check_service_status
        exit 0
    fi
    
    # Force kill if requested
    if [ "$FORCE_KILL" = true ]; then
        print_status $YELLOW "Force kill requested - using kill -9..."
        
        if check_port $BACKEND_PORT; then
            lsof -ti :$BACKEND_PORT | xargs kill -9 2>/dev/null || true
        fi
        
        if check_port $ADMIN_PORT; then
            lsof -ti :$ADMIN_PORT | xargs kill -9 2>/dev/null || true
        fi
        
        if check_port $FRONTEND_PORT; then
            lsof -ti :$FRONTEND_PORT | xargs kill -9 2>/dev/null || true
        fi
        
        # Clean up PID files
        rm -f backend.pid admin.pid frontend.pid
        
        sleep 2
        print_status $GREEN "Force kill completed"
    else
        # Graceful shutdown
        stop_all_services
    fi
    
    echo ""
    
    # Final status check
    check_service_status
    
    # Clean up logs if requested
    if [ "$CLEANUP_LOGS" = true ]; then
        echo ""
        cleanup_logs
    fi
    
    echo ""
    print_status $GREEN "🎯 Service shutdown complete!"
    echo ""
    print_status $BLUE "💡 To start services again, run:"
    echo -e "${YELLOW}./rsa_dex_service_startup.sh${NC}"
}

# Execute main function
main "$@"