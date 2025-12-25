-- Add metadata columns to photos table
ALTER TABLE photos 
ADD COLUMN IF NOT EXISTS taken_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS latitude FLOAT,
ADD COLUMN IF NOT EXISTS longitude FLOAT,
ADD COLUMN IF NOT EXISTS name TEXT; -- Ensure name exists if not already

-- Update existing rows to have a logical taken_at (using created_at) if null
UPDATE photos SET taken_at = created_at WHERE taken_at IS NULL;
