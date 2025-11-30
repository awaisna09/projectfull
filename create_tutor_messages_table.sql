-- Create tutor_messages table for AI Tutor conversation history
-- This table stores all messages in AI Tutor conversations

CREATE TABLE IF NOT EXISTS tutor_messages (
    -- Primary key
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Conversation identifier (matches conversation_id from TutorRequest)
    conversation_id TEXT NOT NULL,
    
    -- Message role: 'user' or 'assistant'
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    
    -- Message content
    message_text TEXT NOT NULL,
    
    -- User ID (optional, for tracking)
    user_id UUID,
    
    -- Topic (optional, for reference)
    topic TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_tutor_messages_conversation_id 
    ON tutor_messages(conversation_id);

CREATE INDEX IF NOT EXISTS idx_tutor_messages_created_at 
    ON tutor_messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tutor_messages_user_id 
    ON tutor_messages(user_id);

CREATE INDEX IF NOT EXISTS idx_tutor_messages_conversation_created 
    ON tutor_messages(conversation_id, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE tutor_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own messages
CREATE POLICY "Users can view their own tutor messages"
    ON tutor_messages
    FOR SELECT
    USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own messages
CREATE POLICY "Users can insert their own tutor messages"
    ON tutor_messages
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own messages
CREATE POLICY "Users can update their own tutor messages"
    ON tutor_messages
    FOR UPDATE
    USING (auth.uid() = user_id);

-- RLS Policy: Users can delete their own messages
CREATE POLICY "Users can delete their own tutor messages"
    ON tutor_messages
    FOR DELETE
    USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tutor_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on row update
CREATE TRIGGER tutor_messages_updated_at
    BEFORE UPDATE ON tutor_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_tutor_messages_updated_at();

-- Comments for documentation
COMMENT ON TABLE tutor_messages IS 'Stores all messages in AI Tutor conversations';
COMMENT ON COLUMN tutor_messages.conversation_id IS 'Unique identifier for a conversation thread';
COMMENT ON COLUMN tutor_messages.role IS 'Message role: user or assistant';
COMMENT ON COLUMN tutor_messages.message_text IS 'The actual message content';
COMMENT ON COLUMN tutor_messages.user_id IS 'Reference to the user who owns this conversation';

