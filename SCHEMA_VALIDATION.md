# Database Schema Validation

This document summarizes the expected column names based on the code implementation.

## Tables and Expected Columns

### `user_mastery`
**Code expects:**
- `user_id` (character varying/text) - Primary key component
- `concept_id` (character varying/text) - Primary key component  
- `mastery` (numeric/float) - Mastery score (0-100)

**Code usage:**
- Select: `SELECT * WHERE user_id = ? AND concept_id = ?`
- Update: `UPDATE SET mastery = ? WHERE user_id = ? AND concept_id = ?`
- Insert: `INSERT (user_id, concept_id, mastery) VALUES (?, ?, ?)`

### `user_weaknesses`
**Code expects:**
- `user_id` (character varying/text) - Primary key component
- `concept_id` (character varying/text) - Primary key component
- `is_weak` (boolean) - Weakness flag

**Code usage:**
- Upsert: `UPSERT (user_id, concept_id, is_weak) VALUES (?, ?, ?)`

### `user_trends`
**Code expects:**
- `user_id` (character varying/text)
- `concept_id` (character varying/text)
- `mastery` (numeric/float) - Mastery score at time of log

**Code usage:**
- Insert: `INSERT (user_id, concept_id, mastery) VALUES (?, ?, ?)`

### `question_attempts`
**Code expects:**
- `user_id` (character varying/text)
- `question_id` (character varying/text)
- `topic_id` (character varying/text) - nullable
- `raw_score` (numeric/float) - Overall score
- `percentage` (numeric/float) - Percentage score
- `grade` (character varying/text) - Letter grade
- `reasoning_category` (character varying/text)
- `has_misconception` (boolean)
- `primary_concept_ids` (array/text[]) - List of concept IDs
- `secondary_concept_ids` (array/text[]) - List of concept IDs

**Code usage:**
- Insert: `INSERT (user_id, question_id, topic_id, raw_score, percentage, grade, reasoning_category, has_misconception, primary_concept_ids, secondary_concept_ids) VALUES (...)`

### `business_activity_questions`
**Code expects:**
- `question_id` (character varying) - Primary key
- `question` (text) - Question text
- `model_answer` (text) - Model answer
- `context` (text) - Lesson/context text (nullable)
- `marks` (integer) - Can be used for max_marks (nullable)
- Other columns: `topic_id`, `topic_name`, `part`, `skill`, `explanation`, `hint`

**Code usage:**
- Select: `SELECT * WHERE question_id = ?`
- Access: `row.get("question")`, `row.get("model_answer")`, `row.get("context")`

### `question_embeddings`
**Code expects:**
- Used by RPC function `match_concepts_for_question`
- Expected to have `question_id` column
- Returns rows with `concept_id` column

**Code usage:**
- RPC call: `match_concepts_for_question(question_id, match_count)`

### `concept_embeddings`
**Code expects:**
- Used by RPC function `match_concepts_for_question`
- Expected to have `concept_id` column

**Code usage:**
- RPC call: `match_concepts_for_question(question_id, match_count)`

## Validation Queries

Run these queries to validate the schema matches the code expectations:

```sql
-- Validate table structures
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_mastery';

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_weaknesses';

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_trends';

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'question_attempts';

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'question_embeddings';

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'concept_embeddings';

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'business_activity_questions';
```

## Notes

- All `user_id` columns should be of type `character varying` or `text`
- All `concept_id` columns should be of type `character varying` or `text`
- All `question_id` columns should be of type `character varying` or `text`
- `mastery` should be numeric (integer or float) with range 0-100
- `is_weak` should be boolean
- `primary_concept_ids` and `secondary_concept_ids` should be arrays (text[] or jsonb)

