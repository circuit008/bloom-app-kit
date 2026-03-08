
-- Allow authenticated users to insert into trademark_database (for admin verification flow)
CREATE POLICY "Authenticated users can insert trademarks"
  ON public.trademark_database FOR INSERT
  TO authenticated
  WITH CHECK (true);
