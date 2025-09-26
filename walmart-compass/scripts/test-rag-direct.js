#!/usr/bin/env node

/**
 * Direct RAG System Test
 * 
 * This script tests the RAG system directly to verify it's working
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

// Simple RAG system implementation for testing
class TestRAGSystem {
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
        this.items = dbItems.map(item => {
          let embedding = [];
          if (item.embedding) {
            if (Array.isArray(item.embedding)) {
              embedding = item.embedding;
            } else if (typeof item.embedding === 'string') {
              try {
                embedding = JSON.parse(item.embedding);
              } catch (e) {
                console.error(`Failed to parse embedding for ${item.name}:`, e);
                embedding = [];
              }
            }
          }
          
          return {
            id: item.id,
            name: item.name,
            description: item.description || `${item.name} ${item.category}`,
            category: item.category,
            embedding: embedding,
            coordinates: item.coordinates,
            price: item.price || 0
          };
        });
        
        logSuccess(`RAG system initialized with ${this.items.length} items`);
        this.isInitialized = true;
        return;
      } else {
        logError(`Failed to load items: ${error?.message}`);
      }
    } catch (error) {
      logError(`RAG system initialization failed: ${error.message}`);
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
      'electronics', 'toys', 'games', 'healthy', 'snacks', 'protein', 'energy', 'nutrition'
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

  async searchWithContext(query, limit = 5) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    logInfo(`Searching for: "${query}"`);
    
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
      
      // Only compare if both embeddings have the same dimensions
      if (queryVector.length === itemEmbedding.length) {
        const similarity = this.cosineSimilarity(queryVector, itemEmbedding);
        if (similarity > 0.01) {
          results.push({
            item,
            similarity,
            distance: 1 - similarity
          });
        }
      } else {
        // If dimensions don't match, use fallback embedding for the item too
        const fallbackItemEmbedding = this.createFallbackEmbedding(`${item.name} ${item.description} ${item.category}`);
        const similarity = this.cosineSimilarity(queryVector, fallbackItemEmbedding);
        if (similarity > 0.01) {
          results.push({
            item,
            similarity,
            distance: 1 - similarity
          });
        }
      }
      
      // Debug: show similarities for first few items
      if (results.length === 0 && item === this.items[0]) {
        console.log(`Debug - Query vector length: ${queryVector.length}, Item embedding length: ${itemEmbedding.length}`);
        const fallbackItemEmbedding = this.createFallbackEmbedding(`${item.name} ${item.description} ${item.category}`);
        const fallbackSimilarity = this.cosineSimilarity(queryVector, fallbackItemEmbedding);
        console.log(`Debug - Fallback similarity for "${item.name}": ${fallbackSimilarity.toFixed(4)}`);
      }
    }
    
    // Sort by similarity (highest first)
    results.sort((a, b) => b.similarity - a.similarity);
    
    logSuccess(`Found ${results.length} similar items`);
    
    return results.slice(0, limit);
  }

  async buildRAGContext(query, context) {
    const relevantItems = await this.searchWithContext(query, 8);
    
    // Generate contextual recommendations
    const recommendations = this.generateRecommendations(context || query);
    
    return {
      relevantItems,
      recommendations,
      userPreferences: {
        dietaryRestrictions: [],
        brandPreferences: [],
        organicPreference: true
      },
      currentContext: context || query
    };
  }

  generateRecommendations(context) {
    const recommendations = [];
    
    switch (context.toLowerCase()) {
      case 'workout':
      case 'fitness':
        recommendations.push('Greek Yogurt', 'Organic Bananas', 'Spring Water (24 pack)');
        break;
      case 'party':
      case 'celebration':
        recommendations.push('Chocolate Chip Cookies', 'Coca-Cola (12 pack)', 'Spring Water (24 pack)');
        break;
      case 'dinner':
      case 'cooking':
        recommendations.push('Boneless Chicken Breast', 'Roma Tomatoes', 'Extra Virgin Olive Oil');
        break;
      case 'breakfast':
        recommendations.push('Organic Whole Milk', 'Whole Wheat Bread', 'Free Range Eggs');
        break;
      default:
        recommendations.push('Greek Yogurt', 'Organic Bananas', 'Spring Water (24 pack)');
    }
    
    return recommendations;
  }
}

// Test the RAG system
async function testRAGSystem() {
  console.log(`${colors.bold}${colors.blue}🧪 Testing RAG System Directly${colors.reset}`);
  console.log('=====================================');
  
  const ragSystem = new TestRAGSystem();
  
  // Initialize
  await ragSystem.initialize();
  
  // Test searches
  const testQueries = [
    'healthy snacks for workout',
    'breakfast items',
    'dairy products',
    'organic food'
  ];
  
  for (const query of testQueries) {
    console.log(`\n🔍 Testing query: "${query}"`);
    const ragContext = await ragSystem.buildRAGContext(query, 'workout');
    
    logSuccess(`RAG context built with ${ragContext.relevantItems.length} relevant items and ${ragContext.recommendations.length} recommendations`);
    
    if (ragContext.relevantItems.length > 0) {
      logInfo('Relevant items:');
      ragContext.relevantItems.forEach(result => {
        logInfo(`  - ${result.item.name} (${result.item.category}) - similarity: ${result.similarity.toFixed(3)}`);
      });
    } else {
      logError('No relevant items found');
    }
    
    logInfo('Recommendations:');
    ragContext.recommendations.forEach(rec => {
      logInfo(`  - ${rec}`);
    });
  }
}

// Run the test
testRAGSystem().catch(console.error);
