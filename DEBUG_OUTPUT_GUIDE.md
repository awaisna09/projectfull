# Debug Output Guide for LangGraph Tutor

## ✅ Debug Mode is Enabled

Debug mode is now configured to use Python's `logging` module instead of `print()` statements, which ensures output is visible in the console.

## How to See Debug Output

### 1. **Restart the Backend Server**

**IMPORTANT**: You must restart the backend server for debug mode to take effect!

```bash
# Stop the current server (Ctrl+C)
# Then restart:
python unified_backend.py
```

### 2. **Verify DEBUG=1 is Set**

Check `config.env` file:
```env
DEBUG=1
```

### 3. **Check Console Output**

When you send a message through the AI Tutor, you should see output like:

```
2025-01-XX XX:XX:XX - __main__ - INFO - ============================================================
2025-01-XX XX:XX:XX - __main__ - INFO - [DEBUG MODE ENABLED] LangGraph Tutor debug logging is active
2025-01-XX XX:XX:XX - __main__ - INFO - [DEBUG] Environment DEBUG value: 1
2025-01-XX XX:XX:XX - __main__ - INFO - ============================================================

2025-01-XX XX:XX:XX - __main__ - INFO - 
2025-01-XX XX:XX:XX - __main__ - INFO - ============================================================
2025-01-XX XX:XX:XX - __main__ - INFO - [DEBUG] Starting LangGraph Tutor Pipeline
2025-01-XX XX:XX:XX - __main__ - INFO - ============================================================
2025-01-XX XX:XX:XX - __main__ - INFO - [DEBUG] User ID: user123
2025-01-XX XX:XX:XX - __main__ - INFO - [DEBUG] Topic: topic456
2025-01-XX XX:XX:XX - __main__ - INFO - [DEBUG] Message: What is photosynthesis?
2025-01-XX XX:XX:XX - __main__ - INFO - [DEBUG] Mode: tutor
2025-01-XX XX:XX:XX - __main__ - INFO - [DEBUG] Explanation Style: default
2025-01-XX XX:XX:XX - __main__ - INFO - ============================================================
2025-01-XX XX:XX:XX - __main__ - INFO - 
2025-01-XX XX:XX:XX - __main__ - INFO - [DEBUG] Conversation ID: user123_topic456
2025-01-XX XX:XX:XX - __main__ - INFO - [DEBUG] Trace ID: abc-123-def-456
2025-01-XX XX:XX:XX - __main__ - INFO - 

2025-01-XX XX:XX:XX - __main__ - INFO - [DEBUG] Embedding results: Found 5 concepts
2025-01-XX XX:XX:XX - __main__ - INFO -   - Concept A (distance: 0.23)
2025-01-XX XX:XX:XX - __main__ - INFO -   - Concept B (distance: 0.31)
2025-01-XX XX:XX:XX - __main__ - INFO -   - Concept C (distance: 0.35)

2025-01-XX XX:XX:XX - __main__ - INFO - [DEBUG] History token count: 450 tokens (3 messages)

2025-01-XX XX:XX:XX - __main__ - INFO - [DEBUG] Reasoning label: good

2025-01-XX XX:XX:XX - __main__ - INFO - [DEBUG] Mastery deltas: 3 updates
2025-01-XX XX:XX:XX - __main__ - INFO -   - Concept CID_001: +2
2025-01-XX XX:XX:XX - __main__ - INFO -   - Concept CID_002: +2
2025-01-XX XX:XX:XX - __main__ - INFO -   - Concept CID_003: +2

2025-01-XX XX:XX:XX - __main__ - INFO - [DEBUG] Readiness computation: overall=ready, avg_mastery=75.0, min_mastery=70

2025-01-XX XX:XX:XX - __main__ - INFO - 
2025-01-XX XX:XX:XX - __main__ - INFO - ============================================================
2025-01-XX XX:XX:XX - __main__ - INFO - [DEBUG] Pipeline Execution Complete
2025-01-XX XX:XX:XX - __main__ - INFO - ============================================================
2025-01-XX XX:XX:XX - __main__ - INFO - [DEBUG] Response Length: 1234 chars
2025-01-XX XX:XX:XX - __main__ - INFO - [DEBUG] Related Concepts: 5
2025-01-XX XX:XX:XX - __main__ - INFO - [DEBUG] Reasoning Label: good
2025-01-XX XX:XX:XX - __main__ - INFO - [DEBUG] Mastery Updates: 3
2025-01-XX XX:XX:XX - __main__ - INFO - [DEBUG] Readiness: ready
2025-01-XX XX:XX:XX - __main__ - INFO - [DEBUG] Learning Path: advance
2025-01-XX XX:XX:XX - __main__ - INFO - ============================================================
2025-01-XX XX:XX:XX - __main__ - INFO - 
```

## Debug Output Locations

### Startup (Module Load)
- Debug mode enabled confirmation
- Environment variable check

### Pipeline Start (`run_tutor_graph`)
- User ID, Topic, Message preview
- Mode and Explanation Style
- Conversation ID and Trace ID

### During Pipeline Execution
- **ValidateInput**: Token limit warnings
- **FetchConcepts**: Embedding results and concept details
- **SummarizeHistory**: History token count
- **ClassifyReasoning**: Reasoning label
- **UpdateMastery**: Mastery deltas
- **ComputeReadiness**: Readiness computation results

### Pipeline End
- Response length
- Related concepts count
- Reasoning label
- Mastery updates count
- Readiness level
- Learning path decision

## Troubleshooting

### If you don't see debug output:

1. **Check DEBUG=1 in config.env**
   ```bash
   cat config.env | grep DEBUG
   ```

2. **Restart the backend server**
   - Stop the current server (Ctrl+C)
   - Start it again: `python unified_backend.py`

3. **Check the console/terminal where the backend is running**
   - Debug output appears in the same terminal where you started `unified_backend.py`
   - Not in the browser console!

4. **Verify logging is working**
   - You should see the startup message: `[DEBUG MODE ENABLED] LangGraph Tutor debug logging is active`
   - If you don't see this, DEBUG mode is not enabled

5. **Check for errors**
   - Look for any import errors or exceptions that might prevent the module from loading

## Notes

- Debug output uses Python's `logging` module (not `print()`)
- Output appears in the **backend console**, not the browser console
- All debug messages are prefixed with `[DEBUG]`
- Timestamps are included in the log format
- Debug mode adds minimal overhead (just logging, no performance impact)

