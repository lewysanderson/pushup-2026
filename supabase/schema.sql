-- Pushup 2026 Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Groups table
CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(6) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    group_target BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on code for faster lookups
CREATE INDEX IF NOT EXISTS idx_groups_code ON groups(code);

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    daily_target INTEGER NOT NULL DEFAULT 50,
    group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on group_id for faster joins
CREATE INDEX IF NOT EXISTS idx_profiles_group_id ON profiles(group_id);

-- Logs table
CREATE TABLE IF NOT EXISTS logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    count INTEGER NOT NULL CHECK (count >= 0),
    sets_breakdown JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_date ON logs(date);
CREATE INDEX IF NOT EXISTS idx_logs_user_date ON logs(user_id, date);

-- Enable Row Level Security
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for groups (everyone can read, anyone can create)
CREATE POLICY "Groups are viewable by everyone"
    ON groups FOR SELECT
    USING (true);

CREATE POLICY "Anyone can create a group"
    ON groups FOR INSERT
    WITH CHECK (true);

-- RLS Policies for profiles (everyone can read, users can update their own)
CREATE POLICY "Profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Anyone can create a profile"
    ON profiles FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (true);

-- RLS Policies for logs (everyone in group can read, users can manage their own)
CREATE POLICY "Logs are viewable by everyone"
    ON logs FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own logs"
    ON logs FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update their own logs"
    ON logs FOR UPDATE
    USING (true);

CREATE POLICY "Users can delete their own logs"
    ON logs FOR DELETE
    USING (true);

-- Create a view for leaderboard rankings
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT
    p.id,
    p.username,
    p.avatar_url,
    p.group_id,
    COALESCE(SUM(l.count), 0) as total_reps,
    COUNT(DISTINCT l.date) FILTER (WHERE EXTRACT(YEAR FROM l.date) = 2026) as days_logged
FROM profiles p
LEFT JOIN logs l ON p.id = l.user_id
GROUP BY p.id, p.username, p.avatar_url, p.group_id;

-- Create a view for group statistics
CREATE OR REPLACE VIEW group_stats_view AS
SELECT
    g.id as group_id,
    g.name as group_name,
    g.group_target,
    COUNT(DISTINCT p.id) as member_count,
    COALESCE(SUM(l.count), 0) as total_reps
FROM groups g
LEFT JOIN profiles p ON g.id = p.group_id
LEFT JOIN logs l ON p.id = l.user_id
GROUP BY g.id, g.name, g.group_target;

-- Function to calculate current streak for a user
CREATE OR REPLACE FUNCTION calculate_streak(user_uuid UUID, target_reps INTEGER)
RETURNS INTEGER AS $$
DECLARE
    current_streak INTEGER := 0;
    check_date DATE := CURRENT_DATE;
    daily_count INTEGER;
BEGIN
    LOOP
        SELECT COALESCE(SUM(count), 0) INTO daily_count
        FROM logs
        WHERE user_id = user_uuid AND date = check_date;

        IF daily_count >= target_reps THEN
            current_streak := current_streak + 1;
            check_date := check_date - INTERVAL '1 day';
        ELSE
            EXIT;
        END IF;
    END LOOP;

    RETURN current_streak;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Comments for documentation
COMMENT ON TABLE groups IS 'Stores group information and invite codes';
COMMENT ON TABLE profiles IS 'User profiles with daily targets';
COMMENT ON TABLE logs IS 'Daily pushup logs with optional set breakdown';
COMMENT ON COLUMN groups.code IS 'Unique 6-character alphanumeric invite code';
COMMENT ON COLUMN logs.sets_breakdown IS 'JSON array of sets, e.g., [{"sets": 3, "reps": 20}]';
