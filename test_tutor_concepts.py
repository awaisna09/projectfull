#!/usr/bin/env python3
"""
Test script to verify concept fetching in the full tutor pipeline
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv('config.env')

# Add current directory to path
sys.path.insert(0, os.path.dirname(__file__))

try:
    from langgraph_tutor import run_tutor_graph

    print("🔍 Testing Tutor Pipeline with Concept Fetching")
    print("=" * 60)
    print("\n📝 Test Parameters:")
    print("   User ID: test-user-123")
    print("   Topic ID: 11")
    print("   Message: 'what is scarcity'")
    print("=" * 60)

    # Run the tutor graph
    result = run_tutor_graph(
        user_id="test-user-123",
        topic="11",  # Topic ID as string
        message="what is scarcity",
        conversation_id="test-conv-123",
        explanation_style="default",
        subject_id=101
    )

    print("\n✅ Tutor Pipeline Completed")
    print("=" * 60)

    # Check concepts
    related_concepts = result.get("related_concepts", [])
    concept_ids = result.get("concept_ids", [])

    print("\n📊 Results:")
    print(f"   Related Concepts Count: {len(related_concepts)}")
    print(f"   Concept IDs Count: {len(concept_ids)}")

    if related_concepts:
        print("\n📋 Related Concepts Found:")
        for i, concept in enumerate(related_concepts[:5], 1):
            print(f"   {i}. {concept}")
    else:
        print("\n⚠️  No related concepts found!")

    if concept_ids:
        print("\n🆔 Concept IDs Found:")
        for i, cid in enumerate(concept_ids[:5], 1):
            print(f"   {i}. {cid}")
    else:
        print("\n⚠️  No concept IDs found!")

    # Check response
    response = result.get("response", "")
    print(f"\n💬 Response Length: {len(response)} characters")
    if response:
        print(f"   Preview: {response[:100]}...")

    print("\n" + "=" * 60)

    # Verification
    if related_concepts and len(related_concepts) > 0:
        print("✅ SUCCESS: Concepts are being fetched and returned!")
        print(f"   Found {len(related_concepts)} concept(s) for topic_id 11")
    else:
        print("❌ WARNING: No concepts were returned")
        print("   This might indicate an issue with the concept fetching")

    print("=" * 60)

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
