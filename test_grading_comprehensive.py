#!/usr/bin/env python3
"""
Comprehensive Test Script for Answer Grading Agent
Tests all new features: RAG, reasoning classification, misconception detection,
concept detection, mastery tracking, and analytics
"""

import requests
import json
import time
from datetime import datetime

# Test configuration
API_BASE_URL = "http://localhost:8000"  # Unified backend
TEST_USER_ID = "test_user_123"
TEST_QUESTION_ID = "Q001"
TEST_TOPIC_ID = "13"

def print_section(title):
    """Print a formatted section header"""
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)

def test_health_check():
    """Test the health check endpoint"""
    print_section("Health Check")
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            result = response.json()
            print("✅ Health Check Passed")
            print(f"   Status: {result.get('status', 'unknown')}")
            if 'services' in result:
                grading = result['services'].get('grading', {})
                print(f"   Grading Service: {grading.get('status', 'unknown')}")
                print(f"   Agent Ready: {grading.get('agent_ready', False)}")
            return True
        else:
            print(f"❌ Health Check Failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health Check Error: {e}")
        return False

def test_basic_grading():
    """Test basic grading functionality"""
    print_section("Test 1: Basic Grading")
    
    test_data = {
        "question": "Explain the concept of market segmentation.",
        "model_answer": "Market segmentation is the process of dividing a market into distinct groups of consumers with similar needs or characteristics. It helps businesses target specific customer groups more effectively.",
        "student_answer": "Market segmentation means dividing customers into groups based on what they need. This helps companies sell better.",
        "subject": "Business Studies",
        "topic": "Marketing"
    }
    
    start_time = time.time()
    try:
        response = requests.post(
            f"{API_BASE_URL}/grade-answer",
            json=test_data,
            timeout=60
        )
        elapsed = time.time() - start_time
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Basic Grading: PASSED ({elapsed:.2f}s)")
            print(f"   Score: {result['result']['overall_score']}/50")
            print(f"   Percentage: {result['result']['percentage']}%")
            print(f"   Grade: {result['result']['grade']}")
            return True, elapsed
        else:
            print(f"❌ Basic Grading: FAILED ({response.status_code})")
            print(f"   Response: {response.text[:200]}")
            return False, elapsed
    except Exception as e:
        elapsed = time.time() - start_time
        print(f"❌ Basic Grading Error: {e} ({elapsed:.2f}s)")
        return False, elapsed

def test_full_features():
    """Test all new features with complete data"""
    print_section("Test 2: Full Features (RAG, Analytics, Mastery)")
    
    test_data = {
        "question": "What is SWOT analysis and how is it used in strategic planning?",
        "model_answer": """SWOT analysis is a strategic planning tool that identifies Strengths, Weaknesses, Opportunities, and Threats. 
        Strengths are internal advantages. Weaknesses are internal disadvantages. 
        Opportunities are external favorable conditions. Threats are external risks.
        It's used to develop strategies that leverage strengths and opportunities while addressing weaknesses and threats.""",
        "student_answer": """SWOT analysis helps businesses plan. It looks at strengths like good products, weaknesses like limited money, 
        opportunities like new markets, and threats like competitors. Companies use it to make better decisions.""",
        "subject": "Business Studies",
        "topic": "Strategic Management",
        "user_id": TEST_USER_ID,
        "question_id": TEST_QUESTION_ID,
        "topic_id": TEST_TOPIC_ID,
        "max_marks": 4,
        "difficulty_level": 2  # Medium (4 marks)
    }
    
    start_time = time.time()
    try:
        response = requests.post(
            f"{API_BASE_URL}/grade-answer",
            json=test_data,
            timeout=90
        )
        elapsed = time.time() - start_time
        
        if response.status_code == 200:
            result = response.json()
            grading_result = result['result']
            
            print(f"✅ Full Features Test: PASSED ({elapsed:.2f}s)")
            print(f"\n📊 Grading Results:")
            print(f"   Score: {grading_result['overall_score']}/50")
            print(f"   Percentage: {grading_result['percentage']}%")
            print(f"   Grade: {grading_result['grade']}")
            
            # Check new fields
            print(f"\n🔍 New Features:")
            print(f"   Reasoning Category: {grading_result.get('reasoning_category', 'N/A')}")
            print(f"   Has Misconception: {grading_result.get('has_misconception', False)}")
            print(f"   Primary Concepts: {grading_result.get('primary_concept_ids', [])}")
            print(f"   Secondary Concepts: {grading_result.get('secondary_concept_ids', [])}")
            print(f"   Mastery Deltas: {grading_result.get('mastery_deltas', {})}")
            
            # Validate new fields exist
            checks = {
                "reasoning_category": "reasoning_category" in grading_result,
                "has_misconception": "has_misconception" in grading_result,
                "primary_concept_ids": "primary_concept_ids" in grading_result,
                "secondary_concept_ids": "secondary_concept_ids" in grading_result,
                "mastery_deltas": "mastery_deltas" in grading_result
            }
            
            print(f"\n✅ Feature Validation:")
            for feature, exists in checks.items():
                status = "✅" if exists else "❌"
                print(f"   {status} {feature}")
            
            all_passed = all(checks.values())
            return all_passed, elapsed
        else:
            print(f"❌ Full Features Test: FAILED ({response.status_code})")
            print(f"   Response: {response.text[:300]}")
            return False, elapsed
    except Exception as e:
        elapsed = time.time() - start_time
        print(f"❌ Full Features Error: {e} ({elapsed:.2f}s)")
        return False, elapsed

def test_difficulty_levels():
    """Test different difficulty levels based on marks"""
    print_section("Test 3: Difficulty Level Mapping")
    
    test_cases = [
        {"marks": 2, "expected_difficulty": 1, "name": "2 Marks (Low)"},
        {"marks": 4, "expected_difficulty": 2, "name": "4 Marks (Medium)"},
        {"marks": 6, "expected_difficulty": 3, "name": "6 Marks (High)"}
    ]
    
    results = []
    for test_case in test_cases:
        test_data = {
            "question": "Explain a business concept.",
            "model_answer": "A detailed explanation of the concept.",
            "student_answer": "A brief explanation.",
            "subject": "Business Studies",
            "topic": "General",
            "user_id": TEST_USER_ID,
            "question_id": f"Q{test_case['marks']}",
            "topic_id": TEST_TOPIC_ID,
            "max_marks": test_case["marks"],
            "difficulty_level": test_case["expected_difficulty"]
        }
        
        start_time = time.time()
        try:
            response = requests.post(
                f"{API_BASE_URL}/grade-answer",
                json=test_data,
                timeout=60
            )
            elapsed = time.time() - start_time
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ {test_case['name']}: PASSED ({elapsed:.2f}s)")
                print(f"   Marks: {test_case['marks']}, Difficulty: {test_case['expected_difficulty']}")
                results.append(True)
            else:
                print(f"❌ {test_case['name']}: FAILED ({response.status_code})")
                results.append(False)
        except Exception as e:
            elapsed = time.time() - start_time
            print(f"❌ {test_case['name']}: ERROR - {e} ({elapsed:.2f}s)")
            results.append(False)
        
        time.sleep(1)  # Rate limiting
    
    return all(results)

def test_performance():
    """Test performance with multiple requests"""
    print_section("Test 4: Performance Test")
    
    test_data = {
        "question": "What is a business plan?",
        "model_answer": "A business plan is a written document that describes a business, its objectives, strategies, and financial forecasts.",
        "student_answer": "A business plan is a document that explains what a business does and how it will make money.",
        "subject": "Business Studies",
        "topic": "Business Planning"
    }
    
    num_requests = 3
    times = []
    
    print(f"Running {num_requests} requests to measure performance...")
    
    for i in range(num_requests):
        start_time = time.time()
        try:
            response = requests.post(
                f"{API_BASE_URL}/grade-answer",
                json=test_data,
                timeout=60
            )
            elapsed = time.time() - start_time
            times.append(elapsed)
            
            if response.status_code == 200:
                print(f"   Request {i+1}: {elapsed:.2f}s ✅")
            else:
                print(f"   Request {i+1}: {elapsed:.2f}s ❌ ({response.status_code})")
        except Exception as e:
            elapsed = time.time() - start_time
            times.append(elapsed)
            print(f"   Request {i+1}: {elapsed:.2f}s ❌ ({e})")
        
        if i < num_requests - 1:
            time.sleep(1)
    
    if times:
        avg_time = sum(times) / len(times)
        min_time = min(times)
        max_time = max(times)
        
        print(f"\n📊 Performance Metrics:")
        print(f"   Average: {avg_time:.2f}s")
        print(f"   Min: {min_time:.2f}s")
        print(f"   Max: {max_time:.2f}s")
        
        if avg_time > 30:
            print(f"   ⚠️  WARNING: Average response time is high (>30s)")
        elif avg_time > 15:
            print(f"   ⚠️  CAUTION: Average response time is moderate (>15s)")
        else:
            print(f"   ✅ Performance is acceptable (<15s)")
        
        return True
    return False

def test_error_handling():
    """Test error handling"""
    print_section("Test 5: Error Handling")
    
    # Test with missing required fields
    test_cases = [
        {
            "name": "Missing student_answer",
            "data": {
                "question": "Test question",
                "model_answer": "Test answer"
            },
            "should_fail": True
        },
        {
            "name": "Empty student_answer",
            "data": {
                "question": "Test question",
                "model_answer": "Test answer",
                "student_answer": ""
            },
            "should_fail": True
        }
    ]
    
    results = []
    for test_case in test_cases:
        try:
            response = requests.post(
                f"{API_BASE_URL}/grade-answer",
                json=test_case["data"],
                timeout=10
            )
            
            if test_case["should_fail"]:
                if response.status_code != 200:
                    print(f"✅ {test_case['name']}: Correctly rejected")
                    results.append(True)
                else:
                    print(f"❌ {test_case['name']}: Should have failed but didn't")
                    results.append(False)
            else:
                if response.status_code == 200:
                    print(f"✅ {test_case['name']}: Passed")
                    results.append(True)
                else:
                    print(f"❌ {test_case['name']}: Failed unexpectedly")
                    results.append(False)
        except Exception as e:
            print(f"❌ {test_case['name']}: Error - {e}")
            results.append(False)
    
    return all(results) if results else False

def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("  COMPREHENSIVE ANSWER GRADING AGENT TEST SUITE")
    print("=" * 60)
    print(f"API Base URL: {API_BASE_URL}")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    results = {}
    
    # Test 1: Health Check
    results['health'] = test_health_check()
    if not results['health']:
        print("\n❌ Health check failed. Please ensure the backend is running.")
        print("   Run: python unified_backend.py")
        return
    
    time.sleep(1)
    
    # Test 2: Basic Grading
    results['basic'], basic_time = test_basic_grading()
    time.sleep(2)
    
    # Test 3: Full Features
    results['full_features'], full_time = test_full_features()
    time.sleep(2)
    
    # Test 4: Difficulty Levels
    results['difficulty'] = test_difficulty_levels()
    time.sleep(2)
    
    # Test 5: Performance
    results['performance'] = test_performance()
    time.sleep(1)
    
    # Test 6: Error Handling
    results['error_handling'] = test_error_handling()
    
    # Summary
    print_section("Test Summary")
    
    total_tests = len(results)
    passed_tests = sum(1 for v in results.values() if v)
    
    for test_name, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"   {test_name.upper()}: {status}")
    
    print(f"\n📊 Results: {passed_tests}/{total_tests} tests passed")
    
    if passed_tests == total_tests:
        print("\n🎉 All tests passed!")
    else:
        print(f"\n⚠️  {total_tests - passed_tests} test(s) failed")
    
    if 'basic' in results and 'full_features' in results:
        print(f"\n⏱️  Performance:")
        print(f"   Basic Grading: {basic_time:.2f}s")
        print(f"   Full Features: {full_time:.2f}s")
        if full_time > basic_time * 1.5:
            print(f"   ⚠️  Full features test is significantly slower")
            print(f"      Consider optimizing reasoning/misconception/concept detection")

if __name__ == "__main__":
    main()

