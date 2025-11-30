-- =====================================================
-- Demo Data Insertion Script
-- Inserts test data into all grading system tables
-- =====================================================

-- Clean up any existing test data (optional - comment out if you want to keep existing data)
-- DELETE FROM public.question_attempts WHERE user_id = 'DEMO_USER_001';
-- DELETE FROM public.user_trends WHERE user_id = 'DEMO_USER_001';
-- DELETE FROM public.user_weaknesses WHERE user_id = 'DEMO_USER_001';
-- DELETE FROM public.user_mastery WHERE user_id = 'DEMO_USER_001';

-- =====================================================
-- 1. USER_MASTERY - User concept mastery levels
-- =====================================================
INSERT INTO public.user_mastery (user_id, concept_id, mastery)
VALUES 
  ('DEMO_USER_001', 'C001', 75.0),
  ('DEMO_USER_001', 'C002', 60.0),
  ('DEMO_USER_001', 'C003', 45.0),
  ('DEMO_USER_001', 'C004', 85.0),
  ('DEMO_USER_002', 'C001', 90.0),
  ('DEMO_USER_002', 'C002', 70.0),
  ('DEMO_USER_003', 'C001', 30.0),
  ('DEMO_USER_003', 'C003', 55.0)
ON CONFLICT (user_id, concept_id) 
DO UPDATE SET mastery = EXCLUDED.mastery
RETURNING *;

-- =====================================================
-- 2. USER_WEAKNESSES - Track user weaknesses
-- =====================================================
INSERT INTO public.user_weaknesses (user_id, concept_id, is_weak)
VALUES 
  ('DEMO_USER_001', 'C003', true),   -- Low mastery (45%)
  ('DEMO_USER_001', 'C002', false),  -- Not weak (60%)
  ('DEMO_USER_003', 'C001', true),   -- Very low mastery (30%)
  ('DEMO_USER_003', 'C003', false)    -- Not weak (55%)
ON CONFLICT (user_id, concept_id) 
DO UPDATE SET is_weak = EXCLUDED.is_weak
RETURNING *;

-- =====================================================
-- 3. USER_TRENDS - Historical mastery tracking
-- =====================================================
INSERT INTO public.user_trends (user_id, concept_id, mastery, created_at)
VALUES 
  ('DEMO_USER_001', 'C001', 70.0, NOW() - INTERVAL '7 days'),
  ('DEMO_USER_001', 'C001', 72.0, NOW() - INTERVAL '5 days'),
  ('DEMO_USER_001', 'C001', 75.0, NOW() - INTERVAL '3 days'),
  ('DEMO_USER_001', 'C001', 75.0, NOW()),
  ('DEMO_USER_001', 'C002', 55.0, NOW() - INTERVAL '7 days'),
  ('DEMO_USER_001', 'C002', 58.0, NOW() - INTERVAL '5 days'),
  ('DEMO_USER_001', 'C002', 60.0, NOW()),
  ('DEMO_USER_002', 'C001', 85.0, NOW() - INTERVAL '7 days'),
  ('DEMO_USER_002', 'C001', 88.0, NOW() - INTERVAL '3 days'),
  ('DEMO_USER_002', 'C001', 90.0, NOW())
RETURNING *;

-- =====================================================
-- 4. BUSINESS_ACTIVITY_QUESTIONS - Question bank
-- =====================================================
INSERT INTO public.business_activity_questions (
  question_id, topic_id, topic_name, context, part, 
  question, marks, skill, model_answer, explanation, hint
)
VALUES 
  (
    'Q001',
    'T001',
    'Marketing Fundamentals',
    'Market segmentation is the process of dividing a market into distinct groups of consumers who have different needs, characteristics, or behaviors. This allows businesses to target specific customer segments with tailored marketing strategies.',
    'A',
    'Explain the concept of market segmentation and provide two examples of segmentation criteria.',
    8,
    'Analysis and Application',
    'Market segmentation involves dividing a broad consumer market into sub-groups based on shared characteristics. Examples include: 1) Demographic segmentation (age, income, gender), 2) Geographic segmentation (location, climate, urban/rural). This enables businesses to create targeted marketing campaigns.',
    'Market segmentation helps businesses understand their customers better and allocate resources more effectively. Demographic factors like age and income help identify purchasing power, while geographic factors help determine distribution channels.',
    'Think about how businesses group customers - consider age groups, locations, lifestyles, or buying behaviors.'
  ),
  (
    'Q002',
    'T001',
    'Marketing Fundamentals',
    'The marketing mix, also known as the 4Ps, consists of Product, Price, Place, and Promotion. These elements work together to create an effective marketing strategy.',
    'B',
    'Analyze how the 4Ps of marketing work together to create an effective marketing strategy. Use a real business example.',
    10,
    'Critical Thinking and Application',
    'The 4Ps must be coordinated: Product (features, quality), Price (competitive pricing), Place (distribution channels), and Promotion (advertising, sales). For example, Apple coordinates premium products with high prices, exclusive retail locations, and aspirational advertising to maintain brand positioning.',
    'The 4Ps are interdependent - a premium product requires premium pricing, appropriate distribution channels, and promotion that reinforces the brand image. Mismatched elements can confuse customers and damage brand perception.',
    'Consider how a business you know coordinates all four elements. Think about luxury brands vs. budget brands.'
  ),
  (
    'Q003',
    'T002',
    'Financial Management',
    'Cash flow management is crucial for business survival. Positive cash flow means more money coming in than going out, while negative cash flow indicates financial problems.',
    'A',
    'A business has monthly cash inflows of $50,000 and outflows of $45,000. Calculate the net cash flow and explain what this means for the business.',
    5,
    'Calculation and Interpretation',
    'Net cash flow = $50,000 - $45,000 = $5,000. This positive cash flow means the business has a surplus of $5,000 per month, indicating healthy financial operations and the ability to invest, save, or pay down debt.',
    'Positive cash flow indicates the business is generating more revenue than expenses, which is essential for sustainability and growth. This surplus can be used for expansion, emergency funds, or debt reduction.',
    'Remember: Net cash flow = Cash inflows - Cash outflows. Positive is good, negative needs attention.'
  ),
  (
    'Q004',
    'T002',
    'Financial Management',
    'Break-even analysis helps businesses determine the point at which total revenue equals total costs, meaning no profit or loss.',
    'B',
    'A company has fixed costs of $10,000 per month and variable costs of $5 per unit. If they sell each unit for $15, calculate the break-even point in units.',
    6,
    'Calculation and Analysis',
    'Break-even point = Fixed costs / (Selling price - Variable cost per unit) = $10,000 / ($15 - $5) = $10,000 / $10 = 1,000 units. The company must sell 1,000 units per month to break even.',
    'Break-even analysis is crucial for pricing decisions and understanding the minimum sales volume needed to cover costs. Below this point, the business operates at a loss.',
    'Formula: Break-even = Fixed Costs / (Price - Variable Cost per Unit)'
  ),
  (
    'Q005',
    'T003',
    'Operations Management',
    'Quality control ensures products meet customer expectations and regulatory standards. It involves inspection, testing, and continuous improvement processes.',
    'A',
    'Explain the importance of quality control in operations management and describe two quality control methods.',
    7,
    'Understanding and Application',
    'Quality control is vital for customer satisfaction, brand reputation, and cost reduction. Two methods: 1) Statistical Process Control (SPC) - uses charts to monitor production processes, 2) Inspection - systematic checking of products at various stages to identify defects before they reach customers.',
    'Quality control prevents defective products from reaching customers, reduces waste and rework costs, and maintains brand reputation. Effective quality control can differentiate a business from competitors.',
    'Think about what happens when quality fails - customer complaints, returns, reputation damage. Consider both prevention and detection methods.'
  )
ON CONFLICT (question_id) 
DO UPDATE SET 
  topic_id = EXCLUDED.topic_id,
  topic_name = EXCLUDED.topic_name,
  context = EXCLUDED.context,
  part = EXCLUDED.part,
  question = EXCLUDED.question,
  marks = EXCLUDED.marks,
  skill = EXCLUDED.skill,
  model_answer = EXCLUDED.model_answer,
  explanation = EXCLUDED.explanation,
  hint = EXCLUDED.hint
RETURNING *;

-- =====================================================
-- 5. QUESTION_ATTEMPTS - User question attempts with grading results
-- =====================================================
INSERT INTO public.question_attempts (
  user_id, question_id, topic_id,
  raw_score, percentage, grade,
  reasoning_category, has_misconception,
  primary_concept_ids, secondary_concept_ids,
  created_at
)
VALUES 
  (
    'DEMO_USER_001',
    'Q001',
    'T001',
    35,
    70.0,
    'C',
    'partial',
    false,
    '["C001", "C002"]'::jsonb,
    '["C003"]'::jsonb,
    NOW() - INTERVAL '2 days'
  ),
  (
    'DEMO_USER_001',
    'Q002',
    'T001',
    42,
    84.0,
    'B',
    'correct',
    false,
    '["C001"]'::jsonb,
    '[]'::jsonb,
    NOW() - INTERVAL '1 day'
  ),
  (
    'DEMO_USER_001',
    'Q003',
    'T002',
    25,
    50.0,
    'D',
    'mild_confusion',
    false,
    '["C004"]'::jsonb,
    '["C005"]'::jsonb,
    NOW() - INTERVAL '5 hours'
  ),
  (
    'DEMO_USER_002',
    'Q001',
    'T001',
    45,
    90.0,
    'A',
    'correct',
    false,
    '["C001"]'::jsonb,
    '["C002"]'::jsonb,
    NOW() - INTERVAL '1 day'
  ),
  (
    'DEMO_USER_002',
    'Q004',
    'T002',
    30,
    60.0,
    'C',
    'wrong',
    true,
    '["C004"]'::jsonb,
    '["C006"]'::jsonb,
    NOW() - INTERVAL '3 hours'
  ),
  (
    'DEMO_USER_003',
    'Q001',
    'T001',
    20,
    40.0,
    'F',
    'high_confusion',
    true,
    '["C001"]'::jsonb,
    '[]'::jsonb,
    NOW() - INTERVAL '1 hour'
  ),
  (
    'DEMO_USER_003',
    'Q005',
    'T003',
    28,
    56.0,
    'D',
    'mild_confusion',
    false,
    '["C007"]'::jsonb,
    '["C008"]'::jsonb,
    NOW()
  )
RETURNING *;

-- =====================================================
-- 6. QUESTION_EMBEDDINGS & CONCEPT_EMBEDDINGS
-- =====================================================
-- NOTE: These tables typically require vector embeddings generated by
-- embedding models (e.g., OpenAI embeddings, sentence transformers).
-- They are usually populated via:
-- 1. Automated processes that generate embeddings for questions/concepts
-- 2. RPC functions like match_concepts_for_question
-- 
-- If you need to insert test embeddings, you would need to:
-- 1. Generate embeddings for your questions/concepts using an embedding model
-- 2. Insert them with the appropriate vector format (usually pgvector extension)
--
-- Example structure (if using pgvector):
-- INSERT INTO question_embeddings (question_id, embedding)
-- VALUES ('Q001', '[0.1, 0.2, 0.3, ...]'::vector);
--
-- For now, these tables are accessed via RPC functions and don't require
-- manual test data insertion for basic functionality testing.

-- =====================================================
-- Verification Queries
-- =====================================================

-- Count records in each table
SELECT 'user_mastery' as table_name, COUNT(*) as record_count FROM public.user_mastery
UNION ALL
SELECT 'user_weaknesses', COUNT(*) FROM public.user_weaknesses
UNION ALL
SELECT 'user_trends', COUNT(*) FROM public.user_trends
UNION ALL
SELECT 'question_attempts', COUNT(*) FROM public.question_attempts
UNION ALL
SELECT 'business_activity_questions', COUNT(*) FROM public.business_activity_questions;

-- View sample data
SELECT '=== USER_MASTERY ===' as info;
SELECT * FROM public.user_mastery WHERE user_id = 'DEMO_USER_001';

SELECT '=== USER_WEAKNESSES ===' as info;
SELECT * FROM public.user_weaknesses WHERE user_id = 'DEMO_USER_001';

SELECT '=== USER_TRENDS ===' as info;
SELECT * FROM public.user_trends WHERE user_id = 'DEMO_USER_001' ORDER BY created_at DESC LIMIT 5;

SELECT '=== QUESTION_ATTEMPTS ===' as info;
SELECT * FROM public.question_attempts WHERE user_id = 'DEMO_USER_001' ORDER BY created_at DESC;

SELECT '=== BUSINESS_ACTIVITY_QUESTIONS ===' as info;
SELECT question_id, topic_name, question, marks FROM public.business_activity_questions LIMIT 3;

