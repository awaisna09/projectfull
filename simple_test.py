import os
import requests
from dotenv import load_dotenv

print("🔧 Testing Configuration and Network...")

# Load environment
load_dotenv('config.env')
openai_key = os.getenv('OPENAI_API_KEY')
print(f"OpenAI Key: {'✅ Set' if openai_key else '❌ Missing'}")

# Test basic connectivity
try:
    response = requests.get('http://localhost:8000', timeout=5)
    print(f"Backend: ✅ HTTP {response.status_code}")
except Exception as e:
    print(f"Backend: ❌ {e}")

# Test health endpoint
try:
    response = requests.get('http://localhost:8000/tutor/health', timeout=10)
    print(f"Health: ✅ HTTP {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Status: {data.get('status', 'Unknown')}")
except Exception as e:
    print(f"Health: ❌ {e}")
