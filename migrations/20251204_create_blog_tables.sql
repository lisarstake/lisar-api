-- Migration: Create blog_posts and blog_categories tables
-- Date: 2025-12-04
-- Description: Blog/publications system with categories, tags, and content management

BEGIN;

-- Create blog_categories table
CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for slug lookups
CREATE INDEX idx_blog_categories_slug ON blog_categories(slug);

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL, -- markdown content
  
  -- Author information (stored as JSONB for flexibility)
  author JSONB NOT NULL DEFAULT '{"name": "LISAR Team"}'::jsonb,
  -- Expected structure: { name: string, avatar?: string, role?: string }
  
  cover_image TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}', -- array of tag strings
  
  published_at TIMESTAMP WITH TIME ZONE,
  reading_time INTEGER NOT NULL DEFAULT 5, -- in minutes
  featured BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  
  -- Metadata
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_category ON blog_posts(category);
CREATE INDEX idx_blog_posts_featured ON blog_posts(featured);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX idx_blog_posts_tags ON blog_posts USING GIN(tags); -- GIN index for array searches

-- Create full-text search index on title and excerpt
CREATE INDEX idx_blog_posts_search ON blog_posts USING GIN(to_tsvector('english', title || ' ' || excerpt || ' ' || content));

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_blog_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on blog_posts
CREATE TRIGGER trigger_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_updated_at();

-- Trigger to update updated_at on blog_categories
CREATE TRIGGER trigger_blog_categories_updated_at
  BEFORE UPDATE ON blog_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_updated_at();

-- Disable Row Level Security for public access
ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories DISABLE ROW LEVEL SECURITY;

-- Insert some default categories
INSERT INTO blog_categories (name, slug, description) VALUES
  ('Technology', 'technology', 'Latest tech trends and innovations'),
  ('DeFi', 'defi', 'Decentralized finance and Web3'),
  ('Staking', 'staking', 'Staking guides and updates'),
  ('News', 'news', 'Company and industry news'),
  ('Tutorials', 'tutorials', 'How-to guides and tutorials')
ON CONFLICT (slug) DO NOTHING;

COMMIT;
