-- Albums table
CREATE TABLE albums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  cover_photo_id UUID,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Photos table
CREATE TABLE photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  storage_path TEXT NOT NULL,
  album_id UUID REFERENCES albums(id) ON DELETE SET NULL,
  caption TEXT,
  uploaded_by TEXT,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key for cover photo after photos table exists
ALTER TABLE albums 
ADD CONSTRAINT fk_cover_photo 
FOREIGN KEY (cover_photo_id) REFERENCES photos(id) ON DELETE SET NULL;

-- Reactions table
CREATE TABLE reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE NOT NULL,
  user_name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Prevent duplicate reactions from same user with same emoji on same photo
  UNIQUE(photo_id, user_name, emoji)
);

-- Comments table
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE NOT NULL,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Photo tags (who's in the photo)
CREATE TABLE photo_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE NOT NULL,
  person_name TEXT NOT NULL,
  tagged_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Prevent duplicate tags
  UNIQUE(photo_id, person_name)
);

-- Landing page photos config (optional, for hardcoded positioning)
CREATE TABLE landing_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  storage_path TEXT NOT NULL,
  position_x INTEGER NOT NULL, -- percentage 0-100
  position_y INTEGER NOT NULL, -- percentage 0-100
  rotation INTEGER DEFAULT 0, -- degrees -15 to 15
  scale NUMERIC(3,2) DEFAULT 1.0, -- 0.8 to 1.2
  z_index INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true
);

-- Create indexes for common queries
CREATE INDEX idx_photos_album ON photos(album_id);
CREATE INDEX idx_reactions_photo ON reactions(photo_id);
CREATE INDEX idx_comments_photo ON comments(photo_id);
CREATE INDEX idx_photo_tags_photo ON photo_tags(photo_id);
CREATE INDEX idx_photos_created ON photos(created_at DESC);

-- Enable RLS on all tables
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_photos ENABLE ROW LEVEL SECURITY;

-- Allow read/write access ONLY to authenticated users
-- The "password" on the landing page will trigger a Supabase signInWithPassword
CREATE POLICY "Allow authenticated read" ON albums FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert" ON albums FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON albums FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete" ON albums FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read" ON photos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert" ON photos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON photos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete" ON photos FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read" ON reactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert" ON reactions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON reactions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete" ON reactions FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read" ON comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert" ON comments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON comments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete" ON comments FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read" ON photo_tags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert" ON photo_tags FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON photo_tags FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete" ON photo_tags FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read" ON landing_photos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert" ON landing_photos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON landing_photos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete" ON landing_photos FOR DELETE TO authenticated USING (true);


-- STORAGE SETUP (Requires 'storage' schema access)
-- Note: You might need to run this block in the Supabase SQL Editor if the user lacks permissions to create buckets via client (usually admin only).

-- 1. Create the 'photos' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies
-- Allow authenticated uploads
CREATE POLICY "Authenticated users can upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'photos' );

-- Allow public read access (since we made basic bucket public)
-- If we want strict auth read, we can set public=false above and use:
-- CREATE POLICY "Authenticated users can select photos" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'photos');
-- But for public bucket, read is implicit for public URLs.

-- Allow authenticated delete
CREATE POLICY "Authenticated users can delete photos"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'photos' );
