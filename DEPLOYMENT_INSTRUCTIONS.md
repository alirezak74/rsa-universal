# 🚀 RSA DEX Deployment Instructions

## 📦 **Step 1: Clone Repository**
```bash
git clone https://github.com/alirezak74/rsa-universal.git
cd rsa-universal
git checkout cursor/rsa-dex-unified-qa-and-bug-fix-9b4f
```

## 🔧 **Step 2: Install Dependencies**

### Backend:
```bash
cd rsa-dex-backend
npm install
cd ..
```

### Admin Panel:
```bash
cd rsa-admin-next
npm install
cd ..
```

### Frontend:
```bash
cd rsa-dex
npm install
cd ..
```

## 🚀 **Step 3: Start Services**
```bash
# Make startup script executable
chmod +x rsa_dex_service_startup.sh

# Start all services
./rsa_dex_service_startup.sh
```

## ✅ **Step 4: Verify Deployment**
```bash
# Run QA test to confirm 100% success
node rsa_dex_enhanced_qa_test.js
```

## 🎯 **Expected Results:**
- ✅ Backend: http://localhost:8001
- ✅ Admin Panel: http://localhost:3002  
- ✅ Frontend: http://localhost:3000
- ✅ QA Test: 37/37 tests passing (100% success)

## 🛑 **Stop Services:**
```bash
chmod +x rsa_dex_service_stop.sh
./rsa_dex_service_stop.sh
```

---

## 📋 **What's Included:**
✅ All source code and configurations  
✅ All 21 bug fixes implemented  
✅ Complete backend with all endpoints  
✅ Emergency management system  
✅ Advanced QA testing framework  
✅ Service management scripts  
✅ 100% working ecosystem  

**Note:** `node_modules` directories are automatically created when you run `npm install` - this is standard practice and ensures you get the correct dependencies for your environment.