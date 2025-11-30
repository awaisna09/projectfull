#!/usr/bin/env python3
"""
Check the actual schema of mock exam tables in the database
"""

import os
from dotenv import load_dotenv

load_dotenv("config.env")

def check_table_schema():
    """Check actual table schema using information_schema."""
    try:
        from supabase import create_client
        
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")
        
        if not supabase_url or not supabase_key:
            print("❌ Supabase credentials not found")
            return
        
        supabase = create_client(supabase_url, supabase_key)
        
        tables = [
            "exam_attempts",
            "exam_question_results",
            "student_mastery",
            "student_weaknesses",
            "student_readiness"
        ]
        
        print("="*70)
        print("  ACTUAL TABLE SCHEMAS IN DATABASE")
        print("="*70)
        
        for table in tables:
            print(f"\n📋 {table}:")
            try:
                # Try to get column info using RPC or direct query
                # First, try to insert a dummy record to see what columns are expected
                # Or better: query information_schema
                result = supabase.rpc(
                    "get_table_columns",
                    {"table_name": table}
                ).execute()
                print(f"   Columns: {result.data}")
            except:
                # Alternative: Try to select with limit 0 to see structure
                try:
                    # Try selecting all columns
                    result = supabase.table(table).select("*").limit(0).execute()
                    print(f"   ✅ Table exists")
                except Exception as e:
                    error_msg = str(e)
                    # Try to parse column names from error or try inserting empty
                    print(f"   Error: {error_msg[:200]}")
                    
                    # Try to get one row to see structure
                    try:
                        result = supabase.table(table).select("*").limit(1).execute()
                        if result.data:
                            print(f"   Sample columns: {list(result.data[0].keys())}")
                    except:
                        pass
                        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    check_table_schema()

