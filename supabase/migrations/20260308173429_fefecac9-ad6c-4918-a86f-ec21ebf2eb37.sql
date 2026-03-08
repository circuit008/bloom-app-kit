
-- Create trademark_database table
CREATE TABLE public.trademark_database (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  term TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  risk_level TEXT NOT NULL DEFAULT 'high',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trademark_database ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read
CREATE POLICY "Authenticated users can read trademarks"
  ON public.trademark_database
  FOR SELECT
  TO authenticated
  USING (true);
