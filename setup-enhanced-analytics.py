#!/usr/bin/env python3
"""
Enhanced Analytics Setup Script
This script sets up the daily analytics table and related functions for the Imtehaan AI EdTech Platform.
"""

import os
import sys
import subprocess
from pathlib import Path

def run_sql_file(sql_file_path):
    """Run a SQL file using psql"""
    try:
        # Check if file exists
        if not os.path.exists(sql_file_path):
            print(f"❌ SQL file not found: {sql_file_path}")
            return False
        
        print(f"🔧 Running SQL file: {sql_file_path}")
        
        # Try to run with psql if available
        try:
            result = subprocess.run([
                'psql', 
                '-h', 'localhost',
                '-U', 'postgres',
                '-d', 'postgres',
                '-f', sql_file_path
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                print(f"✅ Successfully executed: {sql_file_path}")
                return True
            else:
                print(f"⚠️ psql execution failed: {result.stderr}")
                print(f"📋 You can manually run this SQL file: {sql_file_path}")
                return False
                
        except FileNotFoundError:
            print(f"⚠️ psql not found. Please manually run this SQL file: {sql_file_path}")
            return False
            
    except Exception as e:
        print(f"❌ Error running SQL file {sql_file_path}: {e}")
        return False

def main():
    """Main setup function"""
    print("🚀 Enhanced Analytics Setup for Imtehaan AI EdTech Platform")
    print("=" * 60)
    
    # Get the current directory
    current_dir = Path(__file__).parent
    print(f"📁 Working directory: {current_dir}")
    
    # List of SQL files to run in order
    sql_files = [
        "create-daily-analytics-table.sql",
        "create-learning-activities-table.sql"
    ]
    
    print("\n📋 SQL files to execute:")
    for i, file in enumerate(sql_files, 1):
        print(f"  {i}. {file}")
    
    print("\n🔧 Starting database setup...")
    
    success_count = 0
    for sql_file in sql_files:
        sql_path = current_dir / sql_file
        if run_sql_file(sql_path):
            success_count += 1
        print()
    
    print("=" * 60)
    print(f"📊 Setup Summary:")
    print(f"  ✅ Successful: {success_count}")
    print(f"  ❌ Failed: {len(sql_files) - success_count}")
    
    if success_count == len(sql_files):
        print("\n🎉 Enhanced Analytics setup completed successfully!")
        print("\n📋 What was created:")
        print("  • daily_analytics table for daily progress tracking")
        print("  • learning_activities table for activity tracking")
        print("  • study_sessions table for session management")
        print("  • user_analytics_summary view for analytics")
        print("  • Functions and triggers for automatic tracking")
        print("  • Row Level Security policies")
        
        print("\n🚀 Next steps:")
        print("  1. Restart your backend server")
        print("  2. The analytics page will now show real-time daily data")
        print("  3. All platform activities will be automatically tracked")
        print("  4. Daily analytics will reset automatically at midnight")
        
    else:
        print("\n⚠️ Some setup steps failed. Please check the errors above.")
        print("📋 Manual setup instructions:")
        print("  1. Run the SQL files manually in your database")
        print("  2. Ensure you have the necessary permissions")
        print("  3. Check that all tables and functions are created")
    
    print("\n📚 For more information, check the README files in your project.")

if __name__ == "__main__":
    main()


















