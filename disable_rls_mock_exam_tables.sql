-- Disable RLS for Mock Exam Grading Agent Tables
-- These tables are managed by the backend service, so RLS can be disabled
-- Run this in Supabase SQL Editor

-- ============================================================================
-- Disable RLS on all mock exam tables
-- ============================================================================

ALTER TABLE exam_attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE exam_question_results DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_readiness DISABLE ROW LEVEL SECURITY;

-- Note: student_mastery and student_weaknesses already work (they use TEXT user_id)
-- So we don't need to disable RLS for them

-- ============================================================================
-- Verify RLS is disabled
-- ============================================================================

SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('exam_attempts', 'exam_question_results', 'student_readiness')
ORDER BY tablename;

-- Should show rls_enabled = false for all three tables

-- ============================================================================
-- Success message
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ RLS disabled for mock exam tables!';
    RAISE NOTICE '✅ Backend can now insert/update data without restrictions';
END $$;

