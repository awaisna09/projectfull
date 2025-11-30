# Timeout Protection Fixes - Complete Summary

## Problem
AI Tutor and Grading agents were hanging indefinitely, causing requests to never complete.

## Root Causes Identified

1. **No timeout on ChatOpenAI client** - LLM calls could hang forever
2. **No timeout on LLM invoke calls** - Even with client timeout, invoke could block
3. **No timeout on graph execution** - Entire LangGraph pipeline could hang
4. **No timeout on Supabase queries** - Database queries could block indefinitely
5. **No timeout on grading execution** - Grading agent could hang

## Fixes Applied

### 1. ChatOpenAI Client Timeout
**File**: `agents/ai_tutor_agent.py`
- Added `timeout=30` to ChatOpenAI initialization
- Added `max_retries=2` to limit retries

### 2. LLM Invoke Timeout Protection
**File**: `agents/services/llm_service.py`
- Wrapped both `self.llm.invoke()` calls with 30-second timeout
- Uses threading to prevent blocking
- Raises TimeoutError if LLM call exceeds 30 seconds

### 3. Graph Execution Timeout
**File**: `unified_backend.py` (tutor/chat endpoint)
- Added 60-second overall timeout for `run_tutor_graph()`
- Uses threading to prevent blocking the async endpoint
- Returns 504 error if graph execution times out

### 4. Grading Execution Timeout
**File**: `unified_backend.py` (grade-answer endpoint)
- Added 45-second timeout for grading agent execution
- Uses threading to prevent blocking
- Returns 504 error if grading times out

### 5. Supabase Query Timeouts
**Files**: 
- `agents/services/history_service.py`
- `agents/services/lesson_service.py`
- `agents/concept_agent.py`
- `langgraph_tutor.py` (utility function)

- All Supabase queries wrapped with 3-5 second timeouts
- Returns empty/default values on timeout
- Prevents indefinite blocking

## Timeout Values

| Operation | Timeout | Location |
|-----------|---------|----------|
| ChatOpenAI client | 30s | `agents/ai_tutor_agent.py` |
| LLM invoke calls | 30s | `agents/services/llm_service.py` |
| Graph execution | 60s | `unified_backend.py` |
| Grading execution | 45s | `unified_backend.py` |
| Supabase queries | 3-5s | Various service files |
| pgvector search | 5s | `agents/concept_agent.py` |

## Expected Behavior

### Before Fixes
- Requests could hang indefinitely
- No error messages
- Frontend shows infinite loading
- No timeout protection anywhere

### After Fixes
- Maximum 60 seconds for AI Tutor responses
- Maximum 45 seconds for grading responses
- Graceful error messages on timeout
- Frontend receives error response instead of hanging
- All operations have timeout protection

## Testing

Test the endpoints:
```bash
# AI Tutor
curl -X POST http://localhost:8000/tutor/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is Business Strategy?",
    "topic": "1",
    "user_id": "test_user",
    "conversation_id": "test_conv"
  }'

# Grading
curl -X POST http://localhost:8000/grade-answer \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is Business Strategy?",
    "model_answer": "A plan for business success",
    "student_answer": "A strategy for business",
    "user_id": "test_user"
  }'
```

## Error Handling

All timeouts now return proper HTTP errors:
- **504 Gateway Timeout** - For graph/grading execution timeouts
- **Empty/default values** - For Supabase query timeouts (graceful degradation)
- **TimeoutError** - For LLM invoke timeouts (caught and handled)

## Next Steps

1. Monitor response times in production
2. Adjust timeout values if needed based on actual performance
3. Consider implementing async/await for better concurrency
4. Add retry logic with exponential backoff for transient failures

