-- Seed data for unit_time_profiles table
-- Default IGCSE Business Studies time profiles
-- These are initial estimates and can be adjusted based on actual usage data

-- First, ensure we have the subjects and topics
-- This assumes Business Studies (subject_id = 1) already exists

-- Insert time profiles for Business Studies topics
-- Using topic_id from existing topics table (1-5 based on schema.sql)

INSERT INTO public.unit_time_profiles (
  subject_id,
  topic_id,
  base_minutes_first_pass,
  base_minutes_revision,
  difficulty_multiplier,
  notes
) VALUES

(101, 11, 240, 144, 1.0, 'Core foundational unit - Business Activity'),


(101, 12, 300, 180, 1.2, 'Marketing concepts and strategies - more complex'),


(101, 13, 360, 216, 1.3, 'Financial management - challenging unit with calculations'),


(101, 14, 240, 144, 1.0, 'HR management - moderate complexity'),


(101, 15, 270, 162, 1.1, 'Operations management - moderate complexity')

ON CONFLICT (subject_id, topic_id) DO UPDATE SET
  base_minutes_first_pass = EXCLUDED.base_minutes_first_pass,
  base_minutes_revision = EXCLUDED.base_minutes_revision,
  difficulty_multiplier = EXCLUDED.difficulty_multiplier,
  notes = EXCLUDED.notes,
  updated_at = NOW();

-- Note: If you have more topics, add them here following the same pattern
-- Adjust base_minutes_first_pass based on unit size:
--   Small unit: 120-180 minutes (2-3 hours)
--   Medium unit: 180-240 minutes (3-4 hours)
--   Large unit: 240-360 minutes (4-6 hours)
--   Very large unit: 360+ minutes (6+ hours)
--
-- base_minutes_revision is typically 50-60% of first_pass
-- difficulty_multiplier:
--   Easy: 0.8-0.9
--   Normal: 1.0
--   Hard: 1.2-1.5
--   Very Hard: 1.5-2.0

