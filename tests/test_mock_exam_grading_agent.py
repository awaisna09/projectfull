"""
Tests for Mock Exam Grading Agent
"""
import pytest
import os
from unittest.mock import Mock, patch, MagicMock
from agents.mock_exam_grading_agent import (
    MockExamGradingAgent,
    QuestionGrade,
    ExamReport,
    QuestionInput,
    MockStartRequest,
)


@pytest.fixture
def api_key():
    """Mock API key."""
    return "test-api-key"


@pytest.fixture
def mock_agent(api_key):
    """Create a mock agent with mocked dependencies."""
    with patch('agents.mock_exam_grading_agent.ChatOpenAI'), \
         patch('agents.mock_exam_grading_agent.OpenAIEmbeddings'), \
         patch('agents.mock_exam_grading_agent.create_client'):
        agent = MockExamGradingAgent(api_key)
        agent.supabase = None  # Disable Supabase for tests
        agent.embeddings = None
        return agent


@pytest.fixture
def sample_question():
    """Sample question data."""
    return {
        "question_id": 1,
        "question": "What is market segmentation?",
        "user_answer": "Dividing customers into groups",
        "solution": "Market segmentation is the process of dividing...",
        "marks": 10,
        "part": "A",
    }


class TestMockExamGradingAgent:
    """Test cases for MockExamGradingAgent."""

    def test_init(self, api_key):
        """Test agent initialization."""
        with patch('agents.mock_exam_grading_agent.ChatOpenAI'), \
             patch('agents.mock_exam_grading_agent.OpenAIEmbeddings'), \
             patch('agents.mock_exam_grading_agent.create_client'):
            agent = MockExamGradingAgent(api_key)
            assert agent.api_key == api_key
            assert agent.llm is not None

    def test_difficulty_weight_from_marks(self, mock_agent):
        """Test difficulty weight calculation."""
        assert mock_agent.difficulty_weight_from_marks(3) == 1.0
        assert mock_agent.difficulty_weight_from_marks(8) == 1.2
        assert mock_agent.difficulty_weight_from_marks(15) == 1.5

    def test_base_delta_from_question_score(self, mock_agent):
        """Test base delta calculation."""
        assert mock_agent.base_delta_from_question_score(50.0) == 0.0
        assert mock_agent.base_delta_from_question_score(100.0) == 10.0
        assert mock_agent.base_delta_from_question_score(0.0) == -10.0

    def test_classify_weakness_level(self, mock_agent):
        """Test weakness level classification."""
        assert mock_agent.classify_weakness_level(25.0) == "critical"
        assert mock_agent.classify_weakness_level(35.0) == "high"
        assert mock_agent.classify_weakness_level(45.0) == "moderate"
        assert mock_agent.classify_weakness_level(55.0) == "low"
        assert mock_agent.classify_weakness_level(70.0) is None

    def test_calculate_grade(self, mock_agent):
        """Test grade calculation."""
        assert mock_agent._calculate_grade(98.0) == "A+"
        assert mock_agent._calculate_grade(95.0) == "A"
        assert mock_agent._calculate_grade(85.0) == "B+"
        assert mock_agent._calculate_grade(80.0) == "B"
        assert mock_agent._calculate_grade(70.0) == "C+"
        assert mock_agent._calculate_grade(65.0) == "D"
        assert mock_agent._calculate_grade(50.0) == "F"

    def test_detect_concepts_no_supabase(self, mock_agent):
        """Test concept detection when Supabase is unavailable."""
        result = mock_agent.detect_concepts_for_question("test question")
        assert result == []

    @patch('agents.mock_exam_grading_agent.OpenAIEmbeddings')
    def test_detect_concepts_with_embeddings(self, mock_embeddings, api_key):
        """Test concept detection with embeddings."""
        mock_emb = MagicMock()
        mock_emb.embed_query.return_value = [0.1] * 1536
        mock_embeddings.return_value = mock_emb

        with patch('agents.mock_exam_grading_agent.ChatOpenAI'), \
             patch('agents.mock_exam_grading_agent.create_client') as mock_client:
            mock_supabase = MagicMock()
            mock_supabase.rpc.return_value.execute.return_value.data = [
                {"concept_id": "1"},
                {"concept_id": "2"},
            ]
            mock_client.return_value = mock_supabase

            agent = MockExamGradingAgent(api_key)
            agent.embeddings = mock_emb
            agent.supabase = mock_supabase

            result = agent.detect_concepts_for_question("test question")
            assert len(result) == 2
            assert "1" in result
            assert "2" in result

    def test_apply_mastery_update_no_supabase(self, mock_agent):
        """Test mastery update when Supabase is unavailable."""
        result = mock_agent.apply_mastery_update(
            "user1", "concept1", 5.0, 10
        )
        assert result == 0.0

    def test_compute_readiness_score(self, mock_agent):
        """Test readiness score computation."""
        exam_report = ExamReport(
            total_questions=5,
            questions_attempted=5,
            total_marks=50,
            marks_obtained=40,
            percentage_score=80.0,
            overall_grade="B",
            question_grades=[],
            overall_feedback="Good",
            recommendations=[],
            strengths_summary=[],
            weaknesses_summary=[],
        )
        mastery_updates = {"concept1": 75.0, "concept2": 85.0}

        score = mock_agent.compute_readiness_score(
            "user1", exam_report, mastery_updates
        )
        assert 0.0 <= score <= 100.0

    @patch('agents.mock_exam_grading_agent.ChatOpenAI')
    def test_grade_single_question(self, mock_llm_class, mock_agent, sample_question):
        """Test single question grading."""
        mock_llm = MagicMock()
        mock_response = MagicMock()
        mock_response.content = json.dumps({
            "marks_awarded": 8,
            "percentage_score": 80.0,
            "feedback": "Good answer",
            "strengths": ["Clear explanation"],
            "improvements": ["Add more detail"],
        })
        mock_llm.invoke.return_value = mock_response
        mock_llm_class.return_value = mock_llm
        mock_agent.llm = mock_llm

        grade = mock_agent._grade_single_question(sample_question)
        assert isinstance(grade, QuestionGrade)
        assert grade.marks_awarded == 8.0
        assert grade.percentage_score == 80.0

    def test_grade_single_question_no_model_answer(self, mock_agent):
        """Test grading when no model answer is provided."""
        question = {
            "question_id": 1,
            "question": "Test question",
            "user_answer": "Some answer",
            "marks": 10,
        }
        grade = mock_agent._grade_single_question(question)
        assert grade.marks_awarded == 5.0  # 50% of marks
        assert grade.percentage_score == 50.0


class TestQuestionInput:
    """Test cases for QuestionInput model."""

    def test_valid_question_input(self):
        """Test valid question input."""
        question = QuestionInput(
            question_id=1,
            question="Test question",
            user_answer="Answer",
            solution="Model answer",
            marks=10,
        )
        assert question.question_id == 1
        assert question.marks == 10

    def test_question_input_validation_no_solution(self):
        """Test that solution or model_answer is required."""
        with pytest.raises(ValueError):
            QuestionInput(
                question_id=1,
                question="Test question",
                user_answer="Answer",
                marks=10,
            )

    def test_question_input_validation_marks_range(self):
        """Test marks validation."""
        with pytest.raises(Exception):  # Pydantic validation error
            QuestionInput(
                question_id=1,
                question="Test question",
                solution="Model answer",
                marks=150,  # Exceeds max
            )


class TestMockStartRequest:
    """Test cases for MockStartRequest model."""

    def test_valid_request(self):
        """Test valid request."""
        questions = [
            QuestionInput(
                question_id=1,
                question="Q1",
                solution="A1",
                marks=10,
            )
        ]
        request = MockStartRequest(
            user_id="user123",
            attempted_questions=questions,
        )
        assert request.user_id == "user123"
        assert len(request.attempted_questions) == 1

    def test_empty_user_id(self):
        """Test that empty user_id is rejected."""
        with pytest.raises(ValueError):
            MockStartRequest(
                user_id="",
                attempted_questions=[
                    QuestionInput(
                        question_id=1,
                        question="Q1",
                        solution="A1",
                        marks=10,
                    )
                ],
            )

    def test_empty_questions(self):
        """Test that empty questions list is rejected."""
        with pytest.raises(ValueError):
            MockStartRequest(
                user_id="user123",
                attempted_questions=[],
            )

    def test_too_many_questions(self):
        """Test that too many questions are rejected."""
        questions = [
            QuestionInput(
                question_id=i,
                question=f"Q{i}",
                solution=f"A{i}",
                marks=10,
            )
            for i in range(101)  # 101 questions
        ]
        with pytest.raises(ValueError):
            MockStartRequest(
                user_id="user123",
                attempted_questions=questions,
            )


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

