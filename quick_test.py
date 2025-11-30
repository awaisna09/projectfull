import requests
import time

print("🔍 Quick Backend Health Check")
print("=" * 40)

# Wait a moment for server to start
print("⏳ Waiting for server to start...")
time.sleep(3)

try:
    # Test health endpoint
    print("🔍 Testing health endpoint...")
    response = requests.get('http://localhost:8000/tutor/health', timeout=10)
    print(f"✅ Health endpoint: HTTP {response.status_code}")
    print(f"📊 Response: {response.json()}")
    
    # Test root endpoint
    print("\n🔍 Testing root endpoint...")
    response = requests.get('http://localhost:8000/', timeout=10)
    print(f"✅ Root endpoint: HTTP {response.status_code}")
    print(f"📊 Response: {response.json()}")
    
    print("\n🎉 Backend is working correctly!")
    
except requests.exceptions.ConnectionError:
    print("❌ Connection Error: Backend server is not running or not accessible")
    print("💡 Please check if the server started successfully")
    
except requests.exceptions.Timeout:
    print("⏰ Timeout Error: Backend is taking too long to respond")
    print("💡 Server might be starting up or overloaded")
    
except Exception as e:
    print(f"❌ Unexpected error: {e}")
    print("💡 Please check the server logs for more details")

print("\n" + "=" * 40)
