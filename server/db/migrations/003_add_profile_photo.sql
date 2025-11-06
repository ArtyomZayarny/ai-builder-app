-- Add profile photo URL to personal_info table
-- Migration 003: Profile Photo Support

-- Add photo_url column
ALTER TABLE personal_info
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Added photo_url field to personal_info table!';
END $$;

