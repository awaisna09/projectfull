#!/usr/bin/env python3
"""
CRITICAL TEST: Verify that BOTH system and user prompts are sent to the LLM
This test intercepts the actual LLM call to verify both messages are received.
"""

import os
import sys
from unittest.mock import patch
from dotenv import load_dotenv

# Load environment
load_dotenv('config.env')

# Add agents to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'agents'))

from answer_grading_agent import AnswerGradingAgent
from langchain_core.messages import SystemMessage, HumanMessage


def test_both_prompts_sent():
    """Verify BOTH system and user prompts are sent to LLM"""
    
    print("=" * 80)
    print("CRITICAL TEST: Verifying BOTH Prompts Are Sent to LLM")
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
    question = "Define the term 'business activity'."
    model_answer = (
        "Business activity is the process of producing goods and "
        "services to satisfy people's needs and wants."
    )
    student_answer = "activities invloved in the business"
    
    # Track what messages are actually sent to the LLM
    captured_messages = []
    call_count = 0
    
    # Create a mock invoke that captures messages
    original_invoke = None
    from langchain_openai import ChatOpenAI
    
    def mock_invoke(self, messages, **kwargs):
        """Capture messages sent to LLM"""
        nonlocal captured_messages, call_count
        call_count += 1
        captured_messages = list(messages)  # Make a copy
        
        # Return a mock response
        from unittest.mock import MagicMock
        mock_response = MagicMock()
        mock_response.content = '''{
            "overall_score": 25,
            "percentage": 50,
            "grade": "D",
            "strengths": ["Attempted the question"],
            "areas_for_improvement": ["Needs more detail"],
            "specific_feedback": "Basic answer provided",
            "suggestions": ["Add more examples"],
            "reasoning_category": "partial",
            "has_misconception": false,
            "primary_concepts": ["concept_1"],
            "secondary_concepts": []
        }'''
        return mock_response
    
    # Replace the invoke method
    original_invoke = ChatOpenAI.invoke
    ChatOpenAI.invoke = mock_invoke
    
    try:
        print("🧪 Running grade_answer() with message interception...")
        print()
        
        # Enable debug mode
        os.environ['GRADING_DEBUG'] = 'true'
        
        result = agent.grade_answer(
            question=question,
            model_answer=model_answer,
            student_answer=student_answer,
            user_id="test_user",
            max_marks=2,
            question_id="test_q1",
            topic_id="test_topic"
        )
        
        print()
        print("✅ grade_answer() completed")
        print()
        
    finally:
        # Restore original
        ChatOpenAI.invoke = original_invoke
    
    # Verify the messages
    print("=" * 80)
    print("CRITICAL VERIFICATION RESULTS")
    print("=" * 80)
    print()
    
    if call_count == 0:
        print("❌ CRITICAL FAILURE: LLM was never called!")
        return False
    
    if call_count > 1:
        print(f"⚠️  WARNING: LLM was called {call_count} times (expected 1)")
    
    print(f"📊 LLM invoke() was called: {call_count} time(s)")
    print()
    
    if not captured_messages:
        print("❌ CRITICAL FAILURE: No messages were captured!")
        print("   This means the LLM invoke() did not receive any messages")
        return False
    
    print(f"📊 Total messages captured: {len(captured_messages)}")
    print()
    
    # CRITICAL CHECKS
    print("=" * 80)
    print("CRITICAL CHECKS:")
    print("=" * 80)
    print()
    
    # Check 1: Must have exactly 2 messages
    if len(captured_messages) != 2:
        print(f"❌ CRITICAL FAILURE: Expected 2 messages, got {len(captured_messages)}")
        return False
    else:
        print("✅ PASS: Exactly 2 messages were sent")
    
    # Check 2: First message must be SystemMessage
    if not isinstance(captured_messages[0], SystemMessage):
        print(f"❌ CRITICAL FAILURE: First message is not SystemMessage")
        print(f"   Got: {type(captured_messages[0]).__name__}")
        return False
    else:
        print("✅ PASS: First message is SystemMessage")
        system_content = captured_messages[0].content
        print(f"   Length: {len(system_content)} characters")
    
    # Check 3: Second message must be HumanMessage
    if not isinstance(captured_messages[1], HumanMessage):
        print(f"❌ CRITICAL FAILURE: Second message is not HumanMessage")
        print(f"   Got: {type(captured_messages[1]).__name__}")
        return False
    else:
        print("✅ PASS: Second message is HumanMessage")
        user_content = captured_messages[1].content
        print(f"   Length: {len(user_content)} characters")
    
    # Check 4: System message must contain key content
    print()
    print("=" * 80)
    print("SYSTEM MESSAGE CONTENT VERIFICATION:")
    print("=" * 80)
    
    required_system_keywords = [
        "Cambridge IGCSE Business Studies examiner",
        "MARK-BASED EXPECTATION RULES",
        "FEEDBACK REQUIREMENTS"
    ]
    
    all_system_keywords_found = True
    for keyword in required_system_keywords:
        if keyword in system_content:
            print(f"   ✅ Found: '{keyword}'")
        else:
            print(f"   ❌ MISSING: '{keyword}'")
            all_system_keywords_found = False
    
    # Check 5: User message must contain key content
    print()
    print("=" * 80)
    print("USER MESSAGE CONTENT VERIFICATION:")
    print("=" * 80)
    
    required_user_keywords = [
        "Question:",
        "Model Answer:",
        "Student Answer:",
        "Return JSON exactly"
    ]
    
    all_user_keywords_found = True
    for keyword in required_user_keywords:
        if keyword in user_content:
            print(f"   ✅ Found: '{keyword}'")
        else:
            print(f"   ❌ MISSING: '{keyword}'")
            all_user_keywords_found = False
    
    # Final verdict
    print()
    print("=" * 80)
    if (len(captured_messages) == 2 and
            isinstance(captured_messages[0], SystemMessage) and
            isinstance(captured_messages[1], HumanMessage) and
            all_system_keywords_found and
            all_user_keywords_found):
        print("✅✅✅ ALL CRITICAL TESTS PASSED! ✅✅✅")
        print()
        print("VERIFIED:")
        print("   ✓ System prompt (SystemMessage) is being sent")
        print("   ✓ User prompt (HumanMessage) is being sent")
        print("   ✓ Both messages contain expected content")
        print("   ✓ LLM receives BOTH messages in the correct format")
        print("=" * 80)
        return True
    else:
        print("❌❌❌ CRITICAL TESTS FAILED ❌❌❌")
        print("=" * 80)
        return False


if __name__ == "__main__":
    try:
        success = test_both_prompts_sent()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

