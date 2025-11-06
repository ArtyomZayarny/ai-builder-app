-- Add public visibility fields to resumes table
-- Migration 002: Public/Private Resume Visibility

-- Add is_public column (default false)
ALTER TABLE resumes
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Add public_id column (UUID for shareable links)
ALTER TABLE resumes
ADD COLUMN IF NOT EXISTS public_id UUID DEFAULT gen_random_uuid();

-- Create unique index on public_id for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_resumes_public_id ON resumes(public_id);

-- Create index on is_public for filtering
CREATE INDEX IF NOT EXISTS idx_resumes_is_public ON resumes(is_public);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Added public visibility fields to resumes table!';
END $$;

