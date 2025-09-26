-- Fix the match_store_items function to handle string embeddings properly
-- Run this in your Supabase SQL Editor

DROP FUNCTION IF EXISTS match_store_items(vector(384), float, int);

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
    1 - (store_items.embedding::vector(384) <=> query_embedding) as similarity
  FROM store_items
  WHERE store_items.in_stock = true
    AND store_items.embedding IS NOT NULL
    AND store_items.embedding::text != 'null'
    AND 1 - (store_items.embedding::vector(384) <=> query_embedding) > match_threshold
  ORDER BY store_items.embedding::vector(384) <=> query_embedding
  LIMIT LEAST(match_count, 50);
$$;
