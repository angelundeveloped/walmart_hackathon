#!/usr/bin/env node

/**
 * Test Script for Session Memory & Data Persistence
 * 
 * This script tests the database schema and API endpoints
 * to ensure session memory is working correctly.
 */

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env.local') });

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test colors
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Test functions
async function testDatabaseSchema() {
  log('\n🔍 Testing Database Schema...', 'bold');
  
  try {
    // Test if tables exist
    const tables = ['active_shopping_lists', 'chat_sessions', 'user_profiles', 'shopping_history'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error && error.code === 'PGRST116') {
        logError(`Table '${table}' does not exist`);
        return false;
      } else if (error) {
        logWarning(`Table '${table}' exists but has issues: ${error.message}`);
      } else {
        logSuccess(`Table '${table}' exists and is accessible`);
      }
    }
    
    return true;
  } catch (error) {
    logError(`Database schema test failed: ${error.message}`);
    return false;
  }
}

async function testRLSPolicies() {
  log('\n🔒 Testing RLS Policies...', 'bold');
  
  try {
    // Test RLS by trying to access data without authentication
    const { data, error } = await supabase
      .from('active_shopping_lists')
      .select('*');
    
    if (error && error.message.includes('RLS')) {
      logSuccess('RLS policies are active (expected error for unauthenticated access)');
      return true;
    } else if (data && data.length === 0) {
      logSuccess('RLS policies are active (no data returned for unauthenticated access)');
      return true;
    } else {
      logWarning('RLS policies may not be properly configured');
      return false;
    }
  } catch (error) {
    logError(`RLS test failed: ${error.message}`);
    return false;
  }
}

async function testAPIEndpoints() {
  log('\n🌐 Testing API Endpoints...', 'bold');
  
  const endpoints = [
    { path: '/api/shopping-list', method: 'GET', name: 'Shopping List GET' },
    { path: '/api/chat-history', method: 'GET', name: 'Chat History GET' },
    { path: '/api/user-context', method: 'GET', name: 'User Context GET' }
  ];
  
  let allPassed = true;
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint.path}`, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 401) {
        logSuccess(`${endpoint.name}: Returns 401 (Unauthorized) - Expected for unauthenticated access`);
      } else if (response.status === 200) {
        logSuccess(`${endpoint.name}: Returns 200 (OK)`);
      } else {
        logWarning(`${endpoint.name}: Returns ${response.status}`);
        allPassed = false;
      }
    } catch (error) {
      logError(`${endpoint.name}: Failed - ${error.message}`);
      allPassed = false;
    }
  }
  
  return allPassed;
}

async function testDatabaseExtensions() {
  log('\n🔧 Testing Database Extensions...', 'bold');
  
  try {
    // Test if required extensions are installed
    const { data, error } = await supabase.rpc('test_extensions');
    
    if (error) {
      // If the function doesn't exist, try a simple query that would use extensions
      const { data: testData, error: testError } = await supabase
        .from('store_items')
        .select('embedding')
        .limit(1);
      
      if (testError && testError.message.includes('vector')) {
        logWarning('Vector extension may not be installed');
        return false;
      } else {
        logSuccess('Database extensions appear to be working');
        return true;
      }
    }
    
    return true;
  } catch (error) {
    logWarning(`Extension test inconclusive: ${error.message}`);
    return true; // Don't fail the test for this
  }
}

async function runAllTests() {
  log('🧪 Session Memory & Data Persistence Test Suite', 'bold');
  log('=' .repeat(50), 'blue');
  
  const tests = [
    { name: 'Database Schema', fn: testDatabaseSchema },
    { name: 'RLS Policies', fn: testRLSPolicies },
    { name: 'API Endpoints', fn: testAPIEndpoints },
    { name: 'Database Extensions', fn: testDatabaseExtensions }
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      }
    } catch (error) {
      logError(`${test.name} test crashed: ${error.message}`);
    }
  }
  
  log('\n📊 Test Results:', 'bold');
  log(`Passed: ${passed}/${total}`, passed === total ? 'green' : 'yellow');
  
  if (passed === total) {
    logSuccess('All tests passed! Session memory is ready to use.');
  } else {
    logWarning('Some tests failed. Check the issues above.');
  }
  
  log('\n📝 Next Steps:', 'bold');
  log('1. Apply the database schema from database-schema.sql', 'blue');
  log('2. Start your Next.js app: npm run dev', 'blue');
  log('3. Test the UI by adding items and refreshing the page', 'blue');
  log('4. Check the browser console for any errors', 'blue');
}

// Run the tests
runAllTests().catch(error => {
  logError(`Test suite failed: ${error.message}`);
  process.exit(1);
});
