#!/usr/bin/env node

/**
 * Simple Database Test Script
 * Run with: node scripts/test-db.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

async function testDatabase() {
  log(colors.bold + colors.blue, '🧪 Testing Walmart Wavefinder Database Setup\n');

  // Test 1: Environment Variables
  log(colors.blue, '1. Checking Environment Variables...');
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'GEMINI_API_KEY'
  ];

  let envValid = true;
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      log(colors.green, `   ✅ ${varName} is set`);
    } else {
      log(colors.red, `   ❌ ${varName} is missing`);
      envValid = false;
    }
  });

  if (!envValid) {
    log(colors.red, '\n❌ Environment validation failed. Please check your .env.local file.');
    process.exit(1);
  }

  // Test 2: Supabase Connection
  log(colors.blue, '\n2. Testing Supabase Connection...');
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
    
    if (error) {
      log(colors.red, `   ❌ Connection failed: ${error.message}`);
      return;
    }
    
    log(colors.green, '   ✅ Supabase connection successful');
  } catch (error) {
    log(colors.red, `   ❌ Connection error: ${error.message}`);
    return;
  }

  // Test 3: Database Tables
  log(colors.blue, '\n3. Testing Database Tables...');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const expectedTables = ['user_profiles', 'store_items', 'chat_sessions', 'shopping_history'];
  
  for (const tableName of expectedTables) {
    try {
      const { data, error } = await supabase.from(tableName).select('*').limit(1);
      
      if (error) {
        log(colors.red, `   ❌ Table ${tableName}: ${error.message}`);
      } else {
        log(colors.green, `   ✅ Table ${tableName} accessible`);
      }
    } catch (error) {
      log(colors.red, `   ❌ Table ${tableName}: ${error.message}`);
    }
  }

  // Test 4: CRUD Operations
  log(colors.blue, '\n4. Testing CRUD Operations...');
  const testUserId = '00000000-0000-0000-0000-' + Date.now().toString().slice(-12);
  
  try {
    // Create
    const { error: createError } = await supabase
      .from('user_profiles')
      .insert({
        id: testUserId,
        email: 'test@example.com',
        name: 'Test User',
        preferences: {
          mapFilters: {
            showSections: ['dairy'],
            showItems: true,
            showRoute: true,
            showAnchors: true,
            showServices: true
          },
          dietaryRestrictions: [],
          brandPreferences: [],
          organicPreference: false
        }
      });

    if (createError) {
      log(colors.red, `   ❌ Create failed: ${createError.message}`);
    } else {
      log(colors.green, '   ✅ Create operation successful');
    }

    // Read
    const { data: readData, error: readError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', testUserId)
      .single();

    if (readError) {
      log(colors.red, `   ❌ Read failed: ${readError.message}`);
    } else {
      log(colors.green, '   ✅ Read operation successful');
    }

    // Update
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ name: 'Updated Test User' })
      .eq('id', testUserId);

    if (updateError) {
      log(colors.red, `   ❌ Update failed: ${updateError.message}`);
    } else {
      log(colors.green, '   ✅ Update operation successful');
    }

    // Delete (cleanup)
    const { error: deleteError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', testUserId);

    if (deleteError) {
      log(colors.red, `   ❌ Delete failed: ${deleteError.message}`);
    } else {
      log(colors.green, '   ✅ Delete operation successful');
    }

  } catch (error) {
    log(colors.red, `   ❌ CRUD operations error: ${error.message}`);
  }

  // Test 5: Gemini API
  log(colors.blue, '\n5. Testing Gemini API...');
  try {
    const model = process.env.GEMINI_MODEL || 'models/gemma-3n-e4b-it';
    const endpoint = model.startsWith('models/') 
      ? `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent`
      : `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    
    const response = await fetch(`${endpoint}?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Test message for API connection'
          }]
        }]
      })
    });

    if (!response.ok) {
      log(colors.red, `   ❌ API request failed: ${response.status} ${response.statusText}`);
    } else {
      const data = await response.json();
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        log(colors.green, '   ✅ Gemini API connection successful');
      } else {
        log(colors.red, '   ❌ Invalid API response format');
      }
    }
  } catch (error) {
    log(colors.red, `   ❌ Gemini API error: ${error.message}`);
  }

  log(colors.bold + colors.green, '\n🎉 Database testing completed!');
  log(colors.blue, 'If you see any ❌ errors above, please check your configuration.');
}

// Run the test
testDatabase().catch(error => {
  log(colors.red, `Test failed: ${error.message}`);
  process.exit(1);
});
