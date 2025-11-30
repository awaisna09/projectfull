#!/usr/bin/env python3
"""
Comprehensive AI Tutor Agent Test
Tests all features with topic ID 11
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:8000"
TOPIC_ID = 11
USER_ID = "test_user_123"
CONVERSATION_ID = f"test_conv_{int(time.time())}"

def print_section(title):
    """Print a formatted section header"""
    print("\n" + "="*70)
    print(f"  {title}")
    print("="*70)

def print_test(test_name):
    """Print a test name"""
    print(f"\nTest: {test_name}")
    print("-" * 70)

def test_health():
    """Test backend health endpoint"""
    print_section("TEST 1: Backend Health Check")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=10)
        response.raise_for_status()
        data = response.json()
        print(f"[OK] Backend Status: {data['status']}")
        print(f"[OK] AI Tutor: {data['services']['ai_tutor']['status']}")
        print(f"[OK] Grading: {data['services']['grading']['status']}")
        return True
    except Exception as e:
        print(f"[ERROR] Health check failed: {e}")
        return False

def test_tutor_chat(message, test_name):
    """Test AI Tutor chat endpoint"""
    print_test(test_name)
    print(f"Sending message: '{message}'")
    print(f"Topic ID: {TOPIC_ID}")
    print(f"User ID: {USER_ID}")
    
    start_time = time.time()
    
    try:
        payload = {
            "message": message,
            "topic": TOPIC_ID,
            "user_id": USER_ID,
            "conversation_id": CONVERSATION_ID,
            "explanation_style": "default"
        }
        
        print(f"\nSending request...")
        response = requests.post(
            f"{BASE_URL}/tutor/chat",
            json=payload,
            timeout=130  # 130 seconds timeout
        )
        
        elapsed = time.time() - start_time
        print(f"Response time: {elapsed:.2f} seconds")
        
        if response.status_code == 200:
            data = response.json()
            
            # Check response structure
            print(f"\n[OK] Response received successfully!")
            print(f"Response length: {len(data.get('response', ''))} characters")
            print(f"Response preview: {data.get('response', '')[:200]}...")
            
            # Check all fields
            print(f"\nResponse Fields:")
            print(f"   - response: {'[OK]' if data.get('response') else '[MISSING]'}")
            print(f"   - suggestions: {len(data.get('suggestions', []))} items")
            print(f"   - related_concepts: {len(data.get('related_concepts', []))} items")
            print(f"   - related_concept_ids: {len(data.get('related_concept_ids', []))} items")
            print(f"   - confidence_score: {data.get('confidence_score', 'N/A')}")
            print(f"   - reasoning_label: {data.get('reasoning_label', 'N/A')}")
            print(f"   - mastery_updates: {len(data.get('mastery_updates', []))} items")
            print(f"   - readiness: {'[OK]' if data.get('readiness') else '[MISSING]'}")
            print(f"   - learning_path: {'[OK]' if data.get('learning_path') else '[MISSING]'}")
            print(f"   - token_usage: {'[OK]' if data.get('token_usage') else '[MISSING]'}")
            
            # Detailed checks
            if data.get('readiness'):
                readiness = data['readiness']
                print(f"\nReadiness Details:")
                print(f"   - overall_readiness: {readiness.get('overall_readiness', 'N/A')}")
                print(f"   - average_mastery: {readiness.get('average_mastery', 'N/A')}")
                print(f"   - min_mastery: {readiness.get('min_mastery', 'N/A')}")
            
            if data.get('learning_path'):
                learning_path = data['learning_path']
                print(f"\nLearning Path Details:")
                print(f"   - decision: {learning_path.get('decision', 'N/A')}")
                print(f"   - recommended_concept: {learning_path.get('recommended_concept', 'N/A')}")
                print(f"   - recommended_concept_name: {learning_path.get('recommended_concept_name', 'N/A')}")
            
            if data.get('token_usage'):
                tokens = data['token_usage']
                print(f"\nToken Usage:")
                print(f"   - prompt_tokens: {tokens.get('prompt_tokens', 0)}")
                print(f"   - completion_tokens: {tokens.get('completion_tokens', 0)}")
                print(f"   - total_tokens: {tokens.get('total_tokens', 0)}")
            
            return True, data
        else:
            print(f"[ERROR] Request failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False, None
            
    except requests.exceptions.Timeout:
        print(f"[ERROR] Request timed out after {elapsed:.2f} seconds")
        return False, None
    except Exception as e:
        print(f"[ERROR] Error: {e}")
        import traceback
        print(traceback.format_exc())
        return False, None

def test_lesson_generation():
    """Test lesson generation endpoint"""
    print_section("TEST 2: Lesson Generation")
    try:
        payload = {
            "topic": "Business Strategy",
            "learning_objectives": [
                "Understand strategic planning",
                "Learn about competitive advantage",
                "Analyze business models"
            ],
            "difficulty_level": "intermediate"
        }
        
        print(f"Generating lesson for topic: {payload['topic']}")
        response = requests.post(
            f"{BASE_URL}/tutor/lesson",
            json=payload,
            timeout=60
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"[OK] Lesson generated successfully!")
            print(f"Content length: {len(data.get('lesson_content', ''))} characters")
            print(f"Key points: {len(data.get('key_points', []))} items")
            print(f"Practice questions: {len(data.get('practice_questions', []))} items")
            print(f"Estimated duration: {data.get('estimated_duration', 'N/A')} minutes")
            return True
        else:
            print(f"[ERROR] Failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"[ERROR] Error: {e}")
        return False

def main():
    """Run all tests"""
    print("\n" + "="*70)
    print("  AI TUTOR AGENT COMPREHENSIVE TEST SUITE")
    print(f"  Topic ID: {TOPIC_ID}")
    print(f"  Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*70)
    
    # Test 1: Health check
    if not test_health():
        print("\n❌ Backend is not healthy. Stopping tests.")
        return
    
    # Test 2: Basic chat
    success1, response1 = test_tutor_chat(
        "What is Business Strategy?",
        "Basic Question - Business Strategy"
    )
    
    if not success1:
        print("\n[ERROR] Basic chat test failed. Stopping tests.")
        return
    
    # Test 3: Follow-up question
    time.sleep(2)  # Small delay between requests
    success2, response2 = test_tutor_chat(
        "Can you explain competitive advantage?",
        "Follow-up Question - Competitive Advantage"
    )
    
    # Test 4: Complex question
    time.sleep(2)
    success3, response3 = test_tutor_chat(
        "How do I analyze a company's business model?",
        "Complex Question - Business Model Analysis"
    )
    
    # Test 5: Lesson generation
    test_lesson_generation()
    
    # Summary
    print_section("TEST SUMMARY")
    print(f"[OK] Health Check: PASSED")
    print(f"{'[OK]' if success1 else '[FAIL]'} Basic Chat: {'PASSED' if success1 else 'FAILED'}")
    print(f"{'[OK]' if success2 else '[FAIL]'} Follow-up Chat: {'PASSED' if success2 else 'FAILED'}")
    print(f"{'[OK]' if success3 else '[FAIL]'} Complex Chat: {'PASSED' if success3 else 'FAILED'}")
    
    # Check response quality
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

