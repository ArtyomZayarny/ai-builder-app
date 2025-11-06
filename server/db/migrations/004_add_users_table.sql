-- Migration 004: Add users table for authentication
-- Create users table for authentication

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email_verified BOOLEAN DEFAULT FALSE,
  email_verification_token VARCHAR(255),
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP,
  failed_login_attempts INTEGER DEFAULT 0,
  account_locked_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_email_verification_token ON users(email_verification_token);
CREATE INDEX IF NOT EXISTS idx_users_password_reset_token ON users(password_reset_token);

-- Create trigger for updating updated_at timestamp
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add user_id to resumes table (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'resumes' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE resumes ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
  END IF;
  RAISE NOTICE '✅ Created users table and added user_id to resumes table.';
END $$;

