#!/usr/bin/env python3
"""
Verify concepts are being returned correctly
"""

import requests
import json

url = "http://localhost:8000/tutor/chat"

payload = {
    "message": "what is scarcity",
    "topic": 11,
    "user_id": "f4f9cab9-70c2-45cb-89a4-d0cbd6aca6ea",
    "conversation_id": "f4f9cab9-70c2-45cb-89a4-d0cbd6aca6ea_11",
    "explanation_style": "default"
}

print("🔍 Verifying Concepts in Response")
print("=" * 60)

response = requests.post(url, json=payload, timeout=60)
data = response.json()

print(f"\n✅ Status: {response.status_code}")
print(f"📊 Related Concepts Count: {len(data.get('related_concepts', []))}")
print(f"🆔 Concept IDs Count: {len(data.get('related_concept_ids', []))}")

if data.get('related_concepts'):
    print("\n📋 Related Concepts:")
    for i, concept in enumerate(data['related_concepts'], 1):
        print(f"   {i}. {concept}")

if data.get('related_concept_ids'):
    print("\n🆔 Concept IDs:")
    for i, cid in enumerate(data['related_concept_ids'], 1):
        print(f"   {i}. {cid} (type: {type(cid).__name__})")

print("\n" + "=" * 60)

if len(data.get('related_concepts', [])) > 0:
    print("✅ SUCCESS: Concepts are being returned!")
else:
    print("❌ WARNING: No concepts returned")

