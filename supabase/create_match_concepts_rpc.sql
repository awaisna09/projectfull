-- Create match_concepts RPC function for pgvector similarity search
-- This function is used by the Mock Exam Grading Agent for concept detection

-- Enable pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Create or replace the match_concepts function
CREATE OR REPLACE FUNCTION match_concepts(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 5,
    subject_filter text DEFAULT NULL,
    topic_filter int DEFAULT NULL
)
RETURNS TABLE (
    concept_id text,
    concept text,
    explanation text,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ce.concept_id::text,
        ce.concept,
        ce.explanation,
        1 - (ce.embedding <=> query_embedding) as similarity
    FROM concept_embeddings ce
    WHERE
        -- Check similarity threshold
        1 - (ce.embedding <=> query_embedding) >= match_threshold
        -- Optional subject filter
        AND (subject_filter IS NULL OR ce.subject_id = subject_filter)
        -- Optional topic filter
        AND (topic_filter IS NULL OR ce.topic_id = topic_filter)
    ORDER BY ce.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION match_concepts TO authenticated;
GRANT EXECUTE ON FUNCTION match_concepts TO service_role;

-- Add comment
COMMENT ON FUNCTION match_concepts IS 
'Performs pgvector similarity search on concept_embeddings table. Returns top matching concepts based on embedding similarity.';

