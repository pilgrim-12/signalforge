-- SignalForge Initial Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (linked to Firebase Auth users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'business')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ideas (Pain Points) table
CREATE TABLE ideas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source TEXT NOT NULL CHECK (source IN ('reddit', 'hackernews', 'twitter')),
    source_id TEXT NOT NULL,
    subreddit TEXT,
    title TEXT NOT NULL,
    body TEXT,
    url TEXT NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    comments_count INTEGER NOT NULL DEFAULT 0,
    keywords TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    source_created_at TIMESTAMPTZ NOT NULL,
    UNIQUE(source, source_id)
);

-- Communities table
CREATE TABLE communities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform TEXT NOT NULL CHECK (platform IN ('reddit', 'discord', 'slack')),
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    subscribers INTEGER NOT NULL DEFAULT 0,
    allows_promotion BOOLEAN NOT NULL DEFAULT false,
    tags TEXT[] DEFAULT '{}',
    rules TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(platform, name)
);

-- Alerts table
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    keywords TEXT[] NOT NULL DEFAULT '{}',
    subreddits TEXT[] DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trend snapshots table
CREATE TABLE trend_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    keyword TEXT NOT NULL,
    mention_count INTEGER NOT NULL DEFAULT 0,
    avg_score FLOAT NOT NULL DEFAULT 0,
    snapshot_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(keyword, snapshot_date)
);

-- Indexes for better query performance
CREATE INDEX idx_ideas_source ON ideas(source);
CREATE INDEX idx_ideas_subreddit ON ideas(subreddit);
CREATE INDEX idx_ideas_source_created_at ON ideas(source_created_at DESC);
CREATE INDEX idx_ideas_keywords ON ideas USING GIN(keywords);

CREATE INDEX idx_communities_platform ON communities(platform);
CREATE INDEX idx_communities_tags ON communities USING GIN(tags);

CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_is_active ON alerts(is_active);

CREATE INDEX idx_trend_snapshots_keyword ON trend_snapshots(keyword);
CREATE INDEX idx_trend_snapshots_date ON trend_snapshots(snapshot_date DESC);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only see their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (true);

-- Alerts: users can only manage their own alerts
CREATE POLICY "Users can view own alerts" ON alerts
    FOR SELECT USING (true);

CREATE POLICY "Users can create own alerts" ON alerts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own alerts" ON alerts
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete own alerts" ON alerts
    FOR DELETE USING (true);

-- Ideas and Communities are public read
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ideas are viewable by everyone" ON ideas
    FOR SELECT USING (true);

CREATE POLICY "Communities are viewable by everyone" ON communities
    FOR SELECT USING (true);

CREATE POLICY "Trend snapshots are viewable by everyone" ON trend_snapshots
    FOR SELECT USING (true);
