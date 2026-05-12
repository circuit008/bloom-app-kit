# Plan: Move database to your own Supabase account

This project currently runs on **Lovable Cloud** (a managed Supabase instance owned by Lovable). Cloud cannot be detached from this project once enabled — so the move requires a **remix into a fresh project** that you connect to your own Supabase account.

## What you'll do (high level)

1. **Prepare your Supabase project**
   - Create a new project at supabase.com (or pick an existing empty one).
   - Note the Project URL and anon key — you'll need them later.

2. **Recreate the schema in your Supabase**
   - I'll generate a single `schema.sql` file containing all 18 tables, RLS policies, the `update_updated_at_column` function, indexes, and storage setup that exists today.
   - You paste it into your Supabase SQL Editor and run it.

3. **Export and import data**
   - I'll export every table from Lovable Cloud as CSV (anon-safe — no auth.users rows).
   - You import each CSV via your Supabase Table Editor → Import.
   - Order matters for foreign keys: `user_profiles` first, then dependent tables.

4. **Disable Lovable Cloud for new projects**
   - Connectors → Lovable Cloud → Disable Cloud (workspace-level toggle).

5. **Remix this project**
   - Project name (top-left) → Settings → Remix this project.
   - The remix will start without Cloud since you disabled it in step 4.

6. **Connect your Supabase to the remix**
   - In the new project: Connectors → Supabase → authorize and select your project.
   - The remix will get a new auto-generated `src/integrations/supabase/client.ts` and `types.ts` pointing at your Supabase.

7. **Recreate auth + secrets in your Supabase**
   - Enable Email/Password and Google provider in your Supabase Auth settings.
   - Re-add edge function secrets you use today: `SHOPIFY_ACCESS_TOKEN`, `SHOPIFY_STOREFRONT_ACCESS_TOKEN`, `LOVABLE_API_KEY` (if used by edge functions).
   - Edge functions (`sync-cipo`, `sync-euipo`, `sync-uspto`) will redeploy automatically in the new project.

8. **Verify**
   - Sign up a test user, run a scan, check that data lands in your Supabase tables.

## What you need to know

- **Users will not transfer.** `auth.users` rows live inside Supabase Auth and cannot be exported as CSV. Existing users must sign up again on the new project. If keeping users matters, tell me and I can outline the (more involved) Supabase Auth admin import path.
- **Storage buckets:** none currently exist in this project, so nothing to migrate there.
- **Edge functions:** code carries over automatically with the remix.

## What I'll deliver in the next step (once you say go)

- `lovable-cloud-export/schema.sql` — complete schema + RLS + functions, ready to paste.
- `lovable-cloud-export/data/*.csv` — one CSV per table, in import order, with a short README listing the order.
- A short checklist you can follow end-to-end.

## Decision needed before I generate files

- Do you want to **keep existing user accounts** (more work — auth admin import) or is **users re-signing up** acceptable (simple)?

Reply "go" (and tell me the user-accounts choice) and I'll generate the export bundle.
