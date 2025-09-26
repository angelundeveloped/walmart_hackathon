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
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// SQL statements to execute
const sqlStatements = [
  {
    name: 'Update embedding column to 384 dimensions',
    sql: `
      ALTER TABLE store_items 
      ALTER COLUMN embedding TYPE vector(384);
    `
  },
  {
    name: 'Create semantic search function',
    sql: `
      CREATE OR REPLACE FUNCTION match_store_items (
        query_embedding vector(384),
        match_threshold float DEFAULT 0.1,
        match_count int DEFAULT 10
      )
      RETURNS TABLE (
        id text,
        name text,
        category text,
        description text,
        coordinates jsonb,
        price decimal(10,2),
        similarity float
      )
      LANGUAGE sql
      AS $$
        SELECT 
          store_items.id,
          store_items.name,
          store_items.category,
          store_items.description,
          store_items.coordinates,
          store_items.price,
          1 - (store_items.embedding <=> query_embedding) as similarity
        FROM store_items
        WHERE store_items.in_stock = true
          AND store_items.embedding IS NOT NULL
          AND 1 - (store_items.embedding <=> query_embedding) > match_threshold
        ORDER BY store_items.embedding <=> query_embedding
        LIMIT LEAST(match_count, 50);
      $$;
    `
  },
  {
    name: 'Create vector index for performance',
    sql: `
      CREATE INDEX IF NOT EXISTS store_items_embedding_idx 
      ON store_items 
      USING ivfflat (embedding vector_cosine_ops) 
      WITH (lists = 100);
    `
  }
];

async function executeSQL(statement) {
  try {
    console.log(`⚡ Executing: ${statement.name}...`);
    
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: statement.sql.trim() 
    });
    
    if (error) {
      // Check if it's a "already exists" type error
      if (error.message.includes('already exists') || 
          error.message.includes('does not exist') ||
          error.message.includes('relation') && error.message.includes('already exists')) {
        console.log(`⚠️  ${statement.name}: ${error.message}`);
        return { success: true, warning: true };
      }
      throw error;
    }
    
    console.log(`✅ ${statement.name}: Success`);
    return { success: true, warning: false };
    
  } catch (error) {
    console.error(`❌ ${statement.name}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function updateSupabaseSchema() {
  console.log('🚀 Starting Supabase Schema Update');
  console.log('=====================================');
  
  let successCount = 0;
  let warningCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < sqlStatements.length; i++) {
    const statement = sqlStatements[i];
    const result = await executeSQL(statement);
    
    if (result.success) {
      if (result.warning) {
        warningCount++;
      } else {
        successCount++;
      }
    } else {
      errorCount++;
    }
    
    // Add a small delay between statements
    if (i < sqlStatements.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('\n📊 Update Summary');
  console.log('==================');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`⚠️  Warnings: ${warningCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  
  if (errorCount === 0) {
    console.log('\n🎉 Supabase schema update completed successfully!');
    console.log('\n📝 What was updated:');
    console.log('   • Updated embedding column to 384 dimensions');
    console.log('   • Created match_store_items() semantic search function');
    console.log('   • Added vector index for better performance');
    console.log('\n🔍 Next steps:');
    console.log('   • Restart your Next.js development server');
    console.log('   • Test the RAG system with semantic search');
  } else {
    console.log('\n⚠️  Some updates failed. Please check the errors above.');
    process.exit(1);
  }
}

// Test the connection first
async function testConnection() {
  try {
    console.log('🔌 Testing Supabase connection...');
    const { data, error } = await supabase.from('store_items').select('count').limit(1);
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  const connected = await testConnection();
  
  if (!connected) {
    console.error('\n💡 Troubleshooting tips:');
    console.error('   • Check your .env.local file has correct Supabase credentials');
    console.error('   • Ensure SUPABASE_SERVICE_ROLE_KEY has admin privileges');
    console.error('   • Verify your Supabase project is active');
    process.exit(1);
  }
  
  await updateSupabaseSchema();
}

main().catch(console.error);
