#!/usr/bin/env python3
"""
Backend Diagnostic Script
Checks network connectivity and configuration issues
"""

import os
import sys
import time
import requests
from dotenv import load_dotenv

def check_environment():
    """Check environment configuration"""
    print("🔧 Checking Environment Configuration...")
    
    # Load environment variables
    load_dotenv('config.env')
    
    # Check required variables
    openai_key = os.getenv('OPENAI_API_KEY')
    langsmith_key = os.getenv('LANGSMITH_API_KEY')
    
    print(f"✅ OpenAI API Key: {'Set' if openai_key else 'Missing'}")
    if openai_key:
        print(f"   Format: {openai_key[:20]}...{openai_key[-4:]}")
    
    print(f"✅ LangSmith API Key: {'Set' if langsmith_key else 'Missing'}")
    if langsmith_key:
        print(f"   Format: {langsmith_key[:20]}...{langsmith_key[-4:]}")
    
    return bool(openai_key)

def check_network_connectivity():
    """Check network connectivity to localhost"""
    print("\n🌐 Checking Network Connectivity...")
    
    try:
        # Test localhost connectivity
        response = requests.get('http://localhost:8000', timeout=5)
        print(f"✅ Localhost connectivity: HTTP {response.status_code}")
        return True
    except requests.exceptions.ConnectionError:
        print("❌ Connection refused - Backend not running or port blocked")
        return False
    except requests.exceptions.Timeout:
        print("⏰ Connection timeout - Backend responding slowly")
        return False
    except Exception as e:
        print(f"❌ Network error: {e}")
        return False

def check_backend_endpoints():
    """Check specific backend endpoints"""
    print("\n🔍 Checking Backend Endpoints...")
    
    endpoints = [
        '/tutor/health',
        '/tutor/topics',
        '/docs'
    ]
    
    working_endpoints = 0
    
    for endpoint in endpoints:
        try:
            start_time = time.time()
            response = requests.get(f'http://localhost:8000{endpoint}', timeout=10)
            response_time = (time.time() - start_time) * 1000
            
            if response.status_code == 200:
                print(f"✅ {endpoint}: HTTP 200 ({response_time:.2f}ms)")
                working_endpoints += 1
            else:
                print(f"⚠️  {endpoint}: HTTP {response.status_code}")
                
        except requests.exceptions.Timeout:
            print(f"⏰ {endpoint}: Timeout")
        except Exception as e:
            print(f"❌ {endpoint}: Error - {e}")
    
    return working_endpoints, len(endpoints)

def test_openai_connection():
    """Test OpenAI API connectivity"""
    print("\n🤖 Testing OpenAI API Connection...")
    
    try:
        # Test with a simple request
        test_payload = {
            "message": "Hello",
            "topic": "Test",
            "user_id": "diagnostic_user",
            "learning_level": "beginner"
        }
        
        start_time = time.time()
        response = requests.post(
            'http://localhost:8000/tutor/chat',
            json=test_payload,
            timeout=30
        )
        response_time = (time.time() - start_time) * 1000
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ OpenAI API working: {response_time:.2f}ms")
            print(f"   Response length: {len(data.get('response', ''))} chars")
            return True
        else:
            print(f"❌ OpenAI API error: HTTP {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("⏰ OpenAI API timeout - Service responding slowly")
        return False
    except Exception as e:
        print(f"❌ OpenAI API error: {e}")
        return False

def check_firewall_and_ports():
    """Check for firewall and port issues"""
    print("\n🛡️  Checking Firewall and Ports...")
    
    import subprocess
    
    try:
        # Check if port 8000 is listening
        result = subprocess.run(
            ['netstat', '-an'], 
            capture_output=True, 
            text=True, 
            timeout=10
        )
        
        if ':8000' in result.stdout:
            print("✅ Port 8000 is listening")
            
            # Check for multiple listeners
            lines = [line for line in result.stdout.split('\n') if ':8000' in line]
            listening_lines = [line for line in lines if 'LISTENING' in line]
            
            if len(listening_lines) > 1:
                print(f"⚠️  Multiple listeners on port 8000: {len(listening_lines)}")
                for line in listening_lines:
                    print(f"   {line.strip()}")
            else:
                print("✅ Single listener on port 8000")
        else:
            print("❌ Port 8000 not listening")
            
    except Exception as e:
        print(f"❌ Could not check ports: {e}")

def main():
    """Main diagnostic function"""
    print("🏥 Imtehaan AI EdTech Platform - Backend Diagnostics")
    print("=" * 60)
    
    # Check environment
    env_ok = check_environment()
    
    # Check network
    network_ok = check_network_connectivity()
    
    # Check endpoints
    working_endpoints, total_endpoints = check_backend_endpoints()
    
    # Check OpenAI
    openai_ok = test_openai_connection()
    
    # Check firewall/ports
    check_firewall_and_ports()
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 DIAGNOSTIC SUMMARY")
    print("=" * 60)
    
    print(f"🔧 Environment: {'✅ OK' if env_ok else '❌ Issues'}")
    print(f"🌐 Network: {'✅ OK' if network_ok else '❌ Issues'}")
    print(f"🔍 Endpoints: {working_endpoints}/{total_endpoints} working")
    print(f"🤖 OpenAI: {'✅ OK' if openai_ok else '❌ Issues'}")
    
    # Recommendations
    print("\n💡 RECOMMENDATIONS:")
    
    if not env_ok:
        print("   - Check config.env file for missing API keys")
    
    if not network_ok:
        print("   - Ensure backend server is running")
        print("   - Check if port 8000 is available")
    
    if working_endpoints < total_endpoints:
        print("   - Backend is running but some endpoints are failing")
        print("   - Check backend logs for error messages")
    
    if not openai_ok:
        print("   - OpenAI API integration has issues")
        print("   - Check API key validity and rate limits")
        print("   - Verify network connectivity to OpenAI")

if __name__ == "__main__":
    main()
