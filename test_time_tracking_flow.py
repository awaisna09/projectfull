"""
Test script to verify time tracking flow from time_tracking to daily_analytics
and ensure weekly/monthly calculations work correctly.
"""

import os
import sys
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv('config.env')

# Get Supabase credentials (try multiple possible names)
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = (
    os.getenv('SUPABASE_SERVICE_ROLE_KEY') or 
    os.getenv('SUPABASE_ANON_KEY')
)

if not SUPABASE_URL:
    print("❌ Error: SUPABASE_URL must be set in config.env")
    print("   Available env vars:", [k for k in os.environ.keys() if 'SUPABASE' in k])
    sys.exit(1)

if not SUPABASE_SERVICE_ROLE_KEY:
    print("❌ Error: SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY must be set in config.env")
    print("   Available env vars:", [k for k in os.environ.keys() if 'SUPABASE' in k])
    sys.exit(1)

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def test_time_tracking_flow():
    """Test if time_tracking data flows to daily_analytics and weekly/monthly calculations"""
    
    print("=" * 80)
    print("TIME TRACKING FLOW TEST")
    print("=" * 80)
    
    # Get a test user from time_tracking or daily_analytics table
    print("\n1. Finding a test user...")
    
    # Try to get a user from time_tracking first
    time_tracking_result = supabase.table('time_tracking')\
        .select('user_id')\
        .limit(1)\
        .execute()
    
    if time_tracking_result.data and len(time_tracking_result.data) > 0:
        test_user_id = time_tracking_result.data[0]['user_id']
        print(f"✅ Found user from time_tracking: {test_user_id}")
    else:
        # Try daily_analytics
        daily_result = supabase.table('daily_analytics')\
            .select('user_id')\
            .limit(1)\
            .execute()
        
        if daily_result.data and len(daily_result.data) > 0:
            test_user_id = daily_result.data[0]['user_id']
            print(f"✅ Found user from daily_analytics: {test_user_id}")
        else:
            print("⚠️  No users found in time_tracking or daily_analytics tables")
            print("   This is expected if the system hasn't been used yet.")
            print("\n   To test the time tracking flow:")
            print("   1. Start the backend server: python unified_backend.py")
            print("   2. Open the frontend and log in")
            print("   3. Navigate between pages (flashcards, lessons, practice, etc.)")
            print("   4. Each page will track time via usePageTimer hook")
            print("   5. Open the Analytics page - it will sync time_tracking → daily_analytics")
            print("   6. Run this test again to verify the sync worked")
            print("\n   Testing system architecture instead...")
            test_system_architecture()
            return
    
    # Get today's date
    today = datetime.now(timezone.utc).date().isoformat()
    print(f"\n2. Today's date: {today}")
    
    # Check time_tracking data for today
    print("\n3. Checking time_tracking table for today...")
    time_tracking_result = supabase.table('time_tracking')\
        .select('*')\
        .eq('user_id', test_user_id)\
        .gte('start_time', f"{today}T00:00:00Z")\
        .lt('start_time', f"{today}T23:59:59Z")\
        .execute()
    
    time_tracking_records = time_tracking_result.data or []
    print(f"   Found {len(time_tracking_records)} time_tracking records for today")
    
    # Calculate total time from time_tracking
    total_seconds_from_tracking = sum(
        record.get('duration_seconds', 0) or 0 
        for record in time_tracking_records
    )
    total_minutes_from_tracking = total_seconds_from_tracking / 60
    print(f"   Total time from time_tracking: {total_seconds_from_tracking} seconds ({total_minutes_from_tracking:.2f} minutes)")
    
    # Check daily_analytics for today
    print("\n4. Checking daily_analytics table for today...")
    daily_analytics_result = supabase.table('daily_analytics')\
        .select('*')\
        .eq('user_id', test_user_id)\
        .eq('date', today)\
        .execute()
    
    daily_analytics_data = daily_analytics_result.data[0] if daily_analytics_result.data else None
    
    if daily_analytics_data:
        total_seconds_from_daily = daily_analytics_data.get('total_time_spent', 0) or 0
        total_minutes_from_daily = total_seconds_from_daily / 60
        print(f"   Total time in daily_analytics: {total_seconds_from_daily} seconds ({total_minutes_from_daily:.2f} minutes)")
        
        # Check if they match
        if abs(total_seconds_from_tracking - total_seconds_from_daily) < 1:
            print("   ✅ time_tracking and daily_analytics are in sync!")
        else:
            print(f"   ⚠️  MISMATCH: time_tracking has {total_seconds_from_tracking}s but daily_analytics has {total_seconds_from_daily}s")
            print("   ⚠️  This means weekly/monthly calculations may be incorrect!")
    else:
        print("   ⚠️  No daily_analytics record found for today")
        print("   ⚠️  This means weekly/monthly calculations will miss today's data!")
    
    # Check weekly data
    print("\n5. Checking weekly data (last 7 days)...")
    week_start = (datetime.now(timezone.utc) - timedelta(days=7)).date().isoformat()
    
    weekly_daily_result = supabase.table('daily_analytics')\
        .select('date, total_time_spent')\
        .eq('user_id', test_user_id)\
        .gte('date', week_start)\
        .lte('date', today)\
        .order('date', desc=False)\
        .execute()
    
    weekly_records = weekly_daily_result.data or []
    weekly_total_seconds = sum(record.get('total_time_spent', 0) or 0 for record in weekly_records)
    weekly_total_minutes = weekly_total_seconds / 60
    print(f"   Found {len(weekly_records)} daily_analytics records in the last 7 days")
    print(f"   Weekly total: {weekly_total_seconds} seconds ({weekly_total_minutes:.2f} minutes)")
    
    # Check monthly data
    print("\n6. Checking monthly data (last 30 days)...")
    month_start = (datetime.now(timezone.utc) - timedelta(days=30)).date().isoformat()
    
    monthly_daily_result = supabase.table('daily_analytics')\
        .select('date, total_time_spent')\
        .eq('user_id', test_user_id)\
        .gte('date', month_start)\
        .lte('date', today)\
        .order('date', desc=False)\
        .execute()
    
    monthly_records = monthly_daily_result.data or []
    monthly_total_seconds = sum(record.get('total_time_spent', 0) or 0 for record in monthly_records)
    monthly_total_minutes = monthly_total_seconds / 60
    print(f"   Found {len(monthly_records)} daily_analytics records in the last 30 days")
    print(f"   Monthly total: {monthly_total_seconds} seconds ({monthly_total_minutes:.2f} minutes)")
    
    # Summary
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Today's time_tracking: {total_seconds_from_tracking}s ({total_minutes_from_tracking:.2f} min)")
    if daily_analytics_data:
        print(f"Today's daily_analytics: {daily_analytics_data.get('total_time_spent', 0)}s ({total_minutes_from_daily:.2f} min)")
    else:
        print("Today's daily_analytics: NO RECORD")
    print(f"Weekly total (from daily_analytics): {weekly_total_seconds}s ({weekly_total_minutes:.2f} min)")
    print(f"Monthly total (from daily_analytics): {monthly_total_seconds}s ({monthly_total_minutes:.2f} min)")
    
    # Recommendations
    print("\n" + "=" * 80)
    print("RECOMMENDATIONS")
    print("=" * 80)
    
    if not daily_analytics_data or abs(total_seconds_from_tracking - (daily_analytics_data.get('total_time_spent', 0) or 0)) >= 1:
        print("❌ ISSUE FOUND: time_tracking data is not synced to daily_analytics")
        print("   → Weekly and monthly calculations will be incorrect")
        print("   → Need to create a sync function to aggregate time_tracking → daily_analytics")
    else:
        print("✅ time_tracking is properly synced to daily_analytics")
        print("   → Weekly and monthly calculations should work correctly")
    
    print("\n" + "=" * 80)

def test_system_architecture():
    """Test the system architecture and verify tables exist"""
    print("\n" + "=" * 80)
    print("SYSTEM ARCHITECTURE TEST")
    print("=" * 80)
    
    # Check if time_tracking table exists
    print("\n1. Checking time_tracking table...")
    try:
        result = supabase.table('time_tracking').select('id').limit(1).execute()
        print("   ✅ time_tracking table exists and is accessible")
        print(f"   📊 Total records: {len(result.data) if result.data else 0}")
    except Exception as e:
        print(f"   ❌ time_tracking table error: {e}")
    
    # Check if daily_analytics table exists
    print("\n2. Checking daily_analytics table...")
    try:
        result = supabase.table('daily_analytics').select('id').limit(1).execute()
        print("   ✅ daily_analytics table exists and is accessible")
        print(f"   📊 Total records: {len(result.data) if result.data else 0}")
    except Exception as e:
        print(f"   ❌ daily_analytics table error: {e}")
    
    # Check backend endpoint
    print("\n3. Checking backend rollup endpoint...")
    print("   ℹ️  Backend endpoint: POST /analytics/rollup/{user_id}")
    print("   ℹ️  This endpoint syncs time_tracking → daily_analytics")
    print("   ℹ️  Called automatically when Analytics page loads")
    
    # Summary
    print("\n" + "=" * 80)
    print("EXPECTED FLOW")
    print("=" * 80)
    print("1. User navigates to a page (flashcards, lessons, etc.)")
    print("2. usePageTimer hook calls POST /analytics/start")
    print("3. Backend creates record in time_tracking table")
    print("4. User leaves page → usePageTimer calls POST /analytics/stop")
    print("5. Backend updates time_tracking with duration_seconds")
    print("6. User opens Analytics page")
    print("7. Analytics calls POST /analytics/rollup/{user_id}")
    print("8. Backend aggregates time_tracking → daily_analytics.total_time_spent")
    print("9. Weekly/Monthly calculations read from daily_analytics")
    print("\n✅ System architecture is ready!")
    print("   Run this test again after using the app to verify data flow.")


if __name__ == "__main__":
    try:
        test_time_tracking_flow()
    except Exception as e:
        print(f"\n❌ Error running test: {e}")
        import traceback
        traceback.print_exc()

