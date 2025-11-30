# Mock Exam Grading Service - Deployment Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Running the Service](#running-the-service)
7. [Production Deployment](#production-deployment)
8. [Monitoring and Observability](#monitoring-and-observability)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Python 3.10+**
- **PostgreSQL 14+** (for Supabase)
- **Supabase Account** (or self-hosted Supabase)
- **OpenAI API Key**

### Required Python Packages

All dependencies are listed in `requirements.txt`. Install with:

```bash
pip install -r requirements.txt
```

---

## Environment Setup

### 1. Create Environment File

Create a `config.env` file in the project root:

```bash
# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here
GRADING_MODEL=gpt-4o-mini  # or your preferred model
EMBEDDING_MODEL=text-embedding-3-small

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
# OR use anon key (less secure)
# SUPABASE_ANON_KEY=your-anon-key

# Service Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
JOB_EXPIRY_HOURS=24
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60

# Optional: LangSmith Tracing
LANGSMITH_API_KEY=your-langsmith-key
LANGSMITH_PROJECT=imtehaan-mock-exam
LANGSMITH_ENDPOINT=https://api.smith.langchain.com
LANGSMITH_TRACING=true
```

### 2. Environment Variables

Alternatively, set environment variables directly:

```bash
export OPENAI_API_KEY="your-key"
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-key"
```

---

## Database Setup

### 1. Create Supabase RPC Function

Run the SQL script to create the `match_concepts` RPC function:

```bash
# In Supabase SQL Editor or via psql
psql -h your-db-host -U postgres -d postgres -f supabase/create_match_concepts_rpc.sql
```

Or manually execute the SQL in `supabase/create_match_concepts_rpc.sql`.

### 2. Verify Required Tables

Ensure the following tables exist in your Supabase database:

- `exam_attempts`
- `exam_question_results`
- `student_mastery`
- `student_weaknesses`
- `student_readiness`
- `concepts` (with `embedding` column of type `vector(1536)`)

### 3. Create Missing Tables (if needed)

If tables don't exist, create them with appropriate schemas. Example:

```sql
-- exam_attempts
CREATE TABLE IF NOT EXISTS exam_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    total_marks INTEGER NOT NULL,
    marks_obtained FLOAT NOT NULL,
    percentage_score FLOAT NOT NULL,
    overall_grade TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- exam_question_results
CREATE TABLE IF NOT EXISTS exam_question_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES exam_attempts(id),
    question_id INTEGER NOT NULL,
    marks_allocated INTEGER NOT NULL,
    marks_awarded FLOAT NOT NULL,
    percentage_score FLOAT NOT NULL,
    feedback TEXT,
    concept_ids TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- student_mastery
CREATE TABLE IF NOT EXISTS student_mastery (
    user_id TEXT NOT NULL,
    concept_id TEXT NOT NULL,
    mastery FLOAT NOT NULL CHECK (mastery >= 0 AND mastery <= 100),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, concept_id)
);

-- student_weaknesses
CREATE TABLE IF NOT EXISTS student_weaknesses (
    user_id TEXT NOT NULL,
    concept_id TEXT NOT NULL,
    level TEXT NOT NULL CHECK (level IN ('critical', 'high', 'moderate', 'low')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, concept_id)
);

-- student_readiness
CREATE TABLE IF NOT EXISTS student_readiness (
    user_id TEXT PRIMARY KEY,
    readiness_score FLOAT NOT NULL CHECK (readiness_score >= 0 AND readiness_score <= 100),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd imtehaan-ai-edtech-platform
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Verify Installation

```bash
python -c "from agents.mock_exam_grading_agent import MockExamGradingAgent; print('✅ Installation successful')"
```

---

## Configuration

### Rate Limiting

Adjust rate limits based on your needs:

```env
RATE_LIMIT_REQUESTS=100  # Max requests per window
RATE_LIMIT_WINDOW=60     # Window in seconds
```

### Job Expiration

Control how long jobs are retained:

```env
JOB_EXPIRY_HOURS=24  # Jobs expire after 24 hours
```

### CORS Configuration

Configure allowed origins:

```env
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

---

## Running the Service

### Development Mode

```bash
# Using uvicorn directly
uvicorn agents.mock_exam_grading_agent:app --reload --host 0.0.0.0 --port 8000

# Or using Python
python -m uvicorn agents.mock_exam_grading_agent:app --reload
```

### Production Mode

```bash
uvicorn agents.mock_exam_grading_agent:app \
    --host 0.0.0.0 \
    --port 8000 \
    --workers 4 \
    --log-level info
```

### Using Gunicorn (Recommended for Production)

```bash
gunicorn agents.mock_exam_grading_agent:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000 \
    --timeout 120 \
    --log-level info
```

---

## Production Deployment

### 1. Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "agents.mock_exam_grading_agent:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:

```bash
docker build -t mock-exam-grading .
docker run -p 8000:8000 --env-file config.env mock-exam-grading
```

### 2. Systemd Service

Create `/etc/systemd/system/mock-exam-grading.service`:

```ini
[Unit]
Description=Mock Exam Grading Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/project
Environment="PATH=/path/to/venv/bin"
ExecStart=/path/to/venv/bin/uvicorn agents.mock_exam_grading_agent:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable mock-exam-grading
sudo systemctl start mock-exam-grading
sudo systemctl status mock-exam-grading
```

### 3. Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Request-ID $request_id;
    }
}
```

### 4. Cloud Deployment

#### AWS (Elastic Beanstalk / ECS)

- Use Docker container
- Configure environment variables
- Set up load balancer
- Enable health checks

#### Google Cloud (Cloud Run)

```bash
gcloud run deploy mock-exam-grading \
    --source . \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --set-env-vars "OPENAI_API_KEY=...,SUPABASE_URL=..."
```

#### Heroku

```bash
heroku create mock-exam-grading
heroku config:set OPENAI_API_KEY=...
heroku config:set SUPABASE_URL=...
git push heroku main
```

---

## Monitoring and Observability

### 1. Health Checks

Monitor the `/health` endpoint:

```bash
curl http://localhost:8000/health
```

### 2. Metrics Endpoint

Check metrics:

```bash
curl http://localhost:8000/metrics
```

### 3. Logging

Logs are structured JSON. Configure log aggregation:

- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Loki + Grafana**
- **CloudWatch** (AWS)
- **Stackdriver** (GCP)

### 4. LangSmith Tracing

If `LANGSMITH_API_KEY` is set, traces are automatically sent to LangSmith.

View traces at: https://smith.langchain.com

### 5. Application Performance Monitoring (APM)

Consider integrating:
- **Sentry** for error tracking
- **Datadog** for APM
- **New Relic** for performance monitoring

---

## Troubleshooting

### Common Issues

#### 1. Supabase Connection Failed

**Error**: `Supabase credentials not found`

**Solution**:
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `config.env`
- Check network connectivity
- Verify Supabase project is active

#### 2. RPC Function Not Found

**Error**: `function match_concepts does not exist`

**Solution**:
- Run `supabase/create_match_concepts_rpc.sql` in Supabase SQL Editor
- Verify `pgvector` extension is enabled

#### 3. Rate Limiting Too Aggressive

**Error**: `429 Too Many Requests`

**Solution**:
- Increase `RATE_LIMIT_REQUESTS` or `RATE_LIMIT_WINDOW`
- Implement client-side rate limiting
- Use request queuing

#### 4. Jobs Expiring Too Quickly

**Error**: `Job not found`

**Solution**:
- Increase `JOB_EXPIRY_HOURS`
- Poll status more frequently
- Implement job result persistence (database instead of in-memory)

#### 5. OpenAI API Errors

**Error**: `OpenAI API error`

**Solution**:
- Verify `OPENAI_API_KEY` is valid
- Check API quota/rate limits
- Verify model name is correct

#### 6. Memory Issues

**Error**: Out of memory

**Solution**:
- Reduce `--workers` count
- Implement job result pagination
- Use external job store (Redis) instead of in-memory

---

## Security Considerations

### 1. API Authentication

**Current**: No authentication (development only)

**Production**: Add authentication:
- API keys
- JWT tokens
- OAuth2

### 2. Environment Variables

- Never commit `config.env` to version control
- Use secrets management (AWS Secrets Manager, HashiCorp Vault)
- Rotate keys regularly

### 3. CORS Configuration

- Restrict `ALLOWED_ORIGINS` to specific domains
- Never use `*` in production

### 4. Rate Limiting

- Implement per-user rate limiting
- Use distributed rate limiting (Redis) for multi-instance deployments

### 5. Input Validation

- Already implemented via Pydantic
- Consider additional sanitization for user inputs

---

## Scaling Considerations

### Horizontal Scaling

For multiple instances:

1. **Use External Job Store**: Replace in-memory `JOB_STORE` with Redis
2. **Distributed Rate Limiting**: Use Redis for rate limit tracking
3. **Load Balancer**: Distribute requests across instances
4. **Database Connection Pooling**: Configure Supabase connection pooling

### Vertical Scaling

- Increase worker count: `--workers 8`
- Increase memory allocation
- Use faster CPU instances

---

## Backup and Recovery

### 1. Database Backups

- Configure Supabase automatic backups
- Export job results periodically
- Backup Supabase RPC functions

### 2. Log Retention

- Retain logs for at least 30 days
- Archive older logs
- Monitor log size

---

## Support

For issues or questions:

1. Check logs: `journalctl -u mock-exam-grading -f`
2. Review metrics: `curl http://localhost:8000/metrics`
3. Check health: `curl http://localhost:8000/health`
4. Contact development team

---

## Version History

- **v1.0.0**: Initial release with FastAPI, LangGraph, and Supabase integration

