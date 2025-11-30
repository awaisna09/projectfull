-- Query to get actual column names for mock exam tables
-- Run this in Supabase SQL Editor

SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'exam_attempts',
    'exam_question_results',
    'student_mastery',
    'student_weaknesses',
    'student_readiness'
  )
ORDER BY table_name, ordinal_position;

