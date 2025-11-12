-- Migration: Make experience fields optional (allow NULL)
-- This aligns the database schema with the requirement that all fields
-- except Personal Info (name, email, role) should be optional

-- 1. Make start_date nullable in experiences
ALTER TABLE experiences 
  ALTER COLUMN start_date DROP NOT NULL;

-- 2. Make description nullable in experiences (it was NOT NULL but should be optional)
ALTER TABLE experiences 
  ALTER COLUMN description DROP NOT NULL;

-- 3. Make company and role nullable in experiences (should be optional per requirements)
ALTER TABLE experiences 
  ALTER COLUMN company DROP NOT NULL;

ALTER TABLE experiences 
  ALTER COLUMN role DROP NOT NULL;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Experience fields are now optional (NULL allowed)!';
END $$;

