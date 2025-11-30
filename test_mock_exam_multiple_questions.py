#!/usr/bin/env python3
"""
Test Mock Exam Grading Agent with Multiple Questions
Tests batch grading functionality with various question types and scenarios
"""

import os
import sys
import json
import asyncio
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
from dotenv import load_dotenv
load_dotenv("config.env")

# Import agent
from agents.mock_exam_grading_agent import (
    MockExamGradingAgent,
    ExamReport,
    run_mock_exam_graph,
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


def create_sample_exam_questions():
    """Create a comprehensive set of sample exam questions."""
    return [
        {
            "question_id": 1,
            "question": (
                "What is market segmentation and why is it important "
                "for businesses?"
            ),
            "user_answer": (
                "Market segmentation is dividing customers into groups "
                "based on their needs. It helps businesses target "
                "specific customers more effectively."
            ),
            "solution": (
                "Market segmentation is the process of dividing a "
                "market into distinct groups of customers with similar "
                "needs, characteristics, or behaviors. It is important "
                "because it allows businesses to: 1) Target marketing "
                "efforts more effectively, 2) Develop products that meet "
                "specific customer needs, 3) Set appropriate pricing "
                "strategies, 4) Improve customer satisfaction, and "
                "5) Increase profitability by focusing resources on "
                "the most valuable segments."
            ),
            "marks": 10,
            "part": "A",
            "question_number": 1,
        },
        {
            "question_id": 2,
            "question": (
                "Explain the difference between primary and secondary "
                "market research."
            ),
            "user_answer": (
                "Primary research is done by the company itself, "
                "secondary is from other sources."
            ),
            "solution": (
                "Primary market research involves collecting original "
                "data directly from sources through methods such as "
                "surveys, interviews, focus groups, and observations. "
                "It is specific to the business's needs but can be "
                "time-consuming and expensive. Secondary market research "
                "involves using existing data collected by others, such "
                "as government reports, industry publications, and "
                "competitor analysis. It is faster and cheaper but may "
                "not be as specific to the business's needs."
            ),
            "marks": 8,
            "part": "B",
            "question_number": 2,
        },
        {
            "question_id": 3,
            "question": (
                "Describe the four Ps of the marketing mix and give an "
                "example for each."
            ),
            "user_answer": (
                "The four Ps are Product, Price, Place, and Promotion. "
                "Product is what you sell, Price is how much it costs, "
                "Place is where you sell it, and Promotion is how you "
                "advertise it."
            ),
            "solution": (
                "The four Ps of the marketing mix are: 1) Product - "
                "the goods or services offered (e.g., a smartphone with "
                "specific features), 2) Price - the amount customers "
                "pay (e.g., $999 for a premium phone), 3) Place - "
                "where products are sold (e.g., online store, retail "
                "outlets), and 4) Promotion - how products are "
                "advertised (e.g., TV commercials, social media "
                "campaigns). These elements work together to create a "
                "comprehensive marketing strategy."
            ),
            "marks": 12,
            "part": "A",
            "question_number": 3,
        },
        {
            "question_id": 4,
            "question": (
                "What is the break-even point and how is it calculated?"
            ),
            "user_answer": (
                "Break-even is when you don't make profit or loss. "
                "You calculate it by dividing fixed costs by "
                "contribution per unit."
            ),
            "solution": (
                "The break-even point is the level of sales at which "
                "total revenue equals total costs, resulting in neither "
                "profit nor loss. It is calculated using the formula: "
                "Break-even point (units) = Fixed Costs / (Selling "
                "Price per Unit - Variable Cost per Unit). This helps "
                "businesses determine the minimum sales volume needed to "
                "cover all costs and start making a profit."
            ),
            "marks": 10,
            "part": "B",
            "question_number": 4,
        },
        {
            "question_id": 5,
            "question": (
                "Explain the concept of cash flow and why it is "
                "important for business survival."
            ),
            "user_answer": (
                "Cash flow is money coming in and going out. It's "
                "important because businesses need cash to pay bills."
            ),
            "solution": (
                "Cash flow refers to the movement of money into and out "
                "of a business over a period of time. Positive cash flow "
                "means more money is coming in than going out, while "
                "negative cash flow means more money is going out. Cash "
                "flow is crucial for business survival because: 1) "
                "Businesses need cash to pay immediate expenses like "
                "salaries and suppliers, 2) Even profitable businesses "
                "can fail if they run out of cash, 3) Cash flow "
                "management helps businesses plan for future "
                "investments, and 4) It indicates the financial health "
                "and liquidity of the business."
            ),
            "marks": 15,
            "part": "A",
            "question_number": 5,
        },
        {
            "question_id": 6,
            "question": (
                "What are the advantages and disadvantages of "
                "partnership as a business structure?"
            ),
            "user_answer": (
                "Partnerships share work and costs. But partners might "
                "disagree."
            ),
            "solution": (
                "Advantages of partnership include: shared financial "
                "burden, combined skills and expertise, shared decision-"
                "making, and easier to set up than a corporation. "
                "Disadvantages include: unlimited liability for all "
                "partners, potential for conflicts and disagreements, "
                "shared profits, and difficulty in raising capital "
                "compared to corporations. Partnerships work best when "
                "partners have complementary skills and trust each other."
            ),
            "marks": 10,
            "part": "B",
            "question_number": 6,
        },
    ]


def test_synchronous_multiple_questions():
    """Test 1: Synchronous grading with multiple questions."""
    print("\n" + "="*70)
    print("TEST 1: Synchronous Grading with Multiple Questions")
    print("="*70)

    try:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            test_result(
                "Synchronous Multiple Questions",
                False,
                "OPENAI_API_KEY not found"
            )
            return False

        agent = MockExamGradingAgent(api_key)
        questions = create_sample_exam_questions()

        print(f"\n📝 Grading {len(questions)} questions...")
        start_time = datetime.now()

        report = agent.grade_exam(questions)

        elapsed = (datetime.now() - start_time).total_seconds()

        # Verify report structure
        assert isinstance(report, ExamReport), "Should return ExamReport"
        assert report.total_questions == len(questions), (
            f"Should have {len(questions)} questions, "
            f"got {report.total_questions}"
        )
        assert len(report.question_grades) == len(questions), (
            f"Should have {len(questions)} question grades, "
            f"got {len(report.question_grades)}"
        )

        # Verify calculations
        expected_total_marks = sum(q["marks"] for q in questions)
        assert report.total_marks == expected_total_marks, (
            f"Total marks mismatch: expected {expected_total_marks}, "
            f"got {report.total_marks}"
        )

        # Verify all questions were graded
        for i, grade in enumerate(report.question_grades):
            assert grade.question_id == questions[i]["question_id"], (
                f"Question ID mismatch for question {i+1}"
            )
            assert 0 <= grade.percentage_score <= 100, (
                f"Invalid percentage score for question {i+1}"
            )
            assert 0 <= grade.marks_awarded <= grade.marks_allocated, (
                f"Invalid marks awarded for question {i+1}"
            )

        # Print results
        print(f"\n⏱️  Grading completed in {elapsed:.2f} seconds")
        print(f"\n📊 EXAM RESULTS:")
        print(f"   Total Questions: {report.total_questions}")
        print(f"   Total Marks: {report.total_marks}")
        print(f"   Marks Obtained: {report.marks_obtained:.2f}")
        print(f"   Percentage Score: {report.percentage_score:.2f}%")
        print(f"   Overall Grade: {report.overall_grade}")

        print(f"\n📋 QUESTION BREAKDOWN:")
        for i, grade in enumerate(report.question_grades, 1):
            print(
                f"   Q{grade.question_number} ({grade.part}): "
                f"{grade.marks_awarded:.1f}/{grade.marks_allocated} "
                f"({grade.percentage_score:.1f}%)"
            )

        print(f"\n💡 FEEDBACK SUMMARY:")
        print(f"   {report.overall_feedback[:200]}...")

        print(f"\n🎯 RECOMMENDATIONS:")
        for rec in report.recommendations[:3]:
            print(f"   - {rec}")

        test_result("Synchronous Multiple Questions", True)
        return True

    except Exception as e:
        test_result("Synchronous Multiple Questions", False, str(e))
        import traceback
        traceback.print_exc()
        return False


async def test_langgraph_multiple_questions():
    """Test 2: LangGraph workflow with multiple questions."""
    print("\n" + "="*70)
    print("TEST 2: LangGraph Workflow with Multiple Questions")
    print("="*70)

    try:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            test_result(
                "LangGraph Multiple Questions",
                False,
                "OPENAI_API_KEY not found"
            )
            return False

        agent = MockExamGradingAgent(api_key)
        questions = create_sample_exam_questions()

        print(f"\n📝 Running LangGraph workflow for {len(questions)} questions...")
        start_time = datetime.now()

        exam_report = await run_mock_exam_graph(
            agent,
            "test-user-123",
            questions,
            request_id="test-multi-request-123",
            job_id="test-multi-job-123"
        )

        elapsed = (datetime.now() - start_time).total_seconds()

        # Verify report
        assert isinstance(exam_report, ExamReport), "Should return ExamReport"
        assert exam_report.total_questions == len(questions), (
            f"Should have {len(questions)} questions"
        )
        assert len(exam_report.question_grades) == len(questions), (
            f"Should have {len(questions)} question grades"
        )

        # Print results
        print(f"\n⏱️  Workflow completed in {elapsed:.2f} seconds")
        print(f"\n📊 EXAM RESULTS:")
        print(f"   Total Questions: {exam_report.total_questions}")
        print(f"   Total Marks: {exam_report.total_marks}")
        print(f"   Marks Obtained: {exam_report.marks_obtained:.2f}")
        print(f"   Percentage Score: {exam_report.percentage_score:.2f}%")
        print(f"   Overall Grade: {exam_report.overall_grade}")
        if exam_report.readiness_score:
            print(f"   Readiness Score: {exam_report.readiness_score:.2f}")

        print(f"\n📋 QUESTION BREAKDOWN:")
        for grade in exam_report.question_grades:
            print(
                f"   Q{grade.question_number} ({grade.part}): "
                f"{grade.marks_awarded:.1f}/{grade.marks_allocated} "
                f"({grade.percentage_score:.1f}%)"
            )
            if grade.concept_ids:
                print(f"      Concepts: {len(grade.concept_ids)} detected")

        print(f"\n💡 STRENGTHS:")
        for strength in exam_report.strengths_summary[:3]:
            print(f"   - {strength}")

        print(f"\n⚠️  WEAKNESSES:")
        for weakness in exam_report.weaknesses_summary[:3]:
            print(f"   - {weakness}")

        test_result("LangGraph Multiple Questions", True)
        return True

    except Exception as e:
        test_result("LangGraph Multiple Questions", False, str(e))
        import traceback
        traceback.print_exc()
        return False


def test_score_calculation_accuracy():
    """Test 3: Verify score calculations are accurate."""
    print("\n" + "="*70)
    print("TEST 3: Score Calculation Accuracy")
    print("="*70)

    try:
        api_key = os.getenv("OPENAI_API_KEY")
        agent = MockExamGradingAgent(api_key)
        questions = create_sample_exam_questions()

        report = agent.grade_exam(questions)

        # Verify total marks calculation
        expected_total = sum(q["marks"] for q in questions)
        assert report.total_marks == expected_total, (
            f"Total marks incorrect: {report.total_marks} != "
            f"{expected_total}"
        )

        # Verify marks obtained calculation
        calculated_marks = sum(
            g.marks_awarded for g in report.question_grades
        )
        assert abs(report.marks_obtained - calculated_marks) < 0.01, (
            f"Marks obtained mismatch: {report.marks_obtained} != "
            f"{calculated_marks}"
        )

        # Verify percentage calculation
        calculated_percentage = (
            (report.marks_obtained / report.total_marks * 100)
            if report.total_marks > 0
            else 0
        )
        assert abs(
            report.percentage_score - calculated_percentage
        ) < 0.01, (
            f"Percentage mismatch: {report.percentage_score} != "
            f"{calculated_percentage}"
        )

        # Verify grade assignment
        assert report.overall_grade in [
            "A+", "A", "B+", "B", "C+", "C", "D", "F"
        ], f"Invalid grade: {report.overall_grade}"

        print(f"✅ Total Marks: {report.total_marks}")
        print(f"✅ Marks Obtained: {report.marks_obtained:.2f}")
        print(f"✅ Percentage: {report.percentage_score:.2f}%")
        print(f"✅ Grade: {report.overall_grade}")
        print(f"✅ All calculations verified!")

        test_result("Score Calculation Accuracy", True)
        return True

    except Exception as e:
        test_result("Score Calculation Accuracy", False, str(e))
        return False


def test_question_grading_consistency():
    """Test 4: Verify each question is graded consistently."""
    print("\n" + "="*70)
    print("TEST 4: Question Grading Consistency")
    print("="*70)

    try:
        api_key = os.getenv("OPENAI_API_KEY")
        agent = MockExamGradingAgent(api_key)
        questions = create_sample_exam_questions()

        report = agent.grade_exam(questions)

        # Verify each question has required fields
        for i, grade in enumerate(report.question_grades):
            assert grade.question_id > 0, f"Q{i+1}: Invalid question_id"
            assert grade.question_text, f"Q{i+1}: Missing question_text"
            assert grade.student_answer is not None, (
                f"Q{i+1}: Missing student_answer"
            )
            assert grade.model_answer, f"Q{i+1}: Missing model_answer"
            assert grade.marks_allocated > 0, (
                f"Q{i+1}: Invalid marks_allocated"
            )
            assert 0 <= grade.marks_awarded <= grade.marks_allocated, (
                f"Q{i+1}: Invalid marks_awarded"
            )
            assert 0 <= grade.percentage_score <= 100, (
                f"Q{i+1}: Invalid percentage_score"
            )
            assert grade.feedback, f"Q{i+1}: Missing feedback"
            assert len(grade.strengths) > 0, f"Q{i+1}: Missing strengths"
            assert len(grade.improvements) > 0, (
                f"Q{i+1}: Missing improvements"
            )

        print(f"✅ All {len(report.question_grades)} questions graded")
        print(f"✅ All required fields present")
        print(f"✅ All scores within valid ranges")

        test_result("Question Grading Consistency", True)
        return True

    except Exception as e:
        test_result("Question Grading Consistency", False, str(e))
        return False


def test_feedback_quality():
    """Test 5: Verify feedback quality and structure."""
    print("\n" + "="*70)
    print("TEST 5: Feedback Quality and Structure")
    print("="*70)

    try:
        api_key = os.getenv("OPENAI_API_KEY")
        agent = MockExamGradingAgent(api_key)
        questions = create_sample_exam_questions()

        report = agent.grade_exam(questions)

        # Check overall feedback
        assert report.overall_feedback, "Missing overall feedback"
        assert len(report.overall_feedback) > 50, (
            "Overall feedback too short"
        )

        # Check recommendations
        assert len(report.recommendations) > 0, "Missing recommendations"
        assert all(
            len(rec) > 10 for rec in report.recommendations
        ), "Recommendations too short"

        # Check strengths and weaknesses
        assert len(report.strengths_summary) > 0, "Missing strengths"
        assert len(report.weaknesses_summary) > 0, "Missing weaknesses"

        # Check per-question feedback
        for grade in report.question_grades:
            assert len(grade.feedback) > 20, (
                f"Q{grade.question_number}: Feedback too short"
            )
            assert len(grade.strengths) >= 1, (
                f"Q{grade.question_number}: Need at least 1 strength"
            )
            assert len(grade.improvements) >= 1, (
                f"Q{grade.question_number}: Need at least 1 improvement"
            )

        print(f"✅ Overall feedback: {len(report.overall_feedback)} chars")
        print(f"✅ Recommendations: {len(report.recommendations)} items")
        print(f"✅ Strengths: {len(report.strengths_summary)} items")
        print(f"✅ Weaknesses: {len(report.weaknesses_summary)} items")
        print(f"✅ All question feedback verified")

        test_result("Feedback Quality and Structure", True)
        return True

    except Exception as e:
        test_result("Feedback Quality and Structure", False, str(e))
        return False


def test_performance_with_multiple_questions():
    """Test 6: Performance test with multiple questions."""
    print("\n" + "="*70)
    print("TEST 6: Performance with Multiple Questions")
    print("="*70)

    try:
        api_key = os.getenv("OPENAI_API_KEY")
        agent = MockExamGradingAgent(api_key)
        questions = create_sample_exam_questions()

        print(f"⏱️  Timing grading of {len(questions)} questions...")

        start_time = datetime.now()
        report = agent.grade_exam(questions)
        elapsed = (datetime.now() - start_time).total_seconds()

        avg_time_per_question = elapsed / len(questions)

        print(f"\n📊 PERFORMANCE METRICS:")
        print(f"   Total Time: {elapsed:.2f} seconds")
        print(f"   Questions: {len(questions)}")
        print(f"   Avg Time per Question: {avg_time_per_question:.2f} seconds")
        print(f"   Questions per Minute: {60 / avg_time_per_question:.1f}")

        # Performance expectations (adjust based on your needs)
        assert elapsed < 300, (
            f"Grading took too long: {elapsed}s (expected < 300s)"
        )
        assert avg_time_per_question < 60, (
            f"Per-question time too high: {avg_time_per_question}s "
            f"(expected < 60s)"
        )

        print(f"✅ Performance within acceptable limits")

        test_result("Performance with Multiple Questions", True)
        return True

    except Exception as e:
        test_result("Performance with Multiple Questions", False, str(e))
        return False


def main():
    """Run all multiple question tests."""
    print("\n" + "="*70)
    print("MOCK EXAM GRADING AGENT - MULTIPLE QUESTIONS TEST SUITE")
    print("="*70)

    # Check prerequisites
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("\n❌ ERROR: OPENAI_API_KEY not found in environment")
        print("   Please set OPENAI_API_KEY in config.env or environment")
        return 1

    print(f"\n✅ OPENAI_API_KEY found: {api_key[:10]}...")
    print(f"📝 Test exam contains 6 questions with varying difficulty")

    # Run synchronous tests
    test_synchronous_multiple_questions()
    test_score_calculation_accuracy()
    test_question_grading_consistency()
    test_feedback_quality()
    test_performance_with_multiple_questions()

    # Run async test
    try:
        asyncio.run(test_langgraph_multiple_questions())
    except Exception as e:
        test_result("LangGraph Multiple Questions (async)", False, str(e))

    # Print summary
    print("\n" + "="*70)
    print("TEST SUMMARY")
    print("="*70)
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

