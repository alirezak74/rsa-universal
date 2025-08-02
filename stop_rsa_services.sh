#!/bin/bash

echo "🛑 Stopping RSA DEX Ecosystem..."

# Function to stop service by PID
stop_service() {
    local pid_file=$1
    local name=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            echo "Stopping $name (PID: $pid)..."
            kill "$pid"
            sleep 2
            if kill -0 "$pid" 2>/dev/null; then
                echo "Force killing $name..."
                kill -9 "$pid"
            fi
        fi
        rm -f "$pid_file"
        echo "✅ $name stopped"
    else
        echo "No PID file found for $name"
    fi
}

stop_service "backend.pid" "Backend"
stop_service "admin.pid" "Admin"
stop_service "frontend.pid" "Frontend"

# Also kill any remaining node processes on our ports
pkill -f "standalone_enhanced_backend.js" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true

echo "🎯 All RSA DEX services stopped!"
