#!/usr/bin/env python3
"""
FastAPI endpoint for answer grading
Integrates with the existing AI tutor system
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import sys
from dotenv import load_dotenv

# Add agents folder to path so we can import directly
agents_path = os.path.join(os.path.dirname(__file__), 'agents')
if agents_path not in sys.path:
    sys.path.insert(0, agents_path)
from answer_grading_agent import (  # noqa: E402
    AnswerGradingAgent,
    GradingResult
)

# Load environment variables (use unified config)
load_dotenv('config.env')

app = FastAPI(title="Answer Grading API", version="1.0.0")

# CORS Configuration
# For production, set ALLOWED_ORIGINS env var to your frontend domain
ALLOWED_ORIGINS_RAW = os.getenv("ALLOWED_ORIGINS", "*")
ALLOWED_ORIGINS = [origin.strip() for origin in ALLOWED_ORIGINS_RAW.split(",")]

# Always allow localhost for local development
if "*" not in ALLOWED_ORIGINS:
    localhost_origins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ]
    for origin in localhost_origins:
        if origin not in ALLOWED_ORIGINS:
            ALLOWED_ORIGINS.append(origin)

# Security warning for production
if (
    "*" in ALLOWED_ORIGINS
    and os.getenv("ENVIRONMENT", "development") == "production"
):
    print(
        "⚠️  WARNING: CORS is set to allow all origins (*) in production!"
    )
    print(
        "   Set ALLOWED_ORIGINS environment variable to specific domains "
        "for security"
    )

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


# Request models
class GradingRequest(BaseModel):
    question: str
    model_answer: str
    student_answer: str
    subject: str = "Business Studies"
    topic: str = ""
    user_id: str | None = None
    question_id: str | None = None
    topic_id: str | None = None
    max_marks: int | None = None
    difficulty_level: int | None = None


class GradingResponse(BaseModel):
    success: bool
    result: GradingResult
    message: str = ""


# Initialize the grading agent
grading_agent = None


@app.on_event("startup")
async def startup_event():
    """Initialize the grading agent on startup"""
    global grading_agent

    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print(
            "❌ Warning: OPENAI_API_KEY not found. "
            "Grading will not work."
        )
        return

    try:
        grading_agent = AnswerGradingAgent(api_key)
        print("✅ Answer Grading Agent initialized successfully")
    except Exception as e:
        print(f"❌ Error initializing grading agent: {e}")


def enforce_rate_limit(user_id: str, endpoint: str):
    """
    TODO: implement Redis-based per-student rate limit.
    No-op for now.
    """
    return


@app.post("/grade-answer", response_model=GradingResponse)
async def grade_answer(request: GradingRequest):
    """Grade a student answer against the model answer"""

    if not grading_agent:
        raise HTTPException(
            status_code=500,
            detail=(
                "Grading agent not initialized. "
                "Check API key configuration."
            )
        )

    try:
        # Validate input
        if not request.student_answer.strip():
            raise HTTPException(
                status_code=400,
                detail="Student answer cannot be empty"
            )

        if not request.model_answer.strip():
            raise HTTPException(
                status_code=400,
                detail="Model answer cannot be empty"
            )

        if request.user_id:
            enforce_rate_limit(request.user_id, "grade-answer")

        # Grade the answer
        result = grading_agent.grade_answer(
            request.question,
            request.model_answer,
            request.student_answer,
            user_id=request.user_id,
            question_id=request.question_id,
            topic_id=request.topic_id,
            max_marks=request.max_marks,
            difficulty_level=request.difficulty_level
        )

        return GradingResponse(
            success=True,
            result=result,
            message="Answer graded successfully"
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error during grading: {str(e)}"
        )


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "grading_agent_ready": grading_agent is not None,
        "grading_agent_supports_analytics": hasattr(
            grading_agent, "mastery_engine"
        ) if grading_agent else False,
        "service": "Answer Grading API"
    }


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Answer Grading API for Business Studies",
        "endpoints": {
            "grade_answer": "/grade-answer",
            "health": "/health"
        },
        "status": "running"
    }


if __name__ == "__main__":
    import uvicorn

    # Check if API key is available
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("❌ Error: OPENAI_API_KEY not found in config.env")
        print("Please add your OpenAI API key to config.env")
        exit(1)

    print("🚀 Starting Answer Grading API...")
    print("📚 Endpoint: http://localhost:8001")
    print("📖 Documentation: http://localhost:8001/docs")

    uvicorn.run(app, host="0.0.0.0", port=8001)
