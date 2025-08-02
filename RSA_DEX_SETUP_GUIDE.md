# 🚀 RSA DEX Complete Setup Guide

This guide will help you fix all issues and get the RSA DEX Cross-Chain Integration running successfully.

## 🔧 Issues Fixed

1. ✅ **Web3 Constructor Error** - Fixed import statement for Web3 v4.x
2. ✅ **PostgreSQL Connection** - Added database setup script
3. ✅ **Port Configuration** - Fixed frontend/admin to connect to correct backend port (8001)
4. ✅ **Environment Configuration** - Added proper .env file
5. ✅ **Database Schema** - Complete database initialization

---

## 📋 Prerequisites

### 1. Install PostgreSQL

**macOS (Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Docker (Alternative):**
```bash
docker run --name rsa-postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:13
```

### 2. Configure PostgreSQL User

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create user and database (if needed)
CREATE USER postgres WITH PASSWORD 'password';
ALTER USER postgres CREATEDB;
\q
```

---

## 🚀 Quick Start

### Step 1: Setup RSA DEX Backend

```bash
cd rsa-dex-backend

# Install dependencies
npm install

# Setup database and start server
./start.sh
```

**Alternative manual setup:**
```bash
cd rsa-dex-backend
npm install
npm run setup-db
npm start
```

### Step 2: Start RSA DEX Frontend

```bash
# In a new terminal
cd rsa-dex
npm install
npm run dev
```

### Step 3: Start RSA DEX Admin Panel

```bash
# In a new terminal  
cd rsa-admin-next
npm install
npm run dev
```

---

## 🌐 Access URLs

Once everything is running:

- **RSA DEX Frontend**: http://localhost:3001
- **RSA DEX Admin Panel**: http://localhost:6000  
- **RSA DEX Backend API**: http://localhost:8001
- **WebSocket Server**: ws://localhost:8002

---

## 🔍 Troubleshooting

### PostgreSQL Issues

**Error: "ECONNREFUSED"**
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql  # macOS
sudo systemctl status postgresql      # Linux

# Start PostgreSQL if not running
brew services start postgresql        # macOS
sudo systemctl start postgresql       # Linux
```

**Error: "database does not exist"**
```bash
cd rsa-dex-backend
npm run setup-db
```

**Error: "password authentication failed"**
- Check your `.env` file in `rsa-dex-backend/`
- Ensure DB_PASSWORD matches your PostgreSQL user password

### Web3 Constructor Error

If you still get Web3 errors:
```bash
cd rsa-dex-backend
rm -rf node_modules package-lock.json
npm install
```

### Port Conflicts

If ports are in use:
```bash
# Check what's using the ports
lsof -i :8001  # Backend
lsof -i :3001  # Frontend  
lsof -i :6000  # Admin

# Kill processes if needed
kill -9 <PID>
```

### Network Error in Admin Panel

1. Ensure backend is running on port 8001
2. Check browser console for CORS errors
3. Verify admin panel is connecting to correct backend URL

---

## 🎯 Features Available

### ✅ Cross-Chain Integration
- **Alchemy API**: Fully configured with key `VSDZI0dFEh6shTS4qYsKd`
- **Supported Networks**: Ethereum, Solana, Avalanche, BSC, Bitcoin
- **Wrapped Tokens**: rBTC, rETH, rSOL, rAVAX, rBNB, rUSDT, rUSDC

### ✅ Dynamic Token Management
- **Admin Interface**: Add/edit/delete tokens without redeployment
- **Database-Driven**: All token metadata stored in PostgreSQL
- **Real-Time Updates**: Changes reflect immediately across all components

### ✅ Backend Services
- **Deposit Monitoring**: Real-time cross-chain deposit detection
- **Withdrawal Processing**: Automated wrapped token burning and native asset release
- **Price Feeds**: CoinGecko integration with manual override support
- **WebSocket**: Real-time updates for frontend applications

### ✅ Security Features
- **JWT Authentication**: Secure API access
- **Rate Limiting**: Anti-spam protection
- **Input Validation**: Joi schema validation
- **Audit Logging**: Complete transaction history

---

## 📊 Database Schema

The setup script creates these tables:
- `users` - User accounts and authentication
- `tokens` - Dynamic token configuration
- `token_price_history` - Price tracking
- `user_deposit_addresses` - Cross-chain deposit addresses
- `deposits` - Deposit transaction tracking
- `withdrawals` - Withdrawal transaction tracking
- `trading_pairs` - Available trading pairs
- `orders` - Trading orders

---

## 🔐 Environment Variables

The `.env` file includes:
- **Database**: PostgreSQL connection settings
- **Alchemy**: API key and network URLs
- **JWT**: Authentication configuration
- **CORS**: Cross-origin request settings
- **Rate Limiting**: API protection settings

---

## 🧪 Testing

### Backend Health Check
```bash
curl http://localhost:8001/health
```

### Database Connection Test
```bash
cd rsa-dex-backend
node -e "
const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'rsa_dex',
  user: 'postgres',
  password: 'password'
});
pool.query('SELECT NOW()', (err, res) => {
  console.log(err ? 'DB Error:' + err : 'DB Connected:', res.rows[0]);
  pool.end();
});
"
```

### Frontend API Test
Open browser console on http://localhost:3001 and run:
```javascript
fetch('http://localhost:8001/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

---

## 🎉 Success Verification

You should see:

1. **Backend Console**:
   ```
   ✅ Alchemy providers initialized successfully
   ✅ Token management database initialized  
   ✅ Cross-chain service database initialized
   🚀 RSA DEX Cross-Chain Backend server running on port 8001
   📡 WebSocket server running on port 8002
   ```

2. **Frontend**: Loads without errors, shows RSA price at $0.85

3. **Admin Panel**: Loads without "Network Error", shows token management interface

4. **Database**: Contains default tokens (RSA, rBTC, rETH, rSOL, rAVAX, rBNB)

---

## 🔄 Development Workflow

### Adding New Tokens
1. Open admin panel: http://localhost:6000
2. Navigate to Token Management
3. Click "Add New Token"
4. Fill in token details (name, symbol, network, etc.)
5. Token appears immediately in DEX frontend

### Monitoring Cross-Chain Deposits
1. Backend automatically monitors all configured networks
2. Deposits are tracked in `deposits` table
3. Wrapped tokens are minted upon confirmation
4. Real-time updates via WebSocket

### Price Updates
1. CoinGecko prices update automatically
2. Manual price override available in admin panel
3. Price history stored for analytics

---

## 📞 Support

If you encounter issues:

1. **Check Logs**: Backend console shows detailed error messages
2. **Database**: Ensure PostgreSQL is running and accessible
3. **Ports**: Verify no conflicts on ports 8001, 3001, 6000
4. **Environment**: Check `.env` file configuration
5. **Dependencies**: Try `rm -rf node_modules && npm install`

The RSA DEX Cross-Chain Integration is now fully functional with dynamic token management! 🎊