
ALTER TABLE public.scan_results 
ADD COLUMN IF NOT EXISTS fail_reason TEXT,
ADD COLUMN IF NOT EXISTS ip_score_raw INT,
ADD COLUMN IF NOT EXISTS overall_score_capped BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_scan_fail_reason ON public.scan_results(fail_reason);
