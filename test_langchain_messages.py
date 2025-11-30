#!/usr/bin/env python3
"""
Test to verify how ChatOpenAI.invoke handles SystemMessage and HumanMessage
"""

import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

load_dotenv('config.env')

api_key = os.getenv('OPENAI_API_KEY')

# Create LLM
llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.1,
    openai_api_key=api_key,
    timeout=30,
    max_retries=1
)

# Create messages
system_msg = SystemMessage(content="You are a helpful assistant.")
human_msg = HumanMessage(content="Say hello in one word.")

messages = [system_msg, human_msg]

print("=" * 80)
print("Testing ChatOpenAI.invoke with SystemMessage + HumanMessage")
print("=" * 80)
print()
print(f"Message 1: {type(messages[0]).__name__}")
print(f"  Content: {messages[0].content}")
print()
print(f"Message 2: {type(messages[1]).__name__}")
print(f"  Content: {messages[1].content}")
print()
print("Calling llm.invoke(messages)...")
print()

try:
    result = llm.invoke(messages)
    print("✅ Success!")
    print(f"Response: {result.content}")
    print()
    print("If LangSmith tracing shows both messages, the format is correct.")
except Exception as e:
    print(f"❌ Error: {e}")

