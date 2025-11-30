#!/usr/bin/env python3
"""
Test Supabase connection for AI Tutor Agent
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('config.env')

def test_supabase_connection():
    """Test Supabase connection"""
    print("="*70)
    print("  SUPABASE CONNECTION TEST")
    print("="*70)
    
    # Check environment variables
    print("\n1. Checking Environment Variables:")
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_anon_key = os.getenv("SUPABASE_ANON_KEY")
    supabase_service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    print(f"   SUPABASE_URL: {'✓ Set' if supabase_url else '✗ Missing'}")
    if supabase_url:
        print(f"      Value: {supabase_url[:30]}...")
    
    print(f"   SUPABASE_ANON_KEY: {'✓ Set' if supabase_anon_key else '✗ Missing'}")
    if supabase_anon_key:
        print(f"      Value: {supabase_anon_key[:30]}...")
    
    print(f"   SUPABASE_SERVICE_ROLE_KEY: {'✓ Set' if supabase_service_key else '✗ Missing'}")
    if supabase_service_key:
        print(f"      Value: {supabase_service_key[:30]}...")
    
    if not supabase_url:
        print("\n✗ ERROR: SUPABASE_URL not found in config.env")
        return False
    
    if not supabase_anon_key and not supabase_service_key:
        print("\n✗ ERROR: Neither SUPABASE_ANON_KEY nor SUPABASE_SERVICE_ROLE_KEY found")
        return False
    
    # Try to import and create client
    print("\n2. Testing Supabase Client Import:")
    try:
        from supabase import create_client
        print("   ✓ Supabase Python client imported successfully")
    except ImportError as e:
        print(f"   ✗ ERROR: Failed to import supabase: {e}")
        print("   Install with: pip install supabase")
        return False
    
    # Create client
    print("\n3. Creating Supabase Client:")
    try:
        supabase_key = supabase_service_key or supabase_anon_key
        supabase_client = create_client(supabase_url, supabase_key)
        print("   ✓ Supabase client created")
    except Exception as e:
        print(f"   ✗ ERROR: Failed to create client: {e}")
        return False
    
    # Test connection with a simple query
    print("\n4. Testing Database Connection:")
    try:
        # Try to query a simple table (topics table should exist)
        response = supabase_client.table("topics").select("topic_id, title").limit(1).execute()
        print(f"   ✓ Connection successful!")
        print(f"   ✓ Query executed successfully")
        if response.data:
            print(f"   ✓ Found {len(response.data)} row(s)")
            print(f"   Sample data: {response.data[0]}")
        else:
            print("   ⚠️  No data returned (table might be empty)")
        return True
    except Exception as e:
        print(f"   ✗ ERROR: Database query failed: {e}")
        print(f"   Error type: {type(e).__name__}")
        
        # Try alternative query
        print("\n5. Trying Alternative Query (subjects table):")
        try:
            response = supabase_client.table("subjects").select("subject_id, subject_name").limit(1).execute()
            print(f"   ✓ Alternative query successful!")
            return True
        except Exception as e2:
            print(f"   ✗ Alternative query also failed: {e2}")
            return False

def test_specific_tables():
    """Test specific tables used by AI Tutor"""
    print("\n" + "="*70)
    print("  TESTING AI TUTOR SPECIFIC TABLES")
    print("="*70)
    
    from dotenv import load_dotenv
    import os
    load_dotenv('config.env')
    
    try:
        from supabase import create_client
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_ANON_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_key:
            print("✗ Supabase credentials not configured")
            return
        
        supabase_client = create_client(supabase_url, supabase_key)
        
        tables_to_test = [
            "topics",
            "concepts",
            "lessons",
            "tutor_messages",
            "student_mastery"
        ]
        
        for table in tables_to_test:
            try:
                response = supabase_client.table(table).select("*").limit(1).execute()
                print(f"✓ {table}: Accessible ({len(response.data)} rows)")
            except Exception as e:
                print(f"✗ {table}: Error - {str(e)[:100]}")
    
    except Exception as e:
        print(f"✗ Error testing tables: {e}")

if __name__ == "__main__":
    success = test_supabase_connection()
    if success:
        test_specific_tables()
    
    print("\n" + "="*70)
    if success:
        print("  ✓ SUPABASE CONNECTION TEST PASSED")
    else:
        print("  ✗ SUPABASE CONNECTION TEST FAILED")
    print("="*70 + "\n")

