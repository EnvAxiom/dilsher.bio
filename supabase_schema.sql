/* 
  Run this in your Supabase SQL Editor to set up the database tables 
*/

-- Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  theme JSONB DEFAULT '{
    "primaryColor": "#3b82f6",
    "accentColor": "#60a5fa",
    "backgroundColor": "#0a0a0a",
    "textColor": "#ffffff",
    "cardColor": "rgba(255, 255, 255, 0.05)",
    "fontFamily": "Inter",
    "blurEffect": true,
    "animatedBackground": "none"
  }'::jsonb,
  links JSONB DEFAULT '[]'::jsonb,
  views INTEGER DEFAULT 0,
  badges TEXT[] DEFAULT '{}',
  music_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Function to increment views
CREATE OR REPLACE FUNCTION increment_views(target_username TEXT)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET views = views + 1
  WHERE username = target_username;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Storage setup (Bucket: "uploads")
-- Note: You should create the "uploads" bucket manually in the Supabase Dashboard -> Storage
-- Then run these policies:

-- Allow public access to read files
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'uploads');

-- Allow authenticated users to upload their own files
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'uploads' AND auth.role() = 'authenticated');

-- Allow users to update/delete their own files
CREATE POLICY "Users can update their own files" ON storage.objects FOR UPDATE 
USING (bucket_id = 'uploads' AND auth.uid() = owner);

CREATE POLICY "Users can delete their own files" ON storage.objects FOR DELETE 
USING (bucket_id = 'uploads' AND auth.uid() = owner);

