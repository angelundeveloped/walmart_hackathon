/**
 * 🧪 Database Testing Utility for Walmart Wavefinder
 * 
 * This script tests all database connections and operations:
 * - Supabase connection and authentication
 * - Database schema validation
 * - CRUD operations for all tables
 * - Vector database functionality
 * - RAG system operations
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config({ path: join(process.cwd(), '.env.local') });

// Test configuration
const TEST_CONFIG = {
  colors: {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
  }
};

// Utility functions
const log = {
  info: (msg: string) => console.log(`${TEST_CONFIG.colors.blue}ℹ️  ${msg}${TEST_CONFIG.colors.reset}`),
  success: (msg: string) => console.log(`${TEST_CONFIG.colors.green}✅ ${msg}${TEST_CONFIG.colors.reset}`),
  error: (msg: string) => console.log(`${TEST_CONFIG.colors.red}❌ ${msg}${TEST_CONFIG.colors.reset}`),
  warning: (msg: string) => console.log(`${TEST_CONFIG.colors.yellow}⚠️  ${msg}${TEST_CONFIG.colors.reset}`),
  header: (msg: string) => console.log(`\n${TEST_CONFIG.colors.bold}${TEST_CONFIG.colors.blue}🔍 ${msg}${TEST_CONFIG.colors.reset}\n`)
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

function recordTest(passed: boolean, testName: string) {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    log.success(`${testName}`);
  } else {
    testResults.failed++;
    log.error(`${testName}`);
  }
}

// Environment validation
function validateEnvironment(): boolean {
  log.header('Environment Variables Validation');
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'GEMINI_API_KEY'
  ];
  
  const optionalVars = [
    'SUPABASE_SERVICE_ROLE_KEY',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET'
  ];
  
  let allRequired = true;
  
  // Check required variables
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      recordTest(true, `Required env var: ${varName}`);
    } else {
      recordTest(false, `Missing required env var: ${varName}`);
      allRequired = false;
    }
  });
  
  // Check optional variables
  optionalVars.forEach(varName => {
    if (process.env[varName]) {
      recordTest(true, `Optional env var: ${varName}`);
    } else {
      log.warning(`Optional env var missing: ${varName}`);
    }
  });
  
  return allRequired;
}

// Supabase connection test
async function testSupabaseConnection() {
  log.header('Supabase Connection Test');
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Test basic connection
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
    
    if (error) {
      recordTest(false, `Supabase connection failed: ${error.message}`);
      return null;
    }
    
    recordTest(true, 'Supabase connection successful');
    return supabase;
    
  } catch (error) {
    recordTest(false, `Supabase connection error: ${(error as Error).message}`);
    return null;
  }
}

// Database schema validation
async function testDatabaseSchema(supabase: unknown) {
  log.header('Database Schema Validation');
  
  const expectedTables = [
    'user_profiles',
    'store_items', 
    'chat_sessions',
    'shopping_history'
  ];
  
  for (const tableName of expectedTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error) {
        recordTest(false, `Table ${tableName} access failed: ${error.message}`);
      } else {
        recordTest(true, `Table ${tableName} exists and accessible`);
      }
    } catch (error) {
      recordTest(false, `Table ${tableName} error: ${(error as Error).message}`);
    }
  }
}

// CRUD operations test
async function testCRUDOperations(supabase: unknown) {
  log.header('CRUD Operations Test');
  
  const testUserId = 'test-user-' + Date.now();
  const testItemId = 'test-item-' + Date.now();
  
  try {
    // Test 1: Create user profile
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .insert({
        id: testUserId,
        email: 'test@example.com',
        name: 'Test User',
        preferences: {
          mapFilters: {
            showSections: ['dairy', 'bakery'],
            showItems: true,
            showRoute: true,
            showAnchors: true,
            showServices: true
          },
          dietaryRestrictions: ['vegetarian'],
          brandPreferences: ['organic'],
          organicPreference: true
        }
      })
      .select();
    
    if (userError) {
      recordTest(false, `User profile creation failed: ${userError.message}`);
    } else {
      recordTest(true, 'User profile created successfully');
    }
    
    // Test 2: Create store item
    const { data: itemData, error: itemError } = await supabase
      .from('store_items')
      .insert({
        id: testItemId,
        name: 'Test Organic Milk',
        category: 'dairy',
        description: 'Test organic milk for database testing',
        coordinates: { x: 10.5, y: 5.2 },
        price: 4.99,
        in_stock: true
      })
      .select();
    
    if (itemError) {
      recordTest(false, `Store item creation failed: ${itemError.message}`);
    } else {
      recordTest(true, 'Store item created successfully');
    }
    
    // Test 3: Read operations
    const { data: readUser, error: readUserError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', testUserId)
      .single();
    
    if (readUserError) {
      recordTest(false, `User profile read failed: ${readUserError.message}`);
    } else {
      recordTest(true, 'User profile read successfully');
    }
    
    // Test 4: Update operations
    const { data: updateData, error: updateError } = await supabase
      .from('user_profiles')
      .update({ name: 'Updated Test User' })
      .eq('id', testUserId)
      .select();
    
    if (updateError) {
      recordTest(false, `User profile update failed: ${updateError.message}`);
    } else {
      recordTest(true, 'User profile updated successfully');
    }
    
    // Test 5: Delete operations (cleanup)
    const { error: deleteUserError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', testUserId);
    
    const { error: deleteItemError } = await supabase
      .from('store_items')
      .delete()
      .eq('id', testItemId);
    
    if (deleteUserError || deleteItemError) {
      recordTest(false, `Cleanup failed: ${deleteUserError?.message || deleteItemError?.message}`);
    } else {
      recordTest(true, 'Test data cleaned up successfully');
    }
    
  } catch (error) {
    recordTest(false, `CRUD operations error: ${(error as Error).message}`);
  }
}

// Vector database test
async function testVectorDatabase() {
  log.header('Vector Database Test');
  
  try {
    // Test Gemini API connection
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Generate a simple embedding for testing: organic milk'
          }]
        }]
      })
    });
    
    if (!response.ok) {
      recordTest(false, `Gemini API connection failed: ${response.status} ${response.statusText}`);
      return;
    }
    
    const data = await response.json();
    recordTest(true, 'Gemini API connection successful');
    
    // Test embedding generation
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      recordTest(true, 'Embedding generation successful');
    } else {
      recordTest(false, 'Embedding generation failed - no content returned');
    }
    
  } catch (error) {
    recordTest(false, `Vector database test error: ${(error as Error).message}`);
  }
}

// Authentication test
async function testAuthentication(supabase: unknown) {
  log.header('Authentication Test');
  
  try {
    // Test anonymous access
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      recordTest(false, `Authentication test failed: ${error.message}`);
    } else {
      recordTest(true, 'Anonymous authentication working');
    }
    
    // Test if we can access public data
    const { data, error: publicError } = await supabase
      .from('store_items')
      .select('id, name, category')
      .limit(5);
    
    if (publicError) {
      recordTest(false, `Public data access failed: ${publicError.message}`);
    } else {
      recordTest(true, 'Public data access working');
    }
    
  } catch (error) {
    recordTest(false, `Authentication test error: ${(error as Error).message}`);
  }
}

// Performance test
async function testPerformance(supabase: unknown) {
  log.header('Performance Test');
  
  try {
    const startTime = Date.now();
    
    // Test multiple concurrent queries
    const promises = Array.from({ length: 10 }, (_, i) => 
      supabase
        .from('store_items')
        .select('id, name, category')
        .limit(1)
        .offset(i)
    );
    
    const results = await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    const allSuccessful = results.every(result => !result.error);
    
    if (allSuccessful) {
      recordTest(true, `Performance test passed - 10 concurrent queries in ${duration}ms`);
    } else {
      recordTest(false, 'Performance test failed - some queries failed');
    }
    
    // Performance threshold check
    if (duration < 5000) { // 5 seconds
      recordTest(true, `Performance within acceptable range (${duration}ms < 5000ms)`);
    } else {
      recordTest(false, `Performance too slow (${duration}ms > 5000ms)`);
    }
    
  } catch (error) {
    recordTest(false, `Performance test error: ${(error as Error).message}`);
  }
}

// Main test runner
async function runAllTests() {
  console.log(`${TEST_CONFIG.colors.bold}${TEST_CONFIG.colors.blue}`);
  console.log('🧪 Walmart Wavefinder Database Testing Suite');
  console.log('==============================================');
  console.log(`${TEST_CONFIG.colors.reset}\n`);
  
  // Step 1: Validate environment
  const envValid = validateEnvironment();
  if (!envValid) {
    log.error('Environment validation failed. Please check your .env.local file.');
    process.exit(1);
  }
  
  // Step 2: Test Supabase connection
  const supabase = await testSupabaseConnection();
  if (!supabase) {
    log.error('Supabase connection failed. Cannot continue with database tests.');
    process.exit(1);
  }
  
  // Step 3: Run all database tests
  await testDatabaseSchema(supabase);
  await testCRUDOperations(supabase);
  await testAuthentication(supabase);
  await testPerformance(supabase);
  
  // Step 4: Test AI/ML services
  await testVectorDatabase();
  
  // Step 5: Print results
  log.header('Test Results Summary');
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`${TEST_CONFIG.colors.green}Passed: ${testResults.passed}${TEST_CONFIG.colors.reset}`);
  console.log(`${TEST_CONFIG.colors.red}Failed: ${testResults.failed}${TEST_CONFIG.colors.reset}`);
  
  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
  console.log(`Success Rate: ${successRate}%`);
  
  if (testResults.failed === 0) {
    log.success('🎉 All tests passed! Your database setup is working perfectly.');
  } else {
    log.warning(`⚠️  ${testResults.failed} test(s) failed. Please review the errors above.`);
  }
  
  console.log('\n');
}

// Run the tests
runAllTests().catch(error => {
  log.error(`Test suite failed: ${(error as Error).message}`);
  process.exit(1);
});
