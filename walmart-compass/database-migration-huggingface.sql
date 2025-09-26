-- Migration to support Hugging Face embeddings (384 dimensions)
-- Run this in your Supabase SQL Editor

-- First, let's check if we need to update the embedding dimension
-- Hugging Face sentence-transformers/all-MiniLM-L6-v2 uses 384 dimensions

-- Drop the existing embedding column and recreate with correct dimensions
ALTER TABLE store_items DROP COLUMN IF EXISTS embedding;
ALTER TABLE store_items ADD COLUMN embedding VECTOR(384);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS idx_store_items_embedding ON store_items 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Update the comment to reflect the new embedding model
COMMENT ON COLUMN store_items.embedding IS 'Hugging Face sentence-transformers embeddings (384 dimensions)';

-- Verify the change
SELECT 
  column_name, 
  data_type, 
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'store_items' AND column_name = 'embedding';
