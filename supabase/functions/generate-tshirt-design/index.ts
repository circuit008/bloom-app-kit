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

    // Build enhanced prompt with style and color preferences - emphasize REAL transparent background
    const enhancedPrompt = `Generate a t-shirt design with REAL TRANSPARENT BACKGROUND ONLY.

DESIGN SPECIFICATIONS:
- Theme: ${prompt}
- Style: ${style}
- Color scheme: ${colorScheme}

CRITICAL TRANSPARENCY REQUIREMENTS:
⚠️ REAL TRANSPARENT BACKGROUND ONLY — not simulated.
⚠️ Remove all background pixels completely.
⚠️ Zero patterns. Zero checkerboard. Zero white. Zero grey.
⚠️ Final image must contain an empty alpha background layer only.

TECHNICAL REQUIREMENTS:
1. TRUE alpha transparency (alpha = 0) for all background pixels
2. NO checkerboard pattern simulation
3. NO background textures of any kind
4. NO white, grey, or colored background
5. Design elements floating on pure transparency
6. Clean, sharp anti-aliased edges
7. Print-ready PNG with alpha channel
8. High resolution: 4500x5400 pixels
9. Think vinyl decal cutout - graphic only, nothing behind it

QUALITY STANDARDS:
- Vibrant colors that pop on any t-shirt
- Professional print quality
- Sharp edges without artifacts
- High contrast design elements

OUTPUT VALIDATION:
If you were to open this in Photoshop, the background layer should show as a transparent checkerboard (indicating true alpha).
The PNG file must have an alpha channel with 0% opacity in all non-design areas.`;

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
