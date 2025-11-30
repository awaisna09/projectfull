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
    print("✅ LangChain imported successfully")
except ImportError as e:
    LANGCHAIN_AVAILABLE = False
    print(f"❌ LangChain import failed: {e}")
    print("⚠️ LangChain not available - using OpenAI directly")

# Load environment variables
print("🔧 Loading environment variables...")
load_dotenv('config.env')

# Configuration with better error handling
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
LANGSMITH_API_KEY = os.getenv("LANGSMITH_API_KEY")
LANGSMITH_PROJECT = os.getenv("LANGSMITH_PROJECT", "imtehaan-ai-tutor")
LANGSMITH_ENDPOINT = os.getenv("LANGSMITH_ENDPOINT", "https://api.smith.langchain.com")

print(f"🔑 OpenAI API Key: {'✅ Set' if OPENAI_API_KEY else '❌ Missing'}")
print(f"🔍 LangSmith API Key: {'✅ Set' if LANGSMITH_API_KEY else '❌ Missing'}")
print(f"📁 LangSmith Project: {LANGSMITH_PROJECT}")

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
print("🚀 Initializing FastAPI app...")
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
        print("🤖 AI Tutor initialized")
    
    def get_response(self, request: TutorRequest) -> TutorResponse:
        """Generate AI tutor response using LangChain directly"""
        print(f"🧠 Processing request for topic: {request.topic}")
        
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
            
            # Use LangChain directly
            if LANGCHAIN_AVAILABLE:
                try:
                    print("🤖 Creating LangChain model...")
                    llm = ChatOpenAI(
                        model="gpt-4",
                        temperature=1,
                        openai_api_key=OPENAI_API_KEY,
                        max_tokens=1500
                    )
                    
                    user_prompt = f"""You are a Business Studies tutor. Topic: {request.topic}. 
                    Level: {request.learning_level}. 
                    Student question: {request.message}
                    
                    Provide a helpful, educational response."""
                    
                    print("🤖 Sending request to LangChain...")
                    response = llm.invoke(user_prompt)
                    ai_response = response.content
                    
                    print(f"✅ LangChain response generated for: {request.topic}")
                    
                except Exception as e:
                    print(f"⚠️ LangChain failed: {e}")
                    ai_response = f"I'm having trouble with the AI service. Please try again. Error: {str(e)}"
            else:
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
            print(f"❌ Error generating response: {e}")
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
        
        business_concepts = [
            "marketing", "finance", "operations", "strategy", "leadership",
            "economics", "accounting", "human resources", "entrepreneurship"
        ]
        
        for concept in business_concepts:
            if concept.lower() in response.lower() and concept.lower() != topic.lower():
                related_concepts.append(concept)
        
        return related_concepts[:3]

# Initialize AI Tutor
print("🤖 Initializing AI Tutor...")
ai_tutor = SimpleAITutor()

# API Endpoints
@app.post("/tutor/chat", response_model=TutorResponse)
async def chat_with_tutor(request: TutorRequest):
    """Main endpoint for AI tutor conversations"""
    print(f"📨 Chat request received: {request.message[:50]}...")
    try:
        response = ai_tutor.get_response(request)
        return response
    except Exception as e:
        print(f"❌ Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/tutor/health")
async def health_check():
    """Health check endpoint with LangChain status"""
    print("🔍 Health check requested")
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
    print("📚 Topics request received")
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
    print("🧠 LangChain status request received")
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

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "AI Tutor Service is running", "status": "healthy"}

if __name__ == "__main__":
    print("🚀 Starting AI Tutor Service...")
    print(f"🔑 OpenAI API Key: {'✅ Set' if OPENAI_API_KEY else '❌ Missing'}")
    
    if LANGCHAIN_AVAILABLE:
        print("✅ LangChain integration: ENABLED")
    else:
        print("⚠️  LangChain integration: DISABLED")
    
    if LANGSMITH_API_KEY:
        print("🔍 LangSmith tracing: ENABLED")
    else:
        print("⚠️  LangSmith tracing: DISABLED")
    
    print("\n🌐 Server starting on http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("🔍 Health Check: http://localhost:8000/tutor/health")
    
    # Run the FastAPI server
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
