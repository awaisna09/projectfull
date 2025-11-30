#!/usr/bin/env python3
"""
Verify if mock exam tables exist, and provide setup instructions if they don't
"""

import os
from dotenv import load_dotenv

load_dotenv("config.env")

def check_tables():
    """Check if all required tables exist."""
    try:
        from supabase import create_client
        
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")
        
        if not supabase_url or not supabase_key:
            print("❌ Supabase credentials not found")
            return False
        
        supabase = create_client(supabase_url, supabase_key)
        
        tables_to_check = [
            "exam_attempts",
            "exam_question_results",
            "student_mastery",
            "student_weaknesses",
            "student_readiness"
        ]
        
        print("="*70)
        print("  CHECKING MOCK EXAM TABLES")
        print("="*70)
        
        missing_tables = []
        
        for table in tables_to_check:
            try:
                # Try to select from the table
                result = supabase.table(table).select("*").limit(1).execute()
                print(f"✅ {table}: EXISTS ({len(result.data)} rows)")
            except Exception as e:
                error_msg = str(e)
                if "does not exist" in error_msg or "PGRST" in error_msg or "column" in error_msg.lower():
                    print(f"❌ {table}: DOES NOT EXIST or has schema issues")
                    print(f"   Error: {error_msg[:100]}")
                    missing_tables.append(table)
                else:
                    print(f"⚠️  {table}: Error checking - {error_msg[:100]}")
        
        if missing_tables:
            print("\n" + "="*70)
            print("  SETUP REQUIRED")
            print("="*70)
            print("\nThe following tables are missing or have issues:")
            for table in missing_tables:
                print(f"  - {table}")
            
            print("\n📋 To create these tables, run this SQL script in Supabase:")
            print("   File: supabase/create_mock_exam_tables.sql")
            print("\n   Steps:")
            print("   1. Open Supabase Dashboard")
            print("   2. Go to SQL Editor")
            print("   3. Copy and paste the contents of supabase/create_mock_exam_tables.sql")
            print("   4. Run the script")
            print("   5. Then run the test again: python test_mock_exam_table_updates.py")
            
            return False
        else:
            print("\n✅ All tables exist!")
            return True
            
    except Exception as e:
        print(f"❌ Error checking tables: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    check_tables()

