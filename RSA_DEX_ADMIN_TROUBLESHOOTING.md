# RSA DEX Admin Troubleshooting Guide

## 🚨 Sync Status Showing "Error" - Quick Fix

If you see this in your RSA DEX Admin:
```
RSA DEX Synchronization:
Assets: Error
Trading Pairs: Error  
Wallets: Error
Contracts: Error
Transactions: Error
```

### ✅ **Solution: Use the Startup Script**

**Step 1: Stop any existing processes**
```bash
pkill -f "node index.js"
pkill -f "npm.*dev"
```

**Step 2: Run the startup script**
```bash
./start-rsa-dex-admin.sh
```

**Step 3: Wait for both services to start**
- Backend will start on port 8001
- Frontend will start on port 3000

**Step 4: Open your browser**
- Go to: http://localhost:3000
- The sync status should now show all green ✅

---

## 🔧 **Manual Startup (Alternative)**

If the script doesn't work, start manually:

### **Terminal 1: Start Backend**
```bash
cd rsa-dex-backend
npm install  # if needed
node index.js
```
Wait for: `🚀 RSA DEX Cross-Chain Backend server running on port 8001`

### **Terminal 2: Start Frontend**
```bash
cd rsa-admin-next  
npm install  # if needed
npm run dev
```
Wait for: `Ready - started server on 0.0.0.0:3000`

---

## 🧪 **Testing the Fix**

### **1. Test Backend Health**
```bash
curl http://localhost:8001/health
```
Should return: `{"status":"ok",...}`

### **2. Test Sync Endpoints**
```bash
curl http://localhost:8001/api/admin/sync-status/assets
curl http://localhost:8001/api/admin/sync-status/trading-pairs
curl http://localhost:8001/api/admin/sync-status/wallets
curl http://localhost:8001/api/admin/sync-status/contracts
curl http://localhost:8001/api/admin/sync-status/transactions
```
All should return: `{"success":true,"data":{"synced":true,...}}`

### **3. Test Token Import**
```bash
curl -X POST http://localhost:8001/api/assets/import-token \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Token","symbol":"TEST","selectedNetworks":["ethereum"],"chainContracts":{"ethereum":"0x123"}}'
```
Should return: `{"success":true,"data":{"asset":{"symbol":"rTEST",...}}`

---

## 🐛 **Common Issues & Solutions**

### **Issue 1: Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::8001
```
**Solution:**
```bash
pkill -f "node index.js"  # Kill existing backend
```

### **Issue 2: Frontend Won't Start**
```
Error: Something is already running on port 3000
```
**Solution:**
```bash
pkill -f "npm.*dev"  # Kill existing frontend
# Or use different port:
npm run dev -- -p 3001
```

### **Issue 3: Network Validation Still Failing**
If token import still shows "Select at least one network":
- Make sure you're using the fixed version
- Check that networks are actually selected in the form
- Verify the backend is running the updated code

### **Issue 4: Sync Status Still Shows Error**
1. Check if backend is running: `curl http://localhost:8001/health`
2. Check browser console for CORS errors
3. Verify frontend is connecting to correct backend URL
4. Check that sync endpoints exist: `curl http://localhost:8001/api/admin/sync-status/assets`

---

## 📊 **Expected Working State**

When everything is working correctly:

### **Backend (port 8001):**
- Health check: ✅ `{"status":"ok"}`
- Assets endpoint: ✅ Returns asset list
- Sync endpoints: ✅ All return `{"synced":true}`
- Token import: ✅ Creates rTokens successfully

### **Frontend (port 3000):**
- Loads without errors: ✅
- Sync status shows: ✅ All green
- Token import works: ✅ No "select network" error
- Content visible: ✅ No blank pages

### **Browser Network Tab:**
- API calls to localhost:8001: ✅ Status 200
- No CORS errors: ✅
- Sync status calls successful: ✅

---

## 🚀 **Quick Health Check**

Run this one-liner to check everything:
```bash
echo "Backend:" && curl -s http://localhost:8001/health | head -c 50 && echo "" && echo "Sync:" && curl -s http://localhost:8001/api/admin/sync-status/assets | head -c 50 && echo "" && echo "Frontend:" && curl -s http://localhost:3000 >/dev/null && echo "✅ Running" || echo "❌ Not running"
```

---

## 📞 **Still Having Issues?**

1. Check log files:
   - Backend: `rsa-dex-backend/backend.log`
   - Frontend: `rsa-admin-next/admin.log`

2. Verify all fixes are applied:
   - Network validation fix in assets page
   - Sync endpoints in backend
   - CSS visibility fixes

3. Ensure you're on the correct branch with all fixes merged

The system should work perfectly once both services are running! 🎉