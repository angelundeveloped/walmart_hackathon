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

// Create a simple test embedding (384 dimensions)
function createTestEmbedding() {
  const embedding = [];
  for (let i = 0; i < 384; i++) {
    embedding.push(Math.random() * 2 - 1); // Random values between -1 and 1
  }
  return embedding;
}

async function testSupabaseSemanticSearch() {
  console.log('🧪 Testing Supabase Semantic Search Function');
  console.log('=============================================');
  
  try {
    // Test 1: Check if the function exists
    console.log('🔍 Test 1: Checking if match_store_items function exists...');
    
    const { data: functions, error: funcError } = await supabase
      .from('pg_proc')
      .select('proname')
      .eq('proname', 'match_store_items');
    
    if (funcError) {
      console.log('⚠️  Could not check function existence (this is normal)');
    } else {
      console.log('✅ Function check completed');
    }
    
    // Test 2: Check store items with embeddings
    console.log('\n🔍 Test 2: Checking store items with embeddings...');
    
    const { data: items, error: itemsError } = await supabase
      .from('store_items')
      .select('id, name, category, embedding')
      .not('embedding', 'is', null)
      .limit(5);
    
    if (itemsError) {
      console.error('❌ Error fetching items:', itemsError.message);
      return;
    }
    
    console.log(`✅ Found ${items.length} items with embeddings:`);
    items.forEach(item => {
      const embeddingLength = Array.isArray(item.embedding) ? item.embedding.length : 'N/A';
      console.log(`   • ${item.name} (${item.category}) - embedding length: ${embeddingLength}`);
    });
    
    if (items.length === 0) {
      console.log('❌ No items with embeddings found. The semantic search will not work.');
      return;
    }
    
    // Test 3: Test the semantic search function
    console.log('\n🔍 Test 3: Testing match_store_items function...');
    
    const testEmbedding = createTestEmbedding();
    console.log(`   Using test embedding with ${testEmbedding.length} dimensions`);
    
    const { data: results, error: searchError } = await supabase.rpc('match_store_items', {
      query_embedding: testEmbedding,
      match_threshold: 0.1,
      match_count: 5
    });
    
    if (searchError) {
      console.error('❌ Semantic search function error:', searchError.message);
      console.log('\n💡 Troubleshooting:');
      console.log('   • Make sure you ran the SQL schema update');
      console.log('   • Check if the function was created successfully');
      console.log('   • Verify the embedding column type is vector(384)');
      return;
    }
    
    console.log(`✅ Semantic search function working! Found ${results.length} results:`);
    results.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.name} (${result.category}) - similarity: ${result.similarity.toFixed(4)}`);
    });
    
    // Test 4: Test with a more specific query
    console.log('\n🔍 Test 4: Testing with a more specific embedding...');
    
    // Create an embedding that should match dairy items better
    const dairyEmbedding = createTestEmbedding();
    // Make it slightly more similar to the first item's embedding
    if (items[0] && Array.isArray(items[0].embedding)) {
      for (let i = 0; i < Math.min(dairyEmbedding.length, items[0].embedding.length); i++) {
        dairyEmbedding[i] = (dairyEmbedding[i] + items[0].embedding[i]) / 2;
      }
    }
    
    const { data: dairyResults, error: dairyError } = await supabase.rpc('match_store_items', {
      query_embedding: dairyEmbedding,
      match_threshold: 0.05, // Lower threshold for more results
      match_count: 3
    });
    
    if (dairyError) {
      console.error('❌ Dairy search error:', dairyError.message);
    } else {
      console.log(`✅ Dairy search found ${dairyResults.length} results:`);
      dairyResults.forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.name} (${result.category}) - similarity: ${result.similarity.toFixed(4)}`);
      });
    }
    
    console.log('\n🎉 Supabase semantic search test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSupabaseSemanticSearch();
