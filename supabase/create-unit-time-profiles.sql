-- Create unit_time_profiles table for storing time requirements per unit
-- This table configures how much time each unit requires based on difficulty and type

CREATE TABLE IF NOT EXISTS public.unit_time_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id INTEGER NOT NULL REFERENCES public.subjects(subject_id) ON DELETE CASCADE,
  topic_id INTEGER NOT NULL REFERENCES public.topics(topic_id) ON DELETE CASCADE,
  
  -- Time requirements (in minutes)
  base_minutes_first_pass INTEGER NOT NULL DEFAULT 180, -- Default 3 hours for medium unit
  base_minutes_revision INTEGER NOT NULL DEFAULT 108, -- Default 60% of first pass (180 * 0.6)
  
  -- Difficulty multiplier
  difficulty_multiplier NUMERIC(3,2) DEFAULT 1.0 CHECK (difficulty_multiplier >= 0.5 AND difficulty_multiplier <= 2.0),
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one profile per topic
  UNIQUE(subject_id, topic_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_unit_time_profiles_subject_id ON public.unit_time_profiles(subject_id);
CREATE INDEX IF NOT EXISTS idx_unit_time_profiles_topic_id ON public.unit_time_profiles(topic_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.unit_time_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy: Anyone can read unit time profiles (public data)
CREATE POLICY "Anyone can view unit time profiles"
  ON public.unit_time_profiles
  FOR SELECT
  USING (true);

-- Create policy: Only authenticated users with admin role can insert/update
-- For now, allow authenticated users to manage (can be restricted later)
CREATE POLICY "Authenticated users can manage unit time profiles"
  ON public.unit_time_profiles
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_unit_time_profiles_updated_at
    BEFORE UPDATE ON public.unit_time_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE public.unit_time_profiles IS 'Stores time requirements configuration for each unit/topic';
COMMENT ON COLUMN public.unit_time_profiles.base_minutes_first_pass IS 'Base time in minutes required for first-time learning of this unit';
COMMENT ON COLUMN public.unit_time_profiles.base_minutes_revision IS 'Base time in minutes required for revision of this unit (typically 50-60% of first pass)';
COMMENT ON COLUMN public.unit_time_profiles.difficulty_multiplier IS 'Multiplier for unit difficulty (1.0 = normal, 1.2-1.5 = hard, 0.8-0.9 = easy)';

