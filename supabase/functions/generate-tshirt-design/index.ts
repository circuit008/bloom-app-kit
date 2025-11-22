import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, style, colorScheme } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build enhanced prompt with style and color preferences - emphasize transparent background
    const enhancedPrompt = `Generate a t-shirt design with a REAL transparent background.

DESIGN SPECIFICATIONS:
- Theme: ${prompt}
- Style: ${style}
- Color scheme: ${colorScheme}

CRITICAL TRANSPARENCY REQUIREMENTS - NO EXCEPTIONS:
1. Background MUST be TRUE ALPHA TRANSPARENCY (alpha = 0)
2. Do NOT create any checkerboard pattern or fake transparency squares
3. NO background textures, NO white squares, NO grey squares, NO patterns whatsoever
4. The background must be completely invisible, not simulated
5. Only the design graphic should exist - nothing else

TECHNICAL REQUIREMENTS:
6. Clean, sharp edges with perfect alpha transparency
7. Print-ready PNG format
8. High resolution: 4500x5400 pixels
9. Design elements only - NO t-shirt mockup, NO background layer
10. Think of this as a vinyl decal cutout - pure graphic floating on nothing

QUALITY STANDARDS:
- High contrast, vibrant colors that pop on any t-shirt color
- Professional print-ready output
- Sharp, crisp edges without artifacts

REMEMBER: True transparency means NOTHING visible in the background - not grey, not white, not checkerboard - pure alpha channel transparency only.`;

    console.log("Generating design with prompt:", enhancedPrompt);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: enhancedPrompt,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (response.status === 429) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (response.status === 402) {
      return new Response(
        JSON.stringify({ error: "Payment required. Please add credits to your Lovable AI workspace." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      throw new Error("No image generated");
    }

    console.log("Design generated successfully");

    return new Response(
      JSON.stringify({ imageUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-tshirt-design:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
