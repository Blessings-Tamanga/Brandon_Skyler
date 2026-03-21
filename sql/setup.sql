-- Brandon Skyler Film Dashboard - Supabase Schema
-- Run this ENTIRE script in Supabase > SQL Editor
-- Creates tables + RLS policies for dashboard + public site

-- Drop existing tables (if any)
DROP TABLE IF EXISTS contactMessages, teamMembers, galleryItems, actingProjects, filmReleases CASCADE;

-- 1. FILM RELEASES (main table)
CREATE TABLE filmReleases (
  id BIGINT PRIMARY KEY,
  title TEXT NOT NULL,
  year TEXT NOT NULL,
  role TEXT NOT NULL,
  poster TEXT NOT NULL,
  trailerUrl TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ACTING PROJECTS
CREATE TABLE actingProjects (
  id BIGINT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  video TEXT NOT NULL,
  link TEXT NOT NULL DEFAULT '#',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. GALLERY ITEMS
CREATE TABLE galleryItems (
  id BIGINT PRIMARY KEY,
  src TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TEAM MEMBERS
CREATE TABLE teamMembers (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT NOT NULL,
  image TEXT NOT NULL DEFAULT 'Media/Brandon_Sklenar.jpg',
  skills TEXT[], -- array of strings
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CONTACT MESSAGES (append-only)
CREATE TABLE contactMessages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SAMPLE DATA (migrate from data.json)
INSERT INTO filmReleases (id, title, year, role, poster, trailerUrl) VALUES
(1772876815824, 'John Star', '2025', 'Lead Actor', 'Media/Brandon_Sklenar.jpg', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');

-- Enable Row Level Security (RLS)
ALTER TABLE filmReleases ENABLE ROW LEVEL SECURITY;
ALTER TABLE actingProjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE galleryItems ENABLE ROW LEVEL SECURITY;
ALTER TABLE teamMembers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contactMessages ENABLE ROW LEVEL SECURITY;

-- POLICIES: Public reads (anon key)
-- filmReleases: anyone can read
CREATE POLICY "Public read filmReleases" ON filmReleases FOR SELECT USING (true);
CREATE POLICY "Public read actingProjects" ON actingProjects FOR SELECT USING (true);
CREATE POLICY "Public read galleryItems" ON galleryItems FOR SELECT USING (true);
CREATE POLICY "Public read teamMembers" ON teamMembers FOR SELECT USING (true);

-- Admin writes (service_role bypasses RLS)
-- service_role can INSERT/UPDATE/DELETE everything

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_filmReleases_updated_at BEFORE UPDATE ON filmReleases FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER update_actingProjects_updated_at BEFORE UPDATE ON actingProjects FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER update_galleryItems_updated_at BEFORE UPDATE ON galleryItems FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER update_teamMembers_updated_at BEFORE UPDATE ON teamMembers FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- Success message
SELECT '✅ Schema created successfully! Tables: filmReleases, actingProjects, galleryItems, teamMembers, contactMessages' as status;

-- NEXT: Update .env.local with your SUPABASE_SERVICE_ROLE_KEY
