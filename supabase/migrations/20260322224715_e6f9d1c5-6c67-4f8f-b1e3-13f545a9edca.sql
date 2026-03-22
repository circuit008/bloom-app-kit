
-- OCR results table
CREATE TABLE public.ocr_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_id UUID REFERENCES public.scan_results(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  extracted_text TEXT NOT NULL DEFAULT '',
  flagged_terms TEXT[] NOT NULL DEFAULT '{}',
  confidence NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ocr_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own ocr results" ON public.ocr_results FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read own ocr results" ON public.ocr_results FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- False positive reports table
CREATE TABLE public.false_positive_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  scan_id UUID REFERENCES public.scan_results(id) ON DELETE SET NULL,
  flagged_term TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.false_positive_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own false positive reports" ON public.false_positive_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read own false positive reports" ON public.false_positive_reports FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can read all false positive reports" ON public.false_positive_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can update false positive reports" ON public.false_positive_reports FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
