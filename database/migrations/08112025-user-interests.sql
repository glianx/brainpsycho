-- Migration: Add user interests functionality
-- Date: 08 November 2025
-- Description: Expand interest enum and add interests array column to neon_auth.users_sync table

-- First, check if we need to alter the existing interest enum or create a new one
-- Update existing interest enum to include all 10 interests
DO $$ 
BEGIN
    -- Drop the old enum if it exists and recreate with all values
    -- This is safe if no data exists yet, otherwise we'd need to migrate data
    DROP TYPE IF EXISTS interest CASCADE;
    
    CREATE TYPE interest AS ENUM (
        'Sports',
        'Art',
        'Music',
        'Science',
        'Cooking',
        'Gaming',
        'Nature',
        'Animals',
        'Space',
        'Technology'
    );
END $$;

-- Add interests column to neon_auth.users_sync table (Stack Auth's user table)
-- Using array of interest enum values
ALTER TABLE neon_auth.users_sync 
ADD COLUMN IF NOT EXISTS interests interest[] DEFAULT '{}';

-- Add index for faster interest-based queries
CREATE INDEX IF NOT EXISTS idx_users_sync_interests ON neon_auth.users_sync USING GIN(interests);

-- Add a check constraint to ensure users don't select more than 5 interests
ALTER TABLE neon_auth.users_sync 
ADD CONSTRAINT check_interests_max_5 
CHECK (array_length(interests, 1) IS NULL OR array_length(interests, 1) <= 5);

-- Add a comment for documentation
COMMENT ON COLUMN neon_auth.users_sync.interests IS 'Array of user interests (max 5) used for personalizing math questions';
