#!/usr/bin/env python3
"""
Test script to reproduce the 500 error and see the actual error message
"""

import requests
import json

# Test the tutor chat endpoint
url = "http://localhost:8000/tutor/chat"

payload = {
    "message": "what is scarcity",
    "topic": 11,
    "user_id": "f4f9cab9-70c2-45cb-89a4-d0cbd6aca6ea",
    "conversation_id": "f4f9cab9-70c2-45cb-89a4-d0cbd6aca6ea_11",
    "explanation_style": "default"
}

print("Testing tutor chat endpoint...")
print(f"URL: {url}")
print(f"Payload: {json.dumps(payload, indent=2)}")
print("=" * 60)

try:
    response = requests.post(url, json=payload, timeout=60)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        print("✅ SUCCESS!")
        data = response.json()
        print(f"Response keys: {list(data.keys())}")
        print(f"Related Concepts: {len(data.get('related_concepts', []))}")
    else:
        print(f"❌ ERROR: {response.status_code}")
        print(f"Response: {response.text}")
        
except requests.exceptions.RequestException as e:
    print(f"❌ Request Exception: {e}")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

