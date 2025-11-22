-- Create saved_images table for storing processed images
CREATE TABLE IF NOT EXISTS public.saved_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  image_type TEXT NOT NULL CHECK (image_type IN ('enhanced', 'background_removed', 'ai_generated', 'uploaded')),
  original_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own saved images"
  ON public.saved_images
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved images"
  ON public.saved_images
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved images"
  ON public.saved_images
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved images"
  ON public.saved_images
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_saved_images_updated_at
  BEFORE UPDATE ON public.saved_images
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();