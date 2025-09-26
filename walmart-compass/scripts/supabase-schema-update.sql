-- Supabase Schema Update for RAG System
-- Run these commands in your Supabase SQL Editor

-- 1. Update embedding column to 384 dimensions (matching actual embeddings)
ALTER TABLE store_items 
ALTER COLUMN embedding TYPE vector(384);

-- 2. Create semantic search function for store items
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

-- 3. Create vector index for better performance (optional but recommended)
CREATE INDEX IF NOT EXISTS store_items_embedding_idx 
ON store_items 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- 4. Test the function (optional - you can run this to verify it works)
-- SELECT * FROM match_store_items(
--   '[0.1, 0.2, 0.3]'::vector(384),  -- Replace with actual embedding
--   0.1,  -- similarity threshold
--   5     -- max results
-- );
