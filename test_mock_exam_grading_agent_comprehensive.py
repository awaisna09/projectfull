#!/usr/bin/env python3
"""
Comprehensive Test Script for Mock Exam Grading Agent
Tests all functionality including core grading, LangGraph workflow, and FastAPI endpoints
"""

import os
import sys
import json
import asyncio
import time
from typing import Dict, List

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
from dotenv import load_dotenv
load_dotenv("config.env")

# Import agent
from agents.mock_exam_grading_agent import (
    MockExamGradingAgent,
    QuestionGrade,
    ExamReport,
    QuestionInput,
    MockStartRequest,
    run_mock_exam_graph,
    get_metrics,
    log_metric,
)

# Test results
test_results = {
    "passed": 0,
    "failed": 0,
    "errors": []
}


def test_result(test_name: str, passed: bool, error: str = None):
    """Record test result."""
    if passed:
        test_results["passed"] += 1
        print(f"✅ PASS: {test_name}")
    else:
        test_results["failed"] += 1
        test_results["errors"].append(f"{test_name}: {error}")
        print(f"❌ FAIL: {test_name}")
        if error:
            print(f"   Error: {error}")


def test_agent_initialization():
    """Test 1: Agent initialization."""
    print("\n" + "="*60)
    print("TEST 1: Agent Initialization")
    print("="*60)
    
    try:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            test_result("Agent Initialization", False, "OPENAI_API_KEY not found")
            return False
        
        agent = MockExamGradingAgent(api_key)
        
        # Check agent attributes
        assert agent.api_key == api_key, "API key not set correctly"
        assert agent.llm is not None, "LLM not initialized"
        
        test_result("Agent Initialization", True)
        return True
    except Exception as e:
        test_result("Agent Initialization", False, str(e))
        return False


def test_difficulty_weight_calculation():
    """Test 2: Difficulty weight calculation."""
    print("\n" + "="*60)
    print("TEST 2: Difficulty Weight Calculation")
    print("="*60)
    
    try:
        api_key = os.getenv("OPENAI_API_KEY")
        agent = MockExamGradingAgent(api_key)
        
        # Test different mark values
        assert agent.difficulty_weight_from_marks(3) == 1.0, "Marks <= 5 should return 1.0"
        assert agent.difficulty_weight_from_marks(8) == 1.2, "Marks <= 10 should return 1.2"
        assert agent.difficulty_weight_from_marks(15) == 1.5, "Marks > 10 should return 1.5"
        
        test_result("Difficulty Weight Calculation", True)
        return True
    except Exception as e:
        test_result("Difficulty Weight Calculation", False, str(e))
        return False


def test_base_delta_calculation():
    """Test 3: Base delta calculation."""
    print("\n" + "="*60)
    print("TEST 3: Base Delta Calculation")
    print("="*60)
    
    try:
        api_key = os.getenv("OPENAI_API_KEY")
        agent = MockExamGradingAgent(api_key)
        
        # Test delta calculations
        delta_50 = agent.base_delta_from_question_score(50.0)
        delta_100 = agent.base_delta_from_question_score(100.0)
        delta_0 = agent.base_delta_from_question_score(0.0)
        
        assert delta_50 == 0.0, f"50% should give 0 delta, got {delta_50}"
        assert delta_100 == 10.0, f"100% should give +10 delta, got {delta_100}"
        assert delta_0 == -10.0, f"0% should give -10 delta, got {delta_0}"
        
        test_result("Base Delta Calculation", True)
        return True
    except Exception as e:
        test_result("Base Delta Calculation", False, str(e))
        return False


def test_weakness_classification():
    """Test 4: Weakness level classification."""
    print("\n" + "="*60)
    print("TEST 4: Weakness Level Classification")
    print("="*60)
    
    try:
        api_key = os.getenv("OPENAI_API_KEY")
        agent = MockExamGradingAgent(api_key)
        
        assert agent.classify_weakness_level(25.0) == "critical", "25% should be critical"
        assert agent.classify_weakness_level(35.0) == "high", "35% should be high"
        assert agent.classify_weakness_level(45.0) == "moderate", "45% should be moderate"
        assert agent.classify_weakness_level(55.0) == "low", "55% should be low"
        assert agent.classify_weakness_level(70.0) is None, "70% should have no weakness"
        
        test_result("Weakness Level Classification", True)
        return True
    except Exception as e:
        test_result("Weakness Level Classification", False, str(e))
        return False


def test_grade_calculation():
    """Test 5: Grade calculation."""
    print("\n" + "="*60)
    print("TEST 5: Grade Calculation")
    print("="*60)
    
    try:
        api_key = os.getenv("OPENAI_API_KEY")
        agent = MockExamGradingAgent(api_key)
        
        # Grade boundaries: A+ (97+), A (93-96), B+ (87-92), B (83-86), 
        # C+ (77-82), C (73-76), D (65-72), F (<65)
        assert agent._calculate_grade(98.0) == "A+", "98% should be A+ (97+)"
        assert agent._calculate_grade(95.0) == "A", "95% should be A (93-96)"
        assert agent._calculate_grade(88.0) == "B+", "88% should be B+ (87-92)"
        assert agent._calculate_grade(85.0) == "B", "85% should be B (83-86)"
        assert agent._calculate_grade(80.0) == "C+", "80% should be C+ (77-82)"
        assert agent._calculate_grade(75.0) == "C", "75% should be C (73-76)"
        assert agent._calculate_grade(73.0) == "C", "73% should be C (73-76)"
        assert agent._calculate_grade(70.0) == "D", "70% should be D (65-72)"
        assert agent._calculate_grade(65.0) == "D", "65% should be D (65-72)"
        assert agent._calculate_grade(50.0) == "F", "50% should be F (<65)"
        
        test_result("Grade Calculation", True)
        return True
    except Exception as e:
        test_result("Grade Calculation", False, str(e))
        return False


def test_readiness_score_calculation():
    """Test 6: Readiness score calculation."""
    print("\n" + "="*60)
    print("TEST 6: Readiness Score Calculation")
    print("="*60)
    
    try:
        api_key = os.getenv("OPENAI_API_KEY")
        agent = MockExamGradingAgent(api_key)
        
        # Create a sample exam report
        exam_report = ExamReport(
            total_questions=5,
            questions_attempted=5,
            total_marks=50,
            marks_obtained=40,
            percentage_score=80.0,
            overall_grade="B",
            question_grades=[],
            overall_feedback="Good performance",
            recommendations=[],
            strengths_summary=[],
            weaknesses_summary=[],
        )
        
        mastery_updates = {"concept1": 75.0, "concept2": 85.0}
        
        score = agent.compute_readiness_score(
            "user123", exam_report, mastery_updates
        )
        
        assert 0.0 <= score <= 100.0, f"Readiness score should be 0-100, got {score}"
        
        test_result("Readiness Score Calculation", True)
        return True
    except Exception as e:
        test_result("Readiness Score Calculation", False, str(e))
        return False


def test_question_input_validation():
    """Test 7: QuestionInput validation."""
    print("\n" + "="*60)
    print("TEST 7: QuestionInput Validation")
    print("="*60)
    
    try:
        # Test valid input
        valid_question = QuestionInput(
            question_id=1,
            question="Test question",
            user_answer="Answer",
            solution="Model answer",
            marks=10,
        )
        assert valid_question.question_id == 1
        
        # Test invalid input (no solution or model_answer)
        try:
            invalid_question = QuestionInput(
                question_id=1,
                question="Test question",
                user_answer="Answer",
                marks=10,
            )
            test_result("QuestionInput Validation (should fail)", False, "Should require solution or model_answer")
            return False
        except ValueError:
            pass  # Expected to fail
        
        test_result("QuestionInput Validation", True)
        return True
    except Exception as e:
        test_result("QuestionInput Validation", False, str(e))
        return False


def test_mock_start_request_validation():
    """Test 8: MockStartRequest validation."""
    print("\n" + "="*60)
    print("TEST 8: MockStartRequest Validation")
    print("="*60)
    
    try:
        questions = [
            QuestionInput(
                question_id=1,
                question="Q1",
                solution="A1",
                marks=10,
            )
        ]
        
        # Test valid request
        valid_request = MockStartRequest(
            user_id="user123",
            attempted_questions=questions,
        )
        assert valid_request.user_id == "user123"
        
        # Test empty user_id
        try:
            invalid_request = MockStartRequest(
                user_id="",
                attempted_questions=questions,
            )
            test_result("MockStartRequest Validation (empty user_id)", False, "Should reject empty user_id")
            return False
        except ValueError:
            pass  # Expected to fail
        
        # Test empty questions
        try:
            invalid_request = MockStartRequest(
                user_id="user123",
                attempted_questions=[],
            )
            test_result("MockStartRequest Validation (empty questions)", False, "Should reject empty questions")
            return False
        except ValueError:
            pass  # Expected to fail
        
        test_result("MockStartRequest Validation", True)
        return True
    except Exception as e:
        test_result("MockStartRequest Validation", False, str(e))
        return False


def test_grade_exam_synchronous():
    """Test 9: Synchronous exam grading."""
    print("\n" + "="*60)
    print("TEST 9: Synchronous Exam Grading")
    print("="*60)
    
    try:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            test_result("Synchronous Exam Grading", False, "OPENAI_API_KEY not found")
            return False
        
        agent = MockExamGradingAgent(api_key)
        
        attempted_questions = [
            {
                "question_id": 1,
                "question": "What is market segmentation?",
                "user_answer": "Market segmentation is dividing customers into groups based on their needs.",
                "solution": (
                    "Market segmentation is the process of dividing a market "
                    "into groups of customers with similar needs and "
                    "characteristics. This allows businesses to target "
                    "specific customer groups more effectively."
                ),
                "marks": 10,
                "part": "A",
            }
        ]
        
        report = agent.grade_exam(attempted_questions)
        
        # Verify report structure
        assert isinstance(report, ExamReport), "Should return ExamReport"
        assert report.total_questions == 1, "Should have 1 question"
        assert report.total_marks == 10, "Should have 10 total marks"
        assert len(report.question_grades) == 1, "Should have 1 question grade"
        assert report.overall_grade in ["A+", "A", "B+", "B", "C+", "C", "D", "F"], "Invalid grade"
        
        print(f"   Score: {report.marks_obtained}/{report.total_marks} ({report.percentage_score}%)")
        print(f"   Grade: {report.overall_grade}")
        
        test_result("Synchronous Exam Grading", True)
        return True
    except Exception as e:
        test_result("Synchronous Exam Grading", False, str(e))
        import traceback
        traceback.print_exc()
        return False


async def test_langgraph_workflow():
    """Test 10: LangGraph workflow."""
    print("\n" + "="*60)
    print("TEST 10: LangGraph Workflow")
    print("="*60)
    
    try:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            test_result("LangGraph Workflow", False, "OPENAI_API_KEY not found")
            return False
        
        agent = MockExamGradingAgent(api_key)
        
        attempted_questions = [
            {
                "question_id": 1,
                "question": "Explain the concept of market segmentation.",
                "user_answer": "Market segmentation divides customers into groups.",
                "solution": "Market segmentation is the process of dividing a market into groups.",
                "marks": 10,
                "part": "A",
            }
        ]
        
        exam_report = await run_mock_exam_graph(
            agent,
            "user123",
            attempted_questions,
            request_id="test-request-123",
            job_id="test-job-123"
        )
        
        assert isinstance(exam_report, ExamReport), "Should return ExamReport"
        assert exam_report.total_questions == 1, "Should have 1 question"
        
        print(f"   Score: {exam_report.marks_obtained}/{exam_report.total_marks} ({exam_report.percentage_score}%)")
        print(f"   Grade: {exam_report.overall_grade}")
        if exam_report.readiness_score:
            print(f"   Readiness Score: {exam_report.readiness_score:.2f}")
        
        test_result("LangGraph Workflow", True)
        return True
    except Exception as e:
        test_result("LangGraph Workflow", False, str(e))
        import traceback
        traceback.print_exc()
        return False


def test_metrics_tracking():
    """Test 11: Metrics tracking."""
    print("\n" + "="*60)
    print("TEST 11: Metrics Tracking")
    print("="*60)
    
    try:
        # Reset metrics
        initial_metrics = get_metrics()
        
        # Log some metrics
        log_metric("jobs_created", 5)
        log_metric("questions_graded", 10)
        
        metrics = get_metrics()
        
        assert "jobs_created" in metrics, "jobs_created should be in metrics"
        assert "questions_graded" in metrics, "questions_graded should be in metrics"
        
        test_result("Metrics Tracking", True)
        return True
    except Exception as e:
        test_result("Metrics Tracking", False, str(e))
        return False


def test_fastapi_endpoints():
    """Test 12: FastAPI endpoints (if available)."""
    print("\n" + "="*60)
    print("TEST 12: FastAPI Endpoints")
    print("="*60)
    
    try:
        from agents.mock_exam_grading_agent import FASTAPI_AVAILABLE, app
        
        if not FASTAPI_AVAILABLE:
            print("   ⚠️  FastAPI not available - skipping endpoint tests")
            test_result("FastAPI Endpoints", True)  # Not a failure, just not available
            return True
        
        # Check if app exists
        assert app is not None, "FastAPI app should exist"
        
        # Check if endpoints are registered
        routes = [route.path for route in app.routes]
        assert "/api/v1/mock/start" in routes, "Start endpoint should exist"
        assert "/api/v1/mock/status/{job_id}" in routes, "Status endpoint should exist"
        assert "/health" in routes, "Health endpoint should exist"
        assert "/metrics" in routes, "Metrics endpoint should exist"
        
        print(f"   Found {len(routes)} routes")
        print(f"   Key routes: {', '.join(routes[:5])}")
        
        test_result("FastAPI Endpoints", True)
        return True
    except Exception as e:
        test_result("FastAPI Endpoints", False, str(e))
        return False


def main():
    """Run all tests."""
    print("\n" + "="*60)
    print("COMPREHENSIVE TEST SUITE FOR MOCK EXAM GRADING AGENT")
    print("="*60)
    
    # Check prerequisites
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("\n❌ ERROR: OPENAI_API_KEY not found in environment")
        print("   Please set OPENAI_API_KEY in config.env or environment")
        return
    
    print(f"\n✅ OPENAI_API_KEY found: {api_key[:10]}...")
    
    # Run synchronous tests
    test_agent_initialization()
    test_difficulty_weight_calculation()
    test_base_delta_calculation()
    test_weakness_classification()
    test_grade_calculation()
    test_readiness_score_calculation()
    test_question_input_validation()
    test_mock_start_request_validation()
    test_grade_exam_synchronous()
    test_metrics_tracking()
    test_fastapi_endpoints()
    
    # Run async test
    try:
        asyncio.run(test_langgraph_workflow())
    except Exception as e:
        test_result("LangGraph Workflow (async)", False, str(e))
    
    # Print summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    print(f"✅ Passed: {test_results['passed']}")
    print(f"❌ Failed: {test_results['failed']}")
    print(f"Total: {test_results['passed'] + test_results['failed']}")
    
    if test_results['errors']:
        print("\nErrors:")
        for error in test_results['errors']:
            print(f"  - {error}")
    
    # Final status
    if test_results['failed'] == 0:
        print("\n🎉 ALL TESTS PASSED!")
        return 0
    else:
        print(f"\n⚠️  {test_results['failed']} TEST(S) FAILED")
        return 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)

