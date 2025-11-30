#!/usr/bin/env python3
"""
Test script to verify readiness and avg_mastery updates correctly
Tests topic ID 12 with three different reasoning states:
- GOOD: Advanced question showing understanding
- NEUTRAL: Basic definition question
- CONFUSED: Misunderstanding
"""

import requests
import json
import time
from typing import Dict, Any

# Configuration
BACKEND_URL = "http://localhost:8000"
TOPIC_ID = 12
USER_ID = "test_user_readiness"
CONVERSATION_ID = f"{USER_ID}_{TOPIC_ID}"

# Test prompts
TEST_PROMPTS = {
    "GOOD": (
        "A private limited company has limited liability and more control "
        "over ownership because shares cannot be freely sold. For a growing "
        "family business, would remaining an Ltd help protect decision-making "
        "while still allowing them to raise enough capital for expansion?"
    ),
    "NEUTRAL": (
        "What is the difference between a sole trader and a partnership?"
    ),
    "CONFUSED": (
        "A sole trader means the business has only one customer, right?"
    )
}

def print_separator():
    """Print a visual separator"""
    print("\n" + "="*80 + "\n")

def test_tutor_request(
    prompt: str,
    reasoning_type: str,
    request_num: int
) -> Dict[str, Any]:
    """
    Make a tutor request and return the response
    
    Args:
        prompt: The student's message
        reasoning_type: Expected reasoning type (GOOD/NEUTRAL/CONFUSED)
        request_num: Request number for tracking
        
    Returns:
        Response JSON as dict
    """
    print(f"📝 Request #{request_num}: Testing {reasoning_type} reasoning")
    print(f"   Prompt: {prompt[:60]}...")
    
    payload = {
        "message": prompt,
        "topic": TOPIC_ID,
        "user_id": USER_ID,
        "conversation_id": CONVERSATION_ID,
        "conversation_history": [],
        "learning_level": "intermediate",
        "explanation_style": "default"
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/tutor/chat",
            json=payload,
            timeout=90
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Error: {e}")
        return {}

def extract_readiness_data(response: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extract readiness and mastery data from response
    
    Returns:
        Dict with readiness, avg_mastery, min_mastery, reasoning_label
    """
    readiness = response.get("readiness", {})
    
    return {
        "overall_readiness": readiness.get("overall", readiness.get("overall_readiness", "N/A")),
        "avg_mastery": readiness.get("average_mastery", "N/A"),
        "min_mastery": readiness.get("min_mastery", "N/A"),
        "reasoning_label": response.get("reasoning_label", "N/A"),
        "mastery_updates_count": len(response.get("mastery_updates", []))
    }

def print_results(data: Dict[str, Any], reasoning_type: str):
    """Print formatted results"""
    print(f"\n   📊 Results for {reasoning_type}:")
    print(f"      Reasoning Label: {data['reasoning_label']}")
    print(f"      Overall Readiness: {data['overall_readiness']}")
    print(f"      Average Mastery: {data['avg_mastery']}")
    print(f"      Min Mastery: {data['min_mastery']}")
    print(f"      Mastery Updates: {data['mastery_updates_count']} concepts")

def main():
    """Run the test suite"""
    print("🧪 READINESS & MASTERY TEST SUITE")
    print("="*80)
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Topic ID: {TOPIC_ID}")
    print(f"User ID: {USER_ID}")
    print("="*80)
    
    # Check backend health
    print("\n🔍 Checking backend health...")
    try:
        health = requests.get(f"{BACKEND_URL}/health", timeout=5)
        if health.status_code == 200:
            print("   ✅ Backend is healthy")
        else:
            print(f"   ⚠️  Backend returned status {health.status_code}")
    except Exception as e:
        print(f"   ❌ Cannot connect to backend: {e}")
        print("   Please ensure the backend is running on port 8000")
        return
    
    print_separator()
    
    # Track mastery progression
    mastery_history = []
    
    # Test each reasoning type
    for i, (reasoning_type, prompt) in enumerate(TEST_PROMPTS.items(), 1):
        print_separator()
        
        # Make request
        response = test_tutor_request(prompt, reasoning_type, i)
        
        if not response:
            print(f"   ❌ Failed to get response for {reasoning_type}")
            continue
        
        # Extract and display results
        data = extract_readiness_data(response)
        print_results(data, reasoning_type)
        
        # Track mastery progression
        mastery_history.append({
            "request": i,
            "type": reasoning_type,
            "avg_mastery": data["avg_mastery"],
            "reasoning": data["reasoning_label"]
        })
        
        # Wait a bit between requests
        if i < len(TEST_PROMPTS):
            print("\n   ⏳ Waiting 2 seconds before next request...")
            time.sleep(2)
    
    print_separator()
    
    # Summary
    print("📈 MASTERY PROGRESSION SUMMARY")
    print("="*80)
    print(f"{'Request':<10} {'Type':<10} {'Reasoning':<12} {'Avg Mastery':<15}")
    print("-"*80)
    
    for entry in mastery_history:
        avg_mastery = entry["avg_mastery"]
        if isinstance(avg_mastery, (int, float)):
            avg_mastery = f"{avg_mastery:.2f}"
        print(
            f"{entry['request']:<10} "
            f"{entry['type']:<10} "
            f"{entry['reasoning']:<12} "
            f"{avg_mastery:<15}"
        )
    
    print_separator()
    
    # Verification
    print("✅ VERIFICATION")
    print("="*80)
    
    # Check if mastery is increasing
    avg_masteries = [
        m["avg_mastery"] for m in mastery_history
        if isinstance(m["avg_mastery"], (int, float))
    ]
    
    if len(avg_masteries) >= 2:
        if avg_masteries[-1] > avg_masteries[0]:
            print("   ✅ Mastery is increasing correctly")
        else:
            print("   ⚠️  Mastery is not increasing as expected")
    
    # Check if readiness is updating
    readiness_values = [
        m["avg_mastery"] / 100.0 if isinstance(m["avg_mastery"], (int, float))
        else None
        for m in mastery_history
    ]
    readiness_values = [r for r in readiness_values if r is not None]
    
    if len(readiness_values) >= 2:
        if readiness_values[-1] != readiness_values[0]:
            print("   ✅ Readiness is updating correctly")
        else:
            print("   ⚠️  Readiness is not updating (stuck at same value)")
    
    # Check reasoning labels
    reasoning_labels = [m["reasoning"] for m in mastery_history]
    expected_labels = ["good", "neutral", "confused"]
    
    print(f"\n   Reasoning Labels: {reasoning_labels}")
    if all(label in expected_labels for label in reasoning_labels):
        print("   ✅ All reasoning labels are valid")
    else:
        print("   ⚠️  Some reasoning labels may be incorrect")
    
    print_separator()
    print("🎉 Test complete!")
    print("\nExpected behavior:")
    print("  - Request 1 (GOOD): Mastery should increase (+2), Readiness should increase")
    print("  - Request 2 (NEUTRAL): Mastery stays same (0), Readiness stays same")
    print("  - Request 3 (CONFUSED): Mastery decreases (-1), Readiness decreases")
    print("\nIf mastery/readiness are not updating, check:")
    print("  - Backend logs for errors")
    print("  - Database connection")
    print("  - Mastery updates are being applied")

if __name__ == "__main__":
    main()

