/**
 * Database Connection Test
 * Validates database connectivity and configuration
 */

require('dotenv').config();
const db = require('./db');

async function testConnection() {
  console.log('===========================================');
  console.log('Testing Database Connection');
  console.log('===========================================\n');
  
  try {
    // Test 1: Get connection pool
    console.log('[TEST 1] Initializing connection pool...');
    const pool = await db.getPool();
    console.log('✓ Connection pool initialized\n');
    
    // Test 2: Execute simple query
    console.log('[TEST 2] Executing test query...');
    const result = await db.query('SELECT 1 + 1 AS result');
    console.log('✓ Query executed successfully');
    console.log(`  Result: ${result[0].result}\n`);
    
    // Test 3: Check clients table
    console.log('[TEST 3] Checking clients table...');
    const clients = await db.query('SELECT COUNT(*) AS count FROM clients');
    console.log('✓ Clients table accessible');
    console.log(`  Total clients: ${clients[0].count}\n`);
    
    // Test 4: Check database version
    console.log('[TEST 4] Checking MySQL version...');
    const version = await db.query('SELECT VERSION() AS version');
    console.log('✓ MySQL version retrieved');
    console.log(`  Version: ${version[0].version}\n`);
    
    console.log('===========================================');
    console.log('✅ All tests passed successfully!');
    console.log('===========================================');
    
    process.exit(0);
  } catch (error) {
    console.error('\n===========================================');
    console.error('❌ Connection test failed!');
    console.error('===========================================');
    console.error('Error:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  } finally {
    await db.closePool();
  }
}

// Run test
testConnection();

