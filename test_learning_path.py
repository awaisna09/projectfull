#!/usr/bin/env python3
"""
Test learning path with concepts
"""

import requests
import json

url = "http://localhost:8000/tutor/chat"

payload = {
    "message": "what is the term business activity",
    "topic": 11,
    "user_id": "f4f9cab9-70c2-45cb-89a4-d0cbd6aca6ea",
    "conversation_id": "f4f9cab9-70c2-45cb-89a4-d0cbd6aca6ea_11",
    "explanation_style": "default"
}

print("🔍 Testing Learning Path with Concepts")
print("=" * 60)

response = requests.post(url, json=payload, timeout=60)
data = response.json()

print(f"\n✅ Status: {response.status_code}")
print(f"📊 Related Concepts: {len(data.get('related_concepts', []))}")
print(f"🆔 Concept IDs: {data.get('related_concept_ids', [])}")

learning_path = data.get('learning_path', {})
print(f"\n🎯 Learning Path:")
print(f"   Decision: {learning_path.get('decision', 'N/A')}")
print(f"   Recommended Concept: {learning_path.get('recommended_concept', 'N/A')}")
print(f"   Details: {learning_path.get('details', 'N/A')}")

if learning_path.get('recommended_concept'):
    print("\n✅ SUCCESS: Learning path recommends a concept!")
else:
    print("\n❌ WARNING: No recommended concept in learning path")

print("\n" + "=" * 60)

