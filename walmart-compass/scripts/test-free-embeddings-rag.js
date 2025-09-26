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

async function testFreeEmbeddingsRAG() {
  console.log('🧪 Testing RAG System with Free Embeddings');
  console.log('==========================================');
  
  try {
    // Test 1: Get embedding from our API
    console.log('🔍 Test 1: Getting embedding from free API...');
    
    const response = await fetch('http://localhost:3001/api/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: 'healthy snacks for workout' }),
    });
    
    if (!response.ok) {
      throw new Error(`Embedding API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    const queryEmbedding = data.embedding;
    
    if (!queryEmbedding || !Array.isArray(queryEmbedding)) {
      throw new Error('Invalid embedding received');
    }
    
    console.log(`✅ Got embedding: ${queryEmbedding.length} dimensions`);
    console.log(`   First 5 values: [${queryEmbedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);
    
    // Test 2: Test Supabase semantic search with the embedding
    console.log('\n🔍 Test 2: Testing Supabase semantic search...');
    
    const { data: results, error } = await supabase.rpc('match_store_items', {
      query_embedding: queryEmbedding,
      match_threshold: 0.1,
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
    
    // Test 3: Test with lower threshold
    console.log('\n🔍 Test 3: Testing with lower threshold (0.05)...');
    
    const { data: moreResults, error: moreError } = await supabase.rpc('match_store_items', {
      query_embedding: queryEmbedding,
      match_threshold: 0.05,
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
    
    // Test 4: Test with even lower threshold
    console.log('\n🔍 Test 4: Testing with very low threshold (0.01)...');
    
    const { data: allResults, error: allError } = await supabase.rpc('match_store_items', {
      query_embedding: queryEmbedding,
      match_threshold: 0.01,
      match_count: 10
    });
    
    if (allError) {
      console.error('❌ Supabase RPC error:', allError.message);
    } else {
      console.log(`✅ Very low threshold search found ${allResults.length} results:`);
      allResults.forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.name} (${result.category}) - similarity: ${result.similarity.toFixed(4)}`);
      });
    }
    
    // Test 5: Check what items have embeddings
    console.log('\n🔍 Test 5: Checking items with embeddings...');
    
    const { data: items, error: itemsError } = await supabase
      .from('store_items')
      .select('id, name, category, embedding')
      .not('embedding', 'is', null)
      .limit(5);
    
    if (itemsError) {
      console.error('❌ Error fetching items:', itemsError.message);
    } else {
      console.log(`✅ Found ${items.length} items with embeddings:`);
      items.forEach(item => {
        const embeddingLength = Array.isArray(item.embedding) ? item.embedding.length : 'N/A';
        console.log(`   • ${item.name} (${item.category}) - embedding length: ${embeddingLength}`);
      });
    }
    
    console.log('\n🎉 Free embeddings RAG test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFreeEmbeddingsRAG();
