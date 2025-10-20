-- Create validators (generalised orchestrators) table to manage validator metadata and visibility
CREATE TABLE IF NOT EXISTS validators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT NOT NULL UNIQUE,
  name TEXT,
  protocol TEXT NOT NULL DEFAULT 'livepeer',        -- protocol the validator belongs to (default: livepeer)
  fee_pct NUMERIC(5,2) DEFAULT 0.00,               -- store percentage (e.g. 5.00)
  apy NUMERIC(6,2) DEFAULT 0.00,                   -- APY % (e.g. 12.34)
  total_delegated_lisar NUMERIC(28,18) DEFAULT 0,  -- high-precision delegated amount
  is_active BOOLEAN DEFAULT true,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_validators_address ON validators(address);
CREATE INDEX IF NOT EXISTS idx_validators_is_active ON validators(is_active);
