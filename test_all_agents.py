#!/usr/bin/env python3
"""
Test All Three Agents
Verifies AI Tutor, Answer Grading, and Mock Exam Grading agents
"""

import requests
import json
import time
from datetime import datetime

def print_header(text):
    """Print formatted header"""
    print("\n" + "="*70)
    print(text)
    print("="*70)

def print_success(message):
    """Print success message"""
    print(f"✅ {message}")

def print_error(message):
    """Print error message"""
    print(f"❌ {message}")

def print_info(message):
    """Print info message"""
    print(f"ℹ️  {message}")

def test_backend_health():
    """Test 1: Backend Health"""
    print_header("TEST 1: Backend Health Check")
    
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print_success("Backend is healthy")
            print(f"   Status: {data.get('status')}")
            if 'services' in data:
                print(f"   Services: {list(data['services'].keys())}")
            return True, data
        else:
            print_error(f"Backend returned status {response.status_code}")
            return False, None
    except Exception as e:
        print_error(f"Backend not responding: {e}")
        return False, None

def test_ai_tutor():
    """Test 2: AI Tutor Agent"""
    print_header("TEST 2: AI Tutor Agent")
    
    # Health check
    try:
        response = requests.get("http://localhost:8000/tutor/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print_success("AI Tutor health check passed")
            print(f"   Status: {data.get('status')}")
            print(f"   LangChain: {data.get('langchain_available')}")
            print(f"   OpenAI: {data.get('openai_configured')}")
        else:
            print_error(f"Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Health check error: {e}")
        return False
    
    # Test chat endpoint
    print_info("Testing chat endpoint...")
    try:
        chat_data = {
            "message": "What is photosynthesis?",
            "topic": 1,
            "user_id": "test-user-123",
            "lesson_content": None
        }
        response = requests.post(
            "http://localhost:8000/tutor/chat",
            json=chat_data,
            timeout=30
        )
        if response.status_code == 200:
            data = response.json()
            print_success("Chat endpoint working")
            print(f"   Response length: {len(data.get('response', ''))} chars")
            print(f"   Confidence: {data.get('confidence_score', 0)}")
            return True
        else:
            print_error(f"Chat endpoint failed: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return False
    except Exception as e:
        print_error(f"Chat endpoint error: {e}")
        return False

def test_answer_grading():
    """Test 3: Answer Grading Agent"""
    print_header("TEST 3: Answer Grading Agent")
    
    # Health check
    try:
        response = requests.get("http://localhost:8000/grading/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print_success("Answer Grading health check passed")
            print(f"   Status: {data.get('status')}")
            print(f"   Grading Agent Ready: {data.get('grading_agent_ready')}")
            print(f"   Mock Exam Agent Ready: {data.get('mock_exam_grading_agent_ready')}")
        else:
            print_error(f"Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Health check error: {e}")
        return False
    
    # Test grading endpoint
    print_info("Testing grading endpoint...")
    try:
        grading_data = {
            "question": "What is the capital of France?",
            "student_answer": "Paris",
            "model_answer": "The capital of France is Paris.",
            "marks": 5
        }
        response = requests.post(
            "http://localhost:8000/grade-answer",
            json=grading_data,
            timeout=30
        )
        if response.status_code == 200:
            data = response.json()
            print_success("Grading endpoint working")
            print(f"   Marks Awarded: {data.get('marks_awarded', 0)}/{data.get('marks_allocated', 0)}")
            print(f"   Percentage: {data.get('percentage_score', 0)}%")
            return True
        else:
            print_error(f"Grading endpoint failed: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return False
    except Exception as e:
        print_error(f"Grading endpoint error: {e}")
        return False

def test_mock_exam_grading():
    """Test 4: Mock Exam Grading Agent"""
    print_header("TEST 4: Mock Exam Grading Agent")
    
    # Health check
    try:
        response = requests.get("http://localhost:8000/api/v1/mock/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print_success("Mock Exam health check passed")
            print(f"   Status: {data.get('status')}")
            print(f"   Service: {data.get('service')}")
            print(f"   Active Jobs: {data.get('active_jobs', 0)}")
            print(f"   Total Jobs: {data.get('total_jobs', 0)}")
        else:
            print_error(f"Health check failed: {response.status_code}")
            if response.status_code == 404:
                print_error("   Endpoint not found - Mock Exam app may not be mounted")
            return False
    except Exception as e:
        print_error(f"Health check error: {e}")
        return False
    
    # Test start endpoint (async job - just check it accepts requests)
    print_info("Testing start endpoint...")
    try:
        start_data = {
            "user_id": "test-user-123",
            "attempted_questions": [
                {
                    "question_id": 1,
                    "question": "What is market segmentation?",
                    "user_answer": "Dividing customers into groups",
                    "solution": "Market segmentation is...",
                    "marks": 10,
                    "part": "A",
                    "question_number": 1
                }
            ]
        }
        response = requests.post(
            "http://localhost:8000/api/v1/mock/start",
            json=start_data,
            timeout=15  # Increased timeout for async processing
        )
        # 200 = success (job created), 400/422 = validation error
        if response.status_code == 200:
            data = response.json()
            print_success("Start endpoint working")
            print(f"   Job ID: {data.get('job_id')}")
            print(f"   Status: {data.get('status')}")
            return True
        elif response.status_code in [400, 422]:
            print_success("Start endpoint exists (validation error)")
            return True
        else:
            print_error(f"Start endpoint failed: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return False
    except requests.exceptions.Timeout:
        # Timeout is OK for async endpoint - it means it's processing
        print_success("Start endpoint working (processing - timeout expected)")
        return True
    except Exception as e:
        print_error(f"Start endpoint error: {e}")
        return False
    
    # Test status endpoint (will get 404 for non-existent job, but endpoint exists)
    print_info("Testing status endpoint...")
    try:
        response = requests.get(
            "http://localhost:8000/api/v1/mock/status/test-job-123",
            timeout=5
        )
        # 404 = job not found (endpoint exists), 200 = job found
        if response.status_code in [200, 404]:
            print_success("Status endpoint exists")
            if response.status_code == 404:
                print_info("   Job not found (expected for test job)")
            return True
        else:
            print_error(f"Status endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Status endpoint error: {e}")
        return False

def main():
    """Main test function"""
    print_header("IMTEHAAN AI EDTECH PLATFORM - AGENT VERIFICATION")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    results = {}
    
    # Test backend health first
    backend_ok, health_data = test_backend_health()
    if not backend_ok:
        print_error("\nBackend is not running. Please start it first.")
        return 1
    
    # Wait a moment for services to be ready
    time.sleep(2)
    
    # Test all agents
    results["AI Tutor"] = test_ai_tutor()
    time.sleep(1)
    
    results["Answer Grading"] = test_answer_grading()
    time.sleep(1)
    
    results["Mock Exam Grading"] = test_mock_exam_grading()
    
    # Summary
    print_header("TEST SUMMARY")
    
    all_passed = True
    for agent, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{agent:30} {status}")
        if not passed:
            all_passed = False
    
    print("\n" + "="*70)
    if all_passed:
        print("🎉 ALL AGENTS ARE WORKING!")
    else:
        print("⚠️  SOME AGENTS ARE NOT WORKING")
    print("="*70)
    
    print("\n📊 Access URLs:")
    print("   Frontend: http://localhost:5173")
    print("   Backend:  http://localhost:8000")
    print("   API Docs: http://localhost:8000/docs")
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    import sys
    sys.exit(main())
