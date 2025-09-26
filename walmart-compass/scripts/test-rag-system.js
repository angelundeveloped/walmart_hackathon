#!/usr/bin/env node

/**
 * Test RAG System Script
 * 
 * This script tests the RAG system to ensure it's using database items
 * instead of hardcoded ones.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fetch from 'node-fetch';

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

function logInfo(message) {
  console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
}

function logSuccess(message) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

function logError(message) {
  console.log(`${colors.red}❌ ${message}${colors.reset}`);
}

// Test function to check if RAG system uses database items
async function testRAGSystem() {
  logInfo('Testing RAG system with database items...');
  
  try {
    // First, get some items from the database
    const { data: dbItems, error } = await supabase
      .from('store_items')
      .select('name, category')
      .limit(5);
    
    if (error) {
      logError(`Failed to fetch database items: ${error.message}`);
      return false;
    }
    
    if (!dbItems || dbItems.length === 0) {
      logError('No items found in database. Run populate script first.');
      return false;
    }
    
    logSuccess(`Found ${dbItems.length} items in database:`);
    dbItems.forEach(item => {
      logInfo(`  - ${item.name} (${item.category})`);
    });
    
    // Test the RAG API endpoint
    const testMessage = "I need some milk and bread for breakfast";
    
    logInfo(`Testing RAG API with message: "${testMessage}"`);
    
    const response = await fetch(`${API_BASE_URL}/api/chat-simple-rag`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: testMessage,
        userContext: {
          preferences: {
            dietaryRestrictions: [],
            brandPreferences: [],
            organicPreference: false
          },
          shoppingHistory: []
        },
        context: testMessage,
        language: 'en'
      }),
    });
    
    if (!response.ok) {
      logError(`RAG API request failed: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      logError(`Error details: ${errorText}`);
      return false;
    }
    
    const data = await response.json();
    
    if (!data.response) {
      logError('No response from RAG API');
      return false;
    }
    
    logSuccess('RAG API responded successfully!');
    logInfo('Response preview:');
    console.log(data.response.substring(0, 200) + '...');
    
    // Check if the response contains database items
    const responseText = data.response.toLowerCase();
    const foundDbItems = dbItems.filter(item => 
      responseText.includes(item.name.toLowerCase())
    );
    
    if (foundDbItems.length > 0) {
      logSuccess(`✅ RAG system is using database items! Found ${foundDbItems.length} database items in response:`);
      foundDbItems.forEach(item => {
        logInfo(`  - ${item.name} (${item.category})`);
      });
      return true;
    } else {
      logWarning('⚠️  RAG system may not be using database items. Response might contain hardcoded items.');
      return false;
    }
    
  } catch (error) {
    logError(`RAG system test failed: ${error.message}`);
    return false;
  }
}

// Test function to verify inventory endpoint
async function testInventoryEndpoint() {
  logInfo('Testing inventory endpoint...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat-simple-rag`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: "What items do you have available?",
        userContext: {
          preferences: {
            dietaryRestrictions: [],
            brandPreferences: [],
            organicPreference: false
          },
          shoppingHistory: []
        },
        context: "inventory check",
        language: 'en'
      }),
    });
    
    if (!response.ok) {
      logError(`Inventory test failed: ${response.status} ${response.statusText}`);
      return false;
    }
    
    const data = await response.json();
    
    if (!data.response) {
      logError('No response from inventory test');
      return false;
    }
    
    logSuccess('Inventory endpoint working!');
    logInfo('Response preview:');
    console.log(data.response.substring(0, 300) + '...');
    
    return true;
    
  } catch (error) {
    logError(`Inventory test failed: ${error.message}`);
    return false;
  }
}

// Main test function
async function main() {
  try {
    console.log(`${colors.bold}${colors.blue}🧪 RAG System Test Suite${colors.reset}`);
    console.log('==================================================');
    
    // Test 1: Check database items
    logInfo('Test 1: Checking database items...');
    const { data: items, error } = await supabase
      .from('store_items')
      .select('name, category')
      .limit(10);
    
    if (error) {
      logError(`Database test failed: ${error.message}`);
      process.exit(1);
    }
    
    if (!items || items.length === 0) {
      logError('No items found in database. Run populate script first.');
      process.exit(1);
    }
    
    logSuccess(`✅ Database has ${items.length} items available`);
    
    // Test 2: Test RAG system
    logInfo('\nTest 2: Testing RAG system...');
    const ragTestPassed = await testRAGSystem();
    
    // Test 3: Test inventory endpoint
    logInfo('\nTest 3: Testing inventory endpoint...');
    const inventoryTestPassed = await testInventoryEndpoint();
    
    // Summary
    console.log(`\n${colors.bold}📊 Test Results:${colors.reset}`);
    logSuccess(`Database items: ✅ Available (${items.length} items)`);
    logSuccess(`RAG system: ${ragTestPassed ? '✅ Using database items' : '⚠️  May be using hardcoded items'}`);
    logSuccess(`Inventory endpoint: ${inventoryTestPassed ? '✅ Working' : '❌ Failed'}`);
    
    if (ragTestPassed && inventoryTestPassed) {
      logSuccess('\n🎉 All tests passed! RAG system is working with database items.');
    } else {
      logWarning('\n⚠️  Some tests failed. Check the logs above for details.');
    }
    
  } catch (error) {
    logError(`Test suite failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the tests
main();
