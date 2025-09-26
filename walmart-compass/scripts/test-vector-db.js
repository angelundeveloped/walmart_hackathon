#!/usr/bin/env node

/**
 * Test Vector Database Script
 * 
 * This script tests the vector database directly
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

// Simple vector database implementation for testing
class TestVectorDB {
  constructor() {
    this.items = [];
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      const { data: dbItems, error } = await supabase
        .from('store_items')
        .select('id, name, category, description, coordinates, price, embedding')
        .eq('in_stock', true);
      
      if (!error && dbItems && dbItems.length > 0) {
        this.items = dbItems.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description || `${item.name} ${item.category}`,
          category: item.category,
          embedding: Array.isArray(item.embedding) ? item.embedding : [],
          coordinates: item.coordinates,
          price: item.price || 0
        }));
        
        console.log(`✅ Vector DB initialized with ${this.items.length} items`);
        this.isInitialized = true;
        return;
      } else {
        console.error('❌ Failed to load items from database:', error);
      }
    } catch (error) {
      console.error('❌ Vector database initialization failed:', error);
    }
  }

  // Simple bag-of-words embedding
  createFallbackEmbedding(text) {
    const vocabulary = [
      'milk', 'bread', 'eggs', 'cheese', 'yogurt', 'chicken', 'beef', 'salmon',
      'bananas', 'apples', 'lettuce', 'tomatoes', 'ice cream', 'vegetables', 'pizza',
      'pasta', 'rice', 'cereal', 'cookies', 'olive oil', 'water', 'soda',
      'coffee', 'shampoo', 'toothpaste', 'multivitamin', 'detergent', 'paper towels',
      'toilet paper', 'dish soap', 'organic', 'whole wheat', 'free range', 'sharp',
      'greek', 'everything', 'red delicious', 'romaine', 'roma', 'boneless', 'ground',
      'atlantic', 'vanilla', 'mixed', 'pepperoni', 'spaghetti', 'basmati', 'honey nut',
      'chocolate chip', 'crushed', 'extra virgin', 'spring', 'coca-cola', 'dark roast',
      'moisturizing', 'fluoride', 'daily', 'liquid', 'original', 'pack', 'lb', 'qt', 'oz',
      'party', 'celebration', 'dinner', 'cooking', 'breakfast', 'workout', 'fitness',
      'healthy eating', 'baby', 'child', 'cleaning', 'office', 'work', 'travel', 'trip',
      'emergency', 'storage', 'snacks', 'candy', 'beverages', 'health', 'beauty', 'household',
      'electronics', 'toys', 'games', 'healthy', 'snacks', 'protein', 'energy'
    ];

    const lowerText = text.toLowerCase();
    const vector = new Array(vocabulary.length).fill(0);
    
    vocabulary.forEach((word, index) => {
      if (lowerText.includes(word)) {
        vector[index] = 1;
      }
    });
    
    return this.normalizeVector(vector);
  }

  normalizeVector(vector) {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return magnitude === 0 ? vector : vector.map(val => val / magnitude);
  }

  cosineSimilarity(a, b) {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async search(query, limit = 5) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    console.log(`🔍 Searching for: "${query}" with ${this.items.length} items`);
    
    const queryVector = this.createFallbackEmbedding(query);
    const results = [];
    
    for (const item of this.items) {
      let itemEmbedding;
      
      if (item.embedding && item.embedding.length > 0) {
        // Use existing embedding if available
        itemEmbedding = item.embedding;
      } else {
        // Create fallback embedding
        itemEmbedding = this.createFallbackEmbedding(`${item.name} ${item.description} ${item.category}`);
      }
      
      const similarity = this.cosineSimilarity(queryVector, itemEmbedding);
      if (similarity > 0.01) {
        results.push({
          item,
          similarity,
          distance: 1 - similarity
        });
      }
    }
    
    // Sort by similarity (highest first)
    results.sort((a, b) => b.similarity - a.similarity);
    
    console.log(`✅ Found ${results.length} similar items`);
    
    return results.slice(0, limit);
  }
}

// Test the vector database
async function testVectorDB() {
  console.log('🧪 Testing Vector Database');
  console.log('==========================');
  
  const vectorDB = new TestVectorDB();
  
  // Initialize
  await vectorDB.initialize();
  
  // Test searches
  const testQueries = [
    'healthy snacks',
    'workout food',
    'breakfast items',
    'dairy products',
    'organic food'
  ];
  
  for (const query of testQueries) {
    console.log(`\n🔍 Testing query: "${query}"`);
    const results = await vectorDB.search(query, 3);
    
    if (results.length > 0) {
      console.log(`✅ Found ${results.length} results:`);
      results.forEach(result => {
        console.log(`  - ${result.item.name} (${result.item.category}) - similarity: ${result.similarity.toFixed(3)}`);
      });
    } else {
      console.log('❌ No results found');
    }
  }
}

// Run the test
testVectorDB().catch(console.error);
