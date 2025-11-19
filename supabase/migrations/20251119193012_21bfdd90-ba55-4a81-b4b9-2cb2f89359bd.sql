-- Create designs table to store all generated t-shirt designs
CREATE TABLE IF NOT EXISTS public.designs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  prompt TEXT NOT NULL,
  style TEXT NOT NULL,
  color_scheme TEXT,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  uploaded_to_shopify BOOLEAN NOT NULL DEFAULT false,
  shopify_product_id TEXT,
  event_tag TEXT
);

-- Enable RLS
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for designs
CREATE POLICY "Users can view their own designs"
  ON public.designs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own designs"
  ON public.designs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own designs"
  ON public.designs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own designs"
  ON public.designs FOR DELETE
  USING (auth.uid() = user_id);

-- Create events_calendar table for USA/Canada events
CREATE TABLE IF NOT EXISTS public.events_calendar (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  event_date DATE NOT NULL,
  country TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  suggested_themes TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Make events_calendar publicly readable (no user_id needed)
ALTER TABLE public.events_calendar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are viewable by everyone"
  ON public.events_calendar FOR SELECT
  USING (true);

-- Insert major USA/Canada events
INSERT INTO public.events_calendar (name, event_date, country, category, description, suggested_themes) VALUES
  ('Christmas', '2025-12-25', 'USA/Canada', 'Holiday', 'Christmas celebration', ARRAY['santa', 'reindeer', 'snowman', 'gifts', 'christmas tree']),
  ('New Year', '2026-01-01', 'USA/Canada', 'Holiday', 'New Year celebration', ARRAY['fireworks', 'champagne', 'countdown', 'party']),
  ('Valentine''s Day', '2026-02-14', 'USA/Canada', 'Holiday', 'Day of love and romance', ARRAY['hearts', 'love', 'cupid', 'roses', 'romance']),
  ('St. Patrick''s Day', '2026-03-17', 'USA/Canada', 'Holiday', 'Irish celebration', ARRAY['shamrock', 'leprechaun', 'green', 'lucky']),
  ('Easter', '2026-04-05', 'USA/Canada', 'Holiday', 'Easter celebration', ARRAY['bunny', 'eggs', 'spring', 'chicks']),
  ('Mother''s Day', '2026-05-10', 'USA/Canada', 'Holiday', 'Celebrating mothers', ARRAY['mom', 'flowers', 'family', 'love']),
  ('Father''s Day', '2026-06-21', 'USA/Canada', 'Holiday', 'Celebrating fathers', ARRAY['dad', 'family', 'tools', 'grilling']),
  ('Independence Day', '2026-07-04', 'USA', 'Holiday', 'American Independence Day', ARRAY['flag', 'fireworks', 'patriotic', 'eagle']),
  ('Canada Day', '2026-07-01', 'Canada', 'Holiday', 'Canadian national day', ARRAY['maple leaf', 'flag', 'patriotic', 'beaver']),
  ('Halloween', '2025-10-31', 'USA/Canada', 'Holiday', 'Spooky celebration', ARRAY['pumpkin', 'ghost', 'witch', 'skeleton', 'candy']),
  ('Thanksgiving', '2025-11-27', 'USA', 'Holiday', 'Thanksgiving Day', ARRAY['turkey', 'pie', 'gratitude', 'family', 'autumn']),
  ('Black Friday', '2025-11-28', 'USA/Canada', 'Shopping', 'Shopping event', ARRAY['sale', 'shopping', 'deals', 'discount']),
  ('Back to School', '2025-09-01', 'USA/Canada', 'Seasonal', 'School season starts', ARRAY['backpack', 'pencil', 'books', 'student', 'teacher']),
  ('Summer', '2025-06-21', 'USA/Canada', 'Seasonal', 'Summer season', ARRAY['beach', 'sun', 'vacation', 'ice cream', 'swimming']),
  ('Fall', '2025-09-23', 'USA/Canada', 'Seasonal', 'Autumn season', ARRAY['leaves', 'pumpkin spice', 'cozy', 'sweater']),
  ('Winter', '2025-12-21', 'USA/Canada', 'Seasonal', 'Winter season', ARRAY['snow', 'skiing', 'hot chocolate', 'cozy']),
  ('Spring', '2026-03-20', 'USA/Canada', 'Seasonal', 'Spring season', ARRAY['flowers', 'birds', 'rain', 'growth']),
  ('Super Bowl', '2026-02-01', 'USA', 'Sports', 'NFL Championship', ARRAY['football', 'sports', 'team', 'championship']),
  ('Pride Month', '2026-06-01', 'USA/Canada', 'Cultural', 'LGBTQ+ Pride Month', ARRAY['rainbow', 'pride', 'love', 'equality']),
  ('Earth Day', '2026-04-22', 'USA/Canada', 'Environmental', 'Environmental awareness', ARRAY['earth', 'nature', 'green', 'recycle']);

-- Create design_suggestions table for caching AI suggestions
CREATE TABLE IF NOT EXISTS public.design_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events_calendar(id),
  suggestion TEXT NOT NULL,
  style TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.design_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Suggestions are viewable by everyone"
  ON public.design_suggestions FOR SELECT
  USING (true);