# Installation Guide

This guide will help you set up and run the RSA Chain project locally.

## Prerequisites
- Git
- Node.js (v16+ recommended)
- Go (v1.18+ recommended)
- CMake & a C++ compiler (for rsa-core)
- PostgreSQL (for Horizon and Faucet)

## 1. Clone the Repository
```sh
git clone https://github.com/rsacrypt/rsachane.git
cd rsachane
```

## 2. Environment Variables
Copy the example environment file and edit as needed:
```sh
cp .env.example .env
nano .env
```

## 3. Build and Run Components

### Core Node
```sh
cd rsa-core
mkdir build && cd build
cmake ..
make -j4
./rsa-core --conf rsa.cfg
```

### Horizon API Server
```sh
cd rsa-horizon
go run ./main.go
```

### Web Wallet
```sh
cd rsa-wallet-web
npm install
npm start
```

### Explorer
```sh
cd rsa-explorer
npm install
npm start
```

### Faucet
```sh
cd rsa-faucet
npm install
node index.js
```

## 4. Database Setup (for Horizon/Faucet)
- Ensure PostgreSQL is running.
- Create a database and user as specified in your `.env` file.

## 5. Additional Notes
- See each subproject's README for more details.
- The native token is RSA CRYPTO (code: RSA).
- For production, review security and deployment best practices. 