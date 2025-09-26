#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Simple cosine similarity function
function cosineSimilarity(a, b) {
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

async function testParsedEmbeddings() {
  console.log('🧪 Testing Parsed Embeddings');
  console.log('============================');
  
  const { data: items } = await supabase
    .from('store_items')
    .select('name, category, embedding')
    .limit(5);

  const parsedItems = items.map(item => {
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
      name: item.name,
      category: item.category,
      embedding: embedding
    };
  });

  console.log(`✅ Parsed ${parsedItems.length} items`);
  
  parsedItems.forEach(item => {
    console.log(`${item.name}: embedding length = ${item.embedding.length}`);
  });

  // Test similarity between items
  if (parsedItems.length >= 2) {
    const item1 = parsedItems[0];
    const item2 = parsedItems[1];
    
    if (item1.embedding.length > 0 && item2.embedding.length > 0) {
      const similarity = cosineSimilarity(item1.embedding, item2.embedding);
      console.log(`\nSimilarity between "${item1.name}" and "${item2.name}": ${similarity.toFixed(4)}`);
    }
  }

  // Test with a simple query embedding (all zeros for now)
  const queryEmbedding = new Array(parsedItems[0]?.embedding.length || 768).fill(0);
  queryEmbedding[0] = 1; // Set first element to 1 for testing
  
  console.log(`\n🔍 Testing with query embedding (length: ${queryEmbedding.length})`);
  
  const similarities = parsedItems.map(item => ({
    name: item.name,
    similarity: item.embedding.length > 0 ? cosineSimilarity(queryEmbedding, item.embedding) : 0
  })).sort((a, b) => b.similarity - a.similarity);
  
  console.log('Top similarities:');
  similarities.slice(0, 3).forEach(result => {
    console.log(`  - ${result.name}: ${result.similarity.toFixed(4)}`);
  });
}

testParsedEmbeddings().catch(console.error);
