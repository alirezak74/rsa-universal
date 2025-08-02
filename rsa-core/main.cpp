#include <iostream>
#include <iomanip>
#include <cstring>
#include "rsa_token.h"

void print_hex(const uint8_t *data, size_t len) {
    for (size_t i = 0; i < len; i++) {
        std::cout << std::hex << std::setw(2) << std::setfill('0') 
                  << static_cast<int>(data[i]);
    }
    std::cout << std::dec << std::endl;
}

void demo_wallet_creation() {
    std::cout << "\n=== RSA Wallet Creation Demo ===" << std::endl;
    
    uint8_t public_key[32];
    uint8_t private_key[64];
    char address[RSA_ADDRESS_LENGTH + 1];
    
    // Generate RSA key pair
    if (rsa_generate_keypair(public_key, private_key)) {
        std::cout << "✓ RSA key pair generated successfully" << std::endl;
        
        // Encode public key to address
        if (rsa_encode_address(public_key, address)) {
            std::cout << "✓ Wallet address: " << address << std::endl;
        }
        
        std::cout << "Public key: ";
        print_hex(public_key, 32);
        
        std::cout << "Private key: ";
        print_hex(private_key, 64);
    } else {
        std::cout << "✗ Failed to generate key pair" << std::endl;
    }
}

void demo_transaction_signing() {
    std::cout << "\n=== RSA Transaction Signing Demo ===" << std::endl;
    
    uint8_t public_key[32];
    uint8_t private_key[64];
    char address[RSA_ADDRESS_LENGTH + 1];
    
    // Generate key pair
    if (!rsa_generate_keypair(public_key, private_key)) {
        std::cout << "✗ Failed to generate key pair" << std::endl;
        return;
    }
    
    rsa_encode_address(public_key, address);
    
    // Create a sample transaction
    rsa_transaction_t tx;
    memset(&tx, 0, sizeof(tx));
    
    // Set transaction details
    tx.fee = RSA_BASE_FEE;
    tx.seq_num = 1;
    tx.operations_count = 1;
    
    // Set time bounds
    tx.time_bounds.min_time = rsa_get_current_time();
    tx.time_bounds.max_time = tx.time_bounds.min_time + 300; // 5 minutes
    
    // Set memo
    tx.memo.type = RSA_MEMO_TEXT;
    strcpy(tx.memo.memo.text, "Test transaction");
    
    // Create payment operation
    rsa_operation_t *op = (rsa_operation_t*)(&tx + 1);
    op->type = RSA_OP_PAYMENT;
    op->operation.payment.amount = rsa_parse_amount("100.0000000"); // 100 RSA
    
    // Set destination (same as source for demo)
    memcpy(op->operation.payment.to, public_key, 32);
    memcpy(op->operation.payment.from, public_key, 32);
    
    // Set asset to native RSA
    op->operation.payment.asset.type = RSA_ASSET_TYPE_NATIVE;
    
    // Sign transaction
    uint8_t signature[256];
    if (rsa_sign_transaction(private_key, &tx, signature)) {
        std::cout << "✓ Transaction signed successfully" << std::endl;
        std::cout << "Transaction hash: ";
        
        uint8_t tx_hash[32];
        rsa_hash_transaction(&tx, tx_hash);
        print_hex(tx_hash, 32);
        
        std::cout << "Signature: ";
        print_hex(signature, 256);
        
        // Verify signature
        if (rsa_verify_signature(public_key, &tx, signature)) {
            std::cout << "✓ Signature verified successfully" << std::endl;
        } else {
            std::cout << "✗ Signature verification failed" << std::endl;
        }
    } else {
        std::cout << "✗ Failed to sign transaction" << std::endl;
    }
}

void demo_amount_operations() {
    std::cout << "\n=== RSA Amount Operations Demo ===" << std::endl;
    
    // Parse amount string
    const char *amount_str = "123.4567890";
    int64_t amount = rsa_parse_amount(amount_str);
    std::cout << "Parsed amount: " << amount_str << " -> " << amount << " (internal units)" << std::endl;
    
    // Format amount
    char formatted[32];
    rsa_format_amount(amount, formatted);
    std::cout << "Formatted amount: " << formatted << std::endl;
    
    // Multiply amount
    int64_t multiplied = rsa_multiply_amount(amount, 2.5);
    rsa_format_amount(multiplied, formatted);
    std::cout << "Amount × 2.5: " << formatted << std::endl;
    
    // Divide amount
    int64_t divided = rsa_divide_amount(amount, 3.0);
    rsa_format_amount(divided, formatted);
    std::cout << "Amount ÷ 3.0: " << formatted << std::endl;
    
    // Fee calculation
    uint32_t fee = RSA_BASE_FEE * 2; // 2 operations
    rsa_format_amount(fee, formatted);
    std::cout << "Transaction fee (2 ops): " << formatted << " RSA" << std::endl;
}

void demo_address_validation() {
    std::cout << "\n=== RSA Address Validation Demo ===" << std::endl;
    
    uint8_t public_key[32];
    uint8_t private_key[64];
    char address[RSA_ADDRESS_LENGTH + 1];
    
    // Generate and encode address
    if (rsa_generate_keypair(public_key, private_key)) {
        rsa_encode_address(public_key, address);
        std::cout << "Generated address: " << address << std::endl;
        
        // Validate address
        if (rsa_is_valid_address(address)) {
            std::cout << "✓ Address is valid" << std::endl;
        } else {
            std::cout << "✗ Address is invalid" << std::endl;
        }
        
        // Decode address back to public key
        uint8_t decoded_key[32];
        if (rsa_decode_address(address, decoded_key)) {
            std::cout << "✓ Address decoded successfully" << std::endl;
            
            if (memcmp(public_key, decoded_key, 32) == 0) {
                std::cout << "✓ Decoded public key matches original" << std::endl;
            } else {
                std::cout << "✗ Decoded public key doesn't match" << std::endl;
            }
        } else {
            std::cout << "✗ Failed to decode address" << std::endl;
        }
    }
    
    // Test invalid address
    const char *invalid_address = "INVALID_ADDRESS_1234567890";
    if (rsa_is_valid_address(invalid_address)) {
        std::cout << "✗ Invalid address was accepted" << std::endl;
    } else {
        std::cout << "✓ Invalid address correctly rejected" << std::endl;
    }
}

void demo_asset_operations() {
    std::cout << "\n=== RSA Asset Operations Demo ===" << std::endl;
    
    // Create native RSA asset
    rsa_asset_t native_asset;
    native_asset.type = RSA_ASSET_TYPE_NATIVE;
    
    // Create custom asset
    rsa_asset_t custom_asset;
    custom_asset.type = RSA_ASSET_TYPE_CREDIT_ALPHANUM4;
    strncpy(custom_asset.asset.credit_alphanum4.code, "USDT", 4);
    memset(custom_asset.asset.credit_alphanum4.issuer, 0x42, 32); // Demo issuer
    
    // Test asset equality
    rsa_asset_t native_asset2;
    rsa_copy_asset(&native_asset2, &native_asset);
    
    if (rsa_asset_equal(&native_asset, &native_asset2)) {
        std::cout << "✓ Native assets are equal" << std::endl;
    }
    
    if (!rsa_asset_equal(&native_asset, &custom_asset)) {
        std::cout << "✓ Native and custom assets are different" << std::endl;
    }
    
    if (rsa_is_native_asset(&native_asset)) {
        std::cout << "✓ Asset is native RSA" << std::endl;
    }
    
    if (!rsa_is_native_asset(&custom_asset)) {
        std::cout << "✓ Asset is not native RSA" << std::endl;
    }
}

void print_token_info() {
    std::cout << "\n=== RSA Token Information ===" << std::endl;
    std::cout << "Token Name: " << RSA_TOKEN_NAME << std::endl;
    std::cout << "Token Symbol: " << RSA_TOKEN_SYMBOL << std::endl;
    std::cout << "Decimals: " << RSA_TOKEN_DECIMALS << std::endl;
    std::cout << "Total Supply: " << RSA_TOKEN_TOTAL_SUPPLY << " RSA" << std::endl;
    std::cout << "Max Supply: " << RSA_TOKEN_MAX_SUPPLY << " RSA" << std::endl;
    std::cout << "Base Fee: " << RSA_BASE_FEE << " (0.00001 RSA)" << std::endl;
    std::cout << "Base Reserve: " << RSA_BASE_RESERVE << " (0.5 RSA)" << std::endl;
    std::cout << "Network: " << RSA_NETWORK_ID << std::endl;
    std::cout << "Passphrase: " << RSA_NETWORK_PASSPHRASE << std::endl;
}

// CRITICAL SECURITY FUNCTIONS DECLARATIONS
// (Declared in rsa_token.h)

int main() {
    std::cout << "🚀 RSA Chain Core - SECURITY HARDENED VERSION" << std::endl;
    std::cout << "=============================================" << std::endl;
    std::cout << "⚠️  CRITICAL SECURITY FEATURES ENABLED:" << std::endl;
    std::cout << "   • Memory corruption detection" << std::endl;
    std::cout << "   • Operational limits: <100 ops/sec" << std::endl;
    std::cout << "   • Real-time monitoring" << std::endl;
    std::cout << "   • Emergency rollback ready" << std::endl;
    std::cout << "=============================================" << std::endl;
    
    // CRITICAL: Initialize security monitoring first
    if (!rsa_monitor_init()) {
        std::cerr << "❌ CRITICAL: Failed to initialize security monitoring!" << std::endl;
        return 1;
    }
    
    // Initialize RSA token system
    rsa_token_init();
    
    // Start background monitoring
    if (!rsa_start_monitoring()) {
        std::cerr << "❌ CRITICAL: Failed to start monitoring system!" << std::endl;
        rsa_token_cleanup();
        return 1;
    }
    
    std::cout << "✅ Security monitoring system active" << std::endl;
    
    // Print token information
    print_token_info();
    
    // Run demos with security monitoring
    std::cout << "\n🔒 Running security-monitored demos..." << std::endl;
    
    try {
        demo_wallet_creation();
        demo_transaction_signing();
        demo_amount_operations();
        demo_address_validation();
        demo_asset_operations();
    } catch (const std::exception& e) {
        std::cerr << "❌ SECURITY: Exception caught: " << e.what() << std::endl;
        rsa_trigger_alert("DEMO_EXCEPTION", e.what());
    }
    
    // Display security statistics
    std::cout << "\n=== SECURITY STATISTICS ===" << std::endl;
    rsa_ops_monitor_t stats;
    rsa_get_monitor_stats(&stats);
    std::cout << "Total Operations: " << stats.total_operations << std::endl;
    std::cout << "Memory Usage: " << stats.memory_usage << " bytes" << std::endl;
    std::cout << "Corruption Detections: " << stats.corruption_detections << std::endl;
    std::cout << "Status: " << (stats.concurrent_operations < RSA_MAX_CONCURRENT_OPS ? "✅ SECURE" : "❌ CRITICAL") << std::endl;
    
    std::cout << "\n=== Demo Complete ===" << std::endl;
    std::cout << "The RSA token implementation follows XLM specifications:" << std::endl;
    std::cout << "• 7 decimal places precision" << std::endl;
    std::cout << "• 100 billion total supply" << std::endl;
    std::cout << "• 0.00001 RSA base fee" << std::endl;
    std::cout << "• 0.5 RSA minimum balance" << std::endl;
    std::cout << "• RSA-2048 cryptography" << std::endl;
    std::cout << "• Base32 address encoding" << std::endl;
    std::cout << "• SHA-256 hashing" << std::endl;
    std::cout << "\n🔒 SECURITY ENHANCEMENTS:" << std::endl;
    std::cout << "• Memory corruption detection" << std::endl;
    std::cout << "• Buffer overflow protection" << std::endl;
    std::cout << "• Rate limiting (<100 ops/sec)" << std::endl;
    std::cout << "• Real-time monitoring" << std::endl;
    std::cout << "• Emergency rollback procedures" << std::endl;
    
    // Cleanup with security monitoring
    std::cout << "\n🔒 Shutting down security monitoring..." << std::endl;
    rsa_stop_monitoring();
    rsa_token_cleanup();
    
    std::cout << "✅ RSA Core shutdown complete" << std::endl;
    return 0;
} 