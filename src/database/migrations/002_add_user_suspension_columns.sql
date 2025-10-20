-- Add suspension-related columns to users table
-- This migration adds is_suspended, suspension_reason, suspended_at and updated_at
-- Run this against your database (psql or supabase CLI) and then refresh Supabase schema cache

ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add an index to speed up queries filtering by suspension status
CREATE INDEX IF NOT EXISTS idx_users_is_suspended ON users(is_suspended);
