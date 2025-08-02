# RSA Chain - Complete Setup Guide

## 🚀 Quick Start

This guide will help you set up and run the entire RSA Chain ecosystem locally.

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Git**
- **C++ compiler** (for rsa-core)

## 🏗️ Project Structure

```
rsachain/
├── rsacrypto.com/          # Main website (Next.js)
├── rsa-wallet-web/         # Web wallet (React)
├── rsa-explorer/           # Blockchain explorer (React)
├── rsa-faucet/             # Test token faucet (Node.js)
├── rsa-admin-next/         # Admin panel (Next.js)
├── rsa-core/               # Core RSA implementation (C++)
├── rsa-sdk-js/             # JavaScript SDK
├── rsa-horizon/            # API server (Go)
└── docs/                   # Documentation
```

## 🔧 Installation Steps

### 1. Install Dependencies

Run these commands in each project directory:

```bash
# Main website
cd rsacrypto.com
npm install

# Web wallet
cd ../rsa-wallet-web
npm install

# Blockchain explorer
cd ../rsa-explorer
npm install

# Faucet
cd ../rsa-faucet
npm install

# Admin panel
cd ../rsa-admin-next
npm install

# JavaScript SDK
cd ../rsa-sdk-js
npm install
```

### 2. Build RSA Core (Optional)

```bash
cd rsa-core
mkdir build && cd build
cmake ..
make
```

## 🚀 Running the Services

### Option 1: Run All Services (Recommended)

Create a startup script:

```bash
# Create start-all.sh
cat > start-all.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting RSA Chain Ecosystem..."

# Start main website (port 3000)
cd rsacrypto.com && npm run dev &
echo "✅ Main website: http://localhost:3000"

# Start web wallet (port 3001)
cd ../rsa-wallet-web && PORT=3001 npm start &
echo "✅ Web wallet: http://localhost:3001"

# Start explorer (port 4000)
cd ../rsa-explorer && PORT=4000 npm start &
echo "✅ Explorer: http://localhost:4000"

# Start faucet (port 5000)
cd ../rsa-faucet && PORT=5000 node index.js &
echo "✅ Faucet: http://localhost:5000"

# Start admin panel (port 6000)
cd ../rsa-admin-next && PORT=6000 npm run dev &
echo "✅ Admin panel: http://localhost:6000"

echo "🎉 All services started!"
echo "Press Ctrl+C to stop all services"
wait
EOF

chmod +x start-all.sh
./start-all.sh
```

### Option 2: Run Services Individually

```bash
# Terminal 1: Main website
cd rsacrypto.com
npm run dev

# Terminal 2: Web wallet
cd rsa-wallet-web
PORT=3001 npm start

# Terminal 3: Explorer
cd rsa-explorer
PORT=4000 npm start

# Terminal 4: Faucet
cd rsa-faucet
PORT=5000 node index.js

# Terminal 5: Admin panel
cd rsa-admin-next
PORT=6000 npm run dev
```

## 🌐 Access Points

Once running, you can access:

- **Main Website**: http://localhost:3000
- **Web Wallet**: http://localhost:3001
- **Blockchain Explorer**: http://localhost:4000
- **Faucet**: http://localhost:5000
- **Admin Panel**: http://localhost:6000

## 🔑 Admin Panel Access

- **URL**: http://localhost:6000
- **Username**: admin
- **Password**: admin123

## 💰 Using the Faucet

1. Go to http://localhost:5000
2. Enter your wallet address
3. Select amount (10K - 500K RSA CRYPTO)
4. Click "Request Test Tokens"

## 👛 Creating a Wallet

1. Go to http://localhost:3001 (Web Wallet)
2. Click "Create New Wallet"
3. Set a strong password
4. Save your private key securely
5. Get test tokens from the faucet

## 🛠️ Development

### Adding New Features

- **Frontend**: Edit files in `rsacrypto.com/src/`
- **Wallet**: Edit files in `rsa-wallet-web/src/`
- **Explorer**: Edit files in `rsa-explorer/src/`
- **Backend**: Edit files in `rsa-faucet/` or `rsa-horizon/`

### API Endpoints

- **Faucet API**: POST http://localhost:5000/api/request
- **Health Check**: GET http://localhost:5000/health

## 🔧 Troubleshooting

### Common Issues

1. **Port already in use**: Change PORT environment variable
2. **Node modules missing**: Run `npm install` in the project directory
3. **Build errors**: Clear cache with `npm run build -- --reset-cache`

### Reset Everything

```bash
# Stop all processes
pkill -f "npm\|node"

# Clear node_modules
find . -name "node_modules" -type d -exec rm -rf {} +

# Reinstall dependencies
./start-all.sh
```

## 📚 Documentation

- **API Docs**: See `docs/api.md`
- **Developer Guide**: See `docs/DEVELOPER_GUIDE.md`
- **SDK Usage**: See `docs/sdk_usage.md`

## 🎯 Next Steps

1. **Customize branding** in the website components
2. **Add real blockchain integration** to replace simulations
3. **Implement user authentication** for the admin panel
4. **Add more transaction types** to the wallet
5. **Deploy to production** servers

## 📞 Support

For issues or questions:
- Check the documentation in `/docs/`
- Review the README files in each project directory
- Check the GitHub repository for updates

---

**Happy coding! 🚀** 