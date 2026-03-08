
-- Eco printers table
CREATE TABLE public.eco_printers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT 'US',
  certifications TEXT[] DEFAULT '{}',
  website_url TEXT,
  affiliate_url TEXT,
  description TEXT,
  rating NUMERIC DEFAULT 4.0,
  min_order INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.eco_printers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read eco printers" ON public.eco_printers FOR SELECT USING (true);

-- Scan results table
CREATE TABLE public.scan_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  ip_score INTEGER NOT NULL DEFAULT 0,
  accessibility_score INTEGER NOT NULL DEFAULT 0,
  quality_score INTEGER NOT NULL DEFAULT 0,
  transparency_score INTEGER NOT NULL DEFAULT 0,
  overall_score INTEGER NOT NULL DEFAULT 0,
  passed BOOLEAN NOT NULL DEFAULT false,
  keywords TEXT[] DEFAULT '{}',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.scan_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own scan results" ON public.scan_results FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read own scan results" ON public.scan_results FOR SELECT TO authenticated USING (auth.uid() = user_id);
