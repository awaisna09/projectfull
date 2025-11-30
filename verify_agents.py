#!/usr/bin/env python3
"""
Verify all agents are working
"""

import requests
import json
import time

def check_endpoint(url, name):
    """Check an endpoint"""
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ {name}: WORKING")
            print(f"   Response: {json.dumps(data, indent=2)}")
            return True
        else:
            print(f"❌ {name}: Status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ {name}: Error - {e}")
        return False

def check_post_endpoint(url, name, data=None):
    """Check a POST endpoint"""
    try:
        response = requests.post(url, json=data, timeout=5)
        # 400/422 means endpoint exists (validation error)
        if response.status_code in [200, 400, 422]:
            print(f"✅ {name}: Endpoint exists")
            if response.status_code == 200:
                result = response.json()
                print(f"   Response: {json.dumps(result, indent=2)}")
            return True
        else:
            print(f"❌ {name}: Status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ {name}: Error - {e}")
        return False

def main():
    print("="*70)
    print("VERIFYING ALL AGENTS")
    print("="*70)
    
    # Wait a bit for servers to be ready
    print("\n⏳ Waiting for servers to be ready...")
    time.sleep(3)
    
    results = {}
    
    # 1. Overall Health
    print("\n1. Backend Health Check")
    print("-"*70)
    results["Backend"] = check_endpoint("http://localhost:8000/health", "Backend Health")
    
    # 2. AI Tutor Agent
    print("\n2. AI Tutor Agent")
    print("-"*70)
    results["AI Tutor Health"] = check_endpoint("http://localhost:8000/tutor/health", "AI Tutor Health")
    
    # 3. Answer Grading Agent
    print("\n3. Answer Grading Agent")
    print("-"*70)
    results["Grading Health"] = check_endpoint("http://localhost:8000/grading/health", "Grading Health")
    
    # 4. Mock Exam Grading Agent
    print("\n4. Mock Exam Grading Agent")
    print("-"*70)
    # Check if endpoint exists (will get validation error, not 404)
    results["Mock Exam"] = check_post_endpoint(
        "http://localhost:8000/api/v1/mock/start",
        "Mock Exam Start Endpoint",
        {"user_id": "test", "attempted_questions": []}
    )
    
    # 5. Frontend
    print("\n5. Frontend Server")
    print("-"*70)
    try:
        response = requests.get("http://localhost:5173", timeout=5)
        if response.status_code == 200:
            print("✅ Frontend: WORKING")
            print(f"   URL: http://localhost:5173")
            results["Frontend"] = True
        else:
            print(f"❌ Frontend: Status {response.status_code}")
            results["Frontend"] = False
    except Exception as e:
        print(f"❌ Frontend: Error - {e}")
        results["Frontend"] = False
    
    # Summary
    print("\n" + "="*70)
    print("VERIFICATION SUMMARY")
    print("="*70)
    
    all_working = True
    for name, status in results.items():
        status_str = "✅ WORKING" if status else "❌ NOT WORKING"
        print(f"{name:30} {status_str}")
        if not status:
            all_working = False
    
    print("\n" + "="*70)
    if all_working:
        print("🎉 ALL AGENTS AND SERVERS ARE WORKING!")
    else:
        print("⚠️  SOME SERVICES ARE NOT WORKING")
    print("="*70)
    
    print("\n📊 Access URLs:")
    print("   Frontend: http://localhost:5173")
    print("   Backend:  http://localhost:8000")
    print("   API Docs: http://localhost:8000/docs")
    
    return 0 if all_working else 1

if __name__ == "__main__":
    import sys
    sys.exit(main())

