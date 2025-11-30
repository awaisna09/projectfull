# Mock Exam Grading Service API Documentation

## Overview

The Mock Exam Grading Service is a FastAPI microservice that provides asynchronous grading of mock exams using LangGraph workflows. It supports concept detection, mastery tracking, weakness identification, and readiness scoring.

## Base URL

```
http://localhost:8000
```

## Authentication

Currently, the service does not require authentication. In production, you should add API key authentication or JWT tokens.

## Endpoints

### 1. Start Mock Exam Grading

**POST** `/api/v1/mock/start`

Submit a mock exam for asynchronous grading.

#### Request Body

```json
{
  "user_id": "string (required, min length: 1)",
  "attempted_questions": [
    {
      "question_id": "integer (required, > 0)",
      "question": "string (required, min length: 1)",
      "user_answer": "string (optional, default: '')",
      "solution": "string (optional, but either solution or model_answer required)",
      "model_answer": "string (optional, but either solution or model_answer required)",
      "marks": "integer (required, 1-100)",
      "part": "string (optional, default: '')",
      "question_number": "integer (optional)",
      "topic_id": "integer (optional)"
    }
  ]
}
```

#### Request Validation

- `user_id`: Cannot be empty
- `attempted_questions`: Must contain 1-100 questions
- Each question must have either `solution` or `model_answer`
- `marks` must be between 1 and 100

#### Response

**200 OK**

```json
{
  "job_id": "uuid",
  "status": "pending"
}
```

#### Example Request

```bash
curl -X POST "http://localhost:8000/api/v1/mock/start" \
  -H "Content-Type: application/json" \
  -H "X-Request-ID: custom-request-id" \
  -d '{
    "user_id": "user-123",
    "attempted_questions": [
      {
        "question_id": 1,
        "question": "Explain market segmentation.",
        "user_answer": "Dividing customers into groups",
        "solution": "Market segmentation is the process...",
        "marks": 10,
        "part": "A"
      }
    ]
  }'
```

#### Error Responses

**400 Bad Request**: Invalid request data
```json
{
  "detail": "attempted_questions cannot be empty"
}
```

**429 Too Many Requests**: Rate limit exceeded
```json
{
  "error": "Rate limit exceeded",
  "message": "Maximum 100 requests per 60 seconds",
  "retry_after": 60
}
```

---

### 2. Get Job Status

**GET** `/api/v1/mock/status/{job_id}`

Check the status of a grading job and retrieve results when complete.

#### Path Parameters

- `job_id` (string, required): The job ID returned from `/api/v1/mock/start`

#### Response

**200 OK**

```json
{
  "job_id": "uuid",
  "status": "pending | processing | completed | failed",
  "result": {
    // ExamReport object (only present when status is "completed")
    "total_questions": 5,
    "questions_attempted": 5,
    "total_marks": 50,
    "marks_obtained": 40.0,
    "percentage_score": 80.0,
    "overall_grade": "B",
    "question_grades": [...],
    "overall_feedback": "...",
    "recommendations": [...],
    "strengths_summary": [...],
    "weaknesses_summary": [...],
    "readiness_score": 75.5
  },
  "error": "string (only present when status is 'failed')"
}
```

#### Status Values

- `pending`: Job is queued but not yet processing
- `processing`: Job is currently being graded
- `completed`: Job finished successfully (result available)
- `failed`: Job encountered an error (error message available)

#### Example Request

```bash
curl "http://localhost:8000/api/v1/mock/status/123e4567-e89b-12d3-a456-426614174000"
```

#### Error Responses

**404 Not Found**: Job not found
```json
{
  "detail": "Job 123e4567-e89b-12d3-a456-426614174000 not found. It may have expired or never existed."
}
```

---

### 3. Health Check

**GET** `/health`

Check if the service is running and healthy.

#### Response

**200 OK**

```json
{
  "status": "healthy",
  "service": "mock_exam_grading",
  "timestamp": "2024-01-01T12:00:00",
  "metrics": {
    "jobs_created": 100,
    "jobs_completed": 95,
    "jobs_failed": 5,
    "questions_graded": 500,
    "api_requests": 200,
    "api_errors": 2,
    "supabase_retries": 10,
    "supabase_failures": 1
  },
  "active_jobs": 3,
  "total_jobs": 100
}
```

---

### 4. Service Metrics

**GET** `/metrics`

Get detailed service metrics and statistics.

#### Response

**200 OK**

```json
{
  "metrics": {
    "jobs_created": 100,
    "jobs_completed": 95,
    "jobs_failed": 5,
    "questions_graded": 500,
    "api_requests": 200,
    "api_errors": 2,
    "supabase_retries": 10,
    "supabase_failures": 1
  },
  "job_store_size": 100,
  "active_jobs": 3,
  "completed_jobs": 95,
  "failed_jobs": 5
}
```

---

## Request Headers

### X-Request-ID (Optional)

You can provide a custom request ID for tracing:

```
X-Request-ID: my-custom-request-id
```

If not provided, the service will generate a UUID. The request ID is returned in the response headers and included in all logs.

---

## Rate Limiting

The service implements rate limiting to prevent abuse:

- **Default**: 100 requests per 60 seconds per IP address
- **Configurable**: Set via environment variables:
  - `RATE_LIMIT_REQUESTS`: Maximum requests (default: 100)
  - `RATE_LIMIT_WINDOW`: Time window in seconds (default: 60)

When rate limited, you'll receive a `429 Too Many Requests` response with a `Retry-After` header.

---

## Job Expiration

Jobs are automatically cleaned up after a configurable period:

- **Default**: 24 hours
- **Configurable**: Set `JOB_EXPIRY_HOURS` environment variable

Expired jobs cannot be retrieved via the status endpoint.

---

## Error Handling

### Standard Error Response Format

```json
{
  "detail": "Error message"
}
```

### Common Error Codes

- `400 Bad Request`: Invalid request data
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

## Workflow

1. **Submit Exam**: POST to `/api/v1/mock/start` with exam data
2. **Get Job ID**: Receive `job_id` in response
3. **Poll Status**: GET `/api/v1/mock/status/{job_id}` periodically
4. **Retrieve Results**: When status is `completed`, results are in the response

### Recommended Polling Strategy

- Poll every 2-5 seconds while status is `pending` or `processing`
- Stop polling when status is `completed` or `failed`
- Implement exponential backoff for failed requests

---

## Data Models

### QuestionGrade

```json
{
  "question_id": 1,
  "question_number": 1,
  "part": "A",
  "question_text": "...",
  "student_answer": "...",
  "model_answer": "...",
  "marks_allocated": 10,
  "marks_awarded": 8.0,
  "percentage_score": 80.0,
  "feedback": "...",
  "strengths": ["..."],
  "improvements": ["..."],
  "concept_ids": ["concept1", "concept2"]
}
```

### ExamReport

```json
{
  "total_questions": 5,
  "questions_attempted": 5,
  "total_marks": 50,
  "marks_obtained": 40.0,
  "percentage_score": 80.0,
  "overall_grade": "B",
  "question_grades": [...],
  "overall_feedback": "...",
  "recommendations": [...],
  "strengths_summary": [...],
  "weaknesses_summary": [...],
  "readiness_score": 75.5
}
```

---

## OpenAPI Documentation

Interactive API documentation is available at:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`

---

## Support

For issues or questions, please contact the development team or check the deployment guide.

