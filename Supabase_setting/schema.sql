--
-- PostgreSQL database dump
--

\restrict SqbzvzbC3heKmxhG5eaeT5Qp5HAISw2QS5InJKZlGyHfj4RA1ngrHS9D3JwxEUB

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accessibility_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.accessibility_rules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    rule_name text NOT NULL,
    description text,
    min_contrast_ratio numeric DEFAULT 4.5 NOT NULL,
    wcag_level text DEFAULT 'AA'::text NOT NULL,
    category text DEFAULT 'contrast'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ad_impressions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ad_impressions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    placement text NOT NULL,
    page text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: api_sync_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.api_sync_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    source text NOT NULL,
    trademarks_synced integer DEFAULT 0,
    status text DEFAULT 'pending'::text NOT NULL,
    error_message text,
    sync_duration_ms integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: copyrighted_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.copyrighted_images (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    image_hash text NOT NULL,
    term text NOT NULL,
    owner text NOT NULL,
    category text DEFAULT 'general'::text NOT NULL,
    source_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: design_suggestions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.design_suggestions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid,
    suggestion text NOT NULL,
    style text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: designs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.designs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    prompt text NOT NULL,
    style text NOT NULL,
    color_scheme text,
    image_url text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    uploaded_to_shopify boolean DEFAULT false NOT NULL,
    shopify_product_id text,
    event_tag text
);


--
-- Name: eco_printers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.eco_printers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    region text DEFAULT 'US'::text NOT NULL,
    certifications text[] DEFAULT '{}'::text[],
    website_url text,
    affiliate_url text,
    description text,
    rating numeric DEFAULT 4.0,
    min_order integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: events_calendar; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events_calendar (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    event_date date NOT NULL,
    country text NOT NULL,
    category text NOT NULL,
    description text,
    suggested_themes text[],
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: false_positive_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.false_positive_reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    scan_id uuid,
    flagged_term text NOT NULL,
    reason text DEFAULT ''::text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    admin_notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    reviewed_at timestamp with time zone
);


--
-- Name: ocr_results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ocr_results (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    scan_id uuid,
    user_id uuid NOT NULL,
    extracted_text text DEFAULT ''::text NOT NULL,
    flagged_terms text[] DEFAULT '{}'::text[] NOT NULL,
    confidence numeric DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: print_requirements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.print_requirements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_type text NOT NULL,
    min_width_px integer NOT NULL,
    min_height_px integer NOT NULL,
    recommended_dpi integer DEFAULT 300 NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: saved_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.saved_images (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    image_url text NOT NULL,
    image_type text NOT NULL,
    original_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT saved_images_image_type_check CHECK ((image_type = ANY (ARRAY['enhanced'::text, 'background_removed'::text, 'ai_generated'::text, 'uploaded'::text])))
);


--
-- Name: scan_results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.scan_results (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    ip_score integer DEFAULT 0 NOT NULL,
    accessibility_score integer DEFAULT 0 NOT NULL,
    quality_score integer DEFAULT 0 NOT NULL,
    transparency_score integer DEFAULT 0 NOT NULL,
    overall_score integer DEFAULT 0 NOT NULL,
    passed boolean DEFAULT false NOT NULL,
    keywords text[] DEFAULT '{}'::text[],
    image_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    fail_reason text,
    ip_score_raw integer,
    overall_score_capped boolean DEFAULT false
);


--
-- Name: shopify_credentials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shopify_credentials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    shop_url text NOT NULL,
    api_key text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: trademark_database; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trademark_database (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    term text NOT NULL,
    category text DEFAULT 'general'::text NOT NULL,
    risk_level text DEFAULT 'high'::text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    source text DEFAULT 'manual'::text,
    region text DEFAULT 'global'::text,
    owner_name text,
    registration_number text,
    auto_synced boolean DEFAULT false,
    last_verified timestamp with time zone
);


--
-- Name: trademark_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trademark_reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    reported_term text NOT NULL,
    category text DEFAULT 'other'::text NOT NULL,
    evidence_url text,
    notes text,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: uploaded_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.uploaded_images (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    image_hash text NOT NULL,
    upload_date timestamp with time zone DEFAULT now() NOT NULL,
    is_copyrighted boolean DEFAULT false NOT NULL
);


--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    display_name text,
    subscription_status text DEFAULT 'free'::text NOT NULL,
    total_scans integer DEFAULT 0 NOT NULL,
    affiliate_clicks integer DEFAULT 0 NOT NULL,
    affiliate_earnings numeric DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    terms_accepted_at timestamp with time zone,
    privacy_accepted_at timestamp with time zone,
    preferred_language text DEFAULT 'en'::text NOT NULL
);


--
-- Name: accessibility_rules accessibility_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accessibility_rules
    ADD CONSTRAINT accessibility_rules_pkey PRIMARY KEY (id);


--
-- Name: ad_impressions ad_impressions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ad_impressions
    ADD CONSTRAINT ad_impressions_pkey PRIMARY KEY (id);


--
-- Name: api_sync_logs api_sync_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_sync_logs
    ADD CONSTRAINT api_sync_logs_pkey PRIMARY KEY (id);


--
-- Name: copyrighted_images copyrighted_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copyrighted_images
    ADD CONSTRAINT copyrighted_images_pkey PRIMARY KEY (id);


--
-- Name: design_suggestions design_suggestions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.design_suggestions
    ADD CONSTRAINT design_suggestions_pkey PRIMARY KEY (id);


--
-- Name: designs designs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.designs
    ADD CONSTRAINT designs_pkey PRIMARY KEY (id);


--
-- Name: eco_printers eco_printers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eco_printers
    ADD CONSTRAINT eco_printers_pkey PRIMARY KEY (id);


--
-- Name: events_calendar events_calendar_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_calendar
    ADD CONSTRAINT events_calendar_pkey PRIMARY KEY (id);


--
-- Name: false_positive_reports false_positive_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.false_positive_reports
    ADD CONSTRAINT false_positive_reports_pkey PRIMARY KEY (id);


--
-- Name: ocr_results ocr_results_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ocr_results
    ADD CONSTRAINT ocr_results_pkey PRIMARY KEY (id);


--
-- Name: print_requirements print_requirements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.print_requirements
    ADD CONSTRAINT print_requirements_pkey PRIMARY KEY (id);


--
-- Name: saved_images saved_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_images
    ADD CONSTRAINT saved_images_pkey PRIMARY KEY (id);


--
-- Name: scan_results scan_results_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scan_results
    ADD CONSTRAINT scan_results_pkey PRIMARY KEY (id);


--
-- Name: shopify_credentials shopify_credentials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shopify_credentials
    ADD CONSTRAINT shopify_credentials_pkey PRIMARY KEY (id);


--
-- Name: shopify_credentials shopify_credentials_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shopify_credentials
    ADD CONSTRAINT shopify_credentials_user_id_key UNIQUE (user_id);


--
-- Name: trademark_database trademark_database_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trademark_database
    ADD CONSTRAINT trademark_database_pkey PRIMARY KEY (id);


--
-- Name: trademark_database trademark_database_term_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trademark_database
    ADD CONSTRAINT trademark_database_term_unique UNIQUE (term);


--
-- Name: trademark_reports trademark_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trademark_reports
    ADD CONSTRAINT trademark_reports_pkey PRIMARY KEY (id);


--
-- Name: uploaded_images uploaded_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.uploaded_images
    ADD CONSTRAINT uploaded_images_pkey PRIMARY KEY (id);


--
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (id);


--
-- Name: user_profiles user_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_user_id_key UNIQUE (user_id);


--
-- Name: idx_scan_fail_reason; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_scan_fail_reason ON public.scan_results USING btree (fail_reason);


--
-- Name: saved_images update_saved_images_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_saved_images_updated_at BEFORE UPDATE ON public.saved_images FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: shopify_credentials update_shopify_credentials_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_shopify_credentials_updated_at BEFORE UPDATE ON public.shopify_credentials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: design_suggestions design_suggestions_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.design_suggestions
    ADD CONSTRAINT design_suggestions_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events_calendar(id);


--
-- Name: false_positive_reports false_positive_reports_scan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.false_positive_reports
    ADD CONSTRAINT false_positive_reports_scan_id_fkey FOREIGN KEY (scan_id) REFERENCES public.scan_results(id) ON DELETE SET NULL;


--
-- Name: ocr_results ocr_results_scan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ocr_results
    ADD CONSTRAINT ocr_results_scan_id_fkey FOREIGN KEY (scan_id) REFERENCES public.scan_results(id) ON DELETE CASCADE;


--
-- Name: trademark_reports trademark_reports_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trademark_reports
    ADD CONSTRAINT trademark_reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: ad_impressions Anyone can insert ad impressions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert ad impressions" ON public.ad_impressions FOR INSERT WITH CHECK (true);


--
-- Name: accessibility_rules Anyone can read accessibility rules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can read accessibility rules" ON public.accessibility_rules FOR SELECT USING (true);


--
-- Name: copyrighted_images Anyone can read copyrighted images; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can read copyrighted images" ON public.copyrighted_images FOR SELECT USING (true);


--
-- Name: eco_printers Anyone can read eco printers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can read eco printers" ON public.eco_printers FOR SELECT USING (true);


--
-- Name: print_requirements Anyone can read print requirements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can read print requirements" ON public.print_requirements FOR SELECT USING (true);


--
-- Name: api_sync_logs Authenticated users can insert sync logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert sync logs" ON public.api_sync_logs FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: trademark_database Authenticated users can insert trademarks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert trademarks" ON public.trademark_database FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: ad_impressions Authenticated users can read ad impressions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read ad impressions" ON public.ad_impressions FOR SELECT TO authenticated USING (true);


--
-- Name: false_positive_reports Authenticated users can read all false positive reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read all false positive reports" ON public.false_positive_reports FOR SELECT TO authenticated USING (true);


--
-- Name: trademark_reports Authenticated users can read all reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read all reports" ON public.trademark_reports FOR SELECT TO authenticated USING (true);


--
-- Name: api_sync_logs Authenticated users can read sync logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read sync logs" ON public.api_sync_logs FOR SELECT TO authenticated USING (true);


--
-- Name: trademark_database Authenticated users can read trademarks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read trademarks" ON public.trademark_database FOR SELECT TO authenticated USING (true);


--
-- Name: false_positive_reports Authenticated users can update false positive reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update false positive reports" ON public.false_positive_reports FOR UPDATE TO authenticated USING (true) WITH CHECK (true);


--
-- Name: trademark_reports Authenticated users can update reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update reports" ON public.trademark_reports FOR UPDATE TO authenticated USING (true) WITH CHECK (true);


--
-- Name: events_calendar Events are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Events are viewable by everyone" ON public.events_calendar FOR SELECT USING (true);


--
-- Name: design_suggestions Suggestions are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Suggestions are viewable by everyone" ON public.design_suggestions FOR SELECT USING (true);


--
-- Name: designs Users can create their own designs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own designs" ON public.designs FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: shopify_credentials Users can delete their own credentials; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own credentials" ON public.shopify_credentials FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: designs Users can delete their own designs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own designs" ON public.designs FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: saved_images Users can delete their own saved images; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own saved images" ON public.saved_images FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: false_positive_reports Users can insert own false positive reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own false positive reports" ON public.false_positive_reports FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: ocr_results Users can insert own ocr results; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own ocr results" ON public.ocr_results FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: trademark_reports Users can insert own reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own reports" ON public.trademark_reports FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: scan_results Users can insert own scan results; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own scan results" ON public.scan_results FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: uploaded_images Users can insert own uploads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own uploads" ON public.uploaded_images FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: shopify_credentials Users can insert their own credentials; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own credentials" ON public.shopify_credentials FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: saved_images Users can insert their own saved images; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own saved images" ON public.saved_images FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: false_positive_reports Users can read own false positive reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read own false positive reports" ON public.false_positive_reports FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: ocr_results Users can read own ocr results; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read own ocr results" ON public.ocr_results FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: user_profiles Users can read own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read own profile" ON public.user_profiles FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: trademark_reports Users can read own reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read own reports" ON public.trademark_reports FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: scan_results Users can read own scan results; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read own scan results" ON public.scan_results FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: uploaded_images Users can read own uploads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read own uploads" ON public.uploaded_images FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: user_profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: shopify_credentials Users can update their own credentials; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own credentials" ON public.shopify_credentials FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: designs Users can update their own designs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own designs" ON public.designs FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: saved_images Users can update their own saved images; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own saved images" ON public.saved_images FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: shopify_credentials Users can view their own credentials; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own credentials" ON public.shopify_credentials FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: designs Users can view their own designs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own designs" ON public.designs FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: saved_images Users can view their own saved images; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own saved images" ON public.saved_images FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: accessibility_rules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.accessibility_rules ENABLE ROW LEVEL SECURITY;

--
-- Name: ad_impressions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ad_impressions ENABLE ROW LEVEL SECURITY;

--
-- Name: api_sync_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.api_sync_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: copyrighted_images; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.copyrighted_images ENABLE ROW LEVEL SECURITY;

--
-- Name: design_suggestions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.design_suggestions ENABLE ROW LEVEL SECURITY;

--
-- Name: designs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;

--
-- Name: eco_printers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.eco_printers ENABLE ROW LEVEL SECURITY;

--
-- Name: events_calendar; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.events_calendar ENABLE ROW LEVEL SECURITY;

--
-- Name: false_positive_reports; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.false_positive_reports ENABLE ROW LEVEL SECURITY;

--
-- Name: ocr_results; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ocr_results ENABLE ROW LEVEL SECURITY;

--
-- Name: print_requirements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.print_requirements ENABLE ROW LEVEL SECURITY;

--
-- Name: saved_images; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.saved_images ENABLE ROW LEVEL SECURITY;

--
-- Name: scan_results; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.scan_results ENABLE ROW LEVEL SECURITY;

--
-- Name: shopify_credentials; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.shopify_credentials ENABLE ROW LEVEL SECURITY;

--
-- Name: trademark_database; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.trademark_database ENABLE ROW LEVEL SECURITY;

--
-- Name: trademark_reports; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.trademark_reports ENABLE ROW LEVEL SECURITY;

--
-- Name: uploaded_images; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.uploaded_images ENABLE ROW LEVEL SECURITY;

--
-- Name: user_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

\unrestrict SqbzvzbC3heKmxhG5eaeT5Qp5HAISw2QS5InJKZlGyHfj4RA1ngrHS9D3JwxEUB

