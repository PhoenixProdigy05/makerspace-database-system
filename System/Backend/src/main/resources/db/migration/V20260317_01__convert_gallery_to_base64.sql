-- Convert gallery table to store image data as base64 instead of image URL
-- First, add the new column
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS image_data TEXT;

-- Update existing records to convert image_url to base64 (if any exist)
-- This is a placeholder - in practice you'd need to convert existing files to base64
UPDATE gallery SET image_data = NULL WHERE image_data IS NULL;

-- Drop the old column
ALTER TABLE gallery DROP COLUMN IF EXISTS image_url;
