-- Create study plan related tables for Daily Study Load Planner
-- This extends the existing study_plans table and adds new tracking tables

-- First, enhance the existing study_plans table with new fields
-- Note: This uses ALTER TABLE to add columns if they don't exist
DO $$ 
BEGIN
  -- Add new columns to study_plans if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'study_plans' AND column_name = 'target_date') THEN
    ALTER TABLE public.study_plans ADD COLUMN target_date DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'study_plans' AND column_name = 'study_days_per_week') THEN
    ALTER TABLE public.study_plans ADD COLUMN study_days_per_week INTEGER DEFAULT 7 
      CHECK (study_days_per_week >= 1 AND study_days_per_week <= 7);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'study_plans' AND column_name = 'max_daily_minutes') THEN
    ALTER TABLE public.study_plans ADD COLUMN max_daily_minutes INTEGER;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'study_plans' AND column_name = 'total_required_minutes') THEN
    ALTER TABLE public.study_plans ADD COLUMN total_required_minutes INTEGER NOT NULL DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'study_plans' AND column_name = 'total_study_days') THEN
    ALTER TABLE public.study_plans ADD COLUMN total_study_days INTEGER NOT NULL DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'study_plans' AND column_name = 'daily_minutes_required') THEN
    ALTER TABLE public.study_plans ADD COLUMN daily_minutes_required INTEGER NOT NULL DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'study_plans' AND column_name = 'subject_id') THEN
    ALTER TABLE public.study_plans ADD COLUMN subject_id INTEGER REFERENCES public.subjects(subject_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'study_plans' AND column_name = 'metadata') THEN
    ALTER TABLE public.study_plans ADD COLUMN metadata JSONB DEFAULT '{}';
  END IF;
  
  -- Update status check constraint to include new statuses
  ALTER TABLE public.study_plans DROP CONSTRAINT IF EXISTS study_plans_status_check;
  ALTER TABLE public.study_plans ADD CONSTRAINT study_plans_status_check 
    CHECK (status IN ('active', 'completed', 'paused', 'archived', 'cancelled', 'expired'));
END $$;

-- Create study_plan_units junction table
CREATE TABLE IF NOT EXISTS public.study_plan_units (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id BIGINT NOT NULL REFERENCES public.study_plans(plan_id) ON DELETE CASCADE,
  topic_id INTEGER NOT NULL REFERENCES public.topics(topic_id) ON DELETE CASCADE,
  
  -- Unit contribution to the plan
  unit_required_minutes INTEGER NOT NULL DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one entry per plan-unit combination
  UNIQUE(plan_id, topic_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_study_plan_units_plan_id ON public.study_plan_units(plan_id);
CREATE INDEX IF NOT EXISTS idx_study_plan_units_topic_id ON public.study_plan_units(topic_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.study_plan_units ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see units for their own study plans
CREATE POLICY "Users can view their own study plan units"
  ON public.study_plan_units
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.study_plans 
      WHERE study_plans.plan_id = study_plan_units.plan_id 
      AND study_plans.user_id = auth.uid()
    )
  );

-- Create policy: Users can insert units for their own study plans
CREATE POLICY "Users can insert their own study plan units"
  ON public.study_plan_units
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.study_plans 
      WHERE study_plans.plan_id = study_plan_units.plan_id 
      AND study_plans.user_id = auth.uid()
    )
  );

-- Create study_plan_daily_logs table for daily tracking
CREATE TABLE IF NOT EXISTS public.study_plan_daily_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id BIGINT NOT NULL REFERENCES public.study_plans(plan_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Planned values
  planned_minutes INTEGER NOT NULL DEFAULT 0,
  planned_questions_minutes INTEGER DEFAULT 0,
  planned_lessons_minutes INTEGER DEFAULT 0,
  planned_flashcards_minutes INTEGER DEFAULT 0,
  
  -- Actual values (tracked from activities)
  actual_total_minutes INTEGER DEFAULT 0,
  actual_questions_minutes INTEGER DEFAULT 0,
  actual_lessons_minutes INTEGER DEFAULT 0,
  actual_flashcards_minutes INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'done', 'missed')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one log per plan per day
  UNIQUE(plan_id, date)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_study_plan_daily_logs_plan_id ON public.study_plan_daily_logs(plan_id);
CREATE INDEX IF NOT EXISTS idx_study_plan_daily_logs_date ON public.study_plan_daily_logs(date);
CREATE INDEX IF NOT EXISTS idx_study_plan_daily_logs_status ON public.study_plan_daily_logs(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.study_plan_daily_logs ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see logs for their own study plans
CREATE POLICY "Users can view their own study plan daily logs"
  ON public.study_plan_daily_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.study_plans 
      WHERE study_plans.plan_id = study_plan_daily_logs.plan_id 
      AND study_plans.user_id = auth.uid()
    )
  );

-- Create policy: Users can insert/update logs for their own study plans
CREATE POLICY "Users can manage their own study plan daily logs"
  ON public.study_plan_daily_logs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.study_plans 
      WHERE study_plans.plan_id = study_plan_daily_logs.plan_id 
      AND study_plans.user_id = auth.uid()
    )
  );

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_study_plan_daily_logs_updated_at
    BEFORE UPDATE ON public.study_plan_daily_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE public.study_plan_units IS 'Junction table linking study plans to units/topics with required minutes per unit';
COMMENT ON TABLE public.study_plan_daily_logs IS 'Daily tracking of planned vs actual study time for each study plan';
COMMENT ON COLUMN public.study_plan_daily_logs.status IS 'pending: not started, partial: some progress, done: completed, missed: no progress';

