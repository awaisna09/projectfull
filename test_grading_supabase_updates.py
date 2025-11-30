#!/usr/bin/env python3
"""
Test if grading agent is updating Supabase tables correctly
"""

import os
from dotenv import load_dotenv

load_dotenv('config.env')

def test_grading_supabase_updates():
    """Test if grading agent can update Supabase tables"""
    print("="*70)
    print("  TESTING GRADING AGENT SUPABASE UPDATES")
    print("="*70)
    
    # Check 1: Environment variables
    print("\n1. Checking Environment Variables:")
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    supabase_anon_key = os.getenv("SUPABASE_ANON_KEY")
    
    if supabase_url:
        print(f"   ✓ SUPABASE_URL: {supabase_url[:40]}...")
    else:
        print("   ✗ SUPABASE_URL: Missing")
        return False
    
    if supabase_service_key:
        print(f"   ✓ SUPABASE_SERVICE_ROLE_KEY: Set ({len(supabase_service_key)} chars)")
    else:
        print("   ⚠️  SUPABASE_SERVICE_ROLE_KEY: Not set")
        if supabase_anon_key:
            print("   ⚠️  Using SUPABASE_ANON_KEY instead (may have limited permissions)")
        else:
            print("   ✗ No Supabase key available")
            return False
    
    # Check 2: Import and initialize SupabaseRepository
    print("\n2. Testing SupabaseRepository Initialization:")
    try:
        from agents.answer_grading_agent import SupabaseRepository
        
        repo = SupabaseRepository()
        if repo.enabled:
            print("   ✓ SupabaseRepository is enabled")
            print(f"   ✓ Supabase client initialized: {repo.client is not None}")
        else:
            print("   ✗ SupabaseRepository is NOT enabled")
            print("   → Grading agent will NOT update Supabase tables!")
            return False
    except Exception as e:
        print(f"   ✗ Failed to initialize SupabaseRepository: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # Check 3: Test table access
    print("\n3. Testing Table Access:")
    tables_to_test = [
        "question_attempts",
        "user_mastery",
        "user_trends",
        "user_weaknesses",
        "business_activity_questions"
    ]
    
    for table_name in tables_to_test:
        try:
            # Try to select 1 row to test access
            response = repo.client.table(table_name).select("*").limit(1).execute()
            print(f"   ✓ {table_name}: Accessible ({len(response.data)} rows found)")
        except Exception as e:
            error_msg = str(e)
            if "does not exist" in error_msg or "PGRST" in error_msg:
                print(f"   ✗ {table_name}: Table does not exist or not accessible")
                print(f"      Error: {error_msg[:100]}")
            else:
                print(f"   ⚠️  {table_name}: Error accessing - {error_msg[:100]}")
    
    # Check 4: Test AnswerGradingAgent initialization
    print("\n4. Testing AnswerGradingAgent Initialization:")
    try:
        from agents.answer_grading_agent import AnswerGradingAgent
        
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            print("   ⚠️  OPENAI_API_KEY not set - skipping agent init")
        else:
            agent = AnswerGradingAgent(api_key=api_key)
            if agent.repo.enabled:
                print("   ✓ AnswerGradingAgent initialized with Supabase enabled")
                print(f"   ✓ Repository enabled: {agent.repo.enabled}")
            else:
                print("   ✗ AnswerGradingAgent initialized but Supabase is disabled")
                print("   → Grading will NOT update Supabase tables!")
                return False
    except Exception as e:
        print(f"   ✗ Failed to initialize AnswerGradingAgent: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # Check 5: Test update methods
    print("\n5. Testing Update Methods:")
    test_user_id = "test_user_grading_check"
    test_concept_id = "1"
    
    # Test update_mastery
    try:
        print("   Testing update_mastery...")
        result = repo.update_mastery(test_user_id, test_concept_id, 5.0)
        if result is not None:
            print(f"   ✓ update_mastery: Working (returned {result})")
        else:
            print("   ✗ update_mastery: Returned None (may be disabled)")
    except Exception as e:
        print(f"   ✗ update_mastery: Error - {e}")
    
    # Test batch_log_trends
    try:
        print("   Testing batch_log_trends...")
        test_trends = [{
            "user_id": test_user_id,
            "concept_id": test_concept_id,
            "mastery": 55.0
        }]
        result = repo.batch_log_trends(test_trends)
        if result is not None:
            print(f"   ✓ batch_log_trends: Working")
        else:
            print("   ✗ batch_log_trends: Returned None (may be disabled)")
    except Exception as e:
        print(f"   ✗ batch_log_trends: Error - {e}")
    
    # Test batch_update_weaknesses
    try:
        print("   Testing batch_update_weaknesses...")
        test_weaknesses = [{
            "user_id": test_user_id,
            "concept_id": test_concept_id,
            "is_weak": False
        }]
        result = repo.batch_update_weaknesses(test_weaknesses)
        if result is not None:
            print(f"   ✓ batch_update_weaknesses: Working")
        else:
            print("   ✗ batch_update_weaknesses: Returned None (may be disabled)")
    except Exception as e:
        print(f"   ✗ batch_update_weaknesses: Error - {e}")
    
    # Test log_question_attempt
    try:
        print("   Testing log_question_attempt...")
        test_attempt = {
            "user_id": test_user_id,
            "question_id": "test_q_1",
            "topic_id": 11,
            "raw_score": 35.0,
            "percentage": 70.0,
            "grade": "C",
            "reasoning_category": "partial",
            "has_misconception": False,
            "primary_concept_ids": ["1", "2"],
            "secondary_concept_ids": ["3"]
        }
        result = repo.log_question_attempt(**test_attempt)
        if result is not None:
            print(f"   ✓ log_question_attempt: Working")
        else:
            print("   ✗ log_question_attempt: Returned None (may be disabled)")
    except Exception as e:
        print(f"   ✗ log_question_attempt: Error - {e}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "="*70)
    print("  SUMMARY")
    print("="*70)
    print("\nTables that should be updated after grading:")
    print("  1. question_attempts - Logs each grading attempt")
    print("  2. user_mastery - Updates mastery scores for concepts")
    print("  3. user_trends - Logs mastery trends over time")
    print("  4. user_weaknesses - Tracks weak concepts (<40 mastery or misconceptions)")
    print("\nIf any methods returned None or errors, those updates are NOT working!")
    print("="*70 + "\n")
    
    return True

if __name__ == "__main__":
    test_grading_supabase_updates()

