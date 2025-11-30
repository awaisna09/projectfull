#!/usr/bin/env python3
"""
Simple test script to verify LangChain setup
"""

from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
import os

def test_langchain_setup():
    """Test basic LangChain functionality"""
    
    # Load environment variables (use unified config)
    load_dotenv('config.env')
    
    # Check if API key is available
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("❌ Error: OPENAI_API_KEY not found in config.env")
        return False
    
    # Check LangSmith configuration
    langsmith_tracing = os.getenv('LANGSMITH_TRACING', 'false').lower() == 'true'
    langsmith_key = os.getenv('LANGSMITH_API_KEY')
    
    print("🔧 Testing LangChain Setup...")
    print(f"📝 OpenAI API Key: {'✅ Found' if api_key else '❌ Missing'}")
    print(f"🔍 LangSmith Tracing: {'✅ Enabled' if langsmith_tracing else '❌ Disabled'}")
    print(f"🔑 LangSmith API Key: {'✅ Found' if langsmith_key else '❌ Missing'}")
    
    try:
        # Initialize ChatOpenAI
        print("\n🚀 Initializing ChatOpenAI...")
        llm = ChatOpenAI(
            model="gpt-4",
            temperature=0.1,
            openai_api_key=api_key
        )
        print("✅ ChatOpenAI initialized successfully")
        
        # Test basic invocation
        print("\n🧪 Testing basic invocation...")
        response = llm.invoke("Hello, world!")
        print(f"✅ Response received: {response.content}")
        
        # Test with a simple question
        print("\n📚 Testing with a simple question...")
        question = "What is 2 + 2?"
        response = llm.invoke(question)
        print(f"✅ Question: {question}")
        print(f"✅ Answer: {response.content}")
        
        print("\n🎉 All tests passed! LangChain is working correctly.")
        return True
        
    except Exception as e:
        print(f"\n❌ Error during testing: {e}")
        return False

if __name__ == "__main__":
    test_langchain_setup()
