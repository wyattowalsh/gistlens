-- Migration: Add icon_set column to user_settings table
-- Run this if you already have a database and need to add the icon_set feature

-- Add icon_set column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_settings' 
        AND column_name = 'icon_set'
    ) THEN
        ALTER TABLE user_settings 
        ADD COLUMN icon_set TEXT DEFAULT 'lucide';
    END IF;
END $$;
