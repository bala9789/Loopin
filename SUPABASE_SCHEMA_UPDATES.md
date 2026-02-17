-- Run this SQL in your Supabase SQL Editor

-- 1. Enable UUID extension if not already
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Add username to profiles
ALTER TABLE profiles ADD COLUMN username TEXT UNIQUE;

-- 3. Create likes table
CREATE TABLE likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, post_id)
);

-- 4. Create notifications table
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  recipient_id UUID REFERENCES auth.users NOT NULL,
  actor_id UUID REFERENCES auth.users NOT NULL,
  type TEXT NOT NULL, -- 'like' or 'comment'
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. RLS Policies
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Likes policies
CREATE POLICY "Public likes are viewable by everyone" ON likes FOR SELECT USING (true);
CREATE POLICY "Users can insert their own likes" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own likes" ON likes FOR DELETE USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (auth.uid() = recipient_id);
CREATE POLICY "Users can insert notifications" ON notifications FOR INSERT WITH CHECK (auth.uid() = actor_id); -- Actors trigger notifications
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (auth.uid() = recipient_id);

-- 6. RPC function to check username availability (optional but recommended for speed)
-- OR just query the table directly in client
