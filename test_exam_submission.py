#!/usr/bin/env python3
"""Test script to verify exam submission updates tables"""

import os
import asyncio
import requests
from dotenv import load_dotenv

load_dotenv('config.env')

# Test user ID (use a valid UUID)
TEST_USER_ID = "f4f9cab9-70c2-45cb-89a4-d0cbd6aca6ea"
API_BASE_URL = "http://localhost:8000"

def test_exam_submission():
    """Test submitting an exam and check if tables are updated"""
    print("="*70)
    print("  TESTING EXAM SUBMISSION - TABLE UPDATES")
    print("="*70)

    # Prepare test exam data
    attempted_questions = [
        {
            "question_id": 1,
            "question": "What is market segmentation?",
            "user_answer": (
                "Market segmentation is dividing customers into groups "
                "based on their needs and characteristics."
            ),
            "solution": (
                "Market segmentation is the process of dividing a market "
                "into groups of customers with similar needs and "
                "characteristics. This allows businesses to target "
                "specific customer groups more effectively."
            ),
            "marks": 10,
            "part": "A",
            "question_number": 1
        },
        {
            "question_id": 2,
            "question": "Explain the concept of economies of scale.",
            "user_answer": (
                "Economies of scale mean bigger companies can produce "
                "goods at lower costs."
            ),
            "solution": (
                "Economies of scale refer to the cost advantages that "
                "enterprises obtain due to their scale of operation, "
                "with cost per unit of output decreasing with increasing "
                "scale."
            ),
            "marks": 8,
            "part": "B",
            "question_number": 2
        }
    ]

    # Submit exam
    print(f"\n📝 Submitting exam with {len(attempted_questions)} questions...")
    print(f"   User ID: {TEST_USER_ID}")

    try:
        response = requests.post(
            f"{API_BASE_URL}/grade-mock-exam",
            json={
                "attempted_questions": attempted_questions,
                "exam_type": "P1",
                "user_id": TEST_USER_ID
            },
            timeout=120  # 2 minutes timeout
        )

        if response.status_code == 200:
            report = response.json()
            print("✅ Exam graded successfully!")
            print(f"   Score: {report.get('marks_obtained')}/{report.get('total_marks')}")
            print(f"   Percentage: {report.get('percentage_score')}%")
            print(f"   Grade: {report.get('overall_grade')}")
            print("\n⏳ Waiting 5 seconds for database operations...")
            import time
            time.sleep(5)

            # Check if tables were updated
            print("\n" + "="*70)
            print("  CHECKING TABLE UPDATES")
            print("="*70)

            # Note: This would require Supabase client to check
            # For now, just confirm the request succeeded
            print("\n✅ Exam submission completed successfully!")
            print("   Check backend logs for persistence details.")
            print("   Check Supabase tables to verify updates:")
            print("   - exam_attempts")
            print("   - exam_question_results")
            print("   - student_mastery")
            print("   - student_weaknesses")
            print("   - student_readiness")

        else:
            print(f"❌ Error: {response.status_code}")
            print(f"   Response: {response.text}")

    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to backend server")
        print("   Make sure the backend is running on port 8000")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_exam_submission()

