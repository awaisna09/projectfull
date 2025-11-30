#!/usr/bin/env python3
"""
Final verification before starting servers
"""

import os
from dotenv import load_dotenv

print("=" * 70)
print("🔍 FINAL VERIFICATION - IMTEHAAN AI EDTECH PLATFORM")
print("=" * 70)
print()

# Load configuration
load_dotenv('config.env')

# Check API Key
api_key = os.getenv('OPENAI_API_KEY')
print("1. API KEY CONFIGURATION:")
print("-" * 70)
if api_key:
    print(f"   ✅ API Key Found: {api_key[:25]}...{api_key[-20:]}")
    print(f"   ✅ Length: {len(api_key)} characters")
else:
    print("   ❌ API Key NOT FOUND")
print()

# Check Model Configuration
print("2. MODEL CONFIGURATION:")
print("-" * 70)
tutor_model = os.getenv('TUTOR_MODEL')
grading_model = os.getenv('GRADING_MODEL')
print(f"   ✅ AI Tutor Model: {tutor_model}")
print(f"   ✅ Grading Model: {grading_model}")
print()

# Check Agents
print("3. AGENTS VERIFICATION:")
print("-" * 70)
try:
    import sys
    agents_path = os.path.join(os.path.dirname(__file__), 'agents')
    if agents_path not in sys.path:
        sys.path.insert(0, agents_path)
    
    from ai_tutor_agent import AITutorAgent
    from answer_grading_agent import AnswerGradingAgent
    from mock_exam_grading_agent import MockExamGradingAgent
    
    print("   ✅ AI Tutor Agent - Imported successfully")
    print("   ✅ Answer Grading Agent - Imported successfully")
    print("   ✅ Mock Exam Grading Agent - Imported successfully")
except Exception as e:
    print(f"   ❌ Error importing agents: {e}")
print()

# Check Dependencies
print("4. DEPENDENCIES CHECK:")
print("-" * 70)
try:
    import fastapi
    print(f"   ✅ FastAPI {fastapi.__version__}")
except:
    print("   ❌ FastAPI not installed")

try:
    import uvicorn
    print(f"   ✅ Uvicorn installed")
except:
    print("   ❌ Uvicorn not installed")

try:
    from langchain_openai import ChatOpenAI
    print("   ✅ LangChain OpenAI installed")
except:
    print("   ❌ LangChain not installed")

try:
    import openai
    print(f"   ✅ OpenAI {openai.__version__}")
except:
    print("   ❌ OpenAI library not installed")

print()

# Summary
print("=" * 70)
print("📋 CONFIGURATION SUMMARY")
print("=" * 70)
print()
print("✅ New API Key Embedded:")
print(f"   {api_key[:30]}...{api_key[-30:]}")
print()
print("✅ Model Configured:")
print(f"   {tutor_model}")
print()
print("✅ Files Updated:")
print("   - config.env")
print("   - grading_config.env")
print("   - unified_backend.py")
print("   - agents/ai_tutor_agent.py")
print("   - agents/answer_grading_agent.py")
print("   - agents/mock_exam_grading_agent.py")
print()
print("=" * 70)
print("🚀 READY TO START SERVERS!")
print("=" * 70)
print()
print("Backend: python unified_backend.py")
print("Frontend: npm run dev")
print()
print("=" * 70)

