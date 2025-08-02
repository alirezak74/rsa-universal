# 🍎 macOS Quick Fix - RSA DEX Admin Sync Errors

## 🚨 **Your Current Issue**
You're getting this error:
```
Error: listen EADDRINUSE: address already in use :::8002
```

This happens because there's already a backend process running that's using port 8002.

## ✅ **IMMEDIATE SOLUTION**

### **Step 1: Kill existing processes**
```bash
pkill -f "node index.js"
pkill -f "nodemon"
```

### **Step 2: Use the automated script**
```bash
./start-rsa-admin-macos.sh
```

**OR manually:**

### **Step 2a: Start Backend (Terminal 1)**
```bash
cd rsa-dex-backend
node index.js
```
Wait for: `🚀 RSA DEX Cross-Chain Backend server running on port 8001`

### **Step 2b: Start Frontend (Terminal 2)**  
```bash
cd rsa-admin-next
npm run dev
```
Wait for: `✓ Ready in [time]ms`

### **Step 3: Open Browser**
Go to: http://localhost:3000

You should now see:
```
RSA DEX Synchronization:
Assets: ✅ Synced (15/15)
Trading Pairs: ✅ Synced (8/8)  
Wallets: ✅ Synced (150/150)
Contracts: ✅ Synced (25/25)
Transactions: ✅ Synced (5000/5000)
```

---

## 🔧 **Why This Happened**

1. **You ran `npm run dev` in the backend** - This uses `nodemon` which watches for file changes
2. **There was already a `node index.js` process running** - This created a port conflict
3. **Port 8002 was already in use** - The WebSocket server couldn't start

## 🎯 **The Fix**

- **Always kill existing processes first**: `pkill -f "node index.js"`
- **Use `node index.js` directly** (not `npm run dev`) for the backend
- **Use `npm run dev` only for the frontend**

---

## 🧪 **Test It's Working**

### **1. Check ports are free:**
```bash
netstat -an | grep -E "(8001|8002|3000).*LISTEN"
```

### **2. Test backend health:**
```bash
curl http://localhost:8001/health
```
Should return: `{"status":"ok",...}`

### **3. Test sync endpoints:**
```bash
curl http://localhost:8001/api/admin/sync-status/assets
```
Should return: `{"success":true,"data":{"synced":true,...}}`

### **4. Check frontend:**
Open http://localhost:3000 - should load without errors

---

## 🚀 **Expected Result**

When working correctly:

### **Backend Terminal:**
```
✅ Alchemy providers initialized successfully
🚀 RSA DEX Cross-Chain Backend server running on port 8001
📡 WebSocket server running on port 8002
✅ SQLite database connected successfully
```

### **Frontend Terminal:**
```
▲ Next.js 14.2.3
- Local:        http://localhost:3000
✓ Ready in 1284ms
```

### **Browser (localhost:3000):**
- ✅ All sync status indicators green
- ✅ Token import works without "select network" error  
- ✅ All content visible (no blank pages)

---

## 🛑 **If Still Having Issues**

### **Problem: Port still in use**
```bash
# Find what's using the port
netstat -an | grep 8002
# Kill all node processes
pkill -9 -f node
# Wait 5 seconds, then restart
```

### **Problem: Frontend won't connect to backend**
1. Verify backend is on port 8001: `curl http://localhost:8001/health`
2. Check browser console (F12) for CORS errors
3. Clear browser cache (Cmd+Shift+R)

### **Problem: Sync still shows errors**
1. Make sure both services are running
2. Check that you're using the fixed version with all changes
3. Verify sync endpoints work: `curl http://localhost:8001/api/admin/sync-status/assets`

---

## 🎉 **Success!**

Once both services are running properly:
- **Backend**: http://localhost:8001 ✅
- **Frontend**: http://localhost:3000 ✅
- **Sync Status**: All green ✅
- **Token Import**: Working ✅
- **Content**: All visible ✅

The RSA DEX Admin is now fully functional! 🚀