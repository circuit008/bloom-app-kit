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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { designId, title, description, price = "24.99" } = await req.json();

    // Get design from database
    const { data: design, error: designError } = await supabase
      .from('designs')
      .select('*')
      .eq('id', designId)
      .eq('user_id', user.id)
      .single();

    if (designError || !design) {
      throw new Error('Design not found');
    }

    // Get Shopify credentials
    const SHOPIFY_ACCESS_TOKEN = Deno.env.get('SHOPIFY_ACCESS_TOKEN');
    const SHOPIFY_STORE_DOMAIN = Deno.env.get('SHOPIFY_STORE_DOMAIN');

    if (!SHOPIFY_ACCESS_TOKEN || !SHOPIFY_STORE_DOMAIN) {
      throw new Error('Shopify credentials not configured');
    }

    // Convert base64 image to file
    const base64Data = design.image_url.split(',')[1];
    const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    // Upload image to Shopify (create as staged upload first)
    const stagedUploadMutation = `
      mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
        stagedUploadsCreate(input: $input) {
          stagedTargets {
            url
            resourceUrl
            parameters {
              name
              value
            }
          }
        }
      }
    `;

    const uploadResponse = await fetch(`https://${SHOPIFY_STORE_DOMAIN}/admin/api/2025-07/graphql.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: stagedUploadMutation,
        variables: {
          input: [{
            resource: 'PRODUCT_IMAGE',
            filename: `design-${designId}.png`,
            mimeType: 'image/png',
            httpMethod: 'POST'
          }]
        }
      })
    });

    const uploadData = await uploadResponse.json();
    const stagedTarget = uploadData.data.stagedUploadsCreate.stagedTargets[0];

    // Upload image to staged URL
    const formData = new FormData();
    stagedTarget.parameters.forEach((param: any) => {
      formData.append(param.name, param.value);
    });
    formData.append('file', new Blob([imageBuffer], { type: 'image/png' }));

    await fetch(stagedTarget.url, {
      method: 'POST',
      body: formData,
    });

    // Create product with the uploaded image
    const createProductMutation = `
      mutation productCreate($input: ProductInput!, $media: [CreateMediaInput!]) {
        productCreate(input: $input, media: $media) {
          product {
            id
            title
            handle
            onlineStoreUrl
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const productResponse = await fetch(`https://${SHOPIFY_STORE_DOMAIN}/admin/api/2025-07/graphql.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: createProductMutation,
        variables: {
          input: {
            title: title || `T-Shirt Design - ${design.prompt.slice(0, 30)}`,
            descriptionHtml: description || design.prompt,
            productType: 'T-Shirt',
            vendor: 'ShopBoost AI',
            tags: design.event_tag ? [design.event_tag, design.style] : [design.style],
            variants: [
              { price, inventoryPolicy: 'CONTINUE', option1: 'S' },
              { price, inventoryPolicy: 'CONTINUE', option1: 'M' },
              { price, inventoryPolicy: 'CONTINUE', option1: 'L' },
              { price, inventoryPolicy: 'CONTINUE', option1: 'XL' },
              { price, inventoryPolicy: 'CONTINUE', option1: 'XXL' },
            ],
            options: ['Size']
          },
          media: [{
            originalSource: stagedTarget.resourceUrl,
            mediaContentType: 'IMAGE'
          }]
        }
      })
    });

    const productData = await productResponse.json();

    if (productData.data.productCreate.userErrors.length > 0) {
      throw new Error(productData.data.productCreate.userErrors[0].message);
    }

    const product = productData.data.productCreate.product;

    // Update design in database
    await supabase
      .from('designs')
      .update({
        uploaded_to_shopify: true,
        shopify_product_id: product.id
      })
      .eq('id', designId);

    console.log(`Product created successfully: ${product.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        productId: product.id,
        productUrl: product.onlineStoreUrl,
        productHandle: product.handle
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error uploading to Shopify:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
