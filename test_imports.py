#!/usr/bin/env python3
"""Test script to check all imports needed for unified_backend.py"""

import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(__file__))

print("=" * 60)
print("TESTING IMPORTS FOR UNIFIED BACKEND")
print("=" * 60)

errors = []
success = []

# Test core dependencies
try:
    import fastapi
    success.append("✓ fastapi")
except ImportError as e:
    errors.append(f"✗ fastapi - {e}")

try:
    import uvicorn
    success.append("✓ uvicorn")
except ImportError as e:
    errors.append(f"✗ uvicorn - {e}")

try:
    import pydantic
    success.append("✓ pydantic")
except ImportError as e:
    errors.append(f"✗ pydantic - {e}")

try:
    import openai
    success.append("✓ openai")
except ImportError as e:
    errors.append(f"✗ openai - {e}")

try:
    from dotenv import load_dotenv
    success.append("✓ python-dotenv")
except ImportError as e:
    errors.append(f"✗ python-dotenv - {e}")

try:
    import langchain
    success.append("✓ langchain")
except ImportError as e:
    errors.append(f"✗ langchain - {e}")

try:
    from langchain_openai import ChatOpenAI
    success.append("✓ langchain-openai")
except ImportError as e:
    errors.append(f"✗ langchain-openai - {e}")

try:
    import supabase
    success.append("✓ supabase")
except ImportError as e:
    errors.append(f"✗ supabase - {e}")

print("\n" + "=" * 60)
print("CORE DEPENDENCIES:")
print("=" * 60)
for msg in success:
    print(f"  {msg}")
for msg in errors:
    print(f"  {msg}")

# Test agent imports
print("\n" + "=" * 60)
print("TESTING AGENT IMPORTS:")
print("=" * 60)

agent_errors = []
agent_success = []

# Add agents folder to path
agents_path = os.path.join(os.path.dirname(__file__), 'agents')
if agents_path not in sys.path:
    sys.path.insert(0, agents_path)

try:
    from agents.ai_tutor_agent import AITutorAgent
    agent_success.append("✓ agents.ai_tutor_agent")
except ImportError as e:
    agent_errors.append(f"✗ agents.ai_tutor_agent - {e}")

try:
    from langgraph_tutor import run_tutor_graph
    agent_success.append("✓ langgraph_tutor")
except ImportError as e:
    agent_errors.append(f"✗ langgraph_tutor - {e}")

try:
    from agents.answer_grading_agent import AnswerGradingAgent, GradingResult
    agent_success.append("✓ agents.answer_grading_agent")
except ImportError as e:
    agent_errors.append(f"✗ agents.answer_grading_agent - {e}")

try:
    from agents.mock_exam_grading_agent import (
        MockExamGradingAgent, ExamReport, QuestionGrade
    )
    agent_success.append("✓ agents.mock_exam_grading_agent")
except ImportError as e:
    agent_errors.append(f"✗ agents.mock_exam_grading_agent - {e}")

for msg in agent_success:
    print(f"  {msg}")
for msg in agent_errors:
    print(f"  {msg}")

# Summary
print("\n" + "=" * 60)
print("SUMMARY:")
print("=" * 60)
print(f"Successful imports: {len(success) + len(agent_success)}")
print(f"Failed imports: {len(errors) + len(agent_errors)}")

if errors or agent_errors:
    print("\n⚠️  SOME IMPORTS FAILED!")
    print("\nTo fix missing packages, run:")
    print("  pip install -r requirements.txt")
    if any("supabase" in str(e) for e in errors):
        print("\nNote: supabase package may need to be installed separately:")
        print("  pip install supabase")
    sys.exit(1)
else:
    print("\n✅ ALL IMPORTS SUCCESSFUL!")
    sys.exit(0)

