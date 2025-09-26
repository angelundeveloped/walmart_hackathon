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

async function fixEmbeddingFormat() {
  console.log('🔧 Fixing Embedding Format in Database');
  console.log('=====================================');
  
  try {
    // Get all items with string embeddings
    console.log('📊 Fetching items with string embeddings...');
    
    const { data: items, error: fetchError } = await supabase
      .from('store_items')
      .select('id, name, embedding')
      .not('embedding', 'is', null);
    
    if (fetchError) {
      console.error('❌ Error fetching items:', fetchError.message);
      return;
    }
    
    console.log(`✅ Found ${items.length} items with embeddings`);
    
    let updatedCount = 0;
    let errorCount = 0;
    
    // Process each item
    for (const item of items) {
      try {
        if (typeof item.embedding === 'string') {
          console.log(`🔄 Processing: ${item.name}`);
          
          // Parse the string embedding
          const embeddingArray = JSON.parse(item.embedding);
          
          if (!Array.isArray(embeddingArray)) {
            console.log(`⚠️  Skipping ${item.name}: embedding is not an array`);
            continue;
          }
          
          if (embeddingArray.length !== 384) {
            console.log(`⚠️  Skipping ${item.name}: embedding length is ${embeddingArray.length}, expected 384`);
            continue;
          }
          
          // Update the item with the parsed embedding
          const { error: updateError } = await supabase
            .from('store_items')
            .update({ embedding: embeddingArray })
            .eq('id', item.id);
          
          if (updateError) {
            console.error(`❌ Error updating ${item.name}:`, updateError.message);
            errorCount++;
          } else {
            console.log(`✅ Updated ${item.name}`);
            updatedCount++;
          }
          
          // Add a small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`❌ Error processing ${item.name}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n📊 Update Summary:');
    console.log(`✅ Successfully updated: ${updatedCount} items`);
    console.log(`❌ Errors: ${errorCount} items`);
    
    if (updatedCount > 0) {
      console.log('\n🧪 Testing semantic search after fix...');
      
      // Test with a simple embedding
      const testEmbedding = new Array(384).fill(0.1);
      
      const { data: results, error: searchError } = await supabase.rpc('match_store_items', {
        query_embedding: testEmbedding,
        match_threshold: 0.01,
        match_count: 5
      });
      
      if (searchError) {
        console.error('❌ Search test error:', searchError.message);
      } else {
        console.log(`✅ Search test found ${results.length} results:`);
        results.forEach((result, index) => {
          console.log(`   ${index + 1}. ${result.name} (${result.category}) - similarity: ${result.similarity.toFixed(4)}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  }
}

fixEmbeddingFormat();
