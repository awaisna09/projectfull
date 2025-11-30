#!/usr/bin/env python3
"""Test grading agent initialization"""

import os
import sys
from dotenv import load_dotenv

load_dotenv('config.env')

# Add agents folder to path
agents_path = os.path.join(os.path.dirname(__file__), 'agents')
if agents_path not in sys.path:
    sys.path.insert(0, agents_path)

try:
    from answer_grading_agent import AnswerGradingAgent
    
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    GRADING_MODEL = os.getenv("GRADING_MODEL", "gpt-4o-mini")
    GRADING_TEMPERATURE = float(os.getenv("GRADING_TEMPERATURE", "0.1"))
    GRADING_MAX_TOKENS = int(os.getenv("GRADING_MAX_TOKENS", "2000"))
    
    print("="*70)
    print("TESTING GRADING AGENT INITIALIZATION")
    print("="*70)
    print(f"OPENAI_API_KEY: {'Set' if OPENAI_API_KEY else 'Missing'}")
    print(f"GRADING_MODEL: {GRADING_MODEL}")
    print(f"GRADING_TEMPERATURE: {GRADING_TEMPERATURE}")
    print(f"GRADING_MAX_TOKENS: {GRADING_MAX_TOKENS}")
    print()
    
    if not OPENAI_API_KEY:
        print("❌ ERROR: OPENAI_API_KEY not set!")
        sys.exit(1)
    
    print("Initializing AnswerGradingAgent...")
    try:
        grading_agent = AnswerGradingAgent(
            api_key=OPENAI_API_KEY,
            model=GRADING_MODEL,
            temperature=GRADING_TEMPERATURE,
            max_tokens=GRADING_MAX_TOKENS
        )
        print("✅ Grading agent initialized successfully!")
        print(f"   Model: {GRADING_MODEL}")
        print(f"   Temperature: {GRADING_TEMPERATURE}")
        print(f"   Max Tokens: {GRADING_MAX_TOKENS}")
        print(f"   Supabase enabled: {grading_agent.repo.enabled}")
    except Exception as e:
        print(f"❌ ERROR initializing grading agent: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
        
except ImportError as e:
    print(f"❌ ERROR importing AnswerGradingAgent: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

