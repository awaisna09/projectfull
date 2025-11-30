#!/usr/bin/env python3
"""
Test Supabase queries directly to see what's happening
"""

import os
from dotenv import load_dotenv

load_dotenv('config.env')

def test_direct_queries():
    """Test Supabase queries directly"""
    print("="*70)
    print("  TESTING SUPABASE QUERIES DIRECTLY")
    print("="*70)
    
    # Import and get the actual client from langgraph_tutor
    import langgraph_tutor
    
    if not langgraph_tutor.supabase_client:
        print("\n✗ ERROR: Supabase client is None!")
        return
    
    supabase = langgraph_tutor.supabase_client
    
    # Test 1: Fetch lessons for topic 11
    print("\n1. Testing lesson fetch for topic_id 11:")
    try:
        response = supabase.table("lessons").select("*").eq("topic_id", 11).limit(5).execute()
        print(f"   ✓ Query executed")
        print(f"   ✓ Found {len(response.data)} lessons")
        if response.data:
            for i, lesson in enumerate(response.data[:3], 1):
                print(f"      {i}. ID: {lesson.get('lessons_id')}, Title: {lesson.get('title', 'N/A')[:50]}")
        else:
            print("   ⚠️  WARNING: No lessons found for topic_id 11!")
    except Exception as e:
        print(f"   ✗ ERROR: {e}")
    
    # Test 2: Fetch concepts for topic 11
    print("\n2. Testing concept fetch for topic_id 11:")
    try:
        # Try with different column names
        response1 = supabase.table("concepts").select("concept_id, concept, explanation").eq("topic_id", 11).limit(5).execute()
        print(f"   ✓ Query with 'concept' column executed")
        print(f"   ✓ Found {len(response1.data)} concepts")
        if response1.data:
            for i, concept in enumerate(response1.data[:3], 1):
                name = concept.get('concept') or concept.get('name', 'N/A')
                print(f"      {i}. ID: {concept.get('concept_id')}, Name: {name[:50]}")
        else:
            print("   ⚠️  WARNING: No concepts found with 'concept' column!")
            
            # Try with 'name' column
            print("\n   Trying with 'name' column instead...")
            response2 = supabase.table("concepts").select("concept_id, name, description").eq("topic_id", 11).limit(5).execute()
            print(f"   ✓ Query with 'name' column executed")
            print(f"   ✓ Found {len(response2.data)} concepts")
            if response2.data:
                for i, concept in enumerate(response2.data[:3], 1):
                    name = concept.get('name', 'N/A')
                    print(f"      {i}. ID: {concept.get('concept_id')}, Name: {name[:50]}")
    except Exception as e:
        print(f"   ✗ ERROR: {e}")
        import traceback
        traceback.print_exc()
    
    # Test 3: Check what columns actually exist
    print("\n3. Checking table structure:")
    try:
        # Get all concepts to see structure
        response = supabase.table("concepts").select("*").limit(1).execute()
        if response.data:
            print("   ✓ Concepts table structure:")
            for key in response.data[0].keys():
                print(f"      - {key}")
        else:
            print("   ⚠️  No data to inspect structure")
    except Exception as e:
        print(f"   ✗ ERROR: {e}")
    
    # Test 4: Check topics table
    print("\n4. Checking topics table for topic_id 11:")
    try:
        response = supabase.table("topics").select("*").eq("topic_id", 11).execute()
        print(f"   ✓ Found {len(response.data)} topics")
        if response.data:
            topic = response.data[0]
            print(f"      Topic ID: {topic.get('topic_id')}")
            print(f"      Title: {topic.get('title', 'N/A')}")
            print(f"      Subject ID: {topic.get('subject_id', 'N/A')}")
    except Exception as e:
        print(f"   ✗ ERROR: {e}")

if __name__ == "__main__":
    test_direct_queries()

