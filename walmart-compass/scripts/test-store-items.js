#!/usr/bin/env node

/**
 * Test Store Items Script
 * 
 * This script tests the populated store items and RAG functionality.
 */

import { createClient } from '@supabase/supabase-js';
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
async function testItemCount() {
  log('\n🔢 Testing Item Count...', 'bold');
  
  try {
    const { count, error } = await supabase
      .from('store_items')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      logError(`Failed to count items: ${error.message}`);
      return false;
    }
    
    logSuccess(`Total items in database: ${count}`);
    return count > 0;
  } catch (error) {
    logError(`Count test failed: ${error.message}`);
    return false;
  }
}

async function testCategories() {
  log('\n📂 Testing Categories...', 'bold');
  
  try {
    const { data, error } = await supabase
      .from('store_items')
      .select('category')
      .order('category');
    
    if (error) {
      logError(`Failed to get categories: ${error.message}`);
      return false;
    }
    
    const categories = [...new Set(data.map(item => item.category))];
    logSuccess(`Found ${categories.length} categories: ${categories.join(', ')}`);
    
    // Show item count per category
    const categoryCount = data.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});
    
    logInfo('Items per category:');
    Object.entries(categoryCount).forEach(([category, count]) => {
      log(`  - ${category}: ${count} items`, 'blue');
    });
    
    return true;
  } catch (error) {
    logError(`Categories test failed: ${error.message}`);
    return false;
  }
}

async function testCoordinates() {
  log('\n📍 Testing Coordinates...', 'bold');
  
  try {
    const { data, error } = await supabase
      .from('store_items')
      .select('name, category, coordinates')
      .limit(10);
    
    if (error) {
      logError(`Failed to get coordinates: ${error.message}`);
      return false;
    }
    
    logSuccess(`Retrieved ${data.length} items with coordinates`);
    
    // Check if coordinates are valid
    const validCoords = data.filter(item => 
      item.coordinates && 
      typeof item.coordinates.x === 'number' && 
      typeof item.coordinates.y === 'number'
    );
    
    if (validCoords.length === data.length) {
      logSuccess('All coordinates are valid');
      
      // Show sample coordinates
      logInfo('Sample coordinates:');
      validCoords.slice(0, 5).forEach(item => {
        log(`  - ${item.name} (${item.category}): (${item.coordinates.x}, ${item.coordinates.y})`, 'blue');
      });
    } else {
      logWarning(`Only ${validCoords.length}/${data.length} items have valid coordinates`);
    }
    
    return true;
  } catch (error) {
    logError(`Coordinates test failed: ${error.message}`);
    return false;
  }
}

async function testSearch() {
  log('\n🔍 Testing Search Functionality...', 'bold');
  
  try {
    // Test text search
    const { data: searchResults, error: searchError } = await supabase
      .from('store_items')
      .select('name, category, price')
      .ilike('name', '%milk%');
    
    if (searchError) {
      logError(`Search test failed: ${searchError.message}`);
      return false;
    }
    
    logSuccess(`Found ${searchResults.length} items containing 'milk'`);
    searchResults.forEach(item => {
      log(`  - ${item.name} (${item.category}) - $${item.price}`, 'blue');
    });
    
    // Test category filter
    const { data: categoryResults, error: categoryError } = await supabase
      .from('store_items')
      .select('name, price')
      .eq('category', 'dairy')
      .limit(5);
    
    if (categoryError) {
      logError(`Category filter test failed: ${categoryError.message}`);
      return false;
    }
    
    logSuccess(`Found ${categoryResults.length} dairy items`);
    categoryResults.forEach(item => {
      log(`  - ${item.name} - $${item.price}`, 'blue');
    });
    
    return true;
  } catch (error) {
    logError(`Search test failed: ${error.message}`);
    return false;
  }
}

async function testEmbeddings() {
  log('\n🧠 Testing Embeddings...', 'bold');
  
  try {
    const { data, error } = await supabase
      .from('store_items')
      .select('name, embedding')
      .not('embedding', 'is', null)
      .limit(5);
    
    if (error) {
      logError(`Embeddings test failed: ${error.message}`);
      return false;
    }
    
    if (data.length === 0) {
      logWarning('No items with embeddings found');
      logInfo('Run the full population script to add embeddings');
      return false;
    }
    
    logSuccess(`Found ${data.length} items with embeddings`);
    
    // Check embedding dimensions
    const embedding = data[0].embedding;
    if (Array.isArray(embedding)) {
      logSuccess(`Embedding dimensions: ${embedding.length}`);
      logInfo(`Sample embedding for "${data[0].name}": [${embedding.slice(0, 5).join(', ')}...]`);
    } else {
      logWarning('Embeddings are not in expected array format');
    }
    
    return true;
  } catch (error) {
    logError(`Embeddings test failed: ${error.message}`);
    return false;
  }
}

async function testPriceRange() {
  log('\n💰 Testing Price Range...', 'bold');
  
  try {
    const { data, error } = await supabase
      .from('store_items')
      .select('name, price')
      .order('price', { ascending: false })
      .limit(5);
    
    if (error) {
      logError(`Price test failed: ${error.message}`);
      return false;
    }
    
    logSuccess('Most expensive items:');
    data.forEach((item, index) => {
      log(`  ${index + 1}. ${item.name} - $${item.price}`, 'blue');
    });
    
    // Get cheapest items
    const { data: cheapest, error: cheapestError } = await supabase
      .from('store_items')
      .select('name, price')
      .order('price', { ascending: true })
      .limit(5);
    
    if (!cheapestError) {
      logSuccess('Cheapest items:');
      cheapest.forEach((item, index) => {
        log(`  ${index + 1}. ${item.name} - $${item.price}`, 'blue');
      });
    }
    
    return true;
  } catch (error) {
    logError(`Price test failed: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  log('🧪 Store Items Test Suite', 'bold');
  log('=' .repeat(50), 'blue');
  
  const tests = [
    { name: 'Item Count', fn: testItemCount },
    { name: 'Categories', fn: testCategories },
    { name: 'Coordinates', fn: testCoordinates },
    { name: 'Search', fn: testSearch },
    { name: 'Embeddings', fn: testEmbeddings },
    { name: 'Price Range', fn: testPriceRange }
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
    logSuccess('All tests passed! Store items are ready for testing.');
  } else {
    logWarning('Some tests failed. Check the issues above.');
  }
  
  log('\n📝 Next Steps:', 'bold');
  log('1. Test the RAG system in your app', 'blue');
  log('2. Try searching for items like "milk", "bread", "chicken"', 'blue');
  log('3. Test the chat functionality with item requests', 'blue');
  log('4. Verify that items appear on the map with correct coordinates', 'blue');
}

// Run the tests
runAllTests().catch(error => {
  logError(`Test suite failed: ${error.message}`);
  process.exit(1);
});
