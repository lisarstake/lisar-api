-- Add a foreign key constraint to ensure the user_id in transactions references the user_id in users table
ALTER TABLE transactions
ADD CONSTRAINT fk_user_id
FOREIGN KEY (user_id)
REFERENCES users (user_id)
ON DELETE CASCADE;