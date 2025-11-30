#!/usr/bin/env python3
"""
Test to check the concept fetching flow
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

    print("🔍 Testing Concept Fetching Flow")
    print("=" * 60)

    # Test with topic as string (as it comes from frontend)
    print("\nTest 1: Topic as string '11'")
    result1 = run_tutor_graph(
        user_id="test-user",
        topic="11",
        message="what is scarcity",
        conversation_id="test-1",
        subject_id=101
    )
    print(f"Related Concepts: {len(result1.get('related_concepts', []))}")
    print(f"Concept IDs: {result1.get('concept_ids', [])}")

    # Test with topic as int
    print("\nTest 2: Topic as int 11")
    result2 = run_tutor_graph(
        user_id="test-user",
        topic=11,
        message="what is scarcity",
        conversation_id="test-2",
        subject_id=101
    )
    print(f"Related Concepts: {len(result2.get('related_concepts', []))}")
    print(f"Concept IDs: {result2.get('concept_ids', [])}")

    print("\n" + "=" * 60)

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

