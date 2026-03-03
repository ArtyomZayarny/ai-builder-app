-- Migration: Add Google OAuth support
-- Makes password_hash nullable (Google-only users don't have passwords)
-- Adds google_id and auth_provider columns

ALTER TABLE users
  ALTER COLUMN password_hash DROP NOT NULL;

ALTER TABLE users
  ADD COLUMN google_id VARCHAR(255) UNIQUE,
  ADD COLUMN auth_provider VARCHAR(20) NOT NULL DEFAULT 'email';

CREATE INDEX idx_users_google_id ON users (google_id) WHERE google_id IS NOT NULL;
