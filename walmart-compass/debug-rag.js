#!/usr/bin/env node

/**
 * Debug RAG System Script
 * 
 * This script tests the RAG system directly to debug issues
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '.env.local') });

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables');
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

function logError(message) {
  console.log(`${colors.red}❌ ${message}${colors.reset}`);
}

// Test function to check database items and embeddings
async function debugDatabaseItems() {
  logInfo('Checking database items and embeddings...');
  
  try {
    const { data: items, error } = await supabase
      .from('store_items')
      .select('id, name, category, description, embedding')
      .limit(5);
    
    if (error) {
      logError(`Failed to fetch items: ${error.message}`);
      return;
    }
    
    if (!items || items.length === 0) {
      logError('No items found in database');
      return;
    }
    
    logSuccess(`Found ${items.length} items in database`);
    
    items.forEach(item => {
      const hasEmbedding = item.embedding && Array.isArray(item.embedding) && item.embedding.length > 0;
      logInfo(`- ${item.name} (${item.category}): embedding=${hasEmbedding ? 'YES' : 'NO'} (${item.embedding?.length || 0} dimensions)`);
    });
    
    return items;
  } catch (error) {
    logError(`Database check failed: ${error.message}`);
    return null;
  }
}

// Test function to check vector database initialization
async function debugVectorDB() {
  logInfo('Testing vector database initialization...');
  
  try {
    // Import the vector database
    const { vectorDB } = await import('./src/lib/vector-db.ts');
    
    // Initialize
    await vectorDB.initialize();
    
    // Get all items
    const allItems = vectorDB.getAllItems();
    logSuccess(`Vector DB has ${allItems.length} items`);
    
    if (allItems.length > 0) {
      const firstItem = allItems[0];
      logInfo(`First item: ${firstItem.name} - embedding length: ${firstItem.embedding.length}`);
    }
    
    // Test search
    const searchResults = await vectorDB.search('healthy snacks', 3);
    logSuccess(`Search for 'healthy snacks' returned ${searchResults.length} results`);
    
    searchResults.forEach(result => {
      logInfo(`- ${result.item.name} (similarity: ${result.similarity.toFixed(3)})`);
    });
    
    return searchResults;
  } catch (error) {
    logError(`Vector DB test failed: ${error.message}`);
    return null;
  }
}

// Test function to check RAG system
async function debugRAGSystem() {
  logInfo('Testing RAG system...');
  
  try {
    const { ragSystem } = await import('./src/lib/rag.ts');
    
    // Initialize with test context
    await ragSystem.initialize({
      preferences: {
        dietaryRestrictions: [],
        brandPreferences: [],
        organicPreference: true
      },
      shoppingHistory: [],
      currentSession: {
        items: [],
        context: 'workout'
      }
    });
    
    // Test search with context
    const searchResults = await ragSystem.searchWithContext('healthy snacks for workout', 5);
    logSuccess(`RAG search returned ${searchResults.length} results`);
    
    searchResults.forEach(result => {
      logInfo(`- ${result.item.name} (similarity: ${result.similarity.toFixed(3)})`);
    });
    
    // Test building RAG context
    const ragContext = await ragSystem.buildRAGContext('healthy snacks for workout', 'workout');
    logSuccess(`RAG context built with ${ragContext.relevantItems.length} relevant items and ${ragContext.recommendations.length} recommendations`);
    
    return ragContext;
  } catch (error) {
    logError(`RAG system test failed: ${error.message}`);
    return null;
  }
}

// Main debug function
async function main() {
  try {
    console.log(`${colors.bold}${colors.blue}🐛 RAG System Debug${colors.reset}`);
    console.log('=====================================');
    
    // Test 1: Database items
    logInfo('\nTest 1: Database items and embeddings');
    const items = await debugDatabaseItems();
    
    // Test 2: Vector database
    logInfo('\nTest 2: Vector database');
    const vectorResults = await debugVectorDB();
    
    // Test 3: RAG system
    logInfo('\nTest 3: RAG system');
    const ragResults = await debugRAGSystem();
    
    // Summary
    console.log(`\n${colors.bold}📊 Debug Results:${colors.reset}`);
    logSuccess(`Database items: ${items ? items.length : 0} items`);
    logSuccess(`Vector DB: ${vectorResults ? vectorResults.length : 0} search results`);
    logSuccess(`RAG system: ${ragResults ? ragResults.relevantItems.length : 0} relevant items`);
    
    if (items && items.length > 0 && vectorResults && vectorResults.length > 0) {
      logSuccess('\n🎉 RAG system is working!');
    } else {
      logError('\n⚠️  RAG system has issues. Check the logs above.');
    }
    
  } catch (error) {
    logError(`Debug failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the debug
main();
