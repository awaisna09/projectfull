#!/usr/bin/env python3
"""
Diagnose Supabase connection in AI Tutor Agent
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv('config.env')

def check_supabase_initialization():
    """Check if Supabase is initialized in langgraph_tutor"""
    print("="*70)
    print("  DIAGNOSING SUPABASE CONNECTION IN AI TUTOR")
    print("="*70)
    
    # Check 1: Environment variables
    print("\n1. Checking Environment Variables:")
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_anon_key = os.getenv("SUPABASE_ANON_KEY")
    supabase_service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if supabase_url:
        print(f"   ✓ SUPABASE_URL: {supabase_url[:40]}...")
    else:
        print("   ✗ SUPABASE_URL: Missing")
        return False
    
    if supabase_anon_key:
        print(f"   ✓ SUPABASE_ANON_KEY: Set ({len(supabase_anon_key)} chars)")
    else:
        print("   ✗ SUPABASE_ANON_KEY: Missing")
    
    if supabase_service_key:
        print(f"   ✓ SUPABASE_SERVICE_ROLE_KEY: Set ({len(supabase_service_key)} chars)")
    else:
        print("   ⚠️  SUPABASE_SERVICE_ROLE_KEY: Not set (using ANON_KEY)")
    
    # Check 2: Import and test Supabase client creation
    print("\n2. Testing Supabase Client Creation:")
    try:
        from supabase import create_client
        supabase_key = supabase_service_key or supabase_anon_key
        if not supabase_key:
            print("   ✗ No Supabase key available")
            return False
        
        test_client = create_client(supabase_url, supabase_key)
        print("   ✓ Supabase client created successfully")
    except Exception as e:
        print(f"   ✗ Failed to create client: {e}")
        return False
    
    # Check 3: Import langgraph_tutor and check supabase_client
    print("\n3. Checking langgraph_tutor.py Supabase Client:")
    try:
        # Import the module
        import langgraph_tutor
        
        # Check if supabase_client is defined
        if hasattr(langgraph_tutor, 'supabase_client'):
            client = langgraph_tutor.supabase_client
            if client is None:
                print("   ✗ supabase_client is None in langgraph_tutor")
                print("   → This means Supabase is NOT connected!")
                return False
            else:
                print("   ✓ supabase_client is initialized in langgraph_tutor")
        else:
            print("   ✗ supabase_client not found in langgraph_tutor module")
            return False
    except Exception as e:
        print(f"   ✗ Error importing langgraph_tutor: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # Check 4: Test actual query with langgraph_tutor's client
    print("\n4. Testing Query with langgraph_tutor's Supabase Client:")
    try:
        response = client.table("topics").select("topic_id").limit(1).execute()
        print(f"   ✓ Query successful - found {len(response.data)} row(s)")
    except Exception as e:
        print(f"   ✗ Query failed: {e}")
        return False
    
    # Check 5: Verify AITutorAgent receives the client
    print("\n5. Checking AITutorAgent Initialization:")
    try:
        from agents.ai_tutor_agent import AITutorAgent
        
        # Check if agent is initialized in langgraph_tutor
        if hasattr(langgraph_tutor, 'agent'):
            agent = langgraph_tutor.agent
            if hasattr(agent, 'supabase'):
                if agent.supabase is None:
                    print("   ✗ AITutorAgent.supabase is None")
                    print("   → Supabase client not passed to agent!")
                    return False
                else:
                    print("   ✓ AITutorAgent has supabase client")
            else:
                print("   ⚠️  AITutorAgent doesn't have supabase attribute")
        else:
            print("   ⚠️  agent not found in langgraph_tutor (may not be initialized yet)")
    except Exception as e:
        print(f"   ✗ Error checking AITutorAgent: {e}")
        import traceback
        traceback.print_exc()
    
    # Check 6: Test ConceptAgent specifically
    print("\n6. Checking ConceptAgent Supabase Connection:")
    try:
        if hasattr(langgraph_tutor, 'agent'):
            agent = langgraph_tutor.agent
            services = agent.build_services()
            concept_service = services.get("concepts")
            if concept_service and hasattr(concept_service, 'concept_agent'):
                concept_agent = concept_service.concept_agent
                if hasattr(concept_agent, 'supabase'):
                    if concept_agent.supabase is None:
                        print("   ✗ ConceptAgent.supabase is None")
                        print("   → Concept retrieval will fail!")
                        return False
                    else:
                        print("   ✓ ConceptAgent has supabase client")
                        
                        # Test a simple query
                        try:
                            test_response = concept_agent.supabase.table("concepts").select("concept_id").limit(1).execute()
                            print(f"   ✓ ConceptAgent can query concepts table ({len(test_response.data)} rows)")
                        except Exception as e:
                            print(f"   ✗ ConceptAgent query failed: {e}")
                            return False
                else:
                    print("   ✗ ConceptAgent doesn't have supabase attribute")
                    return False
            else:
                print("   ⚠️  ConceptService not found")
        else:
            print("   ⚠️  Agent not initialized yet")
    except Exception as e:
        print(f"   ✗ Error checking ConceptAgent: {e}")
        import traceback
        traceback.print_exc()
    
    return True

if __name__ == "__main__":
    success = check_supabase_initialization()
    print("\n" + "="*70)
    if success:
        print("  ✓ SUPABASE CONNECTION DIAGNOSIS PASSED")
        print("  → AI Tutor should be able to connect to Supabase")
    else:
        print("  ✗ SUPABASE CONNECTION DIAGNOSIS FAILED")
        print("  → AI Tutor is NOT connecting to Supabase")
    print("="*70 + "\n")

