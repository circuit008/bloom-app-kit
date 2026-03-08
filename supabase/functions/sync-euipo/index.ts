import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EUIPO_API_URL = "https://euipo.europa.eu/eSearch/WS/trademark/REST/advancedSearch";

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

    // Call EUIPO public search API
    const params = new URLSearchParams({
      searchCriteria: JSON.stringify({
        pageNumber: 1,
        pageSize: Math.min(maxResults, 100),
        criteria: [
          {
            fieldName: "wordMark",
            fieldValue: searchTerm,
            operator: "contains",
          },
        ],
        sortFields: [{ fieldName: "filingDate", sortOrder: "desc" }],
      }),
    });

    const response = await fetch(`${EUIPO_API_URL}?${params.toString()}`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`EUIPO API returned ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    const results = data?.results || data?.trademarks || [];

    if (!Array.isArray(results) || results.length === 0) {
      // Log empty sync
      await supabase.from("api_sync_logs").insert({
        source: "EUIPO",
        trademarks_synced: 0,
        status: "success",
        sync_duration_ms: Date.now() - startTime,
      });

      return new Response(
        JSON.stringify({ success: true, count: 0, message: "No results from EUIPO API" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Map and upsert trademarks
    let synced = 0;
    for (const item of results.slice(0, maxResults)) {
      const term = (item.wordMark || item.name || "").toLowerCase().trim();
      if (!term) continue;

      const { error } = await supabase.from("trademark_database").upsert(
        {
          term,
          category: item.niceClasses?.[0]?.description || "general",
          risk_level: "high",
          source: "EUIPO",
          region: "EU",
          owner_name: item.applicantName || item.ownerName || null,
          registration_number: item.applicationNumber || item.registrationNumber || null,
          auto_synced: true,
          last_verified: new Date().toISOString(),
        },
        { onConflict: "term" }
      );

      if (!error) synced++;
    }

    const duration = Date.now() - startTime;

    // Log success
    await supabase.from("api_sync_logs").insert({
      source: "EUIPO",
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
    console.error("EUIPO sync error:", errorMessage);

    // Log failure
    await supabase.from("api_sync_logs").insert({
      source: "EUIPO",
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
