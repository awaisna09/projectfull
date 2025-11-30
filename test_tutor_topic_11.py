#!/usr/bin/env python3
"""
Direct AI Tutor Agent Test with Topic ID 11
Tests the LangGraph tutor pipeline directly without HTTP server
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv('config.env')

# Import the tutor graph function
from langgraph_tutor import run_tutor_graph

def print_section(title):
    """Print a formatted section header"""
    print("\n" + "="*70)
    print(f"  {title}")
    print("="*70)

def print_test(test_name):
    """Print a test name"""
    print(f"\nTest: {test_name}")
    print("-" * 70)

def test_tutor_direct(message, test_name, topic_id=11):
    """Test AI Tutor directly using run_tutor_graph"""
    print_test(test_name)
    print(f"Message: '{message}'")
    print(f"Topic ID: {topic_id}")
    print(f"User ID: test_user_123")
    
    import time
    start_time = time.time()
    
    try:
        # Call the tutor graph directly
        result = run_tutor_graph(
            user_id="test_user_123",
            topic=str(topic_id),
            message=message,
            conversation_id=f"test_conv_{topic_id}",
            explanation_style="default",
            subject_id=101
        )
        
        elapsed = time.time() - start_time
        print(f"\n[OK] Response received in {elapsed:.2f} seconds")
        print(f"Response length: {len(result.get('response', ''))} characters")
        print(f"Response preview: {result.get('response', '')[:200]}...")
        
        # Check all fields
        print(f"\nResponse Fields:")
        print(f"   - response: {'[OK]' if result.get('response') else '[MISSING]'}")
        print(f"   - suggestions: {len(result.get('suggestions', []))} items")
        print(f"   - related_concepts: {len(result.get('related_concepts', []))} items")
        print(f"   - concept_ids: {len(result.get('concept_ids', []))} items")
        print(f"   - reasoning_label: {result.get('reasoning_label', 'N/A')}")
        print(f"   - mastery_updates: {len(result.get('mastery_updates', []))} items")
        print(f"   - readiness: {'[OK]' if result.get('readiness') else '[MISSING]'}")
        print(f"   - learning_path: {'[OK]' if result.get('learning_path') else '[MISSING]'}")
        print(f"   - token_usage: {'[OK]' if result.get('token_usage') else '[MISSING]'}")
        
        # Detailed checks
        if result.get('readiness'):
            readiness = result['readiness']
            print(f"\nReadiness Details:")
            print(f"   - overall_readiness: {readiness.get('overall_readiness', 'N/A')}")
            print(f"   - average_mastery: {readiness.get('average_mastery', 'N/A')}")
            print(f"   - min_mastery: {readiness.get('min_mastery', 'N/A')}")
        
        if result.get('learning_path'):
            learning_path = result['learning_path']
            print(f"\nLearning Path Details:")
            print(f"   - decision: {learning_path.get('decision', 'N/A')}")
            print(f"   - recommended_concept: {learning_path.get('recommended_concept', 'N/A')}")
            print(f"   - recommended_concept_name: {learning_path.get('recommended_concept_name', 'N/A')}")
        
        if result.get('token_usage'):
            tokens = result['token_usage']
            print(f"\nToken Usage:")
            print(f"   - prompt_tokens: {tokens.get('prompt_tokens', 0)}")
            print(f"   - completion_tokens: {tokens.get('completion_tokens', 0)}")
            print(f"   - total_tokens: {tokens.get('total_tokens', 0)}")
        
        if result.get('related_concepts'):
            print(f"\nRelated Concepts:")
            for i, concept in enumerate(result['related_concepts'][:5], 1):
                print(f"   {i}. {concept}")
        
        if result.get('concept_ids'):
            print(f"\nConcept IDs:")
            for i, cid in enumerate(result['concept_ids'][:5], 1):
                print(f"   {i}. {cid}")
        
        return True, result
    except Exception as e:
        elapsed = time.time() - start_time
        print(f"\n[ERROR] Test failed after {elapsed:.2f} seconds")
        print(f"Error: {e}")
        import traceback
        print(traceback.format_exc())
        return False, None

def main():
    """Run all tests"""
    from datetime import datetime
    
    print("\n" + "="*70)
    print("  AI TUTOR AGENT DIRECT TEST - TOPIC ID 11")
    print(f"  Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*70)
    
    # Verify OpenAI API key
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("\n[ERROR] OPENAI_API_KEY not found in config.env")
        print("Please check your config.env file")
        return
    else:
        print(f"\n[OK] OpenAI API Key: {api_key[:20]}...")
    
    # Test 1: Basic question
    print_section("TEST 1: Basic Question")
    success1, response1 = test_tutor_direct(
        "What is scarcity?",
        "Basic Question - Scarcity",
        topic_id=11
    )
    
    if not success1:
        print("\n[ERROR] Basic test failed. Stopping tests.")
        return
    
    # Test 2: Follow-up question
    import time
    time.sleep(2)
    print_section("TEST 2: Follow-up Question")
    success2, response2 = test_tutor_direct(
        "Can you explain how scarcity affects business decisions?",
        "Follow-up Question - Scarcity in Business",
        topic_id=11
    )
    
    # Test 3: Complex question
    time.sleep(2)
    print_section("TEST 3: Complex Question")
    success3, response3 = test_tutor_direct(
        "How does scarcity relate to opportunity cost and economic choice?",
        "Complex Question - Scarcity and Opportunity Cost",
        topic_id=11
    )
    
    # Summary
    print_section("TEST SUMMARY")
    print(f"{'[OK]' if success1 else '[FAIL]'} Test 1: Basic Question - {'PASSED' if success1 else 'FAILED'}")
    print(f"{'[OK]' if success2 else '[FAIL]'} Test 2: Follow-up Question - {'PASSED' if success2 else 'FAILED'}")
    print(f"{'[OK]' if success3 else '[FAIL]'} Test 3: Complex Question - {'PASSED' if success3 else 'FAILED'}")
    
    # Response quality metrics
    if success1 and response1:
        print(f"\nResponse Quality Metrics:")
        response_text = response1.get('response', '')
        if len(response_text) > 100:
            print(f"[OK] Response length: Good ({len(response_text)} chars)")
        else:
            print(f"[WARN] Response length: Short ({len(response_text)} chars)")
        
        if response1.get('related_concepts'):
            print(f"[OK] Related concepts: Found ({len(response1['related_concepts'])} items)")
        else:
            print(f"[WARN] Related concepts: None found")
        
        if response1.get('concept_ids'):
            print(f"[OK] Concept IDs: Found ({len(response1['concept_ids'])} items)")
        else:
            print(f"[WARN] Concept IDs: None found")
        
        if response1.get('readiness'):
            print(f"[OK] Readiness: Available")
        else:
            print(f"[WARN] Readiness: Not available")
        
        if response1.get('learning_path'):
            print(f"[OK] Learning path: Available")
        else:
            print(f"[WARN] Learning path: Not available")
    
    print("\n" + "="*70)
    print("  TESTING COMPLETE")
    print("="*70 + "\n")

if __name__ == "__main__":
    main()

