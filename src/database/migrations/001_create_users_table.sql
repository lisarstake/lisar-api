-- Set a default value for the user_id column to automatically generate UUIDs
ALTER TABLE users
ALTER COLUMN user_id SET DEFAULT gen_random_uuid();