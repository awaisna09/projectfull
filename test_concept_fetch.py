#!/usr/bin/env python3
"""
Test script to verify concept fetching by topic_id is working
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv('config.env')

# Add agents folder to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'agents'))

try:
    from supabase import create_client
    from agents.concept_agent import ConceptAgent

    # Initialize Supabase client
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_ANON_KEY") or os.getenv(
        "SUPABASE_SERVICE_ROLE_KEY"
    )

    if not supabase_url or not supabase_key:
        print("❌ ERROR: Supabase credentials not found in config.env")
        sys.exit(1)

    supabase_client = create_client(supabase_url, supabase_key)
    print("✅ Supabase client initialized")

    # Initialize ConceptAgent
    api_key = os.getenv("OPENAI_API_KEY")
    concept_agent = ConceptAgent(
        api_key=api_key,
        supabase_client=supabase_client
    )
    print("✅ ConceptAgent initialized")

    # Test fetching concepts for topic_id 11 (as mentioned in user's example)
    print("\n🔍 Testing fetch_concepts_by_topic for topic_id: 11")
    print("=" * 60)

    concepts = concept_agent.fetch_concepts_by_topic(
        topic_id="11",
        limit=5,
        random_order=True
    )

    if concepts:
        print(f"✅ Successfully fetched {len(concepts)} concepts")
        print("\n📋 Concepts found:")
        print("-" * 60)
        for i, concept in enumerate(concepts, 1):
            print(f"\n{i}. Concept ID: {concept.get('concept_id')}")
            print(f"   Name: {concept.get('name', 'N/A')}")
            desc = concept.get('description', 'N/A')[:100]
            print(f"   Description: {desc}...")
            print(f"   Topic ID: {concept.get('topic_id')}")
    else:
        print("❌ No concepts found for topic_id: 11")
        print("\n⚠️  This could mean:")
        print("   1. No concepts exist for topic_id 11 in the database")
        print("   2. There's an error in the query")
        print("\n🔍 Checking if topic_id 11 exists in concepts table...")

        # Check if any concepts exist for this topic
        try:
            result = supabase_client.table("concepts").select(
                "concept_id, concept, explanation, topic_id"
            ).eq("topic_id", 11).limit(1).execute()

            if result.data:
                print(f"✅ Found {len(result.data)} concept(s) in database")
                print(f"   Sample: {result.data[0].get('concept', 'N/A')}")
            else:
                print("❌ No concepts found in database for topic_id: 11")
        except Exception as e:
            print(f"❌ Error querying database: {e}")

    print("\n" + "=" * 60)
    print("✅ Test completed")

except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Please ensure all dependencies are installed:")
    print("  pip install supabase python-dotenv")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
