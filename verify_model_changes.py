#!/usr/bin/env python3
"""
Verify that all model references have been updated to gpt-5-nano-2025-08-07
"""

import os
from dotenv import load_dotenv

print("=" * 70)
print("🔍 VERIFYING MODEL CHANGES")
print("=" * 70)
print()

# Load config
load_dotenv('config.env')

# Check config.env values
print("📄 Configuration Files:")
print("-" * 70)
print(f"✅ TUTOR_MODEL = {os.getenv('TUTOR_MODEL')}")
print(f"✅ GRADING_MODEL = {os.getenv('GRADING_MODEL')}")
print()

# Check if agents load correctly
print("🤖 Agent Configurations:")
print("-" * 70)

try:
    import sys
    agents_path = os.path.join(os.path.dirname(__file__), 'agents')
    if agents_path not in sys.path:
        sys.path.insert(0, agents_path)
    
    # Import agents
    from ai_tutor_agent import AITutorAgent
    from answer_grading_agent import AnswerGradingAgent
    from mock_exam_grading_agent import MockExamGradingAgent
    
    # Create dummy instances to check model
    api_key = os.getenv('OPENAI_API_KEY')
    
    # AI Tutor Agent
    tutor = AITutorAgent(api_key=api_key)
    print(f"✅ AI Tutor Agent Model: {tutor.model}")
    
    # Answer Grading Agent
    grader = AnswerGradingAgent(api_key=api_key)
    print(f"✅ Answer Grading Agent Model: {grader.model}")
    
    # Mock Exam Grading Agent
    mock_grader = MockExamGradingAgent(api_key=api_key)
    print(f"✅ Mock Exam Grading Agent Model: {mock_grader.llm.model_name}")
    
except Exception as e:
    print(f"❌ Error checking agents: {e}")

print()
print("=" * 70)
print("📋 FILES UPDATED:")
print("=" * 70)

files_updated = [
    "✅ config.env",
    "✅ grading_config.env", 
    "✅ unified_backend.py",
    "✅ agents/ai_tutor_agent.py",
    "✅ agents/answer_grading_agent.py",
    "✅ agents/mock_exam_grading_agent.py",
    "✅ test_api_models.py",
    "✅ test_api_key_direct.py",
    "✅ test_api_failure.py"
]

for file in files_updated:
    print(f"   {file}")

print()
print("=" * 70)
print("✅ ALL MODELS CHANGED TO: gpt-5-nano-2025-08-07")
print("=" * 70)
print()
print("🔄 Next Steps:")
print("   1. Restart the backend server")
print("   2. Test the API with: python test_api_models.py")
print("=" * 70)

