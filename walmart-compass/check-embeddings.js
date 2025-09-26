#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkEmbeddings() {
  const { data: items } = await supabase
    .from('store_items')
    .select('name, embedding')
    .limit(3);

  items.forEach(item => {
    console.log(`${item.name}: embedding type = ${typeof item.embedding}`);
    console.log(`  Is array: ${Array.isArray(item.embedding)}`);
    console.log(`  Length: ${item.embedding?.length || 'N/A'}`);
    if (item.embedding) {
      console.log(`  First 5 values: ${JSON.stringify(item.embedding).substring(0, 100)}...`);
    }
  });
}

checkEmbeddings().catch(console.error);
