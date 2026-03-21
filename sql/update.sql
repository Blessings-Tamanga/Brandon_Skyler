-- Add Newsletter + Contact Tables
-- Run after setup.sql

-- Newsletter Subscribers
CREATE TABLE IF NOT EXISTS newsletterSubscribers (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE newsletterSubscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public newsletter subscribe" ON newsletterSubscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin newsletter read" ON newsletterSubscribers FOR SELECT USING (true);

-- Contact Messages (dashboard view)
CREATE TABLE IF NOT EXISTS contactMessages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  ip inet,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE contactMessages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public contact submit" ON contactMessages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin contact read" ON contactMessages FOR SELECT USING (true);

SELECT 'Newsletter + Contact tables added!';
