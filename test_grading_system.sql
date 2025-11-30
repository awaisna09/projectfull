-- =====================================================
-- Grading System Test Script
-- Validates all components of the grading system
-- =====================================================

-- =====================================================
-- TEST 1: Fetch a question from business_activity_questions
-- =====================================================
SELECT '=== TEST 1: Fetch Question ===' as test_name;
SELECT * FROM public.business_activity_questions LIMIT 1;

-- Verify question structure
SELECT 
    'Question Structure Check' as check_name,
    question_id,
    topic_id,
    topic_name,
    LENGTH(context) as context_length,
    LENGTH(question) as question_length,
    LENGTH(model_answer) as model_answer_length,
    marks,
    skill
FROM public.business_activity_questions 
LIMIT 1;

-- =====================================================
-- TEST 2: Check question_embeddings table
-- =====================================================
SELECT '=== TEST 2: Question Embeddings ===' as test_name;

-- Check if embeddings exist
SELECT 
    COUNT(*) as total_embeddings,
    COUNT(DISTINCT question_id) as unique_questions
FROM public.question_embeddings;

-- Show sample embedding (if exists)
SELECT 
    question_id,
    LENGTH(embedding::text) as embedding_size,
    'Embedding exists' as status
FROM public.question_embeddings 
LIMIT 1;

-- If no embeddings exist, show message
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.question_embeddings LIMIT 1) THEN
        RAISE NOTICE 'WARNING: No question embeddings found. The match_concepts_for_question function may not work without embeddings.';
    END IF;
END $$;

-- =====================================================
-- TEST 3: Test match_concepts_for_question RPC function
-- =====================================================
SELECT '=== TEST 3: Match Concepts RPC Function ===' as test_name;

-- Try to get a question_id that has embeddings
DO $$
DECLARE
    test_question_id VARCHAR;
    concept_count INT;
BEGIN
    -- Get a question_id from embeddings if available
    SELECT question_id INTO test_question_id 
    FROM public.question_embeddings 
    LIMIT 1;
    
    IF test_question_id IS NOT NULL THEN
        RAISE NOTICE 'Testing with question_id: %', test_question_id;
        
        -- Test the RPC function
        SELECT COUNT(*) INTO concept_count
        FROM public.match_concepts_for_question(test_question_id, 5);
        
        RAISE NOTICE 'Found % matching concepts', concept_count;
        
        -- Show the results
        PERFORM * FROM public.match_concepts_for_question(test_question_id, 5);
    ELSE
        RAISE NOTICE 'SKIPPED: No question embeddings available to test RPC function';
        RAISE NOTICE 'To test this function, you need to populate question_embeddings table first.';
    END IF;
END $$;

-- Alternative: Direct query if function exists and embeddings are available
SELECT 
    'RPC Function Results' as result_type,
    *
FROM public.match_concepts_for_question(
    (SELECT question_id FROM public.question_embeddings LIMIT 1),
    5
) 
WHERE EXISTS (SELECT 1 FROM public.question_embeddings LIMIT 1);

-- =====================================================
-- TEST 4: Test Mastery/W weakness/Trends Insertion Logic
-- =====================================================
SELECT '=== TEST 4: Mastery/Weakness/Trends Logic ===' as test_name;

-- Clean up any existing test data
DELETE FROM public.user_trends WHERE user_id = 'TEST_USER' AND concept_id = 'C010';
DELETE FROM public.user_weaknesses WHERE user_id = 'TEST_USER' AND concept_id = 'C010';
DELETE FROM public.user_mastery WHERE user_id = 'TEST_USER' AND concept_id = 'C010';

-- Test 4a: Insert/Update Mastery
SELECT '--- Test 4a: Insert Mastery ---' as step;
INSERT INTO public.user_mastery (user_id, concept_id, mastery)
VALUES ('TEST_USER', 'C010', 50)
ON CONFLICT (user_id, concept_id)
DO UPDATE SET mastery = EXCLUDED.mastery
RETURNING *;

-- Test 4b: Update Mastery (should update existing)
SELECT '--- Test 4b: Update Mastery ---' as step;
INSERT INTO public.user_mastery (user_id, concept_id, mastery)
VALUES ('TEST_USER', 'C010', 65)
ON CONFLICT (user_id, concept_id)
DO UPDATE SET mastery = EXCLUDED.mastery
RETURNING *;

-- Test 4c: Insert Weakness
SELECT '--- Test 4c: Insert Weakness ---' as step;
INSERT INTO public.user_weaknesses (user_id, concept_id, is_weak)
VALUES ('TEST_USER', 'C010', true)
ON CONFLICT (user_id, concept_id)
DO UPDATE SET is_weak = EXCLUDED.is_weak
RETURNING *;

-- Test 4d: Update Weakness (should update existing)
SELECT '--- Test 4d: Update Weakness ---' as step;
INSERT INTO public.user_weaknesses (user_id, concept_id, is_weak)
VALUES ('TEST_USER', 'C010', false)
ON CONFLICT (user_id, concept_id)
DO UPDATE SET is_weak = EXCLUDED.is_weak
RETURNING *;

-- Test 4e: Insert Trend (no conflict handling - allows duplicates)
SELECT '--- Test 4e: Insert Trend ---' as step;
INSERT INTO public.user_trends (user_id, concept_id, mastery)
VALUES ('TEST_USER', 'C010', 42)
RETURNING *;

-- Insert another trend entry
INSERT INTO public.user_trends (user_id, concept_id, mastery)
VALUES ('TEST_USER', 'C010', 50)
RETURNING *;

-- =====================================================
-- TEST 5: Verify Data Integrity
-- =====================================================
SELECT '=== TEST 5: Data Integrity Check ===' as test_name;

-- Check all TEST_USER records
SELECT 'Mastery Records' as record_type, * FROM public.user_mastery WHERE user_id = 'TEST_USER';
SELECT 'Weakness Records' as record_type, * FROM public.user_weaknesses WHERE user_id = 'TEST_USER';
SELECT 'Trend Records' as record_type, * FROM public.user_trends WHERE user_id = 'TEST_USER' ORDER BY created_at DESC;

-- Verify mastery is within valid range (0-100)
SELECT 
    'Mastery Range Check' as check_name,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE mastery >= 0 AND mastery <= 100) as valid_range,
    COUNT(*) FILTER (WHERE mastery < 0 OR mastery > 100) as invalid_range
FROM public.user_mastery
WHERE user_id = 'TEST_USER';

-- =====================================================
-- TEST 6: Test Question Attempt Logging
-- =====================================================
SELECT '=== TEST 6: Question Attempt Logging ===' as test_name;

-- Clean up existing test attempt
DELETE FROM public.question_attempts 
WHERE user_id = 'TEST_USER' AND question_id = 'Q001';

-- Insert a test question attempt
INSERT INTO public.question_attempts (
    user_id, question_id, topic_id,
    raw_score, percentage, grade,
    reasoning_category, has_misconception,
    primary_concept_ids, secondary_concept_ids
) VALUES (
    'TEST_USER',
    'Q001',
    'T001',
    38,
    76.0,
    'B',
    'partial',
    false,
    '["C001", "C002"]'::jsonb,
    '["C003"]'::jsonb
)
RETURNING *;

-- Verify JSONB arrays are stored correctly
SELECT 
    user_id,
    question_id,
    primary_concept_ids,
    secondary_concept_ids,
    jsonb_array_length(primary_concept_ids) as primary_count,
    jsonb_array_length(secondary_concept_ids) as secondary_count
FROM public.question_attempts
WHERE user_id = 'TEST_USER' AND question_id = 'Q001';

-- =====================================================
-- TEST 7: Integration Test - Full Flow
-- =====================================================
SELECT '=== TEST 7: Full Integration Test ===' as test_name;

-- Simulate a grading flow:
-- 1. Get a question
-- 2. Log an attempt
-- 3. Update mastery based on result
-- 4. Update weakness if needed
-- 5. Log trend

DO $$
DECLARE
    test_user VARCHAR := 'TEST_USER';
    test_concept VARCHAR := 'C011';
    test_question VARCHAR := 'Q002';
    test_topic VARCHAR := 'T001';
    new_mastery NUMERIC := 55.0;
    is_weak_flag BOOLEAN;
BEGIN
    -- Step 1: Verify question exists
    IF NOT EXISTS (SELECT 1 FROM public.business_activity_questions WHERE question_id = test_question) THEN
        RAISE NOTICE 'Question % does not exist, skipping integration test', test_question;
        RETURN;
    END IF;
    
    RAISE NOTICE 'Starting integration test for user: %, concept: %', test_user, test_concept;
    
    -- Step 2: Log question attempt
    INSERT INTO public.question_attempts (
        user_id, question_id, topic_id,
        raw_score, percentage, grade,
        reasoning_category, has_misconception,
        primary_concept_ids, secondary_concept_ids
    ) VALUES (
        test_user, test_question, test_topic,
        40, 80.0, 'B',
        'correct', false,
        jsonb_build_array(test_concept),
        '[]'::jsonb
    );
    RAISE NOTICE 'Question attempt logged';
    
    -- Step 3: Update mastery
    INSERT INTO public.user_mastery (user_id, concept_id, mastery)
    VALUES (test_user, test_concept, new_mastery)
    ON CONFLICT (user_id, concept_id)
    DO UPDATE SET mastery = EXCLUDED.mastery;
    RAISE NOTICE 'Mastery updated to: %', new_mastery;
    
    -- Step 4: Determine and update weakness
    is_weak_flag := (new_mastery < 40);
    INSERT INTO public.user_weaknesses (user_id, concept_id, is_weak)
    VALUES (test_user, test_concept, is_weak_flag)
    ON CONFLICT (user_id, concept_id)
    DO UPDATE SET is_weak = EXCLUDED.is_weak;
    RAISE NOTICE 'Weakness flag set to: %', is_weak_flag;
    
    -- Step 5: Log trend
    INSERT INTO public.user_trends (user_id, concept_id, mastery)
    VALUES (test_user, test_concept, new_mastery);
    RAISE NOTICE 'Trend logged';
    
    RAISE NOTICE 'Integration test completed successfully';
END $$;

-- Show integration test results
SELECT 'Integration Test Results' as result_type, * FROM public.user_mastery WHERE user_id = 'TEST_USER' AND concept_id = 'C011';
SELECT 'Integration Test Results' as result_type, * FROM public.user_weaknesses WHERE user_id = 'TEST_USER' AND concept_id = 'C011';
SELECT 'Integration Test Results' as result_type, * FROM public.user_trends WHERE user_id = 'TEST_USER' AND concept_id = 'C011' ORDER BY created_at DESC LIMIT 1;
SELECT 'Integration Test Results' as result_type, * FROM public.question_attempts WHERE user_id = 'TEST_USER' AND question_id = 'Q002' ORDER BY created_at DESC LIMIT 1;

-- =====================================================
-- FINAL SUMMARY
-- =====================================================
SELECT '=== TEST SUMMARY ===' as summary;

SELECT 
    'Table' as metric,
    'Record Count' as value
UNION ALL
SELECT 'user_mastery', COUNT(*)::text FROM public.user_mastery WHERE user_id = 'TEST_USER'
UNION ALL
SELECT 'user_weaknesses', COUNT(*)::text FROM public.user_weaknesses WHERE user_id = 'TEST_USER'
UNION ALL
SELECT 'user_trends', COUNT(*)::text FROM public.user_trends WHERE user_id = 'TEST_USER'
UNION ALL
SELECT 'question_attempts', COUNT(*)::text FROM public.question_attempts WHERE user_id = 'TEST_USER';

SELECT 'All tests completed!' as status;

