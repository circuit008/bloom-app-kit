# Lovable Cloud → Your Supabase Migration Bundle

## Step 1 — Schema
In your Supabase project: SQL Editor → New query → paste the contents of
`schema.sql` → Run.

This creates all 18 tables, RLS policies, the `update_updated_at_column`
function, indexes, and constraints — exactly as they exist today.

## Step 2 — Data import (in this order)
Supabase Dashboard → Table Editor → pick the table → Insert → Import data
from CSV. Import in the order below so foreign-key-style references resolve:

1. user_profiles.csv
2. accessibility_rules.csv
3. copyrighted_images.csv
4. eco_printers.csv
5. events_calendar.csv
6. print_requirements.csv
7. trademark_database.csv
8. designs.csv
9. design_suggestions.csv
10. saved_images.csv
11. shopify_credentials.csv
12. uploaded_images.csv
13. ocr_results.csv
14. scan_results.csv
15. trademark_reports.csv
16. false_positive_reports.csv
17. ad_impressions.csv
18. api_sync_logs.csv

Note: `auth.users` rows are NOT included — Supabase Auth users must sign
up again on the new project. The `user_id` columns will then reference
the new auth.users entries.

## Step 3 — Auth setup
In your Supabase project → Authentication → Providers:
- Enable Email/Password
- Enable Google (paste your Google OAuth client ID + secret)

## Step 4 — Edge function secrets
Add these in Project Settings → Edge Functions → Secrets, if your
edge functions use them:
- SHOPIFY_ACCESS_TOKEN
- SHOPIFY_STOREFRONT_ACCESS_TOKEN
- LOVABLE_API_KEY (only if you use Lovable AI Gateway from edge functions)

## Step 5 — Disable Lovable Cloud + remix
- Connectors → Lovable Cloud → Disable Cloud (workspace-level)
- Open this project → name (top-left) → Settings → Remix this project
- In the new project: Connectors → Supabase → connect your account → pick the project
