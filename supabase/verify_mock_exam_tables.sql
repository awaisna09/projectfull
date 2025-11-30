-- ============================================================================
-- Verification Script for Mock Exam Grading Agent Tables
-- ============================================================================
-- This script verifies which tables exist and their complete schema
-- Run this in your Supabase SQL Editor to check table status
-- ============================================================================

-- ============================================================================
-- 1. Check if tables exist
-- ============================================================================
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
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
      'exam_attempts',
      'exam_question_results',
      'student_mastery',
      'student_weaknesses',
      'student_readiness'
  )
ORDER BY table_name;

-- ============================================================================
-- 2. Detailed Column Information for Each Table
-- ============================================================================

-- 2.1 exam_attempts table schema
SELECT 
    'exam_attempts' as table_name,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'exam_attempts'
ORDER BY ordinal_position;

-- 2.2 exam_question_results table schema
SELECT 
    'exam_question_results' as table_name,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'exam_question_results'
ORDER BY ordinal_position;

-- 2.3 student_mastery table schema
SELECT 
    'student_mastery' as table_name,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'student_mastery'
ORDER BY ordinal_position;

-- 2.4 student_weaknesses table schema
SELECT 
    'student_weaknesses' as table_name,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'student_weaknesses'
ORDER BY ordinal_position;

-- 2.5 student_readiness table schema
SELECT 
    'student_readiness' as table_name,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'student_readiness'
ORDER BY ordinal_position;

-- ============================================================================
-- 3. Primary Keys and Constraints
-- ============================================================================
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    kcu.ordinal_position
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.table_schema = 'public'
  AND tc.table_name IN (
      'exam_attempts',
      'exam_question_results',
      'student_mastery',
      'student_weaknesses',
      'student_readiness'
  )
  AND tc.constraint_type IN ('PRIMARY KEY', 'UNIQUE')
ORDER BY tc.table_name, tc.constraint_type, kcu.ordinal_position;

-- ============================================================================
-- 4. Foreign Key Relationships
-- ============================================================================
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN (
      'exam_attempts',
      'exam_question_results',
      'student_mastery',
      'student_weaknesses',
      'student_readiness'
  )
ORDER BY tc.table_name;

-- ============================================================================
-- 5. Check Constraints (Data Validation Rules)
-- ============================================================================
SELECT 
    tc.table_name,
    tc.constraint_name,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.constraint_type = 'CHECK'
  AND tc.table_name IN (
      'exam_attempts',
      'exam_question_results',
      'student_mastery',
      'student_weaknesses',
      'student_readiness'
  )
ORDER BY tc.table_name, tc.constraint_name;

-- ============================================================================
-- 6. Indexes (Performance Optimization)
-- ============================================================================
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
      'exam_attempts',
      'exam_question_results',
      'student_mastery',
      'student_weaknesses',
      'student_readiness'
  )
ORDER BY tablename, indexname;

-- ============================================================================
-- 7. Summary View - All Tables with Column Count
-- ============================================================================
SELECT 
    t.table_name,
    COUNT(c.column_name) as column_count,
    CASE 
        WHEN t.table_name = 'exam_attempts' AND COUNT(c.column_name) = 7 THEN '✅ CORRECT'
        WHEN t.table_name = 'exam_question_results' AND COUNT(c.column_name) = 9 THEN '✅ CORRECT'
        WHEN t.table_name = 'student_mastery' AND COUNT(c.column_name) = 4 THEN '✅ CORRECT'
        WHEN t.table_name = 'student_weaknesses' AND COUNT(c.column_name) = 4 THEN '✅ CORRECT'
        WHEN t.table_name = 'student_readiness' AND COUNT(c.column_name) = 3 THEN '✅ CORRECT'
        ELSE '⚠️ CHECK SCHEMA'
    END as schema_status
FROM information_schema.tables t
LEFT JOIN information_schema.columns c
    ON t.table_name = c.table_name
    AND t.table_schema = c.table_schema
WHERE t.table_schema = 'public'
  AND t.table_name IN (
      'exam_attempts',
      'exam_question_results',
      'student_mastery',
      'student_weaknesses',
      'student_readiness'
  )
GROUP BY t.table_name
ORDER BY t.table_name;

-- ============================================================================
-- 8. Expected vs Actual Column Comparison
-- ============================================================================

-- Expected columns for exam_attempts
WITH expected_exam_attempts AS (
    SELECT unnest(ARRAY[
        'id', 'user_id', 'total_marks', 'marks_obtained', 
        'percentage_score', 'overall_grade', 'created_at'
    ]) as expected_column
),
actual_exam_attempts AS (
    SELECT column_name as actual_column
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'exam_attempts'
)
SELECT 
    'exam_attempts' as table_name,
    COALESCE(e.expected_column, a.actual_column) as column_name,
    CASE 
        WHEN e.expected_column IS NULL THEN '❌ EXTRA COLUMN'
        WHEN a.actual_column IS NULL THEN '❌ MISSING COLUMN'
        ELSE '✅ EXISTS'
    END as status
FROM expected_exam_attempts e
FULL OUTER JOIN actual_exam_attempts a ON e.expected_column = a.actual_column
ORDER BY column_name;

-- Expected columns for exam_question_results
WITH expected_exam_question_results AS (
    SELECT unnest(ARRAY[
        'id', 'exam_id', 'question_id', 'marks_allocated', 
        'marks_awarded', 'percentage_score', 'feedback', 
        'concept_ids', 'created_at'
    ]) as expected_column
),
actual_exam_question_results AS (
    SELECT column_name as actual_column
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'exam_question_results'
)
SELECT 
    'exam_question_results' as table_name,
    COALESCE(e.expected_column, a.actual_column) as column_name,
    CASE 
        WHEN e.expected_column IS NULL THEN '❌ EXTRA COLUMN'
        WHEN a.actual_column IS NULL THEN '❌ MISSING COLUMN'
        ELSE '✅ EXISTS'
    END as status
FROM expected_exam_question_results e
FULL OUTER JOIN actual_exam_question_results a ON e.expected_column = a.actual_column
ORDER BY column_name;

-- Expected columns for student_mastery
WITH expected_student_mastery AS (
    SELECT unnest(ARRAY[
        'user_id', 'concept_id', 'mastery', 'updated_at'
    ]) as expected_column
),
actual_student_mastery AS (
    SELECT column_name as actual_column
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'student_mastery'
)
SELECT 
    'student_mastery' as table_name,
    COALESCE(e.expected_column, a.actual_column) as column_name,
    CASE 
        WHEN e.expected_column IS NULL THEN '❌ EXTRA COLUMN'
        WHEN a.actual_column IS NULL THEN '❌ MISSING COLUMN'
        ELSE '✅ EXISTS'
    END as status
FROM expected_student_mastery e
FULL OUTER JOIN actual_student_mastery a ON e.expected_column = a.actual_column
ORDER BY column_name;

-- Expected columns for student_weaknesses
WITH expected_student_weaknesses AS (
    SELECT unnest(ARRAY[
        'user_id', 'concept_id', 'level', 'updated_at'
    ]) as expected_column
),
actual_student_weaknesses AS (
    SELECT column_name as actual_column
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'student_weaknesses'
)
SELECT 
    'student_weaknesses' as table_name,
    COALESCE(e.expected_column, a.actual_column) as column_name,
    CASE 
        WHEN e.expected_column IS NULL THEN '❌ EXTRA COLUMN'
        WHEN a.actual_column IS NULL THEN '❌ MISSING COLUMN'
        ELSE '✅ EXISTS'
    END as status
FROM expected_student_weaknesses e
FULL OUTER JOIN actual_student_weaknesses a ON e.expected_column = a.actual_column
ORDER BY column_name;

-- Expected columns for student_readiness
WITH expected_student_readiness AS (
    SELECT unnest(ARRAY[
        'user_id', 'readiness_score', 'updated_at'
    ]) as expected_column
),
actual_student_readiness AS (
    SELECT column_name as actual_column
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'student_readiness'
)
SELECT 
    'student_readiness' as table_name,
    COALESCE(e.expected_column, a.actual_column) as column_name,
    CASE 
        WHEN e.expected_column IS NULL THEN '❌ EXTRA COLUMN'
        WHEN a.actual_column IS NULL THEN '❌ MISSING COLUMN'
        ELSE '✅ EXISTS'
    END as status
FROM expected_student_readiness e
FULL OUTER JOIN actual_student_readiness a ON e.expected_column = a.actual_column
ORDER BY column_name;

-- ============================================================================
-- 9. Row Count (if tables have data)
-- ============================================================================
SELECT 
    'exam_attempts' as table_name,
    COUNT(*) as row_count
FROM exam_attempts
UNION ALL
SELECT 
    'exam_question_results' as table_name,
    COUNT(*) as row_count
FROM exam_question_results
UNION ALL
SELECT 
    'student_mastery' as table_name,
    COUNT(*) as row_count
FROM student_mastery
UNION ALL
SELECT 
    'student_weaknesses' as table_name,
    COUNT(*) as row_count
FROM student_weaknesses
UNION ALL
SELECT 
    'student_readiness' as table_name,
    COUNT(*) as row_count
FROM student_readiness
ORDER BY table_name;

-- ============================================================================
-- 10. Complete Schema Export (for documentation)
-- ============================================================================
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.character_maximum_length,
    c.numeric_precision,
    c.numeric_scale,
    c.is_nullable,
    c.column_default,
    c.ordinal_position
FROM information_schema.tables t
JOIN information_schema.columns c
    ON t.table_name = c.table_name
    AND t.table_schema = c.table_schema
WHERE t.table_schema = 'public'
  AND t.table_name IN (
      'exam_attempts',
      'exam_question_results',
      'student_mastery',
      'student_weaknesses',
      'student_readiness'
  )
ORDER BY t.table_name, c.ordinal_position;

