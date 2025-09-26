import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Create fallback embedding (same as in RAG system)
function createFallbackEmbedding(text) {
  const words = text.toLowerCase().split(/\s+/);
  const vocabulary = [
    'healthy', 'snacks', 'workout', 'breakfast', 'lunch', 'dinner', 'organic', 'fresh',
    'milk', 'bread', 'eggs', 'cheese', 'yogurt', 'bananas', 'apples', 'water',
    'dairy', 'bakery', 'produce', 'pantry', 'beverages', 'snacks', 'frozen',
    'protein', 'vitamins', 'nutrition', 'energy', 'fitness', 'exercise'
  ];
  
  const embedding = new Array(384).fill(0);
  
  words.forEach(word => {
    const index = vocabulary.indexOf(word);
    if (index !== -1) {
      // Map vocabulary word to embedding dimensions
      const embeddingIndex = index % 384;
      embedding[embeddingIndex] += 1;
    }
  });
  
  // Normalize the embedding
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    return embedding.map(val => val / magnitude);
  }
  
  return embedding;
}

async function testSupabaseWithFallback() {
  console.log('🧪 Testing Supabase with Fallback Embeddings');
  console.log('============================================');
  
  try {
    // Test 1: Create fallback embedding
    console.log('🔍 Test 1: Creating fallback embedding...');
    const query = 'healthy snacks for workout';
    const queryEmbedding = createFallbackEmbedding(query);
    console.log(`✅ Created fallback embedding: ${queryEmbedding.length} dimensions`);
    console.log(`   First 5 values: [${queryEmbedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);
    
    // Test 2: Test Supabase function with very low threshold
    console.log('\n🔍 Test 2: Testing Supabase function with threshold 0.01...');
    
    const { data: results, error } = await supabase.rpc('match_store_items', {
      query_embedding: queryEmbedding,
      match_threshold: 0.01,
      match_count: 10
    });
    
    if (error) {
      console.error('❌ Supabase RPC error:', error.message);
      return;
    }
    
    console.log(`✅ Supabase search found ${results.length} results:`);
    results.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.name} (${result.category}) - similarity: ${result.similarity.toFixed(4)}`);
    });
    
    // Test 3: Test with even lower threshold
    console.log('\n🔍 Test 3: Testing with threshold 0.001...');
    
    const { data: moreResults, error: moreError } = await supabase.rpc('match_store_items', {
      query_embedding: queryEmbedding,
      match_threshold: 0.001,
      match_count: 10
    });
    
    if (moreError) {
      console.error('❌ Supabase RPC error:', moreError.message);
    } else {
      console.log(`✅ Lower threshold search found ${moreResults.length} results:`);
      moreResults.forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.name} (${result.category}) - similarity: ${result.similarity.toFixed(4)}`);
      });
    }
    
    // Test 4: Check if items have proper embeddings
    console.log('\n🔍 Test 4: Checking item embeddings...');
    
    const { data: items, error: itemsError } = await supabase
      .from('store_items')
      .select('id, name, category, embedding')
      .not('embedding', 'is', null)
      .limit(3);
    
    if (itemsError) {
      console.error('❌ Error fetching items:', itemsError.message);
    } else {
      console.log(`✅ Found ${items.length} items with embeddings:`);
      items.forEach(item => {
        if (typeof item.embedding === 'string') {
          try {
            const parsed = JSON.parse(item.embedding);
            console.log(`   • ${item.name} (${item.category}) - string embedding, parsed length: ${parsed.length}`);
          } catch (e) {
            console.log(`   • ${item.name} (${item.category}) - string embedding, parse failed`);
          }
        } else if (Array.isArray(item.embedding)) {
          console.log(`   • ${item.name} (${item.category}) - array embedding, length: ${item.embedding.length}`);
        } else {
          console.log(`   • ${item.name} (${item.category}) - unknown embedding type: ${typeof item.embedding}`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSupabaseWithFallback();
