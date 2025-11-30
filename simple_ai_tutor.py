import os
import json
from typing import Dict, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv


# Optional LangChain support
try:
    from langchain_openai import ChatOpenAI
    LANGCHAIN_AVAILABLE = True
except ImportError:
    LANGCHAIN_AVAILABLE = False
    print("LangChain not available - using OpenAI directly")

# Load environment variables
load_dotenv('config.env')

# Configuration with better error handling
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
LANGSMITH_API_KEY = os.getenv("LANGSMITH_API_KEY")
LANGSMITH_PROJECT = os.getenv("LANGSMITH_PROJECT", "imtehaan-ai-tutor")
LANGSMITH_ENDPOINT = os.getenv("LANGSMITH_ENDPOINT", "https://api.smith.langchain.com")

# Validate required configuration
if not OPENAI_API_KEY:
    print("❌ CRITICAL ERROR: OPENAI_API_KEY not found")
    print("   Please check config.env and ensure OPENAI_API_KEY is set")
    exit(1)

# Set LangSmith environment variables if available
if LANGSMITH_API_KEY:
    os.environ["LANGSMITH_API_KEY"] = LANGSMITH_API_KEY
    os.environ["LANGSMITH_PROJECT"] = LANGSMITH_PROJECT
    os.environ["LANGSMITH_ENDPOINT"] = LANGSMITH_ENDPOINT
    os.environ["LANGSMITH_TRACING"] = os.getenv("LANGSMITH_TRACING", "true")
    print(f"✅ LangSmith configured: {LANGSMITH_PROJECT}")
else:
    print("⚠️  WARNING: LANGSMITH_API_KEY not found - tracing disabled")


# Initialize FastAPI app
app = FastAPI(title="AI Tutor Service", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class TutorRequest(BaseModel):
    message: str
    topic: str
    lesson_content: Optional[str] = None
    user_id: Optional[str] = None
    conversation_history: Optional[List[Dict[str, str]]] = []
    learning_level: Optional[str] = "intermediate"

class TutorResponse(BaseModel):
    response: str
    suggestions: List[str]
    related_concepts: List[str]
    confidence_score: float

class LessonRequest(BaseModel):
    topic: str
    learning_objectives: List[str]
    difficulty_level: str = "intermediate"

class LessonResponse(BaseModel):
    lesson_content: str
    key_points: List[str]
    practice_questions: List[str]
    estimated_duration: int


class SimpleAITutor:
    def __init__(self):
        self.conversations = {}
    
    def get_response(self, request: TutorRequest) -> TutorResponse:
        """Generate AI tutor response using LangChain directly - every message goes as a prompt"""
        
        try:
            # Create conversation context
            conversation_id = f"{request.user_id}_{request.topic}"
            
            if conversation_id not in self.conversations:
                self.conversations[conversation_id] = []
            
            # Add user message to conversation
            self.conversations[conversation_id].append({
                "role": "user",
                "content": request.message
            })
            
            # Use LangChain directly - every message goes as a prompt
            if LANGCHAIN_AVAILABLE:
                try:
                    # Create LangChain model
                    llm = ChatOpenAI(
                        model="gpt-4",
                        temperature=1,
                        openai_api_key=OPENAI_API_KEY,
                        max_tokens=1500
                    )
                    
                    # Direct prompt to LangChain - minimal processing
                    user_prompt = f"""You are a Business Studies tutor. Topic: {request.topic}. 
                    Level: {request.learning_level}. 
                    Student question: {request.message}
                    
                    Provide a helpful, educational response."""
                    
                    # Send directly to LangChain
                    response = llm.invoke(user_prompt)
                    ai_response = response.content
                    
                    print(f"✅ LangChain response generated for: {request.topic}")
                    
                except Exception as e:
                    print(f"⚠️ LangChain failed: {e}")
                    # Simple fallback
                    ai_response = f"I'm having trouble with the AI service. Please try again. Error: {str(e)}"
            else:
                # Fallback if LangChain not available
                ai_response = "LangChain service not available. Please check configuration."
            
            # Generate follow-up suggestions
            suggestions = self._generate_suggestions(request.topic, request.learning_level)
            
            # Extract related concepts
            related_concepts = self._extract_related_concepts(request.topic, ai_response)
            
            # Add AI response to conversation
            self.conversations[conversation_id].append({
                "role": "assistant",
                "content": ai_response
            })
            
            return TutorResponse(
                response=ai_response,
                suggestions=suggestions,
                related_concepts=related_concepts,
                confidence_score=0.9
            )
            
        except Exception as e:
            print(f"Error generating response: {e}")
            return TutorResponse(
                response="I apologize, but I'm having trouble processing your request right now. Please try again.",
                suggestions=["Ask a simpler question", "Check your internet connection", "Try rephrasing your question"],
                related_concepts=[],
                confidence_score=0.0
            )
    
    def _generate_suggestions(self, topic: str, level: str) -> List[str]:
        """Generate follow-up question suggestions"""
        suggestions = [
            f"Can you explain {topic} with a real-world example?",
            f"What are the key differences between {topic} and related concepts?",
            f"How would you apply {topic} in a business scenario?",
            f"What are common mistakes people make when learning about {topic}?",
            f"Can you give me a practice question about {topic}?"
        ]
        return suggestions[:3]
    
    def _extract_related_concepts(self, topic: str, response: str) -> List[str]:
        """Extract related concepts from the response"""
        related_concepts = []
        
        # Common business concepts that might be related
        business_concepts = [
            "marketing", "finance", "operations", "strategy", "leadership",
            "economics", "accounting", "human resources", "entrepreneurship"
        ]
        
        for concept in business_concepts:
            if concept.lower() in response.lower() and concept.lower() != topic.lower():
                related_concepts.append(concept)
        
        return related_concepts[:3]




# Initialize AI Tutor
ai_tutor = SimpleAITutor()

# API Endpoints
@app.post("/tutor/chat", response_model=TutorResponse)
async def chat_with_tutor(request: TutorRequest):
    """Main endpoint for AI tutor conversations"""
    try:
        response = ai_tutor.get_response(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/tutor/generate-lesson", response_model=LessonResponse)
async def generate_lesson(request: LessonRequest):
    """Generate a custom lesson for a topic"""
    try:
        prompt = f"""Create a comprehensive lesson about '{request.topic}' at a {request.difficulty_level} level.
        
        Learning objectives: {', '.join(request.learning_objectives)}
        
        Include:
        1. Clear explanations
        2. Key concepts
        3. Examples
        4. Practice questions
        5. Estimated duration
        
        Format as JSON:
        {{
            "lesson_content": "...",
            "key_points": ["...", "..."],
            "practice_questions": ["...", "..."],
            "estimated_duration": 30
        }}
        """
        
        if LANGCHAIN_AVAILABLE:
            try:
                llm = ChatOpenAI(
                    model="gpt-4",
                    temperature=1,
                    openai_api_key=OPENAI_API_KEY,
                    max_tokens=1500
                )
                response = llm.invoke(prompt)
                lesson_content = response.content
            except Exception as e:
                lesson_content = f"Error generating lesson: {str(e)}"
        else:
            lesson_content = "LangChain not available for lesson generation"
        
        # Parse the response (in production, you'd want better error handling)
        try:
            lesson_data = json.loads(lesson_content)
            return LessonResponse(**lesson_data)
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            return LessonResponse(
                lesson_content=lesson_content,
                key_points=["Key concept 1", "Key concept 2"],
                practice_questions=["What is the main idea?", "How would you apply this?"],
                estimated_duration=30
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/tutor/health")
async def health_check():
    """Health check endpoint with LangChain status"""
    return {
        "status": "healthy", 
        "service": "AI Tutor Service",
        "langchain_status": "enabled" if LANGCHAIN_AVAILABLE else "disabled",
        "openai_status": "enabled" if OPENAI_API_KEY else "disabled",
        "langsmith_status": "enabled" if LANGSMITH_API_KEY else "disabled",
        "features": [
            "AI-powered Business Studies tutoring",
            "LangChain integration",
            "Conversation memory",
            "Lesson generation",
            "Real-time chat",
            "Context-aware responses"
        ]
    }

@app.get("/tutor/topics")
async def get_available_topics():
    """Get list of available topics"""
    topics = [
        "Business Strategy",
        "Marketing Management",
        "Financial Management",
        "Operations Management",
        "Human Resource Management",
        "Entrepreneurship",
        "Business Ethics",
        "International Business",
        "Supply Chain Management",
        "Digital Marketing"
    ]
    return {"topics": topics}

@app.get("/tutor/langchain-status")
async def get_langchain_status():
    """Get detailed LangChain integration status"""
    return {
        "langchain_available": LANGCHAIN_AVAILABLE,
        "langchain_version": "0.3.27" if LANGCHAIN_AVAILABLE else "not installed",
        "openai_integration": "enabled" if OPENAI_API_KEY else "disabled",
        "langsmith_tracing": "enabled" if LANGSMITH_API_KEY else "disabled",
        "model_config": {
            "model": "gpt-4",
            "temperature": 1,
            "max_tokens": 1500
        },
        "capabilities": [
            "Enhanced AI tutoring with LangChain",
            "Context-aware conversations",
            "Business Studies specialization",
            "Real-time learning assistance",
            "Intelligent response generation"
        ]
    }

if __name__ == "__main__":
    # Check for required environment variables
    if not OPENAI_API_KEY:
        print("❌ ERROR: OPENAI_API_KEY not found in environment variables")
        exit(1)
    
    if not LANGSMITH_API_KEY:
        print("⚠️  WARNING: LANGSMITH_API_KEY not found in environment variables")
        print("   LangSmith tracing will be disabled")
    else:
        print(f"✅ LangSmith API Key found: {LANGSMITH_API_KEY[:20]}...")
    
    print("🚀 Starting AI Tutor Service...")
    print(f"🔑 OpenAI API Key: {OPENAI_API_KEY[:20]}...")
    
    if LANGCHAIN_AVAILABLE:
        print("✅ LangChain integration: ENABLED")
        print("🧠 Enhanced AI tutoring with LangChain")
    else:
        print("⚠️  LangChain integration: DISABLED")
        print("📚 Using OpenAI directly")
    
    if LANGSMITH_API_KEY:
        print("🔍 LangSmith tracing: ENABLED")
    else:
        print("⚠️  LangSmith tracing: DISABLED")
    
    print("\n🌐 Server starting on http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("🔍 Health Check: http://localhost:8000/tutor/health")
    print("🧠 LangChain Status: http://localhost:8000/tutor/langchain-status")
    
    # Run the FastAPI server
    uvicorn.run(app, host="0.0.0.0", port=8000)
