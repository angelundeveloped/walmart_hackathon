-- Walmart Wavefinder Database Schema
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector"; -- For pgvector embeddings

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT,
  name TEXT,
  preferences JSONB DEFAULT '{
    "mapFilters": {
      "showSections": ["dairy", "bakery", "produce", "meat", "frozen", "pantry", "beverages", "health", "household"],
      "showItems": true,
      "showRoute": true,
      "showAnchors": true,
      "showServices": true
    },
    "dietaryRestrictions": [],
    "brandPreferences": [],
    "organicPreference": false
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Store items table
CREATE TABLE IF NOT EXISTS store_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  coordinates JSONB NOT NULL, -- {x: number, y: number}
  price DECIMAL(10,2),
  in_stock BOOLEAN DEFAULT true,
  embedding VECTOR(384), -- Updated to match actual embedding dimensions
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Active shopping lists table (current shopping sessions)
CREATE TABLE IF NOT EXISTS active_shopping_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{id, name, category, isCompleted, location}]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shopping history table (completed shopping sessions)
CREATE TABLE IF NOT EXISTS shopping_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  items JSONB NOT NULL, -- [{id, name, coordinates, completed}]
  route_data JSONB, -- {path: [{x, y}], total_distance: number}
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_store_items_category ON store_items(category);
CREATE INDEX IF NOT EXISTS idx_store_items_coordinates ON store_items USING GIN(coordinates);
CREATE INDEX IF NOT EXISTS idx_store_items_embedding ON store_items USING ivfflat(embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_active_shopping_lists_user_id ON active_shopping_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_history_user_id ON shopping_history(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_history_created_at ON shopping_history(created_at DESC);

-- Row Level Security (RLS) policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_history ENABLE ROW LEVEL SECURITY;

-- User profiles policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own profile' AND tablename = 'user_profiles') THEN
        CREATE POLICY "Users can view own profile" ON user_profiles
          FOR SELECT USING (auth.uid() = id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile' AND tablename = 'user_profiles') THEN
        CREATE POLICY "Users can update own profile" ON user_profiles
          FOR UPDATE USING (auth.uid() = id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own profile' AND tablename = 'user_profiles') THEN
        CREATE POLICY "Users can insert own profile" ON user_profiles
          FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- Chat sessions policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own chat sessions' AND tablename = 'chat_sessions') THEN
        CREATE POLICY "Users can view own chat sessions" ON chat_sessions
          FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own chat sessions' AND tablename = 'chat_sessions') THEN
        CREATE POLICY "Users can insert own chat sessions" ON chat_sessions
          FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own chat sessions' AND tablename = 'chat_sessions') THEN
        CREATE POLICY "Users can update own chat sessions" ON chat_sessions
          FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Active shopping lists policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own active shopping lists' AND tablename = 'active_shopping_lists') THEN
        CREATE POLICY "Users can view own active shopping lists" ON active_shopping_lists
          FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own active shopping lists' AND tablename = 'active_shopping_lists') THEN
        CREATE POLICY "Users can insert own active shopping lists" ON active_shopping_lists
          FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own active shopping lists' AND tablename = 'active_shopping_lists') THEN
        CREATE POLICY "Users can update own active shopping lists" ON active_shopping_lists
          FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own active shopping lists' AND tablename = 'active_shopping_lists') THEN
        CREATE POLICY "Users can delete own active shopping lists" ON active_shopping_lists
          FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Shopping history policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own shopping history' AND tablename = 'shopping_history') THEN
        CREATE POLICY "Users can view own shopping history" ON shopping_history
          FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own shopping history' AND tablename = 'shopping_history') THEN
        CREATE POLICY "Users can insert own shopping history" ON shopping_history
          FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Store items are public (no RLS needed)
-- Users can view all store items without authentication

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for chat_sessions updated_at
DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON chat_sessions;
CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for active_shopping_lists updated_at
DROP TRIGGER IF EXISTS update_active_shopping_lists_updated_at ON active_shopping_lists;
CREATE TRIGGER update_active_shopping_lists_updated_at
  BEFORE UPDATE ON active_shopping_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Semantic search function for store items
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
