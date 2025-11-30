#!/usr/bin/env python3
"""
Test if grading agent actually creates entries in Supabase tables
"""

import os
import time
from dotenv import load_dotenv

load_dotenv('config.env')

def test_grading_creates_entries():
    """Test if grading creates actual entries in Supabase"""
    print("="*70)
    print("  TESTING GRADING AGENT SUPABASE ENTRY CREATION")
    print("="*70)
    
    # Import grading agent
    try:
        from agents.answer_grading_agent import AnswerGradingAgent
    except Exception as e:
        print(f"\n✗ ERROR: Failed to import AnswerGradingAgent: {e}")
        return False
    
    # Initialize agent
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("\n✗ ERROR: OPENAI_API_KEY not set")
        return False
    
    print("\n1. Initializing Grading Agent...")
    try:
        agent = AnswerGradingAgent(api_key=api_key)
        if not agent.repo.enabled:
            print("   ✗ ERROR: SupabaseRepository is disabled!")
            return False
        print("   ✓ Grading agent initialized")
        print(f"   ✓ Supabase enabled: {agent.repo.enabled}")
    except Exception as e:
        print(f"   ✗ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # Test data
    test_user_id = f"test_user_{int(time.time())}"
    test_question = "What is the purpose of market research in business?"
    test_model_answer = (
        "Market research is the systematic gathering, recording, and analysis "
        "of data about customers, competitors, and the market. Its purpose "
        "includes: 1) Identifying customer needs and preferences, 2) "
        "Understanding market trends and opportunities, 3) Assessing "
        "competition, 4) Reducing business risks, 5) Informing product "
        "development and marketing strategies."
    )
    test_student_answer = (
        "Market research helps businesses understand what customers want. "
        "It involves collecting information about the market and competitors. "
        "This helps companies make better decisions about their products."
    )
    test_question_id = f"test_q_{int(time.time())}"
    
    print(f"\n2. Running Grading Test...")
    print(f"   User ID: {test_user_id}")
    print(f"   Question ID: {test_question_id}")
    print(f"   Question: {test_question[:50]}...")
    
    # Get Supabase client for verification
    supabase = agent.repo.client
    
    # Count entries before grading
    print("\n3. Counting entries BEFORE grading:")
    try:
        attempts_before = (
            supabase.table("question_attempts")
            .select("attempt_id", count="exact")
            .eq("user_id", test_user_id)
            .execute()
        )
        attempts_count_before = attempts_before.count if hasattr(attempts_before, 'count') else len(attempts_before.data or [])
        print(f"   question_attempts: {attempts_count_before}")
    except Exception as e:
        print(f"   ⚠️  Could not count question_attempts: {e}")
        attempts_count_before = 0
    
    try:
        mastery_before = (
            supabase.table("user_mastery")
            .select("mastery_id", count="exact")
            .eq("user_id", test_user_id)
            .execute()
        )
        mastery_count_before = mastery_before.count if hasattr(mastery_before, 'count') else len(mastery_before.data or [])
        print(f"   user_mastery: {mastery_count_before}")
    except Exception as e:
        print(f"   ⚠️  Could not count user_mastery: {e}")
        mastery_count_before = 0
    
    try:
        trends_before = (
            supabase.table("user_trends")
            .select("trend_id", count="exact")
            .eq("user_id", test_user_id)
            .execute()
        )
        trends_count_before = trends_before.count if hasattr(trends_before, 'count') else len(trends_before.data or [])
        print(f"   user_trends: {trends_count_before}")
    except Exception as e:
        print(f"   ⚠️  Could not count user_trends: {e}")
        trends_count_before = 0
    
    try:
        weaknesses_before = (
            supabase.table("user_weaknesses")
            .select("weakness_id", count="exact")
            .eq("user_id", test_user_id)
            .execute()
        )
        weaknesses_count_before = weaknesses_before.count if hasattr(weaknesses_before, 'count') else len(weaknesses_before.data or [])
        print(f"   user_weaknesses: {weaknesses_count_before}")
    except Exception as e:
        print(f"   ⚠️  Could not count user_weaknesses: {e}")
        weaknesses_count_before = 0
    
    # Run grading
    print("\n4. Running grading operation...")
    try:
        result = agent.grade_answer(
            question=test_question,
            model_answer=test_model_answer,
            student_answer=test_student_answer,
            user_id=test_user_id,
            question_id=test_question_id,
            max_marks=10,
            difficulty_level=2
        )
        
        print(f"   ✓ Grading completed")
        print(f"   Score: {result.overall_score}/50 ({result.percentage}%)")
        print(f"   Grade: {result.grade}")
        print(f"   Reasoning: {result.reasoning_category}")
        print(f"   Concepts detected: {len(result.primary_concept_ids)} primary, {len(result.secondary_concept_ids)} secondary")
        print(f"   Mastery deltas: {len(result.mastery_deltas)} concepts updated")
        
    except Exception as e:
        print(f"   ✗ ERROR during grading: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # Wait a moment for async operations
    print("\n5. Waiting for database operations to complete...")
    time.sleep(2)
    
    # Count entries after grading
    print("\n6. Counting entries AFTER grading:")
    try:
        attempts_after = (
            supabase.table("question_attempts")
            .select("*")
            .eq("user_id", test_user_id)
            .execute()
        )
        attempts_count_after = len(attempts_after.data or [])
        print(f"   question_attempts: {attempts_count_after} (was {attempts_count_before})")
        if attempts_count_after > attempts_count_before:
            print(f"   ✓ NEW ENTRY CREATED!")
            if attempts_after.data:
                latest = attempts_after.data[-1]
                print(f"      - question_id: {latest.get('question_id')}")
                print(f"      - raw_score: {latest.get('raw_score')}")
                print(f"      - percentage: {latest.get('percentage')}")
                print(f"      - grade: {latest.get('grade')}")
        else:
            print(f"   ✗ NO NEW ENTRY CREATED!")
    except Exception as e:
        print(f"   ✗ ERROR checking question_attempts: {e}")
        import traceback
        traceback.print_exc()
    
    try:
        mastery_after = (
            supabase.table("user_mastery")
            .select("*")
            .eq("user_id", test_user_id)
            .execute()
        )
        mastery_count_after = len(mastery_after.data or [])
        print(f"   user_mastery: {mastery_count_after} (was {mastery_count_before})")
        if mastery_count_after > mastery_count_before:
            print(f"   ✓ NEW ENTRIES CREATED!")
            new_entries = mastery_after.data[mastery_count_before:]
            for entry in new_entries[:5]:  # Show first 5
                print(f"      - concept_id: {entry.get('concept_id')}, mastery: {entry.get('mastery')}")
        else:
            print(f"   ⚠️  No new mastery entries (may have updated existing)")
    except Exception as e:
        print(f"   ✗ ERROR checking user_mastery: {e}")
    
    try:
        trends_after = (
            supabase.table("user_trends")
            .select("*")
            .eq("user_id", test_user_id)
            .execute()
        )
        trends_count_after = len(trends_after.data or [])
        print(f"   user_trends: {trends_count_after} (was {trends_count_before})")
        if trends_count_after > trends_count_before:
            print(f"   ✓ NEW ENTRIES CREATED!")
            new_entries = trends_after.data[trends_count_before:]
            for entry in new_entries[:5]:  # Show first 5
                print(f"      - concept_id: {entry.get('concept_id')}, mastery: {entry.get('mastery')}")
        else:
            print(f"   ✗ NO NEW ENTRIES CREATED!")
    except Exception as e:
        print(f"   ✗ ERROR checking user_trends: {e}")
    
    try:
        weaknesses_after = (
            supabase.table("user_weaknesses")
            .select("*")
            .eq("user_id", test_user_id)
            .execute()
        )
        weaknesses_count_after = len(weaknesses_after.data or [])
        print(f"   user_weaknesses: {weaknesses_count_after} (was {weaknesses_count_before})")
        if weaknesses_count_after > weaknesses_count_before:
            print(f"   ✓ NEW ENTRIES CREATED!")
            new_entries = weaknesses_after.data[weaknesses_count_before:]
            for entry in new_entries[:5]:  # Show first 5
                print(f"      - concept_id: {entry.get('concept_id')}, is_weak: {entry.get('is_weak')}")
        else:
            print(f"   ⚠️  No new weakness entries (may have updated existing)")
    except Exception as e:
        print(f"   ✗ ERROR checking user_weaknesses: {e}")
    
    # Summary
    print("\n" + "="*70)
    print("  VERIFICATION SUMMARY")
    print("="*70)
    
    success_count = 0
    total_checks = 4
    
    if attempts_count_after > attempts_count_before:
        print("✅ question_attempts: Entry created")
        success_count += 1
    else:
        print("❌ question_attempts: No entry created")
    
    if mastery_count_after >= mastery_count_before and result.mastery_deltas:
        print("✅ user_mastery: Entries created/updated")
        success_count += 1
    else:
        print("❌ user_mastery: No entries created/updated")
    
    if trends_count_after > trends_count_before:
        print("✅ user_trends: Entries created")
        success_count += 1
    else:
        print("❌ user_trends: No entries created")
    
    if weaknesses_count_after >= weaknesses_count_before and result.mastery_deltas:
        print("✅ user_weaknesses: Entries created/updated")
        success_count += 1
    else:
        print("❌ user_weaknesses: No entries created/updated")
    
    print(f"\nResult: {success_count}/{total_checks} tables updated successfully")
    
    if success_count == total_checks:
        print("\n✅ ALL SUPABASE UPDATES WORKING!")
        return True
    elif success_count > 0:
        print(f"\n⚠️  PARTIAL SUCCESS: {success_count}/{total_checks} tables updated")
        return False
    else:
        print("\n❌ NO SUPABASE UPDATES WORKING!")
        return False

if __name__ == "__main__":
    success = test_grading_creates_entries()
    print("\n" + "="*70)
    if success:
        print("  ✅ TEST PASSED - All Supabase entries created")
    else:
        print("  ❌ TEST FAILED - Some entries not created")
    print("="*70 + "\n")

