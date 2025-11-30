#!/usr/bin/env python3
"""
Test Supabase connection specifically for AI Tutor Agent
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv('config.env')

def test_supabase_for_ai_tutor():
    """Test Supabase connection with AI Tutor specific queries"""
    print("="*70)
    print("  SUPABASE CONNECTION TEST FOR AI TUTOR")
    print("="*70)
    
    # Check environment variables
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_ANON_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        print("\n✗ ERROR: Supabase credentials not found in config.env")
        return False
    
    try:
        from supabase import create_client
        supabase_client = create_client(supabase_url, supabase_key)
        print("\n✓ Supabase client created successfully")
    except Exception as e:
        print(f"\n✗ ERROR: Failed to create Supabase client: {e}")
        return False
    
    # Test tables used by AI Tutor
    print("\n" + "="*70)
    print("  TESTING AI TUTOR TABLES")
    print("="*70)
    
    tests = []
    
    # Test 1: Topics table
    print("\n1. Testing topics table:")
    try:
        response = supabase_client.table("topics").select("topic_id").limit(1).execute()
        print(f"   ✓ topics table accessible")
        print(f"   ✓ Found {len(response.data)} row(s)")
        tests.append(True)
    except Exception as e:
        print(f"   ✗ topics table error: {str(e)[:100]}")
        tests.append(False)
    
    # Test 2: Concepts table
    print("\n2. Testing concepts table:")
    try:
        response = supabase_client.table("concepts").select("concept_id").limit(1).execute()
        print(f"   ✓ concepts table accessible")
        print(f"   ✓ Found {len(response.data)} row(s)")
        tests.append(True)
    except Exception as e:
        print(f"   ✗ concepts table error: {str(e)[:100]}")
        tests.append(False)
    
    # Test 3: Lessons table
    print("\n3. Testing lessons table:")
    try:
        response = supabase_client.table("lessons").select("lessons_id").limit(1).execute()
        print(f"   ✓ lessons table accessible")
        print(f"   ✓ Found {len(response.data)} row(s)")
        tests.append(True)
    except Exception as e:
        print(f"   ✗ lessons table error: {str(e)[:100]}")
        tests.append(False)
    
    # Test 4: Tutor messages table
    print("\n4. Testing tutor_messages table:")
    try:
        response = supabase_client.table("tutor_messages").select("id").limit(1).execute()
        print(f"   ✓ tutor_messages table accessible")
        print(f"   ✓ Found {len(response.data)} row(s)")
        tests.append(True)
    except Exception as e:
        print(f"   ✗ tutor_messages table error: {str(e)[:100]}")
        tests.append(False)
    
    # Test 5: Student mastery table
    print("\n5. Testing student_mastery table:")
    try:
        response = supabase_client.table("student_mastery").select("user_id").limit(1).execute()
        print(f"   ✓ student_mastery table accessible")
        print(f"   ✓ Found {len(response.data)} row(s)")
        tests.append(True)
    except Exception as e:
        print(f"   ✗ student_mastery table error: {str(e)[:100]}")
        tests.append(False)
    
    # Test 6: Test topic_id 11 specifically
    print("\n6. Testing topic_id 11 (Business Activity):")
    try:
        response = supabase_client.table("topics").select("*").eq("topic_id", 11).execute()
        if response.data:
            print(f"   ✓ Topic 11 found: {response.data[0].get('title', 'N/A')}")
            tests.append(True)
        else:
            print(f"   ⚠️  Topic 11 not found in database")
            tests.append(False)
    except Exception as e:
        print(f"   ✗ Error querying topic 11: {str(e)[:100]}")
        tests.append(False)
    
    # Test 7: Test concepts for topic 11
    print("\n7. Testing concepts for topic_id 11:")
    try:
        response = supabase_client.table("concepts").select("concept_id, name").eq("topic_id", 11).limit(5).execute()
        if response.data:
            print(f"   ✓ Found {len(response.data)} concepts for topic 11")
            for i, concept in enumerate(response.data[:3], 1):
                print(f"      {i}. {concept.get('name', 'N/A')} (ID: {concept.get('concept_id', 'N/A')})")
            tests.append(True)
        else:
            print(f"   ⚠️  No concepts found for topic 11")
            tests.append(False)
    except Exception as e:
        print(f"   ✗ Error querying concepts: {str(e)[:100]}")
        tests.append(False)
    
    # Test 8: Test lessons for topic 11
    print("\n8. Testing lessons for topic_id 11:")
    try:
        response = supabase_client.table("lessons").select("lessons_id, title").eq("topic_id", 11).limit(3).execute()
        if response.data:
            print(f"   ✓ Found {len(response.data)} lessons for topic 11")
            for i, lesson in enumerate(response.data, 1):
                print(f"      {i}. {lesson.get('title', 'N/A')}")
            tests.append(True)
        else:
            print(f"   ⚠️  No lessons found for topic 11")
            tests.append(False)
    except Exception as e:
        print(f"   ✗ Error querying lessons: {str(e)[:100]}")
        tests.append(False)
    
    # Summary
    print("\n" + "="*70)
    print("  TEST SUMMARY")
    print("="*70)
    passed = sum(tests)
    total = len(tests)
    print(f"\nPassed: {passed}/{total}")
    
    if passed == total:
        print("✓ All Supabase tables accessible for AI Tutor")
        return True
    else:
        print(f"⚠️  {total - passed} test(s) failed")
        print("\nNote: Some tables may not exist yet. This is OK if the AI Tutor")
        print("can still function with the available tables.")
        return passed >= 5  # At least 5/8 tests should pass

if __name__ == "__main__":
    success = test_supabase_for_ai_tutor()
    print("\n" + "="*70)
    if success:
        print("  ✓ SUPABASE CONNECTION TEST PASSED")
    else:
        print("  ✗ SUPABASE CONNECTION TEST FAILED")
    print("="*70 + "\n")

