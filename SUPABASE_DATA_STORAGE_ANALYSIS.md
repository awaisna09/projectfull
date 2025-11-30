# Supabase Data Storage Analysis for AI Tutor Agent

## Overview
This document analyzes what data is being stored to Supabase by the AI Tutor agent and whether it's related to LLM operations or embedding operations.

## Answer: **BOTH LLM and Embedding operations store data**

---

## 1. **LLM-Related Data Storage** (Primary Storage)

### A. Conversation Messages (`tutor_messages` table)
- **Service**: `MessageService.log()`
- **Location**: `agents/services/message_service.py:64`
- **What**: Stores all user and assistant messages
- **When**: Every time a message is sent/received
- **Data Stored**:
  ```python
  {
    "user_id": str,
    "lesson_id": str (topic),
    "conversation_id": str,
    "role": "user" | "assistant",
    "message_text": str,  # The actual LLM response or user question
    "concept_ids": List[str]  # Related concepts detected
  }
  ```
- **Purpose**: Conversation history persistence
- **Triggered By**: 
  - `LogUserMessage` node (user messages)
  - `LogMessage` node (assistant responses)

### B. Mastery Tracking (`student_mastery` table)
- **Service**: `MasteryAgent.apply_updates()`
- **Location**: `agents/mastery_agent.py:168`
- **What**: Stores student mastery scores for concepts
- **When**: After reasoning classification (based on LLM classification)
- **Data Stored**:
  ```python
  {
    "user_id": str,
    "concept_id": str,
    "mastery_score": int (0-100)
  }
  ```
- **Purpose**: Track student understanding of concepts
- **Triggered By**: `UpdateMastery` node (after LLM classifies reasoning)

### C. Student Weaknesses (`student_weaknesses` table)
- **Service**: `MasteryAgent.apply_updates()`
- **Location**: `agents/mastery_agent.py:177`
- **What**: Stores identified learning weaknesses
- **When**: When reasoning classification is "confused" (negative delta)
- **Data Stored**:
  ```python
  {
    "user_id": str,
    "concept_id": str,
    "severity": "high" | "medium",
    "reason": str
  }
  ```
- **Purpose**: Track areas where student struggles
- **Triggered By**: `UpdateMastery` node (when delta < 0)

### D. Student Trends (`student_trends` table)
- **Service**: `MasteryAgent.apply_updates()`
- **Location**: `agents/mastery_agent.py:185`
- **What**: Stores mastery trend scores
- **When**: Every mastery update
- **Data Stored**:
  ```python
  {
    "user_id": str,
    "concept_id": str,
    "trend_score": int (delta value)
  }
  ```
- **Purpose**: Track mastery progression over time
- **Triggered By**: `UpdateMastery` node

### E. Performance Traces (`tutor_traces` table)
- **Service**: `timed_node` decorator
- **Location**: `langgraph_tutor.py:62, 86`
- **What**: Stores execution timing for each node
- **When**: After every node execution
- **Data Stored**:
  ```python
  {
    "user_id": str,
    "topic": str,
    "node_name": str,
    "duration_ms": int,
    "timestamp": str,
    "trace_id": str,
    "error": str (optional)
  }
  ```
- **Purpose**: Performance monitoring and debugging
- **Triggered By**: All LangGraph nodes (wrapped with `timed_node`)

### F. Error Logging (`tutor_errors` table)
- **Service**: `timed_node` and `safe_node` decorators
- **Location**: `langgraph_tutor.py:104, 142`
- **What**: Stores error information
- **When**: When a node encounters an exception
- **Data Stored**:
  ```python
  {
    "node": str,
    "user_id": str,
    "topic": str,
    "error": str
  }
  ```
- **Purpose**: Error tracking and debugging
- **Triggered By**: Node exceptions

---

## 2. **Embedding-Related Data Storage** (Secondary Storage)

### A. Concept Embeddings (`concepts` table)
- **Service**: `ConceptService.refresh_embedding()`
- **Location**: `agents/services/concept_service.py:174`
- **What**: Updates concept embeddings when stale (>7 days old)
- **When**: Background refresh when embeddings are detected as stale
- **Data Stored**:
  ```python
  {
    "concept_id": str,
    "embedding": List[float],  # Vector embedding
    "updated_at": timestamp
  }
  ```
- **Purpose**: Keep concept embeddings up-to-date for RAG search
- **Triggered By**: `FetchConcepts` node (when stale embeddings detected)
- **Note**: This is a **background operation** - doesn't block the response

### B. Lesson Chunk Embeddings (`lesson_embeddings` table)
- **Service**: `LessonService.generate_lesson_embeddings()`
- **Location**: `agents/services/lesson_service.py:188`
- **What**: Stores embeddings for lesson content chunks
- **When**: Background refresh when embeddings are stale (>7 days old)
- **Data Stored**:
  ```python
  {
    "lesson_id": str,
    "chunk_id": str,
    "chunk_text": str,
    "embedding": List[float]  # Vector embedding
  }
  ```
- **Purpose**: Enable semantic search within lesson content
- **Triggered By**: `FetchLesson` node (when stale embeddings detected)
- **Note**: This is a **background operation** - doesn't block the response

---

## 3. **Data Flow Summary**

### During a Single Request:

1. **User sends message** → `LogUserMessage` node
   - ✅ **LLM-related**: Stores to `tutor_messages` table

2. **Fetch lesson & concepts** → `FetchLesson`, `FetchConcepts` nodes
   - ⚠️ **Embedding-related**: May trigger background refresh of embeddings
   - 📖 **Read-only**: Reads from `lessons`, `concepts`, `lesson_embeddings` tables

3. **Classify reasoning** → `ClassifyReasoning` node
   - 🤖 **LLM call**: Uses `gpt-4o-mini` to classify (no storage yet)

4. **Generate response** → `GenerateLLMResponse` node
   - 🤖 **LLM call**: Uses main LLM model (no storage yet)

5. **Update mastery** → `UpdateMastery` node
   - ✅ **LLM-related**: Stores to `student_mastery`, `student_weaknesses`, `student_trends`
   - **Based on**: LLM reasoning classification result

6. **Log assistant message** → `LogMessage` node
   - ✅ **LLM-related**: Stores to `tutor_messages` table

7. **Performance tracking** → All nodes (via `timed_node`)
   - ✅ **Monitoring**: Stores to `tutor_traces` table

---

## 4. **Storage Frequency**

### High Frequency (Every Request):
- ✅ `tutor_messages` - 2 writes per request (user + assistant)
- ✅ `tutor_traces` - ~12 writes per request (one per node)
- ✅ `student_mastery` - Variable (depends on concepts found)
- ✅ `student_weaknesses` - Conditional (only if negative delta)
- ✅ `student_trends` - Variable (depends on concepts found)

### Low Frequency (Background/On-Demand):
- ⚠️ `concepts.embedding` - Only when stale (>7 days old)
- ⚠️ `lesson_embeddings` - Only when stale (>7 days old)

### Error-Based:
- ⚠️ `tutor_errors` - Only when exceptions occur

---

## 5. **Storage by Operation Type**

### **LLM Operations Store:**
1. **Conversation messages** (`tutor_messages`) - The actual chat history
2. **Mastery scores** (`student_mastery`) - Based on LLM reasoning classification
3. **Weaknesses** (`student_weaknesses`) - Based on LLM reasoning classification
4. **Trends** (`student_trends`) - Based on LLM reasoning classification
5. **Performance traces** (`tutor_traces`) - Monitoring LLM pipeline execution
6. **Errors** (`tutor_errors`) - LLM pipeline error tracking

### **Embedding Operations Store:**
1. **Concept embeddings** (`concepts.embedding`) - Vector representations of concepts
2. **Lesson chunk embeddings** (`lesson_embeddings`) - Vector representations of lesson content

---

## 6. **Key Differences**

| Aspect | LLM Storage | Embedding Storage |
|--------|------------|-------------------|
| **Frequency** | Every request | Background/on-demand |
| **Purpose** | Conversation & mastery tracking | RAG search optimization |
| **Blocks Response** | Yes (synchronous) | No (asynchronous) |
| **Tables** | `tutor_messages`, `student_mastery`, `student_weaknesses`, `student_trends`, `tutor_traces`, `tutor_errors` | `concepts`, `lesson_embeddings` |
| **Data Type** | Text, scores, metadata | Vector embeddings (arrays of floats) |

---

## 7. **Summary**

**Answer**: **BOTH LLM and Embedding operations store data to Supabase**, but:

- **LLM operations** store the **primary data**: conversation messages, mastery scores, and performance metrics
- **Embedding operations** store **secondary data**: vector embeddings for RAG search (only when refreshing stale embeddings)

**Most storage is LLM-related** because:
- Every request stores conversation messages
- Every request stores mastery updates (based on LLM reasoning classification)
- Every request stores performance traces

**Embedding storage is minimal** because:
- Only happens in background when embeddings are stale (>7 days old)
- Doesn't block the response pipeline
- Used for optimizing future RAG searches

