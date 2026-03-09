
ALTER TABLE public.user_profiles
ADD COLUMN terms_accepted_at timestamp with time zone DEFAULT NULL,
ADD COLUMN privacy_accepted_at timestamp with time zone DEFAULT NULL;
