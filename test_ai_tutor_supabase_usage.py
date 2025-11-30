#!/usr/bin/env python3
"""
Test if AI Tutor is actually using Supabase during operation
"""

import os
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv('config.env')

def test_ai_tutor_supabase_usage():
    """Test if AI Tutor uses Supabase during actual operation"""
    print("="*70)
    print("  TESTING AI TUTOR SUPABASE USAGE")
    print("="*70)
    
    # Import after loading env
    from langgraph_tutor import run_tutor_graph
    
    print("\n1. Testing AI Tutor with topic_id 11:")
    print("   This will check if Supabase is used for:")
    print("   - Fetching lessons")
    print("   - Fetching concepts")
    print("   - Logging messages")
    print("   - Updating mastery")
    print("   - Computing readiness")
    print("   - Computing learning path")
    
    USER_ID = "test_user_supabase_check"
    TOPIC_ID = "11"
    CONVERSATION_ID = f"test_conv_{int(time.time())}"
    
    try:
        print("\n2. Sending test message to AI Tutor...")
        response = run_tutor_graph(
            user_id=USER_ID,
            topic=TOPIC_ID,
            message="What is scarcity?",
            conversation_id=CONVERSATION_ID,
            explanation_style="default",
            subject_id=101
        )
        
        print("\n3. Checking Response:")
        print(f"   ✓ Response received: {len(response.get('response', ''))} chars")
        
        # Check if concepts were fetched (requires Supabase)
        concepts = response.get('related_concepts', [])
        concept_ids = response.get('concept_ids', [])
        print(f"   {'✓' if concepts else '✗'} Related concepts: {len(concepts)} found")
        print(f"   {'✓' if concept_ids else '✗'} Concept IDs: {len(concept_ids)} found")
        
        if not concepts and not concept_ids:
            print("   ⚠️  WARNING: No concepts found - Supabase may not be working!")
        else:
            print("   ✓ Concepts fetched successfully (Supabase working)")
        
        # Check if mastery updates were made (requires Supabase)
        mastery_updates = response.get('mastery_updates', [])
        print(f"   {'✓' if mastery_updates else '✗'} Mastery updates: {len(mastery_updates)}")
        
        # Check if readiness was computed (requires Supabase)
        readiness = response.get('readiness')
        print(f"   {'✓' if readiness else '✗'} Readiness computed: {readiness is not None}")
        
        if readiness:
            print(f"      - Overall readiness: {readiness.get('overall_readiness', 'N/A')}")
            print(f"      - Average mastery: {readiness.get('average_mastery', 'N/A')}")
        else:
            print("   ⚠️  WARNING: Readiness not computed - Supabase may not be working!")
        
        # Check if learning path was computed (requires Supabase)
        learning_path = response.get('learning_path')
        print(f"   {'✓' if learning_path else '✗'} Learning path computed: {learning_path is not None}")
        
        if learning_path:
            decision = learning_path.get('decision', 'N/A')
            recommended_concept = learning_path.get('recommended_concept', 'N/A')
            print(f"      - Decision: {decision}")
            print(f"      - Recommended concept: {recommended_concept}")
        else:
            print(
                "   ⚠️  WARNING: Learning path not computed - "
                "Supabase may not be working!"
            )

        # Summary
        print("\n" + "="*70)
        print("  SUPABASE USAGE SUMMARY")
        print("="*70)
        
        supabase_features_used = []
        if concepts or concept_ids:
            supabase_features_used.append("Concept Retrieval")
        if mastery_updates:
            supabase_features_used.append("Mastery Updates")
        if readiness:
            supabase_features_used.append("Readiness Computation")
        if learning_path:
            supabase_features_used.append("Learning Path")
        
        if supabase_features_used:
            print(f"\n✓ Supabase IS being used for:")
            for feature in supabase_features_used:
                print(f"   - {feature}")
            print("\n✓ AI Tutor is successfully connecting to Supabase!")
            return True
        else:
            print("\n✗ WARNING: No Supabase features were used!")
            print("   This could mean:")
            print("   1. Supabase queries are failing silently")
            print("   2. Supabase client is None during operation")
            print("   3. All queries are returning empty results")
            return False
        
    except Exception as e:
        print(f"\n✗ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_ai_tutor_supabase_usage()
    print("\n" + "="*70)
    if success:
        print("  ✓ TEST PASSED - Supabase is being used")
    else:
        print("  ✗ TEST FAILED - Supabase may not be working")
    print("="*70 + "\n")

