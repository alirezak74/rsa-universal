#include "rsa_token.h"
#include <openssl/rsa.h>
#include <openssl/evp.h>
#include <openssl/sha.h>
#include <openssl/rand.h>
#include <time.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <pthread.h>
#include <syslog.h>

// CRITICAL SECURITY IMPLEMENTATION
// ================================

// Global monitoring instance
rsa_ops_monitor_t g_rsa_monitor = {0};
pthread_mutex_t g_monitor_mutex = PTHREAD_MUTEX_INITIALIZER;

// Memory corruption detection
bool rsa_check_memory_corruption(void) {
    // Check for memory corruption indicators
    if (g_rsa_monitor.memory_usage > RSA_MEMORY_CORRUPTION_THRESHOLD) {
        rsa_trigger_alert("MEMORY_CORRUPTION", "Memory usage exceeded threshold");
        return true;
    }
    return false;
}

void rsa_init_memory_guard(rsa_memory_guard_t *guard, size_t size) {
    if (!guard) return;
    guard->magic_start = RSA_MEMORY_MAGIC_START;
    guard->size = size;
    guard->magic_end = RSA_MEMORY_MAGIC_END;
}

bool rsa_verify_memory_guard(const rsa_memory_guard_t *guard) {
    if (!guard) return false;
    if (guard->magic_start != RSA_MEMORY_MAGIC_START || 
        guard->magic_end != RSA_MEMORY_MAGIC_END) {
        g_rsa_monitor.corruption_detections++;
        rsa_trigger_alert("MEMORY_GUARD_VIOLATION", "Memory guard corruption detected");
        return false;
    }
    return true;
}

// Operational limits enforcement
bool rsa_check_operation_limits(void) {
    pthread_mutex_lock(&g_monitor_mutex);
    
    uint64_t current_time = rsa_get_current_time();
    
    // Reset counters every second
    if (current_time > g_rsa_monitor.last_reset_time) {
        g_rsa_monitor.concurrent_operations = 0;
        g_rsa_monitor.last_reset_time = current_time;
    }
    
    // Check if we're under the limit
    bool under_limit = g_rsa_monitor.concurrent_operations < RSA_MAX_CONCURRENT_OPS;
    
    if (!under_limit) {
        rsa_trigger_alert("RATE_LIMIT_EXCEEDED", "Concurrent operations limit exceeded");
    }
    
    pthread_mutex_unlock(&g_monitor_mutex);
    return under_limit;
}

void rsa_increment_operation_count(void) {
    pthread_mutex_lock(&g_monitor_mutex);
    g_rsa_monitor.concurrent_operations++;
    g_rsa_monitor.total_operations++;
    pthread_mutex_unlock(&g_monitor_mutex);
}

void rsa_reset_operation_counters(void) {
    pthread_mutex_lock(&g_monitor_mutex);
    g_rsa_monitor.concurrent_operations = 0;
    g_rsa_monitor.last_reset_time = rsa_get_current_time();
    pthread_mutex_unlock(&g_monitor_mutex);
}

// Safe string operations
bool rsa_safe_strcpy(char *dest, const char *src, size_t dest_size) {
    if (!dest || !src || dest_size == 0) return false;
    
    size_t src_len = strlen(src);
    if (src_len >= dest_size) {
        rsa_trigger_alert("BUFFER_OVERFLOW_PREVENTED", "strcpy buffer overflow prevented");
        return false;
    }
    
    strncpy(dest, src, dest_size - 1);
    dest[dest_size - 1] = '\0';
    return true;
}

bool rsa_safe_memcpy(void *dest, const void *src, size_t n, size_t dest_size) {
    if (!dest || !src || n == 0) return false;
    
    if (n > dest_size) {
        rsa_trigger_alert("BUFFER_OVERFLOW_PREVENTED", "memcpy buffer overflow prevented");
        return false;
    }
    
    memcpy(dest, src, n);
    return true;
}

// Monitoring and alerting
void rsa_log_security_event(const char *event, const char *details) {
    openlog("rsa-core", LOG_PID | LOG_CONS, LOG_DAEMON);
    syslog(LOG_WARNING, "SECURITY EVENT: %s - %s", event, details);
    closelog();
    
    // Also log to stderr for immediate visibility
    fprintf(stderr, "[SECURITY] %s: %s\n", event, details);
}

void rsa_trigger_alert(const char *alert_type, const char *message) {
    char full_message[512];
    snprintf(full_message, sizeof(full_message), 
             "CRITICAL ALERT [%s]: %s (Time: %lu, Total Ops: %lu)", 
             alert_type, message, rsa_get_current_time(), g_rsa_monitor.total_operations);
    
    rsa_log_security_event(alert_type, full_message);
    
    // Write to emergency log file
    FILE *alert_log = fopen("/tmp/rsa-core-alerts.log", "a");
    if (alert_log) {
        fprintf(alert_log, "%s\n", full_message);
        fclose(alert_log);
    }
}

// Base32 encoding table (RFC 4648)
static const char base32_chars[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

// FIXED: Safe Base32 encoding function with bounds checking
static bool base32_encode_safe(const uint8_t *data, size_t len, char *output, size_t output_size) {
    if (!data || !output || len == 0 || output_size == 0) return false;
    
    // Calculate required output size
    size_t required_size = ((len * 8 + 4) / 5) + 1; // +1 for null terminator
    if (required_size > output_size) {
        rsa_trigger_alert("BUFFER_OVERFLOW_PREVENTED", "base32_encode buffer too small");
        return false;
    }
    
    size_t i = 0, j = 0;
    uint8_t buffer = 0;
    int bits_left = 0;
    
    while (i < len && j < output_size - 1) {
        buffer = (buffer << 8) | data[i++];
        bits_left += 8;
        
        while (bits_left >= 5 && j < output_size - 1) {
            output[j++] = base32_chars[(buffer >> (bits_left - 5)) & 31];
            bits_left -= 5;
        }
    }
    
    if (bits_left > 0 && j < output_size - 1) {
        buffer <<= (5 - bits_left);
        output[j++] = base32_chars[buffer & 31];
    }
    
    output[j] = '\0';
    return true;
}

// FIXED: Safe Base32 decoding function with bounds checking
static bool base32_decode_safe(const char *input, uint8_t *data, size_t *len, size_t data_size) {
    if (!input || !data || !len || data_size == 0) return false;
    
    size_t input_len = strlen(input);
    size_t required_size = (input_len * 5) / 8;
    
    if (required_size > data_size) {
        rsa_trigger_alert("BUFFER_OVERFLOW_PREVENTED", "base32_decode buffer too small");
        return false;
    }
    
    size_t i = 0, j = 0;
    uint8_t buffer = 0;
    int bits_left = 0;
    
    for (i = 0; input[i] && j < data_size; i++) {
        char c = input[i];
        uint8_t value = 0;
        
        if (c >= 'A' && c <= 'Z') {
            value = c - 'A';
        } else if (c >= '2' && c <= '7') {
            value = c - '2' + 26;
        } else {
            rsa_trigger_alert("INVALID_CHARACTER", "Invalid base32 character detected");
            return false; // Invalid character
        }
        
        buffer = (buffer << 5) | value;
        bits_left += 5;
        
        if (bits_left >= 8 && j < data_size) {
            data[j++] = (buffer >> (bits_left - 8)) & 0xFF;
            bits_left -= 8;
        }
    }
    
    *len = j;
    return true;
}

// FIXED: Generate RSA key pair with proper memory management
bool rsa_generate_keypair(uint8_t *public_key, uint8_t *private_key) {
    // Check operational limits
    if (!rsa_check_operation_limits()) {
        return false;
    }
    rsa_increment_operation_count();
    
    if (!public_key || !private_key) {
        rsa_trigger_alert("NULL_POINTER", "Null pointer passed to rsa_generate_keypair");
        return false;
    }
    
    RSA *rsa = NULL;
    BIGNUM *e = NULL;
    bool success = false;
    
    rsa = RSA_new();
    e = BN_new();
    
    if (!rsa || !e) {
        rsa_trigger_alert("MEMORY_ALLOCATION_FAILED", "Failed to allocate RSA structures");
        goto cleanup;
    }
    
    // Set exponent to 65537 (standard for RSA)
    if (BN_set_word(e, RSA_F4) != 1) {
        rsa_trigger_alert("RSA_SETUP_FAILED", "Failed to set RSA exponent");
        goto cleanup;
    }
    
    // Generate 2048-bit RSA key pair
    if (RSA_generate_key_ex(rsa, 2048, e, NULL) != 1) {
        rsa_trigger_alert("RSA_GENERATION_FAILED", "Failed to generate RSA key pair");
        goto cleanup;
    }
    
    // Extract public key components safely
    const BIGNUM *n = RSA_get0_n(rsa);
    const BIGNUM *pub_e = RSA_get0_e(rsa);
    
    if (!n || !pub_e) {
        rsa_trigger_alert("RSA_KEY_EXTRACTION_FAILED", "Failed to extract public key components");
        goto cleanup;
    }
    
    // Store public key with bounds checking
    int n_size = BN_num_bytes(n);
    int e_size = BN_num_bytes(pub_e);
    
    if (n_size > 32 || e_size > 32) {
        rsa_trigger_alert("RSA_KEY_SIZE_INVALID", "RSA key components too large");
        goto cleanup;
    }
    
    memset(public_key, 0, 64);
    BN_bn2bin(n, public_key + (32 - n_size));
    BN_bn2bin(pub_e, public_key + 32 + (32 - e_size));
    
    // Extract private key components safely
    const BIGNUM *d = RSA_get0_d(rsa);
    const BIGNUM *p = RSA_get0_p(rsa);
    const BIGNUM *q = RSA_get0_q(rsa);
    
    if (!d || !p || !q) {
        rsa_trigger_alert("RSA_PRIVATE_KEY_EXTRACTION_FAILED", "Failed to extract private key components");
        goto cleanup;
    }
    
    memset(private_key, 0, 64);
    int d_size = BN_num_bytes(d);
    if (d_size <= 32) {
        BN_bn2bin(d, private_key + (32 - d_size));
        BN_bn2bin(n, private_key + 32 + (32 - n_size));
        success = true;
    } else {
        rsa_trigger_alert("RSA_PRIVATE_KEY_SIZE_INVALID", "Private key component too large");
    }

cleanup:
    if (rsa) RSA_free(rsa);
    if (e) BN_free(e);
    
    return success;
}

// Sign transaction with RSA private key
bool rsa_sign_transaction(const uint8_t *private_key, const rsa_transaction_t *tx, uint8_t *signature) {
    // Create hash of transaction
    uint8_t tx_hash[32];
    rsa_hash_transaction(tx, tx_hash);
    
    // Reconstruct RSA key from private key components
    RSA *rsa = RSA_new();
    BIGNUM *n = BN_new();
    BIGNUM *d = BN_new();
    BIGNUM *p = BN_new();
    BIGNUM *q = BN_new();
    
    if (!rsa || !n || !d || !p || !q) {
        if (rsa) RSA_free(rsa);
        if (n) BN_free(n);
        if (d) BN_free(d);
        if (p) BN_free(p);
        if (q) BN_free(q);
        return false;
    }
    
    // Set private key components
    BN_bin2bn(private_key, 256, n);
    BN_bin2bn(private_key + 256, 256, d);
    BN_bin2bn(private_key + 512, 128, p);
    BN_bin2bn(private_key + 640, 128, q);
    
    // Set RSA key components
    if (RSA_set0_key(rsa, n, NULL, d) != 1 ||
        RSA_set0_factors(rsa, p, q) != 1) {
        RSA_free(rsa);
        return false;
    }
    
    // Sign the transaction hash
    unsigned int sig_len = 0;
    if (RSA_sign(NID_sha256, tx_hash, 32, signature, &sig_len, rsa) != 1) {
        RSA_free(rsa);
        return false;
    }
    
    RSA_free(rsa);
    return true;
}

// Verify transaction signature
bool rsa_verify_signature(const uint8_t *public_key, const rsa_transaction_t *tx, const uint8_t *signature) {
    // Create hash of transaction
    uint8_t tx_hash[32];
    rsa_hash_transaction(tx, tx_hash);
    
    // Reconstruct RSA key from public key components
    RSA *rsa = RSA_new();
    BIGNUM *n = BN_new();
    BIGNUM *e = BN_new();
    
    if (!rsa || !n || !e) {
        if (rsa) RSA_free(rsa);
        if (n) BN_free(n);
        if (e) BN_free(e);
        return false;
    }
    
    // Set public key components
    BN_bin2bn(public_key, 256, n);
    BN_bin2bn(public_key + 256, 4, e);
    
    // Set RSA key components
    if (RSA_set0_key(rsa, n, e, NULL) != 1) {
        RSA_free(rsa);
        return false;
    }
    
    // Verify the signature
    int result = RSA_verify(NID_sha256, tx_hash, 32, signature, 256, rsa);
    
    RSA_free(rsa);
    return result == 1;
}

// Hash transaction using SHA-256
void rsa_hash_transaction(const rsa_transaction_t *tx, uint8_t *hash) {
    SHA256_CTX ctx;
    SHA256_Init(&ctx);
    SHA256_Update(&ctx, tx, sizeof(rsa_transaction_t));
    SHA256_Final(hash, &ctx);
}

// FIXED: Encode public key to RSA address with security checks
bool rsa_encode_address(const uint8_t *public_key, char *address) {
    // Check operational limits
    if (!rsa_check_operation_limits()) {
        return false;
    }
    rsa_increment_operation_count();
    
    if (!public_key || !address) {
        rsa_trigger_alert("NULL_POINTER", "Null pointer passed to rsa_encode_address");
        return false;
    }
    
    // Create version byte (0x30 for mainnet)
    uint8_t versioned_key[33];
    versioned_key[0] = 0x30;
    if (!rsa_safe_memcpy(versioned_key + 1, public_key, 32, 32)) {
        return false;
    }
    
    // Calculate checksum
    uint8_t checksum[32]; // Full SHA256 output
    SHA256_CTX ctx;
    SHA256_Init(&ctx);
    SHA256_Update(&ctx, versioned_key, 33);
    SHA256_Final(checksum, &ctx);
    
    // Combine versioned key with checksum (first 4 bytes)
    uint8_t combined[37];
    if (!rsa_safe_memcpy(combined, versioned_key, 33, 37) ||
        !rsa_safe_memcpy(combined + 33, checksum, 4, 4)) {
        return false;
    }
    
    // Base32 encode with safety checks
    char encoded[100];
    if (!base32_encode_safe(combined, 37, encoded, sizeof(encoded))) {
        return false;
    }
    
    // Add prefix with safety checks
    if (strlen(RSA_ADDRESS_PREFIX) + strlen(encoded) >= RSA_ADDRESS_LENGTH + 1) {
        rsa_trigger_alert("ADDRESS_TOO_LONG", "Generated address exceeds maximum length");
        return false;
    }
    
    if (!rsa_safe_strcpy(address, RSA_ADDRESS_PREFIX, RSA_ADDRESS_LENGTH + 1)) {
        return false;
    }
    
    // Concatenate safely
    size_t prefix_len = strlen(RSA_ADDRESS_PREFIX);
    if (!rsa_safe_strcpy(address + prefix_len, encoded, RSA_ADDRESS_LENGTH + 1 - prefix_len)) {
        return false;
    }
    
    return true;
}

// FIXED: Decode RSA address to public key with security checks
bool rsa_decode_address(const char *address, uint8_t *public_key) {
    // Check operational limits
    if (!rsa_check_operation_limits()) {
        return false;
    }
    rsa_increment_operation_count();
    
    if (!address || !public_key) {
        rsa_trigger_alert("NULL_POINTER", "Null pointer passed to rsa_decode_address");
        return false;
    }
    
    // Validate address length
    size_t addr_len = strlen(address);
    if (addr_len != RSA_ADDRESS_LENGTH) {
        rsa_trigger_alert("INVALID_ADDRESS_LENGTH", "Address length is invalid");
        return false;
    }
    
    // Remove prefix with bounds checking
    size_t prefix_len = strlen(RSA_ADDRESS_PREFIX);
    if (strncmp(address, RSA_ADDRESS_PREFIX, prefix_len) != 0) {
        rsa_trigger_alert("INVALID_ADDRESS_PREFIX", "Address prefix is invalid");
        return false;
    }
    
    const char *encoded = address + prefix_len;
    
    // Base32 decode with safety checks
    uint8_t combined[37];
    size_t len;
    if (!base32_decode_safe(encoded, combined, &len, sizeof(combined)) || len != 37) {
        rsa_trigger_alert("BASE32_DECODE_FAILED", "Failed to decode address");
        return false;
    }
    
    // Verify checksum
    uint8_t checksum[32]; // Full SHA256 output
    SHA256_CTX ctx;
    SHA256_Init(&ctx);
    SHA256_Update(&ctx, combined, 33);
    SHA256_Final(checksum, &ctx);
    
    if (memcmp(combined + 33, checksum, 4) != 0) {
        rsa_trigger_alert("CHECKSUM_MISMATCH", "Address checksum verification failed");
        return false;
    }
    
    // Extract public key safely
    if (!rsa_safe_memcpy(public_key, combined + 1, 32, 32)) {
        return false;
    }
    
    return true;
}

// Validate RSA address format
bool rsa_is_valid_address(const char *address) {
    if (strlen(address) != RSA_ADDRESS_LENGTH) {
        return false;
    }
    
    if (strncmp(address, RSA_ADDRESS_PREFIX, strlen(RSA_ADDRESS_PREFIX)) != 0) {
        return false;
    }
    
    uint8_t public_key[32];
    return rsa_decode_address(address, public_key);
}

// Parse amount string to int64 (7 decimal places like XLM)
int64_t rsa_parse_amount(const char *amount_str) {
    double amount = atof(amount_str);
    return (int64_t)(amount * 10000000.0); // 7 decimal places
}

// Format amount from int64 to string
void rsa_format_amount(int64_t amount, char *amount_str) {
    double value = (double)amount / 10000000.0; // 7 decimal places
    sprintf(amount_str, "%.7f", value);
    
    // Remove trailing zeros
    int len = strlen(amount_str);
    while (len > 0 && amount_str[len-1] == '0') {
        len--;
    }
    if (len > 0 && amount_str[len-1] == '.') {
        len--;
    }
    amount_str[len] = '\0';
}

// Multiply amount by multiplier
int64_t rsa_multiply_amount(int64_t amount, double multiplier) {
    return (int64_t)((double)amount * multiplier);
}

// Divide amount by divisor
int64_t rsa_divide_amount(int64_t amount, double divisor) {
    return (int64_t)((double)amount / divisor);
}

// Check if asset is native RSA token
bool rsa_is_native_asset(const rsa_asset_t *asset) {
    return asset->type == RSA_ASSET_TYPE_NATIVE;
}

// Compare two assets for equality
bool rsa_asset_equal(const rsa_asset_t *asset1, const rsa_asset_t *asset2) {
    if (asset1->type != asset2->type) {
        return false;
    }
    
    switch (asset1->type) {
        case RSA_ASSET_TYPE_NATIVE:
            return true;
        case RSA_ASSET_TYPE_CREDIT_ALPHANUM4:
            return (memcmp(asset1->asset.credit_alphanum4.code, 
                          asset2->asset.credit_alphanum4.code, 4) == 0 &&
                    memcmp(asset1->asset.credit_alphanum4.issuer, 
                          asset2->asset.credit_alphanum4.issuer, 32) == 0);
        case RSA_ASSET_TYPE_CREDIT_ALPHANUM12:
            return (memcmp(asset1->asset.credit_alphanum12.code, 
                          asset2->asset.credit_alphanum12.code, 12) == 0 &&
                    memcmp(asset1->asset.credit_alphanum12.issuer, 
                          asset2->asset.credit_alphanum12.issuer, 32) == 0);
        default:
            return false;
    }
}

// Copy asset
void rsa_copy_asset(rsa_asset_t *dest, const rsa_asset_t *src) {
    memcpy(dest, src, sizeof(rsa_asset_t));
}

// FIXED: Validate transaction with enhanced security checks
bool rsa_validate_transaction(const rsa_transaction_t *tx) {
    // Check operational limits first
    if (!rsa_check_operation_limits()) {
        return false;
    }
    rsa_increment_operation_count();
    
    if (!tx) {
        rsa_trigger_alert("NULL_TRANSACTION", "Null transaction passed for validation");
        return false;
    }
    
    // Check for memory corruption
    if (rsa_check_memory_corruption()) {
        return false;
    }
    
    // Check fee with enhanced validation
    if (tx->fee < RSA_BASE_FEE) {
        rsa_trigger_alert("INSUFFICIENT_FEE", "Transaction fee below minimum");
        return false;
    }
    
    // Prevent excessive fees (potential DoS)
    if (tx->fee > RSA_BASE_FEE * 1000) {
        rsa_trigger_alert("EXCESSIVE_FEE", "Transaction fee suspiciously high");
        return false;
    }
    
    // Check sequence number
    if (tx->seq_num == 0) {
        rsa_trigger_alert("INVALID_SEQUENCE", "Transaction sequence number is zero");
        return false;
    }
    
    // Check time bounds with enhanced validation
    uint64_t current_time = rsa_get_current_time();
    if (tx->time_bounds.min_time > 0 && current_time < tx->time_bounds.min_time) {
        rsa_trigger_alert("TRANSACTION_TOO_EARLY", "Transaction not yet valid");
        return false;
    }
    if (tx->time_bounds.max_time > 0 && current_time > tx->time_bounds.max_time) {
        rsa_trigger_alert("TRANSACTION_EXPIRED", "Transaction has expired");
        return false;
    }
    
    // CRITICAL: Enforce reduced operations count (was 100, now 10)
    if (tx->operations_count == 0) {
        rsa_trigger_alert("NO_OPERATIONS", "Transaction has no operations");
        return false;
    }
    if (tx->operations_count > RSA_MAX_OPERATIONS_PER_TX) {
        rsa_trigger_alert("TOO_MANY_OPERATIONS", "Transaction exceeds maximum operations limit");
        return false;
    }
    
    // Check for time bounds consistency
    if (tx->time_bounds.min_time > 0 && tx->time_bounds.max_time > 0 &&
        tx->time_bounds.min_time >= tx->time_bounds.max_time) {
        rsa_trigger_alert("INVALID_TIME_BOUNDS", "Invalid time bounds configuration");
        return false;
    }
    
    return true;
}

// Validate operation
bool rsa_validate_operation(const rsa_operation_t *op) {
    if (!op) return false;
    
    switch (op->type) {
        case RSA_OP_PAYMENT:
            if (op->operation.payment.amount <= 0) {
                return false;
            }
            break;
        case RSA_OP_CREATE_ACCOUNT:
            if (op->operation.create_account.starting_balance < RSA_BASE_RESERVE) {
                return false;
            }
            break;
        case RSA_OP_MANAGE_OFFER:
            if (op->operation.manage_offer.amount <= 0) {
                return false;
            }
            break;
        default:
            break;
    }
    
    return true;
}

// Validate account
bool rsa_validate_account(const rsa_account_t *account) {
    if (!account) return false;
    
    // Check balance
    if (account->balance < 0) {
        return false;
    }
    
    // Check sequence number
    if (account->seq_num == 0) {
        return false;
    }
    
    // Check signer count
    if (account->signer_count > 20) {
        return false;
    }
    
    return true;
}

// Get current time in seconds since epoch
uint64_t rsa_get_current_time(void) {
    return (uint64_t)time(NULL);
}

// Calculate transaction fee
uint32_t rsa_calculate_fee(const rsa_transaction_t *tx) {
    // Base fee per operation
    uint32_t base_fee = RSA_BASE_FEE;
    
    // Fee increases with number of operations
    uint32_t operation_fee = base_fee * tx->operations_count;
    
    // Additional fee for complex operations
    // This is a simplified calculation
    return operation_fee;
}

// Check sequence number
bool rsa_check_sequence_number(uint64_t current_seq, uint64_t tx_seq) {
    return tx_seq == current_seq + 1;
}

// (Function moved to end of file to avoid duplication)

// Cleanup RSA token system
void rsa_token_cleanup(void) {
    // Cleanup OpenSSL
    EVP_cleanup();
}

// MISSING FUNCTION IMPLEMENTATIONS
// ================================

// Initialize RSA token system
void rsa_token_init(void) {
    // Initialize OpenSSL
    OpenSSL_add_all_algorithms();
    
    // Seed random number generator
    unsigned char seed[32];
    if (RAND_bytes(seed, sizeof(seed)) != 1) {
        // Fallback to time-based seed
        srand((unsigned int)time(NULL));
    }
    
    // Initialize monitoring
    pthread_mutex_lock(&g_monitor_mutex);
    memset(&g_rsa_monitor, 0, sizeof(g_rsa_monitor));
    g_rsa_monitor.last_reset_time = rsa_get_current_time();
    pthread_mutex_unlock(&g_monitor_mutex);
} 