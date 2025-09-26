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

async function debugDatabaseEmbeddings() {
  console.log('🔍 Debugging Database Embeddings');
  console.log('================================');
  
  try {
    // Get raw data from database
    console.log('📊 Fetching raw embedding data...');
    
    const { data: items, error } = await supabase
      .from('store_items')
      .select('id, name, category, embedding')
      .not('embedding', 'is', null)
      .limit(3);
    
    if (error) {
      console.error('❌ Error fetching items:', error.message);
      return;
    }
    
    console.log(`✅ Found ${items.length} items with embeddings:`);
    
    items.forEach((item, index) => {
      console.log(`\n📦 Item ${index + 1}: ${item.name}`);
      console.log(`   Category: ${item.category}`);
      console.log(`   Embedding type: ${typeof item.embedding}`);
      console.log(`   Is array: ${Array.isArray(item.embedding)}`);
      
      if (typeof item.embedding === 'string') {
        console.log(`   String length: ${item.embedding.length}`);
        console.log(`   First 100 chars: ${item.embedding.substring(0, 100)}...`);
        
        try {
          const parsed = JSON.parse(item.embedding);
          console.log(`   Parsed type: ${typeof parsed}`);
          console.log(`   Parsed is array: ${Array.isArray(parsed)}`);
          if (Array.isArray(parsed)) {
            console.log(`   Parsed length: ${parsed.length}`);
            console.log(`   First 5 values: [${parsed.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);
          }
        } catch (e) {
          console.log(`   ❌ Failed to parse as JSON: ${e.message}`);
        }
      } else if (Array.isArray(item.embedding)) {
        console.log(`   Array length: ${item.embedding.length}`);
        console.log(`   First 5 values: [${item.embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);
      } else {
        console.log(`   Raw value: ${JSON.stringify(item.embedding).substring(0, 100)}...`);
      }
    });
    
    // Test the match_store_items function with a simple embedding
    console.log('\n🧪 Testing match_store_items function...');
    
    const testEmbedding = new Array(384).fill(0.1); // Simple test embedding
    
    const { data: results, error: searchError } = await supabase.rpc('match_store_items', {
      query_embedding: testEmbedding,
      match_threshold: 0.01,
      match_count: 5
    });
    
    if (searchError) {
      console.error('❌ Search error:', searchError.message);
    } else {
      console.log(`✅ Search returned ${results.length} results:`);
      results.forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.name} (${result.category}) - similarity: ${result.similarity.toFixed(4)}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugDatabaseEmbeddings();
