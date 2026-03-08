import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CIPO_API_URL = "https://ised-isde.canada.ca/cipo/trademark-search/api";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { searchTerm = "clothing", maxResults = 100 } = await req.json().catch(() => ({}));

    const params = new URLSearchParams({
      q: searchTerm,
      category: "trademark",
      perPage: String(Math.min(maxResults, 100)),
      page: "1",
    });

    const response = await fetch(`${CIPO_API_URL}?${params.toString()}`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`CIPO API returned ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    const results = data?.results || data?.trademarks || data?.data || [];

    if (!Array.isArray(results) || results.length === 0) {
      await supabase.from("api_sync_logs").insert({
        source: "CIPO",
        trademarks_synced: 0,
        status: "success",
        sync_duration_ms: Date.now() - startTime,
      });

      return new Response(
        JSON.stringify({ success: true, count: 0, message: "No results from CIPO API" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let synced = 0;
    for (const item of results.slice(0, maxResults)) {
      const term = (item.trademarkName || item.wordMark || item.name || "").toLowerCase().trim();
      if (!term) continue;

      const { error } = await supabase.from("trademark_database").upsert(
        {
          term,
          category: item.niceClassification?.[0]?.description || item.category || "general",
          risk_level: "high",
          source: "CIPO",
          region: "CA",
          owner_name: item.ownerName || item.applicantName || null,
          registration_number: item.applicationNumber || item.registrationNumber || null,
          auto_synced: true,
          last_verified: new Date().toISOString(),
        },
        { onConflict: "term" }
      );

      if (!error) synced++;
    }

    const duration = Date.now() - startTime;

    await supabase.from("api_sync_logs").insert({
      source: "CIPO",
      trademarks_synced: synced,
      status: "success",
      sync_duration_ms: duration,
    });

    return new Response(
      JSON.stringify({ success: true, count: synced, duration_ms: duration }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("CIPO sync error:", errorMessage);

    await supabase.from("api_sync_logs").insert({
      source: "CIPO",
      trademarks_synced: 0,
      status: "failed",
      error_message: errorMessage,
      sync_duration_ms: Date.now() - startTime,
    });

    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
