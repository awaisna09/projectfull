# AI Tutor Performance Fix - Supabase Timeout Issues

## Problem Identified

The AI Tutor agent was taking too long to respond because:

1. **Synchronous Supabase queries blocking execution** - No timeout protection
2. **Multiple sequential database queries** - Lesson, Concepts, History all query Supabase sequentially
3. **pgvector similarity search can be slow** - Embedding-based concept search can take 5-10+ seconds
4. **No graceful failure** - If Supabase is slow/unreachable, queries hang indefinitely

## Root Causes

### 1. FetchLesson Node
- Queries Supabase `lessons` table synchronously
- No timeout protection
- Blocks if Supabase is slow

### 2. FetchConcepts Node  
- Can do pgvector similarity search (slow, 5-10+ seconds)
- Falls back to topic_id query (faster, but still no timeout)
- Multiple query attempts in sequence

### 3. RetrieveHistory Node
- Queries Supabase `tutor_messages` table synchronously
- No timeout protection
- Blocks if Supabase is slow

## Solutions Implemented

### 1. Added Timeout Protection Utility
- Created `safe_supabase_query()` function in `langgraph_tutor.py`
- Wraps Supabase queries with 3-second timeout
- Returns default values on timeout/error
- Prevents indefinite blocking

### 2. Next Steps (Recommended)

To fully fix the performance issues, update these services:

#### A. Update `agents/services/history_service.py`
```python
def get_recent_messages(self, conversation_id: str, limit: int = 10) -> List[Dict]:
    # Add timeout wrapper
    def query():
        return (
            self.supabase
            .table("tutor_messages")
            .select("role, message_text")
            .eq("conversation_id", conversation_id)
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
    
    # Use timeout wrapper (3 seconds)
    try:
        from langgraph_tutor import safe_supabase_query
        res = safe_supabase_query(query, timeout=3, default_return=None)
        if res is None:
            return []
        # ... rest of processing
    except Exception:
        return []
```

#### B. Update `agents/concept_agent.py`
- Add timeout to `fetch_concepts_by_topic()` method
- Add timeout to `retrieve_concepts()` pgvector search
- Return empty list on timeout

#### C. Update `agents/services/lesson_service.py`
- Add timeout to `fetch_lesson_content()` method
- Return empty string on timeout

## Immediate Fix

The timeout utility has been added. To use it:

1. **Restart the backend** to load the new code
2. **Test the AI Tutor** - it should now fail gracefully if Supabase is slow
3. **Monitor logs** - timeout warnings will appear if queries are slow

## Configuration

Add to `config.env`:
```env
# Supabase query timeout (seconds)
SUPABASE_QUERY_TIMEOUT=3

# Enable debug logging
DEBUG=1
```

## Testing

Test with:
```bash
# Test AI Tutor endpoint
curl -X POST http://localhost:8000/tutor/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is Business Strategy?",
    "topic": "1",
    "user_id": "test_user",
    "conversation_id": "test_conv"
  }'
```

Expected behavior:
- Response within 10-15 seconds (even if Supabase is slow)
- No indefinite hanging
- Graceful degradation if Supabase times out

## Performance Improvements

After implementing timeouts:
- **Before**: Could hang indefinitely if Supabase is slow
- **After**: Maximum 3-second wait per query, then fallback
- **Expected response time**: 5-15 seconds (down from potentially minutes)

## Additional Recommendations

1. **Enable caching** - Already implemented, but verify it's working
2. **Use connection pooling** - Supabase client should reuse connections
3. **Consider async Supabase client** - For better performance
4. **Add query retries** - With exponential backoff
5. **Monitor Supabase performance** - Check dashboard for slow queries

