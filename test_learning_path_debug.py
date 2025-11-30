#!/usr/bin/env python3
"""
Debug script to test learning path with readiness = 0
"""

import requests
import json

url = "http://localhost:8000/tutor/chat"

payload = {
    "message": "what is business activity",
    "topic": 11,
    "user_id": "f4f9cab9-70c2-45cb-89a4-d0cbd6aca6ea",
    "conversation_id": "f4f9cab9-70c2-45cb-89a4-d0cbd6aca6ea_11",
    "explanation_style": "default"
}

print("🔍 Testing Learning Path with Readiness = 0")
print("=" * 60)

response = requests.post(url, json=payload, timeout=60)
data = response.json()

print(f"\n✅ Status: {response.status_code}")
print(f"📊 Related Concepts: {len(data.get('related_concepts', []))}")
print(f"🆔 Concept IDs: {data.get('related_concept_ids', [])}")

readiness = data.get('readiness', {})
print(f"\n📈 Readiness:")
print(f"   Overall: {readiness.get('overall_readiness', 'N/A')}")
print(f"   Avg Mastery: {readiness.get('average_mastery', 'N/A')}")
print(f"   Min Mastery: {readiness.get('min_mastery', 'N/A')}")

learning_path = data.get('learning_path', {})
print(f"\n🎯 Learning Path:")
print(f"   Decision: {learning_path.get('decision', 'N/A')}")
print(f"   Recommended Concept: {learning_path.get('recommended_concept', 'N/A')}")
print(f"   Details: {learning_path.get('details', 'N/A')}")

print("\n" + "=" * 60)
print("\n🔍 Full Readiness Object:")
print(json.dumps(readiness, indent=2))
print("\n🔍 Full Learning Path Object:")
print(json.dumps(learning_path, indent=2))

