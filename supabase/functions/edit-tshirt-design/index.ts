const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, editPrompt, style = "cartoon", colorScheme = "vibrant" } = await req.json();

    if (!imageUrl || !editPrompt) {
      return new Response(
        JSON.stringify({ error: 'Image URL and edit prompt are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Create enhanced prompt for editing with transparent background
    const enhancedPrompt = `Edit this t-shirt graphic design with these instructions:
- Edit request: ${editPrompt}
- Style: ${style}
- Color scheme: ${colorScheme}

ABSOLUTELY CRITICAL REQUIREMENTS - FOLLOW EXACTLY:
1. Keep 100% TRANSPARENT background (alpha channel = 0) - NO BACKGROUND AT ALL
2. Only modify the design elements as requested in the edit
3. NO white, NO colors, NO patterns, NO textures in the background
4. Think PNG cutout - only the design exists, rest is transparent
5. The edited design should float on transparency
6. Maintain sharp, clean edges with perfect transparency
7. Keep the design print-ready for t-shirts
8. Output as PNG with alpha transparency

IMPORTANT: The background MUST remain completely transparent. If you add any background, this will FAIL.`;

    console.log('Editing image with prompt:', enhancedPrompt);

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
            content: [
              {
                type: "text",
                text: enhancedPrompt
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        modalities: ["image", "text"]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('API Error:', errorData);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please check your API credits.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 402 }
        );
      }
      
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const editedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!editedImageUrl) {
      throw new Error('No image generated in response');
    }

    return new Response(
      JSON.stringify({ imageUrl: editedImageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in edit-tshirt-design function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
