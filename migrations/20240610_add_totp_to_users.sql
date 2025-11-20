-- Migration: Add TOTP/2FA columns to users table
-- Date: 2024-06-10

BEGIN;

ALTER TABLE IF EXISTS users
  ADD COLUMN IF NOT EXISTS totp_secret TEXT,
  ADD COLUMN IF NOT EXISTS is_totp_enabled BOOLEAN DEFAULT false;

-- Optional: add index for quick filtering
CREATE INDEX IF NOT EXISTS idx_users_is_totp_enabled_true ON users (is_totp_enabled) WHERE is_totp_enabled = true;

COMMIT;
