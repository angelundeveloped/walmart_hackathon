import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function updateDatabaseSchema() {
  try {
    console.log('🔄 Updating database schema...');
    
    // Read the schema file
    const schemaPath = join(__dirname, '..', 'database-schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');
    
    // Split into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          
          if (error) {
            console.warn(`⚠️  Statement ${i + 1} failed (may already exist):`, error.message);
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.warn(`⚠️  Statement ${i + 1} failed:`, err.message);
        }
      }
    }
    
    console.log('🎉 Database schema update completed!');
    
  } catch (error) {
    console.error('❌ Database schema update failed:', error);
    process.exit(1);
  }
}

updateDatabaseSchema();
