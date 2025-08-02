#!/bin/bash

# RSA DEX Setup Test Script
# This script tests if all components are working correctly

echo "🧪 RSA DEX Setup Test Suite"
echo "=========================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test functions
test_postgresql() {
    echo "🔍 Testing PostgreSQL connection..."
    if nc -z localhost 5432 2>/dev/null; then
        echo -e "${GREEN}✅ PostgreSQL is running on port 5432${NC}"
        return 0
    else
        echo -e "${RED}❌ PostgreSQL is not running${NC}"
        echo "   Please start PostgreSQL first:"
        echo "   macOS: brew services start postgresql"
        echo "   Linux: sudo systemctl start postgresql"
        return 1
    fi
}

test_backend() {
    echo "🔍 Testing RSA DEX Backend..."
    if curl -s http://localhost:8001/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is running on port 8001${NC}"
        return 0
    else
        echo -e "${RED}❌ Backend is not responding${NC}"
        echo "   Start with: cd rsa-dex-backend && npm start"
        return 1
    fi
}

test_frontend() {
    echo "🔍 Testing RSA DEX Frontend..."
    if curl -s http://localhost:3001 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend is running on port 3001${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Frontend is not running${NC}"
        echo "   Start with: cd rsa-dex && npm run dev"
        return 1
    fi
}

test_admin() {
    echo "🔍 Testing RSA DEX Admin..."
    if curl -s http://localhost:6000 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Admin panel is running on port 6000${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Admin panel is not running${NC}"
        echo "   Start with: cd rsa-admin-next && npm run dev"
        return 1
    fi
}

test_database_connection() {
    echo "🔍 Testing database connection..."
    if [ -d "rsa-dex-backend" ]; then
        cd rsa-dex-backend
        if node -e "
        const { Pool } = require('pg');
        const pool = new Pool({
          host: 'localhost',
          port: 5432,
          database: 'rsa_dex',
          user: 'postgres',
          password: 'password'
        });
        pool.query('SELECT COUNT(*) FROM tokens', (err, res) => {
          if (err) {
            console.log('DB_ERROR');
            process.exit(1);
          } else {
            console.log('DB_SUCCESS:' + res.rows[0].count);
            process.exit(0);
          }
          pool.end();
        });
        " 2>/dev/null | grep -q "DB_SUCCESS"; then
            token_count=$(node -e "
            const { Pool } = require('pg');
            const pool = new Pool({
              host: 'localhost',
              port: 5432,
              database: 'rsa_dex',
              user: 'postgres',
              password: 'password'
            });
            pool.query('SELECT COUNT(*) FROM tokens', (err, res) => {
              if (!err) console.log(res.rows[0].count);
              pool.end();
            });
            " 2>/dev/null)
            echo -e "${GREEN}✅ Database connected with ${token_count} tokens${NC}"
            cd ..
            return 0
        else
            echo -e "${RED}❌ Database connection failed${NC}"
            echo "   Run: cd rsa-dex-backend && npm run setup-db"
            cd ..
            return 1
        fi
    else
        echo -e "${RED}❌ rsa-dex-backend directory not found${NC}"
        return 1
    fi
}

test_api_endpoints() {
    echo "🔍 Testing API endpoints..."
    
    # Test health endpoint
    if curl -s http://localhost:8001/health | grep -q "ok"; then
        echo -e "${GREEN}✅ Health endpoint working${NC}"
    else
        echo -e "${RED}❌ Health endpoint failed${NC}"
        return 1
    fi
    
    # Test tokens endpoint (if backend is running)
    if curl -s http://localhost:8001/api/tokens > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Tokens API endpoint working${NC}"
    else
        echo -e "${YELLOW}⚠️  Tokens API endpoint not responding${NC}"
    fi
    
    return 0
}

# Run all tests
echo "Starting comprehensive test suite..."
echo ""

failed_tests=0

test_postgresql || ((failed_tests++))
echo ""

test_database_connection || ((failed_tests++))
echo ""

test_backend || ((failed_tests++))
echo ""

test_api_endpoints || ((failed_tests++))
echo ""

test_frontend
echo ""

test_admin
echo ""

# Summary
echo "=========================="
echo "🎯 Test Results Summary"
echo "=========================="

if [ $failed_tests -eq 0 ]; then
    echo -e "${GREEN}🎉 All critical tests passed!${NC}"
    echo ""
    echo "✅ Your RSA DEX setup is working correctly!"
    echo ""
    echo "🌐 Access your applications:"
    echo "   • Frontend: http://localhost:3001"
    echo "   • Admin Panel: http://localhost:6000"
    echo "   • Backend API: http://localhost:8001"
    echo ""
    echo "🔧 Features available:"
    echo "   • Cross-chain integration with Alchemy API"
    echo "   • Dynamic token management"
    echo "   • Real-time price feeds"
    echo "   • WebSocket support"
    echo "   • PostgreSQL database"
else
    echo -e "${RED}❌ ${failed_tests} critical test(s) failed${NC}"
    echo ""
    echo "🔧 Please fix the issues above and run this test again."
    echo ""
    echo "📖 For detailed setup instructions, see:"
    echo "   RSA_DEX_SETUP_GUIDE.md"
fi

echo ""
echo "🧪 Test completed!"