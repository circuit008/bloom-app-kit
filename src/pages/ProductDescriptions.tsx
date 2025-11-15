import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Copy, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

const SHOPIFY_API_VERSION = '2025-07';
const SHOPIFY_STORE_PERMANENT_DOMAIN = 'lovable-project-tpp8a.myshopify.com';
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const SHOPIFY_STOREFRONT_TOKEN = 'c043f2d0827f12ebb2f53f006a41bdee';

interface ShopifyProduct {
  node: {
    id: string;
    title: string;
    description: string;
    handle: string;
  };
}

const ProductDescriptions = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const query = `
        query GetProducts($first: Int!) {
          products(first: $first) {
            edges {
              node {
                id
                title
                description
                handle
              }
            }
          }
        }
      `;

      const response = await fetch(SHOPIFY_STOREFRONT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN
        },
        body: JSON.stringify({
          query,
          variables: { first: 50 },
        }),
      });

      if (response.status === 402) {
        toast.error("Shopify: Payment required", {
          description: "Shopify API access requires an active Shopify billing plan. Visit https://admin.shopify.com to upgrade."
        });
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(`Shopify API error: ${data.errors.map((e: any) => e.message).join(', ')}`);
      }

      if (data.data?.products?.edges) {
        setProducts(data.data.products.edges);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedProduct) {
      toast.error("Please select a product");
      return;
    }

    setIsGenerating(true);
    
    const product = products.find(p => p.node.id === selectedProduct);
    if (!product) {
      toast.error("Product not found");
      setIsGenerating(false);
      return;
    }
    
    // Simulate AI generation with selected product
    setTimeout(() => {
      const sampleDescription = `Discover the ${product.node.title} - a revolutionary product designed to enhance your lifestyle.

${product.node.description || 'This exceptional item'} combines quality with thoughtful design.

Key Features:
• Premium quality materials and craftsmanship
• Innovative design that stands out
• Built to last with exceptional durability
• Perfect for modern lifestyles

Transform your experience with ${product.node.title}. Order now and enjoy the difference!`;
      
      setGeneratedContent(sampleDescription);
      setIsGenerating(false);
      toast.success("Product description generated successfully!");
    }, 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">AI Product Descriptions</h1>
        <p className="mt-2 text-muted-foreground">Generate compelling product descriptions in seconds</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Form */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Select Product</CardTitle>
            <CardDescription className="text-muted-foreground">Choose a product from your Shopify store</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="product-select" className="text-foreground">Shopify Product *</Label>
              {isLoadingProducts ? (
                <div className="flex items-center gap-2 p-3 bg-secondary border border-border rounded-md">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading products...</span>
                </div>
              ) : (
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger id="product-select" className="bg-secondary border-border text-foreground">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border max-h-[300px]">
                    {products.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        No products found. Please add products to your Shopify store.
                      </div>
                    ) : (
                      products.map((product) => (
                        <SelectItem key={product.node.id} value={product.node.id}>
                          {product.node.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
              <p className="text-xs text-muted-foreground">
                Products are loaded from your connected Shopify store
              </p>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedProduct || isLoadingProducts}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Description
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Output */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Generated Description</CardTitle>
            <CardDescription className="text-muted-foreground">Your AI-powered content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Generated description will appear here..."
              value={generatedContent}
              readOnly
              className="min-h-[300px] bg-secondary border-border text-foreground font-mono text-sm"
            />

            {generatedContent && (
              <div className="flex gap-2">
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="flex-1"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductDescriptions;
