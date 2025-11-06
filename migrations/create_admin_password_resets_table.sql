-- Create admin_password_resets table
CREATE TABLE IF NOT EXISTS admin_password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_password_resets_admin_id ON admin_password_resets(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_password_resets_token ON admin_password_resets(token);
CREATE INDEX IF NOT EXISTS idx_admin_password_resets_expires_at ON admin_password_resets(expires_at);

-- Create a function to clean up expired/used reset tokens
CREATE OR REPLACE FUNCTION cleanup_admin_password_resets()
RETURNS void AS $$
BEGIN
  DELETE FROM admin_password_resets
  WHERE expires_at < NOW() OR used = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a cron job to run cleanup daily (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-admin-password-resets', '0 3 * * *', 'SELECT cleanup_admin_password_resets()');

-- Comment
COMMENT ON TABLE admin_password_resets IS 'Stores password reset tokens for admin accounts';
COMMENT ON COLUMN admin_password_resets.admin_id IS 'Reference to the admin account';
COMMENT ON COLUMN admin_password_resets.token IS 'JWT token for password reset';
COMMENT ON COLUMN admin_password_resets.expires_at IS 'When the reset token expires (1 hour from creation)';
COMMENT ON COLUMN admin_password_resets.used IS 'Whether the token has been used';
COMMENT ON COLUMN admin_password_resets.used_at IS 'When the token was used to reset password';
