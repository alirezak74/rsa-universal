#include "rsa_token.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <unistd.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <syslog.h>
#include <signal.h>
#include <pthread.h>

// CRITICAL MONITORING SYSTEM
// ==========================

#define RSA_MONITOR_LOG_FILE "/var/log/rsa-core/monitor.log"
#define RSA_ALERT_LOG_FILE "/var/log/rsa-core/alerts.log"
#define RSA_STATS_FILE "/var/run/rsa-core/stats.json"
#define RSA_MONITOR_INTERVAL 1  // Check every second

static volatile bool g_monitor_running = true;
static pthread_t g_monitor_thread;
static FILE *g_monitor_log = NULL;
static FILE *g_alert_log = NULL;

// Emergency shutdown handler
void rsa_emergency_shutdown(int sig) {
    (void)sig; // Suppress unused parameter warning
    rsa_trigger_alert("EMERGENCY_SHUTDOWN", "Emergency shutdown triggered by signal");
    g_monitor_running = false;
    
    // Force cleanup
    if (g_monitor_log) {
        fclose(g_monitor_log);
        g_monitor_log = NULL;
    }
    if (g_alert_log) {
        fclose(g_alert_log);
        g_alert_log = NULL;
    }
    
    exit(1);
}

// Initialize monitoring system
bool rsa_monitor_init(void) {
    // Create log directories
    int result1 = system("mkdir -p /var/log/rsa-core");
    int result2 = system("mkdir -p /var/run/rsa-core");
    (void)result1; (void)result2; // Suppress unused result warnings
    
    // Open log files
    g_monitor_log = fopen(RSA_MONITOR_LOG_FILE, "a");
    g_alert_log = fopen(RSA_ALERT_LOG_FILE, "a");
    
    if (!g_monitor_log || !g_alert_log) {
        fprintf(stderr, "CRITICAL: Failed to open monitoring log files\n");
        return false;
    }
    
    // Set up signal handlers for emergency shutdown
    signal(SIGTERM, rsa_emergency_shutdown);
    signal(SIGINT, rsa_emergency_shutdown);
    signal(SIGSEGV, rsa_emergency_shutdown);
    signal(SIGABRT, rsa_emergency_shutdown);
    
    // Initialize monitoring counters
    pthread_mutex_lock(&g_monitor_mutex);
    memset(&g_rsa_monitor, 0, sizeof(g_rsa_monitor));
    g_rsa_monitor.last_reset_time = rsa_get_current_time();
    pthread_mutex_unlock(&g_monitor_mutex);
    
    rsa_log_security_event("MONITOR_INIT", "Monitoring system initialized");
    return true;
}

// Write monitoring statistics to file
void rsa_write_stats(void) {
    FILE *stats_file = fopen(RSA_STATS_FILE, "w");
    if (!stats_file) return;
    
    pthread_mutex_lock(&g_monitor_mutex);
    
    fprintf(stats_file, "{\n");
    fprintf(stats_file, "  \"timestamp\": %lu,\n", rsa_get_current_time());
    fprintf(stats_file, "  \"concurrent_operations\": %lu,\n", g_rsa_monitor.concurrent_operations);
    fprintf(stats_file, "  \"total_operations\": %lu,\n", g_rsa_monitor.total_operations);
    fprintf(stats_file, "  \"memory_usage\": %lu,\n", g_rsa_monitor.memory_usage);
    fprintf(stats_file, "  \"corruption_detections\": %lu,\n", g_rsa_monitor.corruption_detections);
    fprintf(stats_file, "  \"max_concurrent_limit\": %d,\n", RSA_MAX_CONCURRENT_OPS);
    fprintf(stats_file, "  \"memory_threshold\": %d,\n", RSA_MEMORY_CORRUPTION_THRESHOLD);
    fprintf(stats_file, "  \"status\": \"%s\"\n", 
            (g_rsa_monitor.concurrent_operations < RSA_MAX_CONCURRENT_OPS) ? "OK" : "CRITICAL");
    fprintf(stats_file, "}\n");
    
    pthread_mutex_unlock(&g_monitor_mutex);
    
    fclose(stats_file);
}

// Check system health
bool rsa_check_system_health(void) {
    bool healthy = true;
    
    pthread_mutex_lock(&g_monitor_mutex);
    
    // Check operation limits
    if (g_rsa_monitor.concurrent_operations >= RSA_MAX_CONCURRENT_OPS) {
        rsa_trigger_alert("RATE_LIMIT_CRITICAL", "Operation rate limit exceeded");
        healthy = false;
    }
    
    // Check memory corruption
    if (g_rsa_monitor.corruption_detections > 0) {
        rsa_trigger_alert("MEMORY_CORRUPTION_DETECTED", "Memory corruption events detected");
        healthy = false;
    }
    
    // Check memory usage
    if (g_rsa_monitor.memory_usage > RSA_MEMORY_CORRUPTION_THRESHOLD) {
        rsa_trigger_alert("MEMORY_USAGE_HIGH", "Memory usage exceeds threshold");
        healthy = false;
    }
    
    pthread_mutex_unlock(&g_monitor_mutex);
    
    return healthy;
}

// Monitor thread function
void* rsa_monitor_thread_func(void* arg) {
    (void)arg; // Unused parameter
    
    while (g_monitor_running) {
        // Check system health
        bool healthy = rsa_check_system_health();
        
        // Write statistics
        rsa_write_stats();
        
        // Log monitoring data
        if (g_monitor_log) {
            time_t now = time(NULL);
            struct tm *tm_info = localtime(&now);
            char time_str[64];
            strftime(time_str, sizeof(time_str), "%Y-%m-%d %H:%M:%S", tm_info);
            
            pthread_mutex_lock(&g_monitor_mutex);
            fprintf(g_monitor_log, "[%s] OPS:%lu MEM:%lu CORRUPT:%lu STATUS:%s\n",
                    time_str,
                    g_rsa_monitor.concurrent_operations,
                    g_rsa_monitor.memory_usage,
                    g_rsa_monitor.corruption_detections,
                    healthy ? "OK" : "CRITICAL");
            fflush(g_monitor_log);
            pthread_mutex_unlock(&g_monitor_mutex);
        }
        
        // Reset counters if needed
        uint64_t current_time = rsa_get_current_time();
        pthread_mutex_lock(&g_monitor_mutex);
        if (current_time > g_rsa_monitor.last_reset_time + 1) {
            g_rsa_monitor.concurrent_operations = 0;
            g_rsa_monitor.last_reset_time = current_time;
        }
        pthread_mutex_unlock(&g_monitor_mutex);
        
        sleep(RSA_MONITOR_INTERVAL);
    }
    
    return NULL;
}

// Start monitoring thread
bool rsa_start_monitoring(void) {
    if (pthread_create(&g_monitor_thread, NULL, rsa_monitor_thread_func, NULL) != 0) {
        rsa_trigger_alert("MONITOR_START_FAILED", "Failed to start monitoring thread");
        return false;
    }
    
    rsa_log_security_event("MONITOR_STARTED", "Background monitoring thread started");
    return true;
}

// Stop monitoring thread
void rsa_stop_monitoring(void) {
    g_monitor_running = false;
    
    if (g_monitor_thread) {
        pthread_join(g_monitor_thread, NULL);
    }
    
    if (g_monitor_log) {
        fclose(g_monitor_log);
        g_monitor_log = NULL;
    }
    
    if (g_alert_log) {
        fclose(g_alert_log);
        g_alert_log = NULL;
    }
    
    rsa_log_security_event("MONITOR_STOPPED", "Monitoring system stopped");
}

// Get monitoring statistics
void rsa_get_monitor_stats(rsa_ops_monitor_t *stats) {
    if (!stats) return;
    
    pthread_mutex_lock(&g_monitor_mutex);
    memcpy(stats, &g_rsa_monitor, sizeof(rsa_ops_monitor_t));
    pthread_mutex_unlock(&g_monitor_mutex);
}

// Enhanced alert system with escalation
void rsa_trigger_critical_alert(const char *alert_type, const char *message) {
    // Log to syslog with high priority
    openlog("rsa-core-critical", LOG_PID | LOG_CONS, LOG_DAEMON);
    syslog(LOG_CRIT, "CRITICAL ALERT [%s]: %s", alert_type, message);
    closelog();
    
    // Write to alert log
    if (g_alert_log) {
        time_t now = time(NULL);
        struct tm *tm_info = localtime(&now);
        char time_str[64];
        strftime(time_str, sizeof(time_str), "%Y-%m-%d %H:%M:%S", tm_info);
        
        fprintf(g_alert_log, "[%s] CRITICAL: %s - %s\n", time_str, alert_type, message);
        fflush(g_alert_log);
    }
    
    // Write emergency alert file
    FILE *emergency = fopen("/tmp/rsa-core-emergency.alert", "w");
    if (emergency) {
        fprintf(emergency, "CRITICAL ALERT: %s\n%s\nTime: %lu\n", 
                alert_type, message, rsa_get_current_time());
        fclose(emergency);
    }
    
    // If too many corruption events, trigger emergency shutdown
    if (strcmp(alert_type, "MEMORY_CORRUPTION") == 0 && 
        g_rsa_monitor.corruption_detections > 10) {
        rsa_emergency_shutdown(SIGTERM);
    }
}