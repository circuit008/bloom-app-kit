
-- Add new columns to trademark_database
ALTER TABLE public.trademark_database
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS region TEXT DEFAULT 'global',
  ADD COLUMN IF NOT EXISTS owner_name TEXT,
  ADD COLUMN IF NOT EXISTS registration_number TEXT,
  ADD COLUMN IF NOT EXISTS auto_synced BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_verified TIMESTAMP WITH TIME ZONE;

-- Add unique constraint on term for upsert support
ALTER TABLE public.trademark_database
  ADD CONSTRAINT trademark_database_term_unique UNIQUE (term);

-- Create api_sync_logs table
CREATE TABLE public.api_sync_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,
  trademarks_synced INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  sync_duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.api_sync_logs ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read sync logs
CREATE POLICY "Authenticated users can read sync logs"
  ON public.api_sync_logs FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can insert sync logs
CREATE POLICY "Authenticated users can insert sync logs"
  ON public.api_sync_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);
