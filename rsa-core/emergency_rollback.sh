#!/bin/bash

# EMERGENCY ROLLBACK SCRIPT FOR RSA CORE
# ======================================
# This script provides immediate rollback capabilities for security incidents

set -euo pipefail

# Configuration
RSA_CORE_DIR="/opt/rsa-core"
BACKUP_DIR="/opt/rsa-core-backups"
LOG_DIR="/var/log/rsa-core"
RUN_DIR="/var/run/rsa-core"
EMERGENCY_LOG="/tmp/rsa-emergency-rollback.log"

# Logging function
log_emergency() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] EMERGENCY: $1" | tee -a "$EMERGENCY_LOG"
    logger -p daemon.crit "RSA-CORE-EMERGENCY: $1"
}

# Emergency shutdown function
emergency_shutdown() {
    log_emergency "INITIATING EMERGENCY SHUTDOWN"
    
    # Kill all RSA core processes
    pkill -f "rsa-core" || true
    pkill -f "rsa-horizon" || true
    pkill -f "rsa-dex" || true
    
    # Stop related services
    systemctl stop rsa-core || true
    systemctl stop rsa-horizon || true
    systemctl stop rsa-dex-backend || true
    
    log_emergency "All RSA services stopped"
    
    # Create emergency marker
    touch /tmp/rsa-emergency-shutdown
    echo "$(date): Emergency shutdown due to security incident" > /tmp/rsa-emergency-shutdown
}

# Backup current state
backup_current_state() {
    log_emergency "Backing up current state"
    
    mkdir -p "$BACKUP_DIR/emergency-$(date +%Y%m%d-%H%M%S)"
    BACKUP_PATH="$BACKUP_DIR/emergency-$(date +%Y%m%d-%H%M%S)"
    
    # Backup binaries
    if [ -d "$RSA_CORE_DIR" ]; then
        cp -r "$RSA_CORE_DIR" "$BACKUP_PATH/core" || true
    fi
    
    # Backup configuration
    cp /etc/rsa-core/* "$BACKUP_PATH/config/" 2>/dev/null || true
    
    # Backup logs for forensics
    cp -r "$LOG_DIR" "$BACKUP_PATH/logs" 2>/dev/null || true
    
    log_emergency "Current state backed up to $BACKUP_PATH"
}

# Rollback to last known good version
rollback_to_safe_version() {
    log_emergency "Rolling back to last known safe version"
    
    # Find latest backup
    LATEST_BACKUP=$(find "$BACKUP_DIR" -name "safe-*" -type d | sort -r | head -1)
    
    if [ -z "$LATEST_BACKUP" ]; then
        log_emergency "ERROR: No safe backup found!"
        return 1
    fi
    
    log_emergency "Rolling back to: $LATEST_BACKUP"
    
    # Stop all services first
    emergency_shutdown
    
    # Replace current installation
    if [ -d "$LATEST_BACKUP/core" ]; then
        rm -rf "$RSA_CORE_DIR" || true
        cp -r "$LATEST_BACKUP/core" "$RSA_CORE_DIR"
        chmod +x "$RSA_CORE_DIR/bin/rsa-core"
    fi
    
    # Restore configuration
    if [ -d "$LATEST_BACKUP/config" ]; then
        cp "$LATEST_BACKUP/config"/* /etc/rsa-core/ 2>/dev/null || true
    fi
    
    log_emergency "Rollback completed"
}

# Memory corruption response
handle_memory_corruption() {
    log_emergency "MEMORY CORRUPTION DETECTED - INITIATING EMERGENCY RESPONSE"
    
    # Immediate shutdown
    emergency_shutdown
    
    # Backup for forensics
    backup_current_state
    
    # Clear potentially corrupted memory
    sync
    echo 3 > /proc/sys/vm/drop_caches 2>/dev/null || true
    
    # Rollback to safe version
    rollback_to_safe_version
    
    # Set restrictive mode
    echo "EMERGENCY_MODE=true" > /etc/rsa-core/emergency.conf
    echo "MAX_OPERATIONS=10" >> /etc/rsa-core/emergency.conf
    echo "MEMORY_LIMIT=512M" >> /etc/rsa-core/emergency.conf
    
    log_emergency "Memory corruption response completed"
}

# Rate limit exceeded response
handle_rate_limit_exceeded() {
    log_emergency "RATE LIMIT EXCEEDED - IMPLEMENTING THROTTLING"
    
    # Create rate limiting configuration
    cat > /etc/rsa-core/rate-limit.conf << EOF
# Emergency rate limiting configuration
MAX_CONCURRENT_OPS=50
THROTTLE_DELAY=1000
REJECT_THRESHOLD=90
EMERGENCY_MODE=true
EOF
    
    # Restart with limited configuration
    systemctl restart rsa-core || true
    
    log_emergency "Rate limiting implemented"
}

# Create safe backup
create_safe_backup() {
    log_emergency "Creating safe backup checkpoint"
    
    mkdir -p "$BACKUP_DIR"
    SAFE_BACKUP="$BACKUP_DIR/safe-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$SAFE_BACKUP"
    
    # Backup current working version
    cp -r "$RSA_CORE_DIR" "$SAFE_BACKUP/core" 2>/dev/null || true
    cp -r /etc/rsa-core "$SAFE_BACKUP/config" 2>/dev/null || true
    
    # Keep only last 5 safe backups
    find "$BACKUP_DIR" -name "safe-*" -type d | sort -r | tail -n +6 | xargs rm -rf 2>/dev/null || true
    
    log_emergency "Safe backup created: $SAFE_BACKUP"
}

# System health check
check_system_health() {
    log_emergency "Performing system health check"
    
    # Check for emergency markers
    if [ -f "/tmp/rsa-core-emergency.alert" ]; then
        ALERT_TYPE=$(grep "CRITICAL ALERT:" /tmp/rsa-core-emergency.alert | head -1 || echo "UNKNOWN")
        log_emergency "Emergency alert detected: $ALERT_TYPE"
        return 1
    fi
    
    # Check memory usage
    MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
    if [ "$MEMORY_USAGE" -gt 90 ]; then
        log_emergency "High memory usage detected: ${MEMORY_USAGE}%"
        return 1
    fi
    
    # Check process status
    if ! pgrep -f "rsa-core" > /dev/null; then
        log_emergency "RSA Core process not running"
        return 1
    fi
    
    log_emergency "System health check passed"
    return 0
}

# Main emergency response handler
main() {
    case "${1:-help}" in
        "memory-corruption")
            handle_memory_corruption
            ;;
        "rate-limit")
            handle_rate_limit_exceeded
            ;;
        "emergency-shutdown")
            emergency_shutdown
            ;;
        "rollback")
            rollback_to_safe_version
            ;;
        "backup")
            create_safe_backup
            ;;
        "health-check")
            check_system_health
            ;;
        "auto")
            # Automatic response based on alerts
            if [ -f "/tmp/rsa-core-emergency.alert" ]; then
                ALERT_TYPE=$(grep -o "CRITICAL ALERT: \[[^]]*\]" /tmp/rsa-core-emergency.alert | head -1 | sed 's/.*\[\(.*\)\].*/\1/')
                case "$ALERT_TYPE" in
                    "MEMORY_CORRUPTION"|"MEMORY_GUARD_VIOLATION")
                        handle_memory_corruption
                        ;;
                    "RATE_LIMIT_EXCEEDED"|"TOO_MANY_OPERATIONS")
                        handle_rate_limit_exceeded
                        ;;
                    *)
                        emergency_shutdown
                        ;;
                esac
            else
                check_system_health
            fi
            ;;
        *)
            echo "RSA Core Emergency Rollback Script"
            echo "Usage: $0 {memory-corruption|rate-limit|emergency-shutdown|rollback|backup|health-check|auto}"
            echo ""
            echo "Commands:"
            echo "  memory-corruption   - Handle memory corruption incident"
            echo "  rate-limit          - Handle rate limiting incident"
            echo "  emergency-shutdown  - Immediate shutdown of all services"
            echo "  rollback           - Rollback to last known safe version"
            echo "  backup             - Create safe backup checkpoint"
            echo "  health-check       - Check system health"
            echo "  auto               - Automatic response based on alerts"
            exit 1
            ;;
    esac
}

# Ensure running as root
if [ "$EUID" -ne 0 ]; then
    echo "This script must be run as root for emergency operations"
    exit 1
fi

# Create necessary directories
mkdir -p "$LOG_DIR" "$RUN_DIR" "$BACKUP_DIR"

# Execute main function
main "$@"