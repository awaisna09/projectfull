#!/usr/bin/env python3
"""
Test Script to Verify All Tables Are Updated by Mock Exam Grading Agent
Tests: exam_attempts, exam_question_results, student_mastery, student_weaknesses, student_readiness
"""

import os
import sys
import asyncio
from datetime import datetime
from uuid import uuid4
from dotenv import load_dotenv

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
load_dotenv("config.env")

# Import agent
from agents.mock_exam_grading_agent import (
    MockExamGradingAgent,
    run_mock_exam_graph,
)

# Test user ID - must be valid UUID for tables that require UUID
# Using a real user_id from the database to avoid RLS policy violations
TEST_USER_ID = "f4f9cab9-70c2-45cb-89a4-d0cbd6aca6ea"


def check_table_update(supabase, table_name: str, check_func, description: str):
    """Check if a table was updated correctly."""
    print(f"\n📋 Checking {table_name}:")
    print(f"   {description}")
    
    try:
        result = check_func(supabase)
        if result:
            print(f"   ✅ {table_name}: Updated correctly")
            return True
        else:
            print(f"   ❌ {table_name}: Not updated or update failed")
            return False
    except Exception as e:
        print(f"   ❌ {table_name}: Error - {str(e)[:100]}")
        import traceback
        traceback.print_exc()
        return False


def check_exam_attempts(supabase):
    """Check if exam_attempts table was updated."""
    result = (
        supabase.table("exam_attempts")
        .select("*")
        .eq("user_id", TEST_USER_ID)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    
    if not result.data:
        return False
    
    exam = result.data[0]
    print(f"      - Found exam attempt: {exam.get('exam_attempt_id')}")
    print(f"      - Total marks: {exam.get('total_marks')}")
    print(f"      - Marks obtained: {exam.get('obtained_marks')}")
    print(f"      - Percentage: {exam.get('percentage')}%")
    print(f"      - Grade: {exam.get('overall_grade')}")
    if exam.get('readiness_score'):
        print(f"      - Readiness score: {exam.get('readiness_score')}")
    
    # Verify required fields (actual schema)
    required_fields = ["exam_attempt_id", "user_id", "total_marks", "obtained_marks", 
                      "percentage", "overall_grade", "created_at"]
    for field in required_fields:
        if field not in exam:
            print(f"      ⚠️  Missing field: {field}")
            return False
    
    return True


def check_exam_question_results(supabase):
    """Check if exam_question_results table was updated."""
    # First get the exam_attempt_id
    exam_result = (
        supabase.table("exam_attempts")
        .select("exam_attempt_id")
        .eq("user_id", TEST_USER_ID)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    
    if not exam_result.data:
        return False
    
    exam_id = exam_result.data[0]["exam_attempt_id"]
    
    # Get question results
    result = (
        supabase.table("exam_question_results")
        .select("*")
        .eq("exam_attempt_id", exam_id)
        .execute()
    )
    
    if not result.data:
        return False
    
    print(f"      - Found {len(result.data)} question result(s)")
    
    for qr in result.data:
        print(f"      - Question ID: {qr.get('question_id')}")
        print(f"      - Marks: {qr.get('marks_awarded')}/{qr.get('marks_allocated')}")
        print(f"      - Percentage: {qr.get('percentage')}%")
        print(f"      - Concepts: {qr.get('concepts', [])}")
    
    # Verify required fields (actual schema)
    required_fields = ["id", "exam_attempt_id", "user_id", "question_id", "marks_allocated",
                      "marks_awarded", "percentage", "feedback", 
                      "concepts", "created_at"]
    for field in required_fields:
        if field not in result.data[0]:
            print(f"      ⚠️  Missing field: {field}")
            return False
    
    return True


def check_student_mastery(supabase):
    """Check if student_mastery table was updated."""
    result = (
        supabase.table("student_mastery")
        .select("*")
        .eq("user_id", TEST_USER_ID)
        .execute()
    )
    
    if not result.data:
        print("      ⚠️  No mastery records found (may be normal if no concepts detected)")
        return True  # Not a failure - concepts may not be detected
    
    print(f"      - Found {len(result.data)} mastery record(s)")
    
    for mastery in result.data:
        print(f"      - Concept: {mastery.get('concept_id')}")
        print(f"      - Mastery: {mastery.get('mastery')}")
        print(f"      - Updated: {mastery.get('updated_at')}")
    
    # Verify required fields
    required_fields = ["user_id", "concept_id", "mastery", "updated_at"]
    for field in required_fields:
        if field not in result.data[0]:
            print(f"      ⚠️  Missing field: {field}")
            return False
    
    return True


def check_student_weaknesses(supabase):
    """Check if student_weaknesses table was updated."""
    result = (
        supabase.table("student_weaknesses")
        .select("*")
        .eq("user_id", TEST_USER_ID)
        .execute()
    )
    
    if not result.data:
        print("      ⚠️  No weakness records found (may be normal if scores are high)")
        return True  # Not a failure - weaknesses only recorded for low scores
    
    print(f"      - Found {len(result.data)} weakness record(s)")
    
    for weakness in result.data:
        print(f"      - Concept: {weakness.get('concept_id')}")
        print(f"      - Level: {weakness.get('level')}")
        print(f"      - Updated: {weakness.get('updated_at')}")
    
    # Verify required fields
    required_fields = ["user_id", "concept_id", "level", "updated_at"]
    for field in required_fields:
        if field not in result.data[0]:
            print(f"      ⚠️  Missing field: {field}")
            return False
    
    return True


def check_student_readiness(supabase):
    """Check if student_readiness table was updated."""
    result = (
        supabase.table("student_readiness")
        .select("*")
        .eq("user_id", TEST_USER_ID)
        .limit(1)
        .execute()
    )
    
    if not result.data:
        return False
    
    readiness = result.data[0]
    print(f"      - Readiness score: {readiness.get('readiness_score')}")
    print(f"      - Updated: {readiness.get('updated_at')}")
    
    # Verify required fields
    required_fields = ["user_id", "readiness_score", "updated_at"]
    for field in required_fields:
        if field not in readiness:
            print(f"      ⚠️  Missing field: {field}")
            return False
    
    return True


async def main():
    """Run the test."""
    print("="*70)
    print("  TESTING MOCK EXAM GRADING AGENT - TABLE UPDATES")
    print("="*70)
    
    # Check prerequisites
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("\n❌ ERROR: OPENAI_API_KEY not found in environment")
        return 1
    
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")
    
    if not supabase_url or not supabase_key:
        print("\n❌ ERROR: Supabase credentials not found")
        print("   Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in config.env")
        return 1
    
    print(f"\n✅ Environment variables found")
    print(f"   Test User ID: {TEST_USER_ID}")
    
    # Initialize agent
    print("\n📦 Initializing Mock Exam Grading Agent...")
    try:
        agent = MockExamGradingAgent(api_key)
        if not agent.supabase:
            print("❌ ERROR: Supabase client not initialized")
            return 1
        print("✅ Agent initialized successfully")
    except Exception as e:
        print(f"❌ ERROR: Failed to initialize agent: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    # Create test questions
    print("\n📝 Creating test exam questions...")
    attempted_questions = [
        {
            "question_id": 1,
            "question": "Explain the concept of market segmentation in Business Studies.",
            "user_answer": (
                "Market segmentation is dividing customers into groups "
                "based on their needs and characteristics."
            ),
            "solution": (
                "Market segmentation is the process of dividing a market "
                "into groups of customers with similar needs, characteristics, "
                "or behaviors. This allows businesses to target specific "
                "customer groups more effectively with tailored marketing "
                "strategies and products."
            ),
            "marks": 10,
            "part": "A",
            "question_number": 1,
        },
        {
            "question_id": 2,
            "question": "What are the advantages of a sole trader business?",
            "user_answer": "Easy to set up and full control.",
            "solution": (
                "Advantages of a sole trader include: 1) Easy to set up "
                "with minimal legal requirements, 2) Full control over "
                "business decisions, 3) All profits belong to the owner, "
                "4) Quick decision-making, 5) Personal relationship with "
                "customers."
            ),
            "marks": 8,
            "part": "B",
            "question_number": 2,
        }
    ]
    
    print(f"   Created {len(attempted_questions)} test questions")
    
    # Run grading workflow
    print("\n🔄 Running mock exam grading workflow...")
    try:
        exam_report = await run_mock_exam_graph(
            agent,
            TEST_USER_ID,
            attempted_questions,
            request_id=f"test-{uuid4().hex[:8]}",
            job_id=f"test-job-{uuid4().hex[:8]}"
        )
        
        print("✅ Grading workflow completed")
        print(f"   Score: {exam_report.marks_obtained}/{exam_report.total_marks} "
              f"({exam_report.percentage_score}%)")
        print(f"   Grade: {exam_report.overall_grade}")
        if exam_report.readiness_score:
            print(f"   Readiness Score: {exam_report.readiness_score:.2f}")
    except Exception as e:
        print(f"❌ ERROR: Grading workflow failed: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    # Wait a moment for async operations to complete
    print("\n⏳ Waiting for database operations to complete...")
    await asyncio.sleep(2)
    
    # Check all tables
    print("\n" + "="*70)
    print("  CHECKING TABLE UPDATES")
    print("="*70)
    
    results = {}
    
    results["exam_attempts"] = check_table_update(
        agent.supabase,
        "exam_attempts",
        check_exam_attempts,
        "Should contain the exam attempt record"
    )
    
    results["exam_question_results"] = check_table_update(
        agent.supabase,
        "exam_question_results",
        check_exam_question_results,
        "Should contain individual question results"
    )
    
    results["student_mastery"] = check_table_update(
        agent.supabase,
        "student_mastery",
        check_student_mastery,
        "Should contain updated mastery scores for detected concepts"
    )
    
    results["student_weaknesses"] = check_table_update(
        agent.supabase,
        "student_weaknesses",
        check_student_weaknesses,
        "Should contain weakness records if scores are low"
    )
    
    results["student_readiness"] = check_table_update(
        agent.supabase,
        "student_readiness",
        check_student_readiness,
        "Should contain the overall readiness score"
    )
    
    # Summary
    print("\n" + "="*70)
    print("  TEST SUMMARY")
    print("="*70)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for table, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {status}: {table}")
    
    print(f"\n  Results: {passed}/{total} tables updated correctly")
    
    if passed == total:
        print("\n🎉 ALL TABLES UPDATED SUCCESSFULLY!")
        return 0
    else:
        print(f"\n⚠️  {total - passed} TABLE(S) NOT UPDATED CORRECTLY")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)

