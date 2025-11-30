-- ============================================================================
-- Mock Exam Grading Agent - Database Tables
-- ============================================================================
-- This script creates all tables required by the Mock Exam Grading Agent
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. exam_attempts - Stores complete exam attempt records
-- ============================================================================
CREATE TABLE IF NOT EXISTS exam_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    total_marks INTEGER NOT NULL CHECK (total_marks > 0),
    marks_obtained FLOAT NOT NULL CHECK (marks_obtained >= 0),
    percentage_score FLOAT NOT NULL CHECK (percentage_score >= 0 AND percentage_score <= 100),
    overall_grade TEXT NOT NULL CHECK (overall_grade IN ('A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for common queries
    CONSTRAINT exam_attempts_user_id_check CHECK (user_id != '')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_exam_attempts_user_id ON exam_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_created_at ON exam_attempts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_percentage_score ON exam_attempts(percentage_score DESC);

-- ============================================================================
-- 2. exam_question_results - Stores individual question results
-- ============================================================================
CREATE TABLE IF NOT EXISTS exam_question_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL,
    marks_allocated INTEGER NOT NULL CHECK (marks_allocated > 0),
    marks_awarded FLOAT NOT NULL CHECK (marks_awarded >= 0),
    percentage_score FLOAT NOT NULL CHECK (percentage_score >= 0 AND percentage_score <= 100),
    feedback TEXT,
    concept_ids TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    CONSTRAINT exam_question_results_marks_check CHECK (marks_awarded <= marks_allocated)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_exam_question_results_exam_id ON exam_question_results(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_question_results_question_id ON exam_question_results(question_id);
CREATE INDEX IF NOT EXISTS idx_exam_question_results_concept_ids ON exam_question_results USING GIN(concept_ids);

-- ============================================================================
-- 3. student_mastery - Stores concept mastery scores per student
-- ============================================================================
CREATE TABLE IF NOT EXISTS student_mastery (
    user_id TEXT NOT NULL,
    concept_id TEXT NOT NULL,
    mastery FLOAT NOT NULL CHECK (mastery >= 0 AND mastery <= 100),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    PRIMARY KEY (user_id, concept_id),
    CONSTRAINT student_mastery_user_id_check CHECK (user_id != ''),
    CONSTRAINT student_mastery_concept_id_check CHECK (concept_id != '')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_mastery_user_id ON student_mastery(user_id);
CREATE INDEX IF NOT EXISTS idx_student_mastery_concept_id ON student_mastery(concept_id);
CREATE INDEX IF NOT EXISTS idx_student_mastery_mastery ON student_mastery(mastery DESC);

-- ============================================================================
-- 4. student_weaknesses - Stores identified weaknesses per student
-- ============================================================================
CREATE TABLE IF NOT EXISTS student_weaknesses (
    user_id TEXT NOT NULL,
    concept_id TEXT NOT NULL,
    level TEXT NOT NULL CHECK (level IN ('critical', 'high', 'moderate', 'low')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    PRIMARY KEY (user_id, concept_id),
    CONSTRAINT student_weaknesses_user_id_check CHECK (user_id != ''),
    CONSTRAINT student_weaknesses_concept_id_check CHECK (concept_id != '')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_weaknesses_user_id ON student_weaknesses(user_id);
CREATE INDEX IF NOT EXISTS idx_student_weaknesses_level ON student_weaknesses(level);
CREATE INDEX IF NOT EXISTS idx_student_weaknesses_concept_id ON student_weaknesses(concept_id);

-- ============================================================================
-- 5. student_readiness - Stores readiness scores per student
-- ============================================================================
CREATE TABLE IF NOT EXISTS student_readiness (
    user_id TEXT PRIMARY KEY,
    readiness_score FLOAT NOT NULL CHECK (readiness_score >= 0 AND readiness_score <= 100),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT student_readiness_user_id_check CHECK (user_id != '')
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_student_readiness_score ON student_readiness(readiness_score DESC);

-- ============================================================================
-- Enable Row Level Security (RLS) - Optional but recommended
-- ============================================================================
-- Uncomment these if you want to enable RLS policies

-- ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE exam_question_results ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE student_mastery ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE student_weaknesses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE student_readiness ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (adjust based on your auth setup):
-- CREATE POLICY "Users can view their own exam attempts"
--     ON exam_attempts FOR SELECT
--     USING (auth.uid()::text = user_id);

-- CREATE POLICY "Service role can insert exam attempts"
--     ON exam_attempts FOR INSERT
--     WITH CHECK (true);

-- ============================================================================
-- Comments for documentation
-- ============================================================================
COMMENT ON TABLE exam_attempts IS 'Stores complete mock exam attempt records with overall scores and grades';
COMMENT ON TABLE exam_question_results IS 'Stores individual question grading results linked to exam attempts';
COMMENT ON TABLE student_mastery IS 'Stores concept mastery scores (0-100) per student and concept';
COMMENT ON TABLE student_weaknesses IS 'Stores identified weakness levels (critical, high, moderate, low) per student and concept';
COMMENT ON TABLE student_readiness IS 'Stores overall readiness scores (0-100) per student';

-- ============================================================================
-- Verification Queries (Optional - run to verify tables were created)
-- ============================================================================
-- SELECT table_name, column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' 
--   AND table_name IN ('exam_attempts', 'exam_question_results', 'student_mastery', 'student_weaknesses', 'student_readiness')
-- ORDER BY table_name, ordinal_position;

