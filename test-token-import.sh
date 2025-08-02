#!/bin/bash

echo "🧪 Testing RSA DEX Backend Endpoints"
echo "===================================="

# Test basic health
echo "1. Testing health endpoint:"
curl -s http://localhost:8001/health | head -c 100
echo ""
echo ""

# Test sync endpoint (we know this works)
echo "2. Testing sync endpoint (should work):"
curl -s http://localhost:8001/api/admin/sync-status/assets | head -c 100
echo ""
echo ""

# Test token import with GET (should return method not allowed)
echo "3. Testing token import with GET (should return method not allowed):"
curl -s http://localhost:8001/api/assets/import-token
echo ""
echo ""

# Test token import with POST (the actual endpoint)
echo "4. Testing token import with POST (should work):"
curl -s -X POST http://localhost:8001/api/assets/import-token \
  -H "Content-Type: application/json" \
  -d '{"name":"TestToken","symbol":"TEST","selectedNetworks":["ethereum"],"chainContracts":{"ethereum":"0x123"}}'
echo ""
echo ""

# Test a non-existent endpoint
echo "5. Testing non-existent endpoint (should return 404):"
curl -s http://localhost:8001/api/nonexistent
echo ""
echo ""

echo "🔍 Analysis:"
echo "- If #4 returns 'Endpoint not found', the 404 handler is catching it"
echo "- If #4 returns token data, the endpoint is working"
echo "- If #4 returns 'Missing required fields', the endpoint is working but needs data"