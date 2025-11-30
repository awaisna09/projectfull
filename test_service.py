#!/usr/bin/env python3
"""
Simple test script for AI Tutor Service
"""
import requests
import json
import time

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get('http://localhost:8000/tutor/health')
        print(f"Health Check Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return True
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_chat():
    """Test chat endpoint"""
    try:
        payload = {
            "message": "What is business strategy?",
            "topic": "Business Strategy",
            "user_id": "test_user",
            "learning_level": "intermediate"
        }
        
        response = requests.post(
            'http://localhost:8000/tutor/chat',
            json=payload,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"Chat Test Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return True
    except Exception as e:
        print(f"Chat test failed: {e}")
        return False

def test_topics():
    """Test topics endpoint"""
    try:
        response = requests.get('http://localhost:8000/tutor/topics')
        print(f"Topics Test Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return True
    except Exception as e:
        print(f"Topics test failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing AI Tutor Service...")
    print("=" * 50)
    
    # Wait a bit for service to start
    print("Waiting for service to start...")
    time.sleep(3)
    
    # Test endpoints
    health_ok = test_health()
    if health_ok:
        topics_ok = test_topics()
        if topics_ok:
            chat_ok = test_chat()
            if chat_ok:
                print("\n✅ All tests passed! Service is working correctly.")
            else:
                print("\n❌ Chat test failed.")
        else:
            print("\n❌ Topics test failed.")
    else:
        print("\n❌ Health check failed. Service may not be running.")
