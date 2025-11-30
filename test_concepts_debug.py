#!/usr/bin/env python3
"""
Debug script to check why concepts aren't being returned
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv('config.env')

# Enable DEBUG mode
os.environ["DEBUG"] = "1"

# Add current directory to path
sys.path.insert(0, os.path.dirname(__file__))

try:
    from langgraph_tutor import run_tutor_graph

    print("🔍 Testing Tutor Pipeline with DEBUG enabled")
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

    print(f"\n📊 Results:")
    print(f"   Related Concepts Count: {len(related_concepts)}")
    print(f"   Concept IDs Count: {len(concept_ids)}")

    if related_concepts:
        print(f"\n📋 Related Concepts Found:")
        for i, concept in enumerate(related_concepts[:5], 1):
            print(f"   {i}. {concept}")
    else:
        print("\n⚠️  No related concepts found!")

    if concept_ids:
        print(f"\n🆔 Concept IDs Found:")
        for i, cid in enumerate(concept_ids[:5], 1):
            print(f"   {i}. {cid} (type: {type(cid).__name__})")
    else:
        print("\n⚠️  No concept IDs found!")

    print("=" * 60)

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

