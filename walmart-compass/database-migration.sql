-- Migration script for existing databases
-- This script adds session memory features to existing Walmart Compass databases
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector"; -- For pgvector embeddings

-- Add the new active_shopping_lists table
CREATE TABLE IF NOT EXISTS active_shopping_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{id, name, category, isCompleted, location}]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for the new table
CREATE INDEX IF NOT EXISTS idx_active_shopping_lists_user_id ON active_shopping_lists(user_id);

-- Enable RLS on the new table
ALTER TABLE active_shopping_lists ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for active_shopping_lists
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

-- Add updated_at column to existing chat_sessions table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'chat_sessions' AND column_name = 'updated_at') THEN
        ALTER TABLE chat_sessions ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Add updated_at column to existing user_profiles table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE user_profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Create or replace the function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at columns
DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON chat_sessions;
CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_active_shopping_lists_updated_at ON active_shopping_lists;
CREATE TRIGGER update_active_shopping_lists_updated_at
  BEFORE UPDATE ON active_shopping_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Ensure all existing tables have proper RLS policies
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

-- Ensure RLS is enabled on all user tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_history ENABLE ROW LEVEL SECURITY;

-- Create or replace the function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists for user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add any missing indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_history_user_id ON shopping_history(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_history_created_at ON shopping_history(created_at DESC);

-- Verify the migration
SELECT 
  'Migration completed successfully!' as status,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'active_shopping_lists') as active_shopping_lists_exists,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'chat_sessions' AND column_name = 'updated_at') as chat_sessions_updated_at_exists,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'updated_at') as user_profiles_updated_at_exists;
