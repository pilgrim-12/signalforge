-- SignalForge Database Schema
-- Run this in your Supabase SQL Editor

-- Ideas table - stores pain points from Reddit/HackerNews
CREATE TABLE IF NOT EXISTS ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL CHECK (source IN ('reddit', 'hackernews', 'twitter')),
  source_id TEXT NOT NULL,
  subreddit TEXT,
  title TEXT NOT NULL,
  body TEXT,
  url TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  keywords TEXT[] DEFAULT '{}',
  pain_score INTEGER DEFAULT 0, -- 0-20 score indicating likelihood of being a real pain point
  created_at TIMESTAMPTZ DEFAULT NOW(),
  source_created_at TIMESTAMPTZ NOT NULL,
  UNIQUE(source, source_id)
);

-- Communities table - tracked subreddits/communities
CREATE TABLE IF NOT EXISTS communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN ('reddit', 'discord', 'slack', 'hackernews')),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  subscribers INTEGER DEFAULT 0,
  allows_promotion BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  rules TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(platform, name)
);

-- Alerts table - user keyword alerts
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  keywords TEXT[] NOT NULL,
  subreddits TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trend snapshots - daily keyword statistics
CREATE TABLE IF NOT EXISTS trend_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL,
  mention_count INTEGER DEFAULT 0,
  avg_score NUMERIC(10,2) DEFAULT 0,
  snapshot_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(keyword, snapshot_date)
);

-- Alert matches - when alerts find matching posts
CREATE TABLE IF NOT EXISTS alert_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID REFERENCES alerts(id) ON DELETE CASCADE,
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  matched_keywords TEXT[] NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ideas_source ON ideas(source);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ideas_source_created ON ideas(source_created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ideas_keywords ON ideas USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_ideas_pain_score ON ideas(pain_score DESC);
CREATE INDEX IF NOT EXISTS idx_communities_platform ON communities(platform);
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_trend_snapshots_date ON trend_snapshots(snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_trend_snapshots_keyword ON trend_snapshots(keyword);

-- Enable Row Level Security (optional, for multi-user)
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_matches ENABLE ROW LEVEL SECURITY;

-- Insert default communities to track
INSERT INTO communities (platform, name, url, description, subscribers, tags) VALUES
  ('reddit', 'SaaS', 'https://reddit.com/r/SaaS', 'SaaS discussions and ideas', 150000, ARRAY['saas', 'software', 'startup']),
  ('reddit', 'startups', 'https://reddit.com/r/startups', 'Startup community', 1200000, ARRAY['startup', 'business', 'entrepreneur']),
  ('reddit', 'Entrepreneur', 'https://reddit.com/r/Entrepreneur', 'Entrepreneurship discussions', 2000000, ARRAY['entrepreneur', 'business']),
  ('reddit', 'SideProject', 'https://reddit.com/r/SideProject', 'Side projects showcase', 180000, ARRAY['sideproject', 'indie', 'maker']),
  ('reddit', 'indiehackers', 'https://reddit.com/r/indiehackers', 'Indie hackers community', 95000, ARRAY['indiehacker', 'bootstrapped', 'saas']),
  ('reddit', 'webdev', 'https://reddit.com/r/webdev', 'Web development', 2500000, ARRAY['webdev', 'programming', 'frontend']),
  ('hackernews', 'HackerNews', 'https://news.ycombinator.com', 'Hacker News - tech news and discussions', 500000, ARRAY['tech', 'startup', 'programming'])
ON CONFLICT (platform, name) DO NOTHING;
