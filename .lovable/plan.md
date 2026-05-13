# Plan: Remix this project and connect it to your Supabase

You have your Supabase ready with the schema. Here's exactly what to do — no code changes are needed in *this* project (it stays on Lovable Cloud). All wiring happens in the new remixed project.

## Step 1 — Disable Lovable Cloud workspace-wide (so the remix starts clean)

- Sidebar → **Connectors** → **Lovable Cloud** → **Disable Cloud**
- This only affects *new* projects you create. This current project keeps working.

## Step 2 — Remix this project

- Top-left project name → **Settings** → **Remix this project**
- Open the new remixed project. Confirm it does NOT show Lovable Cloud as enabled. If it does, disable Cloud on the new project too before continuing.

## Step 3 — Connect your Supabase to the remix

- In the new project: **Connectors** → **Supabase** → authorize → pick your Supabase project
- Lovable will auto-generate `src/integrations/supabase/client.ts`, `types.ts`, and `.env` pointing at your Supabase. The existing app code already uses `@/integrations/supabase/client`, so most things will just work.

## Step 4 — Configure auth in your Supabase

In your Supabase dashboard → **Authentication → Providers**:
- Enable **Email** (password sign-in)
- Enable **Google**: paste your Google OAuth Client ID + Secret
- **Authentication → URL Configuration**: add the new project's preview URL and any custom domain to **Redirect URLs** and **Site URL**

## Step 5 — Add edge function secrets in your Supabase

Project Settings → **Edge Functions → Secrets**, add only what your functions actually use:
- `SHOPIFY_ACCESS_TOKEN`
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN`
- `LOVABLE_API_KEY` (only if edge functions call Lovable AI Gateway)

The 3 edge functions (`sync-cipo`, `sync-euipo`, `sync-uspto`) deploy automatically with the remix.

## Step 6 — In the remixed project, tell me to verify

Open the chat in the remix and say: *"Verify the Supabase connection and run a smoke test."* I will:
- Confirm tables are reachable from the client
- Run a test signup + scan write
- Fix any RLS or column mismatch found

## Notes

- **Existing users won't carry over** — `auth.users` cannot be CSV-imported. New signups will work normally.
- **Data:** you said schema only — that's fine. Public reference tables (`accessibility_rules`, `eco_printers`, `events_calendar`, `print_requirements`, `trademark_database`, `copyrighted_images`) need rows for the app to function fully. Import those CSVs from the export bundle via Supabase Table Editor → Insert → Import data from CSV.
- **Don't** import `user_profiles`, `scan_results`, etc. — those reference `auth.users` ids that no longer exist.

---

Reply "go" to mark this approved. Then perform Steps 1–5 yourself (I can't click those buttons for you), and ping me from the new project for Step 6.
