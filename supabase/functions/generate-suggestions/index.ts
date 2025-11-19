import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { eventId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get event details
    const { data: event } = await supabase
      .from('events_calendar')
      .select('*')
      .eq('id', eventId)
      .single();

    if (!event) {
      throw new Error('Event not found');
    }

    const systemPrompt = `You are a creative t-shirt design expert. Generate 10 unique and creative t-shirt design prompts for ${event.name}. 
    Use these themes as inspiration: ${event.suggested_themes.join(', ')}.
    Each prompt should be 1-2 sentences describing a fun, creative, or trendy t-shirt design.
    Make designs that would appeal to a broad audience.
    Include variety: funny, cute, minimalist, vintage, and trendy styles.
    Return ONLY a JSON array of strings, no additional text.`;

    console.log("Generating suggestions for event:", event.name);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate 10 creative t-shirt design prompts for ${event.name}` }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the JSON array from response
    const suggestions = JSON.parse(content.replace(/```json\n?|\n?```/g, ''));

    console.log(`Generated ${suggestions.length} suggestions for ${event.name}`);

    return new Response(
      JSON.stringify({ suggestions, event }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating suggestions:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
