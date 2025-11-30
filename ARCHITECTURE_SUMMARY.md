# AI Tutor Architecture - Final Summary

## Architecture Overview

After refactoring, the architecture follows this structure:

```
┌─────────────────────────────────────────────────────────────┐
│                    ARCHITECTURE LAYERS                       │
└─────────────────────────────────────────────────────────────┘

1. ORCHESTRATION LAYER
   └── langgraph_tutor.py
       ├── run_tutor_graph() - Entry point
       ├── LangGraph nodes (LogUserMessage, FetchLesson, etc.)
       └── State management (TutorState)

2. SERVICE FACTORY LAYER
   └── agents/ai_tutor_agent.py
       ├── __init__() - Initializes all services
       └── build_services() - Returns service instances
       └── NO business logic - only service initialization

3. SERVICE LAYER (agents/services/)
   ├── lesson_service.py - Lesson content retrieval & embeddings
   ├── concept_service.py - Concept search & pgvector
   ├── history_service.py - Conversation history management
   ├── llm_service.py - LLM response generation
   ├── mastery_service.py - Mastery tracking & updates
   ├── readiness_service.py - Readiness assessment
   └── message_service.py - Message logging

4. INFRASTRUCTURE LAYER
   ├── cache.py - Caching layer (Redis/in-memory)
   ├── supabase - Database & storage
   ├── openai - LLM + embeddings
   └── pgvector - Similarity search (via Supabase)
```

## Execution Flow

```
unified_backend.py
    ↓
run_tutor_graph() [langgraph_tutor.py]
    ↓
LangGraph Pipeline:
    ├── LogUserMessage → message_service.log()
    ├── FetchLesson → lesson_service.fetch_lesson_content()
    ├── RetrieveHistory → history_service.get_recent_messages()
    ├── SummarizeHistory → (direct OpenAI call)
    ├── FetchConcepts → concept_service.find_related_concepts()
    ├── ClassifyReasoning → mastery_service.classify_student_reasoning()
    ├── GenerateLLMResponse → llm_service.generate_reply()
    ├── UpdateMastery → mastery_service.apply_mastery_updates()
    ├── ComputeReadiness → readiness_service.compute_readiness_signal()
    ├── ComputeLearningPath → readiness_service.compute_next_learning_step()
    └── LogMessage → message_service.log()
    ↓
Services interact with:
    ├── Supabase (storage, pgvector)
    ├── OpenAI (LLM, embeddings)
    └── cache.py (caching layer)
```

## Component Responsibilities

### langgraph_tutor.py
- **Role**: Orchestrates the entire pipeline
- **Responsibilities**:
  - Defines LangGraph nodes
  - Manages state (TutorState)
  - Wires nodes into execution graph
  - Provides `run_tutor_graph()` entry point
- **NO business logic** - only orchestration

### agents/ai_tutor_agent.py
- **Role**: Service factory
- **Responsibilities**:
  - Initializes all services
  - Provides `build_services()` method
  - Defines Pydantic models (TutorRequest, TutorResponse, etc.)
- **NO business logic** - only initialization

### agents/services/*.py
- **Role**: Contain all business logic
- **Responsibilities**:
  - Lesson retrieval and embedding generation
  - Concept search using pgvector
  - History management with caching
  - LLM response generation
  - Mastery tracking and updates
  - Readiness assessment
  - Message logging

### cache.py
- **Role**: Caching layer
- **Responsibilities**:
  - Redis support with in-memory fallback
  - TTL management
  - Cache invalidation

### Supabase
- **Role**: Storage and vector search
- **Responsibilities**:
  - Database storage (tutor_messages, student_mastery, etc.)
  - pgvector similarity search
  - RLS policies

### OpenAI
- **Role**: LLM and embeddings
- **Responsibilities**:
  - Text generation (via LLMService)
  - Embedding generation (via ConceptService)
  - Reasoning classification (via MasteryService)

## Key Principles

1. **Single Orchestrator**: `langgraph_tutor.py` is the ONLY orchestrator
2. **Service Factory**: `AITutorAgent` only initializes services
3. **Service Layer**: All business logic is in `agents/services/`
4. **Infrastructure**: External dependencies (Supabase, OpenAI, cache) are abstracted through services
5. **No Business Logic in Agent**: `AITutorAgent` has no business methods

## Verification Checklist

✅ `langgraph_tutor.py` orchestrates the pipeline
✅ `AITutorAgent` only initializes services (no business logic)
✅ All logic is in `agents/services/*.py`
✅ Supabase is used for storage
✅ OpenAI is used for LLM + embeddings
✅ pgvector is used for similarity search
✅ `cache.py` provides caching layer
✅ All execution flows through `langgraph_tutor.py`

## File Structure

```
.
├── langgraph_tutor.py          # Orchestrator
├── agents/
│   ├── ai_tutor_agent.py       # Service factory
│   └── services/
│       ├── lesson_service.py
│       ├── concept_service.py
│       ├── history_service.py
│       ├── llm_service.py
│       ├── mastery_service.py
│       ├── readiness_service.py
│       └── message_service.py
├── cache.py                    # Caching layer
├── unified_backend.py          # API endpoints (calls run_tutor_graph)
└── services/                   # (Legacy - not used in new architecture)
```

## Migration Notes

- Root `services/` folder contains legacy services (not used)
- All active services are in `agents/services/`
- `unified_backend.py` calls `run_tutor_graph()` from `langgraph_tutor.py`
- No direct calls to `AITutorAgent` business methods

