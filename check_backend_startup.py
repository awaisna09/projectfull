#!/usr/bin/env python3
"""Check if backend can start"""
import subprocess
import sys
import time

print("Starting backend to check for errors...")
try:
    process = subprocess.Popen(
        [sys.executable, "start_unified_backend.py"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    # Wait a moment
    time.sleep(3)
    
    # Check if still running
    if process.poll() is None:
        print("✅ Backend process is running")
        print("   Check http://localhost:8000/health")
    else:
        print("❌ Backend process exited")
        stdout, stderr = process.communicate()
        print("STDOUT:", stdout[:500])
        print("STDERR:", stderr[:500])
        
except Exception as e:
    print(f"❌ Error: {e}")

