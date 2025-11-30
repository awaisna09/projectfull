# Mock Exam Grading Agent - Table Schema Analysis

## Summary
The `mock_exam_grading_agent.py` is trying to update **5 tables**, but there are **column name mismatches** between the code and the schema definition in `supabase/create_mock_exam_tables.sql`.

---

## Tables That Should Be Updated

### 1. ✅ `student_mastery`
**Purpose:** Track concept mastery scores per student

**Schema Definition** (`create_mock_exam_tables.sql`):
- `user_id` (TEXT, part of PK)
- `concept_id` (TEXT, part of PK)
- `mastery` (FLOAT, 0-100)
- `updated_at` (TIMESTAMP)

**Code Usage** (`mock_exam_grading_agent.py` lines 365-420):
- ❌ **ISSUE:** Code uses `mastery_score` but schema has `mastery`
- ❌ **ISSUE:** Code tries to select `id` field which doesn't exist (line 386)
- ✅ Correctly uses `user_id`, `concept_id`, `updated_at`

**Fix Required:**
- Change `mastery_score` → `mastery` in code
- Remove `id` selection (use composite key check instead)

---

### 2. ✅ `student_weaknesses`
**Purpose:** Track identified weaknesses per student/concept

**Schema Definition** (`create_mock_exam_tables.sql`):
- `user_id` (TEXT, part of PK)
- `concept_id` (TEXT, part of PK)
- `level` (TEXT: 'critical', 'high', 'moderate', 'low')
- `updated_at` (TIMESTAMP)

**Code Usage** (`mock_exam_grading_agent.py` lines 1132-1207):
- ❌ **ISSUE:** Code uses `severity` but schema has `level`
- ❌ **ISSUE:** Code tries to select `id` field which doesn't exist (line 1170)
- ✅ Correctly uses `user_id`, `concept_id`

**Fix Required:**
- Change `severity` → `level` in code
- Remove `id` selection (use composite key check instead)

---

### 3. ❌ `exam_attempts`
**Purpose:** Store complete exam attempt records

**Schema Definition** (`create_mock_exam_tables.sql`):
- `id` (UUID, PRIMARY KEY)
- `user_id` (TEXT)
- `total_marks` (INTEGER)
- `marks_obtained` (FLOAT)
- `percentage_score` (FLOAT)
- `overall_grade` (TEXT)
- `created_at` (TIMESTAMP)

**Code Usage** (`mock_exam_grading_agent.py` lines 1274-1295):
- ❌ **ISSUE:** Code uses `exam_attempt_id` but schema has `id`
- ❌ **ISSUE:** Code uses `obtained_marks` but schema has `marks_obtained`
- ❌ **ISSUE:** Code uses `percentage` but schema has `percentage_score`
- ❌ **ISSUE:** Code tries to insert `readiness_score` but schema doesn't have this field

**Fix Required:**
- Change `exam_attempt_id` → `id` in code
- Change `obtained_marks` → `marks_obtained` in code
- Change `percentage` → `percentage_score` in code
- Either add `readiness_score` column to schema OR remove it from code insert

---

### 4. ❌ `exam_question_results`
**Purpose:** Store individual question grading results

**Schema Definition** (`create_mock_exam_tables.sql`):
- `id` (UUID, PRIMARY KEY)
- `exam_id` (UUID, references exam_attempts.id)
- `question_id` (INTEGER)
- `marks_allocated` (INTEGER)
- `marks_awarded` (FLOAT)
- `percentage_score` (FLOAT)
- `feedback` (TEXT)
- `concept_ids` (TEXT[])
- `created_at` (TIMESTAMP)

**Code Usage** (`mock_exam_grading_agent.py` lines 1303-1345):
- ❌ **ISSUE:** Code uses `exam_attempt_id` but schema has `exam_id`
- ❌ **ISSUE:** Code uses `percentage` but schema has `percentage_score`
- ❌ **ISSUE:** Code uses `concepts` but schema has `concept_ids`
- ❌ **ISSUE:** Code tries to insert many fields that don't exist in schema:
  - `question_number` (not in schema)
  - `part` (not in schema)
  - `question_text` (not in schema)
  - `student_answer` (not in schema)
  - `model_answer` (not in schema)
  - `strengths` (not in schema)
  - `improvements` (not in schema)

**Fix Required:**
- Change `exam_attempt_id` → `exam_id` in code
- Change `percentage` → `percentage_score` in code
- Change `concepts` → `concept_ids` in code
- Either add missing fields to schema OR remove them from code insert

---

### 5. ✅ `student_readiness`
**Purpose:** Store overall readiness scores per student

**Schema Definition** (`create_mock_exam_tables.sql`):
- `user_id` (TEXT, PRIMARY KEY)
- `readiness_score` (FLOAT, 0-100)
- `updated_at` (TIMESTAMP)

**Code Usage** (`mock_exam_grading_agent.py` lines 1347-1389):
- ✅ **CORRECT:** Code correctly uses `user_id`, `readiness_score`, `updated_at`
- ❌ **ISSUE:** Code tries to select `id` field which doesn't exist (line 1356)

**Fix Required:**
- Remove `id` selection (use `user_id` as primary key check instead)

---

## Summary of Required Fixes

### Option 1: Fix the Code (Recommended)
Update `mock_exam_grading_agent.py` to match the schema:

1. **student_mastery:**
   - Line 366: `mastery_score` → `mastery`
   - Line 399: `mastery_score` → `mastery`
   - Line 415: `mastery_score` → `mastery`
   - Line 386: Remove `id` selection, use composite key check

2. **student_weaknesses:**
   - Line 1156-1165: `severity` → `level`
   - Line 1181: `severity` → `level`
   - Line 1193: `severity` → `level`
   - Line 1170: Remove `id` selection, use composite key check

3. **exam_attempts:**
   - Line 1280: `exam_attempt_id` → `id`
   - Line 1283: `obtained_marks` → `marks_obtained`
   - Line 1284: `percentage` → `percentage_score`
   - Line 1286-1289: Remove `readiness_score` (or add to schema)

4. **exam_question_results:**
   - Line 1307: `exam_attempt_id` → `exam_id` (and use `exam_id` from exam_attempts insert)
   - Line 1321: `percentage` → `percentage_score`
   - Line 1325: `concepts` → `concept_ids`
   - Lines 1314-1324: Remove fields not in schema OR add them to schema

5. **student_readiness:**
   - Line 1356: Remove `id` selection, use `user_id` as primary key

### Option 2: Fix the Schema
Update `create_mock_exam_tables.sql` to match the code expectations (less recommended, as it changes the database structure).

---

## Recommended Action
**Fix the code** to match the existing schema, as the schema appears to be the source of truth and is simpler to maintain.

