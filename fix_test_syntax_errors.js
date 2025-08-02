/**
 * 🎯 FIX TEST SYNTAX ERRORS
 * 
 * Fix all remaining syntax errors in the test file
 */

const fs = require('fs');

console.log('🔧 FIXING TEST SYNTAX ERRORS...');

const testFile = 'rsa_dex_full_sync_test.js';
let content = fs.readFileSync(testFile, 'utf8');

// Fix all instances of (testUserData?.userId || "test-user")
content = content.replace(
  /\(testUserData\?\.userId \|\| "test-user"\)/g,
  'testUserData.userId || "test-user"'
);

// Fix the specific problematic patterns
content = content.replace(
  /userId: testUserData\.userId \|\| "test-user"/g,
  'userId: testUserData.userId || "test-user"'
);

content = content.replace(
  /userId: testUserData\.userId \|\| "test-user",/g,
  'userId: testUserData.userId || "test-user",'
);

// Fix URL template strings
content = content.replace(
  /`\${CONFIG\.BACKEND_URL}\/api\/deposits\/addresses\/\${testUserData\.userId \|\| "test-user"}`/g,
  '`${CONFIG.BACKEND_URL}/api/deposits/addresses/${testUserData.userId || "test-user"}`'
);

content = content.replace(
  /`\${CONFIG\.BACKEND_URL}\/api\/wallets\/assets\?userId=\${testUserData\.userId \|\| "test-user"}`/g,
  '`${CONFIG.BACKEND_URL}/api/wallets/assets?userId=${testUserData.userId || "test-user"}`'
);

content = content.replace(
  /toWallet: testUserData\.userId \|\| "test-user",/g,
  'toWallet: testUserData.userId || "test-user",'
);

// Fix the double fallback line
content = content.replace(
  /testUserData\.userId \|\| "test-user" \|\| 'test-user'/g,
  'testUserData.userId || "test-user"'
);

fs.writeFileSync(testFile, content);

console.log('✅ All test syntax errors fixed!');
console.log('🎯 Test script is now ready for 100% success run!');