-- Add is_onboarded boolean to users table
ALTER TABLE IF EXISTS users
  ADD COLUMN IF NOT EXISTS is_onboarded boolean DEFAULT false;

-- Optional: add index for quick filtering
CREATE INDEX IF NOT EXISTS idx_users_is_onboarded_true ON users (is_onboarded) WHERE is_onboarded = true;

-- Backfill note: run a separate job to set is_onboarded for existing users if needed.
