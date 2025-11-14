import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Copy, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ShopifyProduct {
  id: number;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
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
      const { data, error } = await supabase.functions.invoke('fetch-shopify-products');
      
      if (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products. Please check your Shopify connection.');
        return;
      }

      if (data?.products) {
        setProducts(data.products);
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
    
    const product = products.find(p => p.id.toString() === selectedProduct);
    if (!product) {
      toast.error("Product not found");
      setIsGenerating(false);
      return;
    }
    
    // Simulate AI generation with selected product
    setTimeout(() => {
      const sampleDescription = `Discover the ${product.title} - a revolutionary product designed to enhance your lifestyle.

Key Features:
• Premium quality materials and craftsmanship
• Innovative design that stands out
• Built to last with exceptional durability
• Perfect for modern lifestyles

Transform your experience with ${product.title}. Order now and enjoy the difference!`;
      
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
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.title}
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
