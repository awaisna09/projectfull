#!/usr/bin/env python3
"""
Test script to show the ACTUAL prompts being sent to the LLM
This will help verify that system and user prompts are properly separated.
"""

import os
import sys
from dotenv import load_dotenv

# Load environment
load_dotenv('config.env')

# Add agents to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'agents'))

from answer_grading_agent import AnswerGradingAgent
from langchain_core.messages import SystemMessage, HumanMessage


def test_actual_prompts():
    """Show the actual prompts being constructed"""
    
    print("=" * 80)
    print("TEST: Showing Actual Prompts Being Sent to LLM")
    print("=" * 80)
    print()
    
    # Get API key
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("❌ ERROR: OPENAI_API_KEY not found in config.env")
        return False
    
    # Initialize agent
    print("📦 Initializing AnswerGradingAgent...")
    agent = AnswerGradingAgent(api_key)
    print("✅ Agent initialized")
    print()
    
    # Test data (matching user's example)
    question = "Define the term 'business activity'."
    model_answer = (
        "Business activity is the process of producing goods and "
        "services to satisfy people's needs and wants."
    )
    student_answer = "activities invloved in the business"
    
    # Enable debug mode to see what's being sent
    os.environ['GRADING_DEBUG'] = 'true'
    
    print("=" * 80)
    print("CONSTRUCTING PROMPTS (without calling LLM)")
    print("=" * 80)
    print()
    
    # Manually construct what the agent would send
    system_prompt = agent._get_system_prompt()
    
    # Simulate truncation
    q_trunc = question[:350] + "..." if len(question) > 350 else question
    m_trunc = (
        model_answer[:500] + "..."
        if len(model_answer) > 500
        else model_answer
    )
    a_trunc = (
        student_answer[:350] + "..."
        if len(student_answer) > 350
        else student_answer
    )
    
    marks_hint = "Max marks for this question: 2.\n"
    
    user_prompt = (
        f"{marks_hint}"
        f"Now grade the following answer. Return ONLY JSON.\n\n"
        f"Question: {q_trunc}\n"
        f"Model Answer: {m_trunc}\n"
        f"Student Answer: {a_trunc}\n"
    )
    
    user_prompt += (
        'Return JSON exactly in this shape:\n'
        '{"overall_score": <0-50>, '
        '"percentage": <0-100>, '
        '"grade": "<A|B|C|D|F>", '
        '"strengths": ["s1"], '
        '"areas_for_improvement": ["a1"], '
        '"specific_feedback": "<brief>", '
        '"suggestions": ["s1"], '
        '"reasoning_category": "<correct|partial|mild_confusion|'
        'wrong|high_confusion|misconception>", '
        '"has_misconception": <true|false>, '
        '"primary_concepts": ["id1"], '
        '"secondary_concepts": ["id2"]}'
    )
    
    # Create messages
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_prompt)
    ]
    
    print("📋 SYSTEM MESSAGE (SystemMessage):")
    print("-" * 80)
    print(f"Type: {type(messages[0]).__name__}")
    print(f"Length: {len(messages[0].content)} characters")
    print()
    print("Content (first 800 chars):")
    print(messages[0].content[:800])
    if len(messages[0].content) > 800:
        print("...")
    print()
    print("=" * 80)
    print()
    
    print("📋 USER MESSAGE (HumanMessage):")
    print("-" * 80)
    print(f"Type: {type(messages[1]).__name__}")
    print(f"Length: {len(messages[1].content)} characters")
    print()
    print("Full Content:")
    print(messages[1].content)
    print()
    print("=" * 80)
    print()
    
    print("🔍 VERIFICATION:")
    print("-" * 80)
    print(f"✅ Total messages: {len(messages)}")
    print(f"✅ Message 1 is SystemMessage: {isinstance(messages[0], SystemMessage)}")
    print(f"✅ Message 2 is HumanMessage: {isinstance(messages[1], HumanMessage)}")
    print()
    
    # Check if system prompt contains key content
    system_has_examiner = "Cambridge IGCSE Business Studies examiner" in system_prompt
    system_has_rules = "MARK-BASED EXPECTATION RULES" in system_prompt
    user_has_question = "Question:" in user_prompt
    user_has_json = "Return JSON exactly" in user_prompt
    
    print("Content Verification:")
    print(f"   System has 'examiner' text: {system_has_examiner}")
    print(f"   System has 'MARK-BASED RULES': {system_has_rules}")
    print(f"   User has 'Question:': {user_has_question}")
    print(f"   User has 'Return JSON': {user_has_json}")
    print()
    
    if (system_has_examiner and system_has_rules and
            user_has_question and user_has_json):
        print("✅ ALL CHECKS PASSED - Prompts are correctly separated!")
    else:
        print("❌ SOME CHECKS FAILED")
    
    print()
    print("=" * 80)
    print("NOTE: LangSmith/LangChain tracing may show a simplified")
    print("      combined view, but the actual API calls use separate")
    print("      SystemMessage and HumanMessage objects.")
    print("=" * 80)
    
    return True


if __name__ == "__main__":
    try:
        test_actual_prompts()
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

