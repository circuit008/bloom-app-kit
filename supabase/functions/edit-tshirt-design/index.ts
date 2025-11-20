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

CRITICAL REQUIREMENTS:
1. Maintain completely transparent background (no white, no colors, no textures)
2. Only modify the design elements as requested
3. Keep transparent areas around all edges
4. Preserve the t-shirt printing quality
5. Ensure clean edges with no background artifacts
6. Keep the design isolated and print-ready

Return as PNG with transparent background.`;

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
