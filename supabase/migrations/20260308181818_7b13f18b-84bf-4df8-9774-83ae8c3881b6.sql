
CREATE TABLE public.trademark_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reported_term TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  evidence_url TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.trademark_reports ENABLE ROW LEVEL SECURITY;

-- Users can read their own reports
CREATE POLICY "Users can read own reports"
  ON public.trademark_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own reports
CREATE POLICY "Users can insert own reports"
  ON public.trademark_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow all authenticated users to read all reports (for admin view)
CREATE POLICY "Authenticated users can read all reports"
  ON public.trademark_reports FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to update report status (admin use)
CREATE POLICY "Authenticated users can update reports"
  ON public.trademark_reports FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
