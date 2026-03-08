
-- Accessibility rules table
CREATE TABLE public.accessibility_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name text NOT NULL,
  description text,
  min_contrast_ratio numeric NOT NULL DEFAULT 4.5,
  wcag_level text NOT NULL DEFAULT 'AA',
  category text NOT NULL DEFAULT 'contrast',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.accessibility_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read accessibility rules"
  ON public.accessibility_rules FOR SELECT
  USING (true);

-- Print requirements table
CREATE TABLE public.print_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_type text NOT NULL,
  min_width_px integer NOT NULL,
  min_height_px integer NOT NULL,
  recommended_dpi integer NOT NULL DEFAULT 300,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.print_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read print requirements"
  ON public.print_requirements FOR SELECT
  USING (true);

-- Seed accessibility rules
INSERT INTO public.accessibility_rules (rule_name, description, min_contrast_ratio, wcag_level, category) VALUES
  ('Normal Text AA', 'Minimum contrast for normal text at WCAG AA', 4.5, 'AA', 'contrast'),
  ('Large Text AA', 'Minimum contrast for large text at WCAG AA', 3.0, 'AA', 'contrast'),
  ('Normal Text AAA', 'Enhanced contrast for normal text at WCAG AAA', 7.0, 'AAA', 'contrast'),
  ('Large Text AAA', 'Enhanced contrast for large text at WCAG AAA', 4.5, 'AAA', 'contrast');

-- Seed print requirements
INSERT INTO public.print_requirements (product_type, min_width_px, min_height_px, recommended_dpi, description) VALUES
  ('T-Shirt (Standard)', 2400, 3200, 300, 'Standard front print area'),
  ('T-Shirt (All-Over)', 4500, 5400, 150, 'All-over sublimation print'),
  ('Mug (11oz)', 2700, 1100, 300, 'Standard 11oz mug wrap'),
  ('Poster (18x24)', 5400, 7200, 300, '18x24 inch poster'),
  ('Phone Case', 1800, 3200, 300, 'Standard phone case print'),
  ('Tote Bag', 3600, 3600, 300, 'Standard tote bag print area'),
  ('Hoodie', 3000, 3500, 300, 'Standard hoodie front print');
