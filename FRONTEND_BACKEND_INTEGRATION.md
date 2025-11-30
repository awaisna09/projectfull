# Frontend-Backend Integration Architecture

## 🏗️ Complete System Architecture

This document explains how the React frontend communicates with the Python FastAPI backend and Supabase database.

---

## 📡 **Communication Flow Overview**

```
┌─────────────────┐
│   React UI      │
│   (Port 5173)   │
└────────┬────────┘
         │
         ├─────────────────────────────────────┐
         │                                     │
         ▼                                     ▼
┌─────────────────┐              ┌────────────────────┐
│  FastAPI        │              │  Supabase Database │
│  Backend        │              │  (Cloud)           │
│  (Port 8000)    │              │                    │
└─────────────────┘              └────────────────────┘
         │
         ▼
┌─────────────────┐
│   OpenAI API    │
│   (External)    │
└─────────────────┘
```

---

## 🔌 **Backend Endpoints**

### **Base URL Configuration**
- **Development**: `http://localhost:8000`
- **Production**: Environment variable `VITE_API_BASE_URL`

### **1. AI Tutor Endpoints**

#### **POST `/tutor/chat`** - AI Chat
**Request:**
```javascript
{
  message: string,
  topic: string,
  lesson_content?: string,
  user_id?: string,
  conversation_history?: Array<{role, content, timestamp}>,
  learning_level?: string
}
```

**Response:**
```javascript
{
  response: string,
  suggestions: string[],
  related_concepts: string[],
  confidence_score: number
}
```

**Frontend Usage** (`utils/ai-tutor-service.ts`):
```typescript
const response = await fetch(`${this.baseURL}/tutor/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "What is market segmentation?",
    topic: "Marketing",
    user_id: userId,
    conversation_history: conversationHistory,
    learning_level: 'intermediate'
  })
});
```

#### **POST `/tutor/lesson`** - Generate Lesson
**Request:**
```javascript
{
  topic: string,
  learning_objectives: string[],
  difficulty_level: string
}
```

**Response:**
```javascript
{
  lesson_content: string,
  key_points: string[],
  practice_questions: string[],
  estimated_duration: number
}
```

#### **GET `/tutor/health`** - Health Check
**Response:**
```javascript
{
  status: "healthy",
  service: "AI Tutor",
  langchain_available: boolean,
  openai_configured: boolean
}
```

---

### **2. Grading Endpoints**

#### **POST `/grade-answer`** - Grade Single Answer
**Request:**
```javascript
{
  question: string,
  model_answer: string,
  student_answer: string,
  subject: string,
  topic: string
}
```

**Response:**
```javascript
{
  success: boolean,
  result: {
    overall_score: number,        // 0-50
    percentage: number,            // 0-100
    grade: string,                 // A, B, C, D, F
    strengths: string[],
    areas_for_improvement: string[],
    specific_feedback: string,
    suggestions: string[]
  },
  message: string
}
```

**Frontend Usage** (`components/PracticeMode.tsx` line 522):
```typescript
const response = await fetch('http://localhost:8000/grade-answer', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    question: currentQuestionData.question,
    model_answer: currentQuestionData.modelAnswer,
    student_answer: studentAnswer,
    subject: 'Business Studies',
    topic: selectedTopic
  })
});
```

#### **POST `/grade-mock-exam`** - Grade Complete Exam
**Request:**
```javascript
{
  attempted_questions: [
    {
      question_id: number,
      question: string,
      user_answer: string,
      solution: string,
      marks: number,
      part: string,
      set: string
    }
  ],
  exam_type: string,  // "P1" or "P2"
  user_id?: string
}
```

**Response:**
```javascript
{
  success: boolean,
  total_questions: number,
  questions_attempted: number,
  total_marks: number,
  marks_obtained: number,
  percentage_score: number,
  overall_grade: string,
  question_grades: [...],
  overall_feedback: string,
  recommendations: string[],
  strengths_summary: string[],
  weaknesses_summary: string[],
  message: string
}
```

**Frontend Usage** (`components/MockExamPage.tsx` line 416):
```typescript
const response = await fetch('http://localhost:8000/grade-mock-exam', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    attempted_questions: gradingData,
    exam_type: 'P1',
    user_id: currentUser?.id
  })
});
```

#### **GET `/grading/health`** - Grading Health Check

---

### **3. Unified Health Check**

#### **GET `/health`** - All Services Status
**Response:**
```javascript
{
  status: "healthy",
  services: {
    ai_tutor: {
      status: "healthy",
      langchain_available: boolean,
      openai_configured: boolean
    },
    grading: {
      status: "healthy",
      agent_ready: boolean
    }
  },
  timestamp: string
}
```

---

## 🗄️ **Supabase Integration**

### **Database Tables**

#### **1. Authentication** (`auth.users`)
- Managed by Supabase Auth
- Triggers create user profile in `users` table

#### **2. Users Table** (`users`)
**Structure:**
```sql
id: UUID (primary key, references auth.users)
email: TEXT (unique)
full_name: TEXT
avatar_url: TEXT
user_type: TEXT (student/teacher/admin)
curriculum: TEXT
grade: TEXT
subjects: TEXT[]
preferences: JSONB
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

#### **3. Topics Table** (`topics`)
**Structure:**
```sql
topic_id: INTEGER (primary key)
subject_id: INTEGER (101=Business, 102=Math, etc.)
topic: TEXT
description: TEXT
is_active: BOOLEAN
```

#### **4. Questions Tables**
**`business_activity_questions`:**
- Context, question, marks, skill, hint
- Topic_name, part, model_answer, explanation
- Topic_id references topics table

**`p1_mock_exam`:** Paper 1 questions
**`p2_mock_exam`:** Paper 2 case studies

#### **5. Analytics Tables**
**`daily_analytics`:**
- User progress summary by day
- Study time, questions answered, accuracy

**`learning_activities`:**
- Individual activity records
- Activity type, duration, metadata

**`study_sessions`:**
- Session-based tracking
- Start/end times, questions, score

**`page_sessions`:**
- Page-level interaction tracking
- Entry/exit times, page name

---

## 🔗 **Frontend-to-Database Flow**

### **Authentication Flow**

```typescript
// 1. User signs up (SignUpPage.tsx)
const result = await AuthService.signUp({
  email, password,
  full_name, user_type, curriculum, grade
});

// 2. Supabase creates auth.users entry
// 3. Trigger creates users table entry
// 4. User redirected to dashboard
```

### **Data Fetching Flow**

```typescript
// Topics Service (utils/supabase/services.ts)
const { data, error } = await supabase
  .from('topics')
  .select('topic_id, topic')
  .eq('subject_id', subjectId);

// Questions Service
const { data, error } = await supabase
  .from('business_activity_questions')
  .select('*')
  .eq('topic_id', topicId);
```

### **Analytics Tracking Flow**

```typescript
// 1. User action occurs (button click, page view)
// 2. Auto-tracker captures event (auto-activity-tracker.ts)
// 3. Data buffered and sent to Supabase
// 4. Comprehensive analytics service aggregates
// 5. Dashboard displays real-time data
```

---

## 🔄 **Complete Feature Flows**

### **1. Practice Mode → AI Grading**

```
User submits answer
        ↓
PracticeMode.tsx: handleSubmit()
        ↓
gradeAnswer(studentAnswer)
        ↓
POST /grade-answer
{
  question, model_answer, 
  student_answer, subject, topic
}
        ↓
AnswerGradingAgent.grade_answer()
        ↓
LangChain + GPT-4 analysis
        ↓
Response: {
  overall_score, percentage, grade,
  strengths, improvements, feedback
}
        ↓
Display results + explanations
        ↓
Track analytics (learning_activities table)
```

### **2. AI Tutor Chat**

```
User asks question
        ↓
AITutorPage.tsx: handleSendMessage()
        ↓
aiTutorService.sendMessage()
        ↓
POST /tutor/chat
{
  message, topic, 
  conversation_history, learning_level
}
        ↓
SimpleAITutor.get_response()
        ↓
LangChain ChatOpenAI processing
        ↓
Response: {
  response, suggestions,
  related_concepts, confidence_score
}
        ↓
Update chat UI + conversation history
```

### **3. Mock Exam Grading**

```
User submits P1 exam
        ↓
MockExamPage.tsx: handleExamSubmit()
        ↓
Collect all attempted questions
        ↓
POST /grade-mock-exam
{
  attempted_questions[], exam_type, user_id
}
        ↓
MockExamGradingAgent.grade_exam()
        ↓
Grade each question individually
        ↓
Calculate overall score & grade
        ↓
Response: {
  percentage_score, overall_grade,
  question_grades[], recommendations
}
        ↓
Display comprehensive report
```

---

## 🎯 **Service Layer Structure**

### **Frontend Services** (`utils/`)

#### **1. AI Tutor Service** (`ai-tutor-service.ts`)
```typescript
class AITutorService {
  private baseURL: string
  private conversationHistory: ConversationMessage[]
  
  async sendMessage(message: string, lessonContent?: string)
  async generateLesson(topic, objectives, difficulty)
  async healthCheck()
}
```

#### **2. Supabase Services** (`supabase/services.ts`)
```typescript
// Topics
export const topicsService = {
  async getTopicsBySubject(subject)
  async getBusinessActivityQuestions(topicId)
}

// Study Plans
export const studyPlansService = {
  async getUserStudyPlans(userId)
  async createStudyPlan(plan)
}

// Mock Exams
export const p1MockExamService = { ... }
export const p2MockExamService = { ... }

// Flashcards
export const flashcardsService = {
  async getFlashcardsByTopic(topicId)
}
```

#### **3. Analytics Services** (`supabase/`)
- **comprehensive-analytics-service.ts**: Real-time analytics
- **enhanced-analytics-tracker.ts**: Session management
- **learning-activity-tracker.ts**: Education tracking
- **page-activity-tracker.ts**: Page-level tracking
- **auto-activity-tracker.ts**: Background monitoring

---

## 🔐 **Authentication Context**

### **AuthContext.tsx Flow**

```typescript
// Wrap app with AuthProvider
<AuthProvider>
  <App />
</AuthProvider>

// Available methods
const {
  user,
  signUp(email, password, metadata),
  signIn(email, password),
  signOut(),
  signInWithGoogle(),
  loading
} = useAuth();

// Fallback: Local authentication
if (!Supabase configured) {
  → Use localStorage
  → Simulate auth flow
  → No server required
}
```

---

## 📊 **Analytics Integration**

### **Automatic Tracking**

1. **useAutoTracking Hook** (`hooks/useAutoTracking.ts`)
   - Tracks clicks, time, scroll
   - Sends to auto-activity-tracker
   - Buffered updates to Supabase

2. **usePageTracking Hook** (`hooks/usePageTracking.ts`)
   - Page-specific events
   - Study sessions
   - Lesson progress

3. **Event Flow:**
```
User Action
    ↓
Hooks capture event
    ↓
Auto-tracker buffers
    ↓
Periodic flush to Supabase
    ↓
Analytics service processes
    ↓
Dashboard updates
```

---

## 🌐 **Environment Configuration**

### **Frontend Environment** (`.env.local`)
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_API_BASE_URL=http://localhost:8000
```

### **Backend Environment** (`config.env`)
```env
OPENAI_API_KEY=sk-xxx
LANGSMITH_TRACING=true
LANGSMITH_API_KEY=lsv2_xxx
LANGSMITH_PROJECT=imtehaan-ai-tutor
HOST=0.0.0.0
PORT=8000
TUTOR_MODEL=gpt-4
GRADING_MODEL=gpt-4
```

---

## 🚀 **Component Integration Examples**

### **Example 1: Practice Mode with Grading**

```typescript
// PracticeMode.tsx
const handleSubmit = async () => {
  const studentAnswer = inputRef.current?.value || '';
  
  // Call grading API
  const response = await fetch('http://localhost:8000/grade-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: currentQuestionData.question,
      model_answer: currentQuestionData.modelAnswer,
      student_answer: studentAnswer,
      subject: 'Business Studies',
      topic: selectedTopic
    })
  });
  
  const result = await response.json();
  setGradingResult(result.result);
  
  // Track in analytics
  await learningActivityTracker.trackQuestionAttempt({
    userId: user.id,
    questionId: currentQuestion,
    isCorrect: result.result.grade !== 'F',
    timeSpent: timeSpent
  });
};
```

### **Example 2: AI Tutor Chat**

```typescript
// AITutorPage.tsx
const handleSendMessage = async () => {
  const response = await aiTutorService.sendMessage(
    inputMessage,
    selectedLesson?.content
  );
  
  if (response.success && response.data) {
    setChatMessages(prev => [...prev, 
      { role: 'user', content: inputMessage, timestamp: new Date().toISOString() },
      { role: 'assistant', content: response.data.response, timestamp: new Date().toISOString() }
    ]);
    
    setSuggestions(response.data.suggestions);
  }
};
```

---

## 🐳 **Docker Integration**

### **docker-compose.yml Structure**

```yaml
services:
  backend:
    build: Dockerfile.backend
    ports: ["8000:8000"]
    env: OPENAI_API_KEY, LANGSMITH_API_KEY
    
  frontend:
    build: Dockerfile.frontend (multi-stage)
    ports: ["80:80"]
    env: VITE_SUPABASE_URL, VITE_API_BASE_URL
    
  supabase: (optional local)
    image: postgres
    ports: ["5432:5432"]
```

### **Nginx Proxy** (`nginx.conf`)
```nginx
location /api/ {
    proxy_pass http://backend:8000/;
}
```

---

## 📱 **State Management**

### **App Context** (`App.tsx`)
```typescript
const AppContext = createContext<{
  currentPage: Page
  user: User | null
  subjects: Subject[]
  studyPlans: StudyPlan[]
  setCurrentPage: (page: Page) => void
  // ... other state
}>()
```

### **Auth Context** (`AuthContext.tsx`)
```typescript
const AuthContext = createContext<{
  user: User | null
  signUp, signIn, signOut
  loading: boolean
}>()
```

---

## 🔄 **Real-Time Data Flow**

### **Dashboard Analytics**

```
1. Component mounts (Analytics.tsx)
   ↓
2. comprehensiveAnalyticsService.getRealTimeAnalytics(userId)
   ↓
3. Fetch from daily_analytics, learning_activities, study_sessions
   ↓
4. Aggregate and calculate metrics
   ↓
5. Return structured data
   ↓
6. React state updates
   ↓
7. UI renders with charts
   ↓
8. Auto-refresh every 30s
```

---

## 🧪 **Testing Integration**

### **Backend Test**
```bash
curl http://localhost:8000/health
curl http://localhost:8000/tutor/health
curl http://localhost:8000/grading/health
```

### **Frontend Test**
```bash
# Start backend first
python start_unified_backend.py

# Start frontend
npm run dev

# Test in browser
localhost:5173
```

---

## 🎉 **Key Integration Points**

1. ✅ **Unified Backend** on port 8000
2. ✅ **Supabase** for data persistence
3. ✅ **AI Services** via OpenAI API
4. ✅ **Real-time Analytics** via Supabase subscriptions
5. ✅ **Authentication** with Supabase Auth
6. ✅ **State Management** via React Context
7. ✅ **Auto-tracking** via custom hooks
8. ✅ **Docker** deployment ready

---

**This architecture enables a seamless flow from user interactions in React to AI processing in Python to data persistence in Supabase!** 🚀

