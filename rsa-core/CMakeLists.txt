cmake_minimum_required(VERSION 3.16)
project(rsa-core VERSION 1.0.0 LANGUAGES CXX C)

# Set C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED ON)

# CRITICAL SECURITY FLAGS
# =======================
set(CMAKE_BUILD_TYPE Release)
add_compile_definitions(
    _FORTIFY_SOURCE=2          # Buffer overflow protection
    _GLIBCXX_ASSERTIONS        # STL bounds checking
)

# Find required packages
find_package(OpenSSL REQUIRED)
find_package(Threads REQUIRED)

# Include directories
include_directories(${CMAKE_CURRENT_SOURCE_DIR})
include_directories(${OPENSSL_INCLUDE_DIR})

# Source files
set(SOURCES
    main.cpp
    rsa_token.c
    rsa_monitor.c
)

# Create executable
add_executable(rsa-core ${SOURCES})

# Link libraries
target_link_libraries(rsa-core 
    ${OPENSSL_LIBRARIES}
    Threads::Threads
)

# CRITICAL SECURITY COMPILER FLAGS
# ================================
target_compile_options(rsa-core PRIVATE
    # Memory protection
    -fstack-protector-strong   # Stack canaries
    -fPIE                      # Position independent executable
    -D_FORTIFY_SOURCE=2        # Buffer overflow detection
    
    # Warning flags
    -Wall
    -Wextra
    -Werror                    # Treat warnings as errors
    -Wformat-security          # Format string vulnerabilities
    -Wstack-protector          # Stack protection warnings
    -Warray-bounds             # Array bounds checking
    -Wno-deprecated-declarations  # Temporarily disable for OpenSSL 3.0 migration
    
    # Optimization with security
    -O2
    -DNDEBUG
    
    # Additional security
    -fno-strict-overflow       # Prevent integer overflow optimizations
    -Wstrict-overflow=5        # Detect overflow issues
)

# CRITICAL SECURITY LINKER FLAGS
# ==============================
target_link_options(rsa-core PRIVATE
    -pie                       # Position independent executable
    -Wl,-z,relro              # Read-only relocations
    -Wl,-z,now                # Immediate binding
    -Wl,-z,noexecstack        # Non-executable stack
)

# Installation
install(TARGETS rsa-core DESTINATION bin)

# Copy configuration file
configure_file(rsa.cfg.example rsa.cfg @ONLY)
install(FILES ${CMAKE_CURRENT_BINARY_DIR}/rsa.cfg DESTINATION etc/rsa-core)

# Create monitoring directories
install(DIRECTORY DESTINATION var/log/rsa-core)
install(DIRECTORY DESTINATION var/run/rsa-core) 