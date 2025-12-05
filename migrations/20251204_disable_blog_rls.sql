-- Migration: Disable RLS on blog tables
-- Date: 2025-12-05
-- Description: Remove Row Level Security policies from blog_posts and blog_categories

BEGIN;

-- Drop all existing policies on blog_posts
DROP POLICY IF EXISTS "Public can view published posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can view all posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can insert posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can update posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can delete posts" ON blog_posts;

-- Drop all existing policies on blog_categories
DROP POLICY IF EXISTS "Public can view categories" ON blog_categories;
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON blog_categories;

-- Disable RLS
ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories DISABLE ROW LEVEL SECURITY;

COMMIT;
