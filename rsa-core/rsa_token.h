#ifndef RSA_TOKEN_H
#define RSA_TOKEN_H

#include <stdint.h>
#include <stdbool.h>
#include <string.h>
#include <pthread.h>

// CRITICAL SECURITY CONFIGURATION
// ===============================
#define RSA_MAX_CONCURRENT_OPS 100        // Limit to <100 concurrent operations/sec
#define RSA_MAX_BUFFER_SIZE 4096          // Maximum buffer size to prevent overflow
#define RSA_MAX_OPERATIONS_PER_TX 10      // Reduced from 100 to prevent DoS
#define RSA_MEMORY_CORRUPTION_THRESHOLD 1048576  // 1MB memory threshold
#define RSA_MAX_ADDRESS_DECODE_ATTEMPTS 3 // Limit decode attempts
#define RSA_SAFE_STRING_LENGTH 256        // Safe string buffer length

// Memory corruption detection
typedef struct {
    uint32_t magic_start;
    size_t size;
    uint32_t magic_end;
} rsa_memory_guard_t;

#define RSA_MEMORY_MAGIC_START 0xDEADBEEF
#define RSA_MEMORY_MAGIC_END   0xCAFEBABE

// Operational monitoring
typedef struct {
    uint64_t concurrent_operations;
    uint64_t total_operations;
    uint64_t memory_usage;
    uint64_t last_reset_time;
    uint64_t corruption_detections;
} rsa_ops_monitor_t;

// Global monitoring instance
extern rsa_ops_monitor_t g_rsa_monitor;
extern pthread_mutex_t g_monitor_mutex;

// RSA Token Specification (Based on XLM/Stellar Lumens)
// ===================================================

// Token Basic Information
#define RSA_TOKEN_NAME "RSA CRYPTO"
#define RSA_TOKEN_SYMBOL "RSA"
#define RSA_TOKEN_DECIMALS 7  // Same as XLM (7 decimal places)
#define RSA_TOKEN_TOTAL_SUPPLY 100000000000  // 100 billion RSA (same as XLM initial supply)
#define RSA_TOKEN_MAX_SUPPLY 100000000000   // Fixed supply like XLM

// Token Address Format (Base32 encoded, similar to XLM)
#define RSA_ADDRESS_LENGTH 56
#define RSA_ADDRESS_PREFIX "RSA"
#define RSA_PUBLIC_KEY_LENGTH 32
#define RSA_PRIVATE_KEY_LENGTH 64

// Transaction Types (similar to Stellar)
typedef enum {
    RSA_TX_PAYMENT = 0,
    RSA_TX_CREATE_ACCOUNT = 1,
    RSA_TX_PATH_PAYMENT = 2,
    RSA_TX_MANAGE_OFFER = 3,
    RSA_TX_CREATE_PASSIVE_OFFER = 4,
    RSA_TX_SET_OPTIONS = 5,
    RSA_TX_CHANGE_TRUST = 6,
    RSA_TX_ALLOW_TRUST = 7,
    RSA_TX_ACCOUNT_MERGE = 8,
    RSA_TX_INFLATION = 9,
    RSA_TX_MANAGE_DATA = 10,
    RSA_TX_BUMP_SEQUENCE = 11
} rsa_transaction_type_t;

// Account Flags (similar to Stellar)
typedef enum {
    RSA_AUTH_REQUIRED_FLAG = 0x00000001,
    RSA_AUTH_REVOCABLE_FLAG = 0x00000002,
    RSA_AUTH_IMMUTABLE_FLAG = 0x00000004
} rsa_account_flags_t;

// Trust Line Flags
typedef enum {
    RSA_TRUSTLINE_AUTHORIZED_FLAG = 0x00000001,
    RSA_TRUSTLINE_AUTHORIZED_TO_MAINTAIN_LIABILITIES_FLAG = 0x00000002,
    RSA_TRUSTLINE_UNAUTHORIZED_FLAG = 0x00000000
} rsa_trustline_flags_t;

// Asset Types
typedef enum {
    RSA_ASSET_TYPE_NATIVE = 0,
    RSA_ASSET_TYPE_CREDIT_ALPHANUM4 = 1,
    RSA_ASSET_TYPE_CREDIT_ALPHANUM12 = 2
} rsa_asset_type_t;

// Thresholds (similar to Stellar)
typedef struct {
    uint8_t master_weight;
    uint8_t low;
    uint8_t medium;
    uint8_t high;
} rsa_thresholds_t;

// Signer (similar to Stellar)
typedef struct {
    uint8_t key[32];
    uint32_t weight;
} rsa_signer_t;

// Asset (similar to Stellar)
typedef struct {
    rsa_asset_type_t type;
    union {
        struct {
            char code[4];
            uint8_t issuer[32];
        } credit_alphanum4;
        struct {
            char code[12];
            uint8_t issuer[32];
        } credit_alphanum12;
    } asset;
} rsa_asset_t;

// Price (similar to Stellar)
typedef struct {
    int32_t n;  // numerator
    int32_t d;  // denominator
} rsa_price_t;

// Time Bounds
typedef struct {
    uint64_t min_time;
    uint64_t max_time;
} rsa_time_bounds_t;

// Memo Types
typedef enum {
    RSA_MEMO_NONE = 0,
    RSA_MEMO_TEXT = 1,
    RSA_MEMO_ID = 2,
    RSA_MEMO_HASH = 3,
    RSA_MEMO_RETURN = 4
} rsa_memo_type_t;

// Memo
typedef struct {
    rsa_memo_type_t type;
    union {
        char text[28];
        uint64_t id;
        uint8_t hash[32];
        uint8_t ret_hash[32];
    } memo;
} rsa_memo_t;

// Transaction Envelope
typedef struct {
    uint32_t tx_source_account[8];  // 256-bit account ID
    uint32_t fee;
    uint64_t seq_num;
    rsa_time_bounds_t time_bounds;
    rsa_memo_t memo;
    uint32_t operations_count;
    // Operations array follows
} rsa_transaction_t;

// Operation Types
typedef enum {
    RSA_OP_CREATE_ACCOUNT = 0,
    RSA_OP_PAYMENT = 1,
    RSA_OP_PATH_PAYMENT = 2,
    RSA_OP_MANAGE_OFFER = 3,
    RSA_OP_CREATE_PASSIVE_OFFER = 4,
    RSA_OP_SET_OPTIONS = 5,
    RSA_OP_CHANGE_TRUST = 6,
    RSA_OP_ALLOW_TRUST = 7,
    RSA_OP_ACCOUNT_MERGE = 8,
    RSA_OP_INFLATION = 9,
    RSA_OP_MANAGE_DATA = 10,
    RSA_OP_BUMP_SEQUENCE = 11
} rsa_operation_type_t;

// Operation
typedef struct {
    rsa_operation_type_t type;
    union {
        struct {
            uint32_t destination[8];
            int64_t starting_balance;
        } create_account;
        
        struct {
            rsa_asset_t asset;
            uint32_t from[8];
            uint32_t to[8];
            int64_t amount;
        } payment;
        
        struct {
            rsa_asset_t send_asset;
            int64_t send_max;
            uint32_t destination[8];
            rsa_asset_t dest_asset;
            int64_t dest_amount;
            rsa_asset_t path[5];  // Max 5 assets in path
            uint32_t path_len;
        } path_payment;
        
        struct {
            rsa_asset_t selling;
            rsa_asset_t buying;
            int64_t amount;
            rsa_price_t price;
            uint32_t offer_id;
        } manage_offer;
        
        struct {
            uint32_t thresholds;
            uint32_t home_domain_len;
            char home_domain[32];
            uint32_t signer_count;
            rsa_signer_t signers[20];  // Max 20 signers
        } set_options;
        
        struct {
            rsa_asset_t asset;
            int64_t limit;
        } change_trust;
        
        struct {
            uint32_t trustor[8];
            rsa_asset_t asset;
            uint32_t authorize;
        } allow_trust;
        
        struct {
            uint32_t destination[8];
        } account_merge;
        
        struct {
            uint32_t data_name_len;
            char data_name[64];
            uint32_t data_value_len;
            uint8_t data_value[64];
        } manage_data;
        
        struct {
            uint64_t bump_to;
        } bump_sequence;
    } operation;
} rsa_operation_t;

// Account Entry
typedef struct {
    uint32_t account_id[8];
    int64_t balance;
    uint64_t seq_num;
    uint32_t num_sub_entries;
    uint32_t inflation_dest[8];
    uint32_t flags;
    rsa_thresholds_t thresholds;
    uint32_t home_domain_len;
    char home_domain[32];
    uint32_t signer_count;
    rsa_signer_t signers[20];
    uint32_t reserved[4];
} rsa_account_t;

// Trust Line Entry
typedef struct {
    uint32_t account_id[8];
    rsa_asset_t asset;
    int64_t balance;
    int64_t limit;
    uint32_t flags;
    uint32_t reserved[2];
} rsa_trustline_t;

// Offer Entry
typedef struct {
    uint32_t seller_id[8];
    uint64_t offer_id;
    rsa_asset_t selling;
    rsa_asset_t buying;
    int64_t amount;
    rsa_price_t price;
    uint32_t flags;
    uint32_t reserved[2];
} rsa_offer_t;

// Data Entry
typedef struct {
    uint32_t account_id[8];
    uint32_t data_name_len;
    char data_name[64];
    uint32_t data_value_len;
    uint8_t data_value[64];
    uint32_t reserved[2];
} rsa_data_t;

// Ledger Header
typedef struct {
    uint32_t ledger_version;
    uint32_t previous_ledger_hash[8];
    uint64_t scp_value[8];
    uint64_t close_time;
    uint32_t close_time_res;
    uint32_t base_fee;
    uint32_t base_reserve;
    uint32_t max_tx_set_size;
    uint32_t skip_list[4][8];
    uint32_t ext[4];
} rsa_ledger_header_t;

// Network Configuration
#define RSA_NETWORK_PASSPHRASE "RSA Chain Network ; 2025"
#define RSA_NETWORK_ID "RSA_CHAIN_MAINNET"
#define RSA_BASE_RESERVE 5000000  // 0.5 RSA (same as XLM)
#define RSA_BASE_FEE 100          // 0.00001 RSA (same as XLM)
#define RSA_MAX_TX_SET_SIZE 1000  // Same as XLM

// Inflation Configuration
#define RSA_INFLATION_RATE 0.01   // 1% annual inflation (same as XLM)
#define RSA_INFLATION_POOL_SIZE 1000000000  // 1 billion RSA for inflation pool
#define RSA_INFLATION_WEEKLY_NUMBER 52      // Weekly inflation distribution

// CRITICAL SECURITY FUNCTIONS
// ===========================

// Memory corruption detection
bool rsa_check_memory_corruption(void);
void rsa_init_memory_guard(rsa_memory_guard_t *guard, size_t size);
bool rsa_verify_memory_guard(const rsa_memory_guard_t *guard);

// Operational limits enforcement
bool rsa_check_operation_limits(void);
void rsa_increment_operation_count(void);
void rsa_reset_operation_counters(void);

// Safe string operations
bool rsa_safe_strcpy(char *dest, const char *src, size_t dest_size);
bool rsa_safe_memcpy(void *dest, const void *src, size_t n, size_t dest_size);

// Monitoring and alerting
void rsa_log_security_event(const char *event, const char *details);
void rsa_trigger_alert(const char *alert_type, const char *message);

// Cryptographic Functions
bool rsa_generate_keypair(uint8_t *public_key, uint8_t *private_key);
bool rsa_sign_transaction(const uint8_t *private_key, const rsa_transaction_t *tx, uint8_t *signature);
bool rsa_verify_signature(const uint8_t *public_key, const rsa_transaction_t *tx, const uint8_t *signature);
void rsa_hash_transaction(const rsa_transaction_t *tx, uint8_t *hash);

// Address Functions
bool rsa_encode_address(const uint8_t *public_key, char *address);
bool rsa_decode_address(const char *address, uint8_t *public_key);
bool rsa_is_valid_address(const char *address);

// Amount Functions
int64_t rsa_parse_amount(const char *amount_str);
void rsa_format_amount(int64_t amount, char *amount_str);
int64_t rsa_multiply_amount(int64_t amount, double multiplier);
int64_t rsa_divide_amount(int64_t amount, double divisor);

// Asset Functions
bool rsa_is_native_asset(const rsa_asset_t *asset);
bool rsa_asset_equal(const rsa_asset_t *asset1, const rsa_asset_t *asset2);
void rsa_copy_asset(rsa_asset_t *dest, const rsa_asset_t *src);

// Validation Functions
bool rsa_validate_transaction(const rsa_transaction_t *tx);
bool rsa_validate_operation(const rsa_operation_t *op);
bool rsa_validate_account(const rsa_account_t *account);

// Utility Functions
uint64_t rsa_get_current_time(void);
uint32_t rsa_calculate_fee(const rsa_transaction_t *tx);
bool rsa_check_sequence_number(uint64_t current_seq, uint64_t tx_seq);

// System initialization and cleanup
void rsa_token_init(void);
void rsa_token_cleanup(void);

// Monitoring functions declarations
bool rsa_monitor_init(void);
bool rsa_start_monitoring(void);
void rsa_stop_monitoring(void);
void rsa_get_monitor_stats(rsa_ops_monitor_t *stats);

#endif // RSA_TOKEN_H 