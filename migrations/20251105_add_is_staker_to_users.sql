-- Migration: Add is_staker boolean and staker_checked_at timestamp to users
-- Date: 2025-11-05

BEGIN;

-- 1) Add columns (nullable / with default)
ALTER TABLE IF EXISTS users
  ADD COLUMN IF NOT EXISTS is_staker boolean DEFAULT false;

ALTER TABLE IF EXISTS users
  ADD COLUMN IF NOT EXISTS staker_checked_at timestamptz;

-- 2) Normalize existing wallet addresses to lowercase to ensure consistent lookups
UPDATE users
SET wallet_address = lower(wallet_address)
WHERE wallet_address IS NOT NULL AND wallet_address <> lower(wallet_address);

-- 3) Add indexes for fast lookups
-- functional index on lower(wallet_address) to support case-insensitive queries
CREATE INDEX IF NOT EXISTS idx_users_wallet_address_lower ON users (lower(wallet_address));

-- partial index to efficiently count stakers
CREATE INDEX IF NOT EXISTS idx_users_is_staker_true ON users (is_staker) WHERE is_staker = true;

COMMIT;

-- Notes:
-- - This migration only adds the schema pieces and normalizes existing wallet_address values.
-- - It intentionally does NOT populate is_staker values (backfill) because an accurate backfill
--   should use on-chain checks (delegatorStatus) or careful subgraph logic. Consider running a
--   background worker or an ad-hoc backfill script to populate is_staker and staker_checked_at.
