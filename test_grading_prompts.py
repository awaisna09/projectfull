#!/usr/bin/env python3
"""
Test script to verify that both system and user prompts are sent correctly
to the LLM in the AnswerGradingAgent.
"""

import os
import sys
from unittest.mock import patch, MagicMock
from dotenv import load_dotenv

# Load environment
load_dotenv('config.env')

# Add agents to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'agents'))

from answer_grading_agent import AnswerGradingAgent
from langchain_core.messages import SystemMessage, HumanMessage


def test_prompts_are_separated():
    """Test that system and user prompts are sent as separate messages"""
    
    print("=" * 80)
    print("TEST: Verifying System and User Prompts are Separated")
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
    
    # Test data
    question = (
        "Explain the concept of market segmentation and its "
        "importance in business strategy."
    )
    model_answer = (
        "Market segmentation is the process of dividing a broad "
        "consumer market into sub-groups based on shared "
        "characteristics. It's important for targeted marketing, "
        "product development, and competitive advantage."
    )
    student_answer = (
        "Market segmentation is when you divide customers into groups. "
        "It's important because it helps businesses sell products better."
    )
    
    # Track what messages are sent to the LLM
    captured_messages = []
    original_invoke = None
    
    def capture_invoke(self, messages, **kwargs):
        """Capture the messages sent to the LLM"""
        captured_messages.extend(messages)
        # Return a mock response
        mock_response = MagicMock()
        mock_response.content = '''{
            "overall_score": 30,
            "percentage": 60,
            "grade": "C",
            "strengths": ["Good understanding of basic concept"],
            "areas_for_improvement": ["Needs more detail"],
            "specific_feedback": "Basic answer provided",
            "suggestions": ["Add more examples"],
            "reasoning_category": "partial",
            "has_misconception": false,
            "primary_concepts": ["concept_1"],
            "secondary_concepts": []
        }'''
        return mock_response
    
    # Store original invoke and replace it
    from langchain_openai import ChatOpenAI
    original_invoke = ChatOpenAI.invoke
    
    # Patch at the class level
    ChatOpenAI.invoke = capture_invoke
    try:
        print("🧪 Running grade_answer()...")
        result = agent.grade_answer(
            question=question,
            model_answer=model_answer,
            student_answer=student_answer,
            user_id="test_user",
            max_marks=6,
            question_id="test_q1",
            topic_id="test_topic"
        )
        print("✅ grade_answer() completed")
        print()
    finally:
        # Restore original
        ChatOpenAI.invoke = original_invoke
    
    # Verify the messages
    print("=" * 80)
    print("VERIFICATION RESULTS")
    print("=" * 80)
    print()
    
    if not captured_messages:
        print("❌ FAILED: No messages were captured")
        return False
    
    print(f"📊 Total messages captured: {len(captured_messages)}")
    print()
    
    # Check for SystemMessage
    system_messages = [
        msg for msg in captured_messages
        if isinstance(msg, SystemMessage)
    ]
    
    # Check for HumanMessage
    human_messages = [
        msg for msg in captured_messages
        if isinstance(msg, HumanMessage)
    ]
    
    print("🔍 Message Analysis:")
    print(f"   SystemMessage(s): {len(system_messages)}")
    print(f"   HumanMessage(s): {len(human_messages)}")
    print()
    
    # Verify we have both
    if len(system_messages) == 0:
        print("❌ FAILED: No SystemMessage found!")
        print("   The system prompt is not being sent as a SystemMessage")
        return False
    
    if len(human_messages) == 0:
        print("❌ FAILED: No HumanMessage found!")
        print("   The user prompt is not being sent as a HumanMessage")
        return False
    
    print("✅ PASSED: Both SystemMessage and HumanMessage are present")
    print()
    
    # Display message contents
    print("=" * 80)
    print("SYSTEM MESSAGE CONTENT (first 500 chars):")
    print("=" * 80)
    system_content = system_messages[0].content
    print(system_content[:500])
    if len(system_content) > 500:
        print("...")
    print()
    
    print("=" * 80)
    print("USER MESSAGE CONTENT (first 500 chars):")
    print("=" * 80)
    user_content = human_messages[0].content
    print(user_content[:500])
    if len(user_content) > 500:
        print("...")
    print()
    
    # Verify system prompt contains expected content
    expected_system_keywords = [
        "Cambridge IGCSE Business Studies examiner",
        "MARK-BASED EXPECTATION RULES",
        "FEEDBACK REQUIREMENTS"
    ]
    
    print("=" * 80)
    print("SYSTEM PROMPT VERIFICATION:")
    print("=" * 80)
    all_keywords_found = True
    for keyword in expected_system_keywords:
        if keyword in system_content:
            print(f"   ✅ Found: '{keyword}'")
        else:
            print(f"   ❌ Missing: '{keyword}'")
            all_keywords_found = False
    print()
    
    # Verify user prompt contains expected content
    expected_user_keywords = [
        "Question:",
        "Model Answer:",
        "Student Answer:",
        "Return JSON exactly"
    ]
    
    print("=" * 80)
    print("USER PROMPT VERIFICATION:")
    print("=" * 80)
    for keyword in expected_user_keywords:
        if keyword in user_content:
            print(f"   ✅ Found: '{keyword}'")
        else:
            print(f"   ❌ Missing: '{keyword}'")
            all_keywords_found = False
    print()
    
    # Final result
    print("=" * 80)
    if all_keywords_found and len(system_messages) > 0 and len(human_messages) > 0:
        print("✅ ALL TESTS PASSED!")
        print("   ✓ System prompt is sent as SystemMessage")
        print("   ✓ User prompt is sent as HumanMessage")
        print("   ✓ Both prompts contain expected content")
        print("=" * 80)
        return True
    else:
        print("❌ SOME TESTS FAILED")
        print("=" * 80)
        return False


if __name__ == "__main__":
    try:
        success = test_prompts_are_separated()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

