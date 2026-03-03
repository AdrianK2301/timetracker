-- Create the working_hours table
CREATE TABLE IF NOT EXISTS working_hours (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  attendance_ms BIGINT NOT NULL,
  actual_breaks_ms BIGINT NOT NULL,
  total_breaks_ms BIGINT NOT NULL,
  auto_deducted_ms BIGINT NOT NULL,
  work_time_ms BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metadata for breaks (JSONB for flexibility)
  breaks JSONB DEFAULT '[]'::jsonb
);

-- Enable Row Level Security
ALTER TABLE working_hours ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- Users can only see their own records
CREATE POLICY "Users can view their own working hours" 
ON working_hours FOR SELECT 
USING (auth.uid() = user_id);

-- Users can only insert their own records
CREATE POLICY "Users can insert their own working hours" 
ON working_hours FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own records
CREATE POLICY "Users can update their own working hours" 
ON working_hours FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can only delete their own records
CREATE POLICY "Users can delete their own working hours" 
ON working_hours FOR DELETE 
USING (auth.uid() = user_id);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_working_hours_user_id ON working_hours(user_id);
CREATE INDEX IF NOT EXISTS idx_working_hours_start_time ON working_hours(start_time);
