-- ============================================================================
-- Quick Verification - Mock Exam Grading Agent Tables
-- ============================================================================
-- Quick check to see which tables exist and their basic structure
-- ============================================================================

-- Quick Status Check
SELECT 
    table_name,
    CASE 
        WHEN table_name IN (
            'exam_attempts',
            'exam_question_results',
            'student_mastery',
            'student_weaknesses',
            'student_readiness'
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status,
    (SELECT COUNT(*) 
     FROM information_schema.columns 
     WHERE table_schema = 'public' 
       AND table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN (
      'exam_attempts',
      'exam_question_results',
      'student_mastery',
      'student_weaknesses',
      'student_readiness'
  )
ORDER BY table_name;

-- Detailed Column List for All Tables
SELECT 
    table_name,
    column_name,
    data_type,
    CASE 
        WHEN is_nullable = 'NO' THEN 'NOT NULL'
        ELSE 'NULL'
    END as nullable,
    column_default,
    ordinal_position
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

