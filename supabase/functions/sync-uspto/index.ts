import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { searchTerm = "clothing", maxResults = 100, apiKey } = await req.json().catch(() => ({}));

    if (!apiKey) {
      throw new Error("USPTO API key is required. Please provide it in the admin settings.");
    }

    // USPTO Trademark Search API
    const params = new URLSearchParams({
      searchText: searchTerm,
      fq: "goodsAndServicesDescription:clothing",
      rows: String(Math.min(maxResults, 100)),
      start: "0",
    });

    const response = await fetch(
      `https://developer.uspto.gov/ibd-api/v1/trademark/search?${params.toString()}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "USPTO-API-KEY": apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`USPTO API returned ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    const results = data?.response?.docs || data?.results || [];

    if (!Array.isArray(results) || results.length === 0) {
      await supabase.from("api_sync_logs").insert({
        source: "USPTO",
        trademarks_synced: 0,
        status: "success",
        sync_duration_ms: Date.now() - startTime,
      });

      return new Response(
        JSON.stringify({ success: true, count: 0, message: "No results from USPTO API" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let synced = 0;
    for (const item of results.slice(0, maxResults)) {
      const term = (item.wordMark || item.markLiteralElements || item.keyword || "").toLowerCase().trim();
      if (!term) continue;

      const { error } = await supabase.from("trademark_database").upsert(
        {
          term,
          category: item.primaryCode?.description || item.goodsAndServicesDescription || "general",
          risk_level: "high",
          source: "USPTO",
          region: "US",
          owner_name: item.ownerName || item.partyName || null,
          registration_number: item.registrationNumber || item.serialNumber || null,
          auto_synced: true,
          last_verified: new Date().toISOString(),
        },
        { onConflict: "term" }
      );

      if (!error) synced++;
    }

    const duration = Date.now() - startTime;

    await supabase.from("api_sync_logs").insert({
      source: "USPTO",
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
    console.error("USPTO sync error:", errorMessage);

    await supabase.from("api_sync_logs").insert({
      source: "USPTO",
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
