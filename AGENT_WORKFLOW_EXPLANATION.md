# How the AI Tutor Agent Works on Lessons Page

## Overview

The AI Tutor system has **two implementations** that work together:

1. **`agents/ai_tutor_agent.py`** - Main agent class with all the core logic
2. **`langgraph_tutor.py`** - LangGraph pipeline wrapper that uses the same agent

Both use the same underlying `AITutorAgent` class, but `langgraph_tutor.py` orchestrates the workflow using LangGraph's state machine.

---

## Current Flow (Active Implementation)

### Step-by-Step Flow:

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. FRONTEND: AITutorPage.tsx                                    │
│    User types message → clicks send                             │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. FRONTEND SERVICE: utils/ai-tutor-service.ts                  │
│    sendMessage() called with:                                   │
│    - message: "What is market segmentation?"                    │
│    - lessonContent: (optional lesson text)                     │
│    - topic: "Business Studies"                                  │
│    - user_id: "user123"                                         │
│                                                                  │
│    POST request to: http://localhost:8000/tutor/chat           │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. BACKEND API: unified_backend.py                              │
│    @app.post("/tutor/chat")                                     │
│                                                                  │
│    Receives TutorRequest:                                       │
│    {                                                             │
│      message: "What is market segmentation?",                   │
│      topic: "Business Studies",                                 │
│      user_id: "user123",                                        │
│      conversation_id: null,                                     │
│      lesson_content: "...",                                  │
│      explanation_style: "default"                             │
│    }                                                             │
│                                                                  │
│    Converts to AITutorRequest and calls:                        │
│    ai_tutor_agent.get_response(ai_request, learning_level)     │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. AI TUTOR AGENT: agents/ai_tutor_agent.py                     │
│    AITutorAgent.get_response() executes:                       │
│                                                                  │
│    a) Determine conversation_id                                  │
│       → "user123_Business Studies"                             │
│                                                                  │
│    b) Log user message to Supabase                              │
│       → _log_message(role="user", ...)                         │
│                                                                  │
│    c) Fetch conversation history from Supabase                  │
│       → _get_recent_messages(conversation_id, limit=10)         │
│                                                                  │
│    d) Find related concepts using pgvector                      │
│       → _find_related_concepts(message, topic, k=5)             │
│       → Returns: [{concept_id, name, description, distance}]    │
│                                                                  │
│    e) Classify student reasoning                                │
│       → _classify_student_reasoning(message)                    │
│       → Returns: "good" | "neutral" | "confused"                │
│                                                                  │
│    f) Update mastery scores                                     │
│       → Convert reasoning → mastery_delta (+2, 0, -1)           │
│       → _apply_mastery_updates(user_id, updates)                │
│                                                                  │
│    g) Compute readiness                                         │
│       → _compute_readiness_signal(user_id, concept_ids)         │
│       → Returns: {overall_readiness, concept_readiness, ...}   │
│                                                                  │
│    h) Compute learning path                                     │
│       → _compute_next_learning_step(readiness, concept_ids)    │
│       → Returns: {decision, recommended_concept, details}       │
│                                                                  │
│    i) Fetch lesson content (if not provided)                   │
│       → _fetch_lesson_content(topic)                           │
│                                                                  │
│    j) Generate AI response using LangChain                      │
│       → _generate_with_langchain(                               │
│            message, topic, learning_level,                      │
│            history, lesson_content,                              │
│            concept_rows, explanation_style                       │
│          )                                                       │
│       → Returns: AI-generated explanation text                 │
│                                                                  │
│    k) Log assistant response to Supabase                         │
│       → _log_message(role="assistant", ...)                     │
│                                                                  │
│    l) Return TutorResponse with all fields                      │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. BACKEND API: unified_backend.py                              │
│    Converts TutorResponse to API format and returns:            │
│    {                                                             │
│      response: "Market segmentation is...",                    │
│      suggestions: [...],                                        │
│      related_concepts: ["Market Research", ...],              │
│      related_concept_ids: ["CID_001", ...],                    │
│      confidence_score: 0.95,                                    │
│      reasoning_label: "good",                                   │
│      mastery_updates: [{concept_id, delta, reason}],           │
│      readiness: {overall_readiness: "ready", ...},             │
│      learning_path: {decision: "advance", ...}                 │
│    }                                                             │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. FRONTEND: AITutorPage.tsx                                    │
│    Receives response and:                                       │
│    - Displays AI response in chat                               │
│    - Updates suggestions                                        │
│    - Shows related concepts                                     │
│    - Updates conversation history                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Alternative Flow (LangGraph Implementation)

The `langgraph_tutor.py` file provides an **alternative implementation** using LangGraph's state machine. It uses the **same** `AITutorAgent` class** but orchestrates the workflow differently.

### LangGraph Pipeline Flow:

```
┌─────────────────────────────────────────────────────────────────┐
│ langgraph_tutor.py - run_tutor_graph()                          │
│                                                                  │
│ Creates initial_state and invokes tutor_app:                   │
│                                                                  │
│  Node 0: LogUserMessage                                         │
│    → agent._log_message(role="user", ...)                      │
│                                                                  │
│  Node 1: FetchLesson                                            │
│    → agent._fetch_lesson_content(topic)                         │
│                                                                  │
│  Node 2: RetrieveHistory                                        │
│    → agent._get_recent_messages(conversation_id, limit=10)      │
│                                                                  │
│  Node 3: FetchConcepts                                          │
│    → agent._find_related_concepts(message, topic, k=5)          │
│                                                                  │
│  Node 4: ClassifyReasoning                                      │
│    → agent._classify_student_reasoning(message)                 │
│                                                                  │
│  Node 5: GenerateLLMResponse                                    │
│    → agent._generate_with_langchain(...)                      │
│                                                                  │
│  Node 6: UpdateMastery                                          │
│    → agent._apply_mastery_updates(user_id, updates)           │
│                                                                  │
│  Node 7: ComputeReadiness                                       │
│    → agent._compute_readiness_signal(user_id, concept_ids)     │
│                                                                  │
│  Node 8: ComputeLearningPath                                    │
│    → agent._compute_next_learning_step(readiness, concept_ids)  │
│                                                                  │
│  Node 9: LogMessage                                             │
│    → agent._log_message(role="assistant", ...)                  │
│                                                                  │
│ Returns final_state with all computed values                   │
└─────────────────────────────────────────────────────────────────┘
```

### Key Differences:

| Feature | `ai_tutor_agent.py` | `langgraph_tutor.py` |
|---------|---------------------|----------------------|
| **Architecture** | Sequential function calls | LangGraph state machine |
| **State Management** | Local variables | TypedDict state object |
| **Node Execution** | Linear execution | Graph nodes |
| **Error Handling** | Try/except blocks | Can be handled per node |
| **Visualization** | Not possible | Can visualize graph |
| **Parallel Execution** | Sequential only | Can parallelize nodes |
| **Current Usage** | ✅ Active in backend | ⚠️ Available but not used |

---

## How They Work Together

### Shared Components:

Both implementations use the **same** `AITutorAgent` class methods:

```python
# Both use these methods from ai_tutor_agent.py:
agent._log_message()              # Log messages to Supabase
agent._fetch_lesson_content()     # Fetch lesson from DB
agent._get_recent_messages()      # Get conversation history
agent._find_related_concepts()    # pgvector similarity search
agent._classify_student_reasoning() # Classify reasoning quality
agent._generate_with_langchain()  # Generate AI response
agent._apply_mastery_updates()    # Update mastery scores
agent._compute_readiness_signal() # Compute readiness
agent._compute_next_learning_step() # Compute learning path
```

### Current Integration:

**Currently Active:**
- `unified_backend.py` → uses `AITutorAgent.get_response()` directly
- This is the **simpler, sequential** approach

**Available but Not Used:**
- `langgraph_tutor.py` → provides `run_tutor_graph()` function
- Could be integrated by modifying `unified_backend.py` to call `run_tutor_graph()` instead

---

## To Switch to LangGraph Implementation

If you want to use the LangGraph version, modify `unified_backend.py`:

```python
# In unified_backend.py, add import:
from langgraph_tutor import run_tutor_graph

# In chat_with_tutor endpoint, replace:
# response = ai_tutor_agent.get_response(ai_request, request.learning_level)

# With:
graph_response = run_tutor_graph(
    user_id=request.user_id or "anonymous",
    topic=request.topic,
    message=request.message,
    conversation_id=request.conversation_id
)

# Then convert graph_response to TutorResponse format
```

---

## Data Flow Summary

### Input (Frontend → Backend):
```json
{
  "message": "What is market segmentation?",
  "topic": "Business Studies",
  "user_id": "user123",
  "conversation_id": null,  // Auto-generated if null
  "lesson_content": "...",  // Optional
  "explanation_style": "default"
}
```

### Processing (Backend):
1. **Conversation Management**: Creates/uses conversation_id
2. **Message Logging**: Stores user message in Supabase
3. **History Retrieval**: Fetches last 10 messages
4. **Concept Search**: Finds related concepts via embeddings
5. **Reasoning Classification**: Analyzes student understanding
6. **Mastery Updates**: Updates student mastery scores
7. **Readiness Assessment**: Computes readiness levels
8. **Learning Path**: Recommends next steps
9. **Response Generation**: Creates AI explanation
10. **Response Logging**: Stores assistant message

### Output (Backend → Frontend):
```json
{
  "response": "Market segmentation is the process...",
  "suggestions": ["Ask me more about...", ...],
  "related_concepts": ["Market Research", "Target Market"],
  "related_concept_ids": ["CID_001", "CID_002"],
  "confidence_score": 0.95,
  "reasoning_label": "good",
  "mastery_updates": [
    {
      "concept_id": "CID_001",
      "delta": 2,
      "reason": "tutor_chat_good"
    }
  ],
  "readiness": {
    "overall_readiness": "ready",
    "concept_readiness": [...],
    "average_mastery": 75.0,
    "min_mastery": 70
  },
  "learning_path": {
    "decision": "advance",
    "recommended_concept": "CID_003",
    "details": "Student has high mastery and is ready to advance."
  }
}
```

---

## Key Features Enabled

### 1. **Persistent Conversation History**
- Messages stored in Supabase `tutor_messages` table
- Survives server restarts
- Can retrieve full conversation context

### 2. **Intelligent Concept Discovery**
- Uses OpenAI embeddings + pgvector
- Finds related concepts dynamically
- Not limited to hardcoded lists

### 3. **Adaptive Mastery Tracking**
- Tracks student understanding per concept
- Updates based on reasoning quality
- Stores in `student_mastery`, `student_weaknesses`, `student_trends`

### 4. **Readiness Assessment**
- Classifies mastery into: ready, almost_ready, needs_reinforcement, review_prerequisites
- Provides aggregate statistics

### 5. **Learning Path Recommendations**
- Suggests next steps based on mastery
- Considers concept prerequisites and next concepts
- Decisions: advance, reinforce, review_prerequisite, learn_next_concept

### 6. **RAG-Enhanced Responses**
- Uses lesson content from Supabase
- Incorporates related concepts
- Includes conversation history
- Provides context-aware explanations

---

## Summary

- **`ai_tutor_agent.py`**: Core agent class with all business logic
- **`langgraph_tutor.py`**: LangGraph wrapper that orchestrates the same logic
- **Current flow**: Backend uses `ai_tutor_agent.py` directly (simpler)
- **Alternative**: Could switch to `langgraph_tutor.py` for better orchestration
- **Both work**: They use the same underlying methods and produce the same results
- **Frontend**: Unchanged - calls `/tutor/chat` endpoint regardless of implementation

The frontend doesn't need to know which implementation is used - it just calls the API endpoint and receives the enriched response with all the new features (readiness, learning_path, mastery_updates, etc.).

