import os
from dotenv import load_dotenv

print("🔧 Testing Configuration Loading...")
print("=" * 50)

# Test 1: Load environment variables
print("1️⃣ Loading config.env...")
load_dotenv('config.env')

# Test 2: Check OpenAI API Key
openai_key = os.getenv("OPENAI_API_KEY")
print(f"2️⃣ OpenAI API Key: {'✅ Set' if openai_key else '❌ Missing'}")
if openai_key:
    print(f"   Format: {openai_key[:20]}...{openai_key[-4:]}")

# Test 3: Check LangSmith API Key
langsmith_key = os.getenv("LANGSMITH_API_KEY")
print(f"3️⃣ LangSmith API Key: {'✅ Set' if langsmith_key else '❌ Missing'}")
if langsmith_key:
    print(f"   Format: {langsmith_key[:20]}...{langsmith_key[-4:]}")

# Test 4: Check LangSmith Project
langsmith_project = os.getenv("LANGSMITH_PROJECT")
print(f"4️⃣ LangSmith Project: {langsmith_project}")

# Test 5: Check LangSmith Endpoint
langsmith_endpoint = os.getenv("LANGSMITH_ENDPOINT")
print(f"5️⃣ LangSmith Endpoint: {langsmith_endpoint}")

# Test 6: Check LangSmith Tracing
langsmith_tracing = os.getenv("LANGSMITH_TRACING")
print(f"6️⃣ LangSmith Tracing: {langsmith_tracing}")

# Test 7: Check Server Config
host = os.getenv("HOST")
port = os.getenv("PORT")
print(f"7️⃣ Server Config: {host}:{port}")

print("\n" + "=" * 50)
print("📊 CONFIGURATION SUMMARY")
print("=" * 50)

if openai_key and langsmith_key:
    print("✅ All required API keys are set")
else:
    print("❌ Missing required API keys")
    if not openai_key:
        print("   - OPENAI_API_KEY is missing")
    if not langsmith_key:
        print("   - LANGSMITH_API_KEY is missing")

if langsmith_project == "imtehaan-ai-tutor":
    print("✅ LangSmith project name is correct")
else:
    print(f"❌ LangSmith project name mismatch: expected 'imtehaan-ai-tutor', got '{langsmith_project}'")

print("\n💡 Next Steps:")
print("1. If all keys are set, try running: python simple_ai_tutor_clean.py")
print("2. Check the console output for any error messages")
print("3. Verify the health endpoint: http://localhost:8000/tutor/health")
