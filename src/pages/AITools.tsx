import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Copy, Download, Upload, Wand2, Search } from "lucide-react";
import { toast } from "sonner";

export default function AITools() {
  const [productInput, setProductInput] = useState("");
  const [generatedDescription, setGeneratedDescription] = useState("");
  const [seoInput, setSeoInput] = useState("");
  const [generatedSEO, setGeneratedSEO] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateDescription = async () => {
    if (!productInput.trim()) {
      toast.error("Please enter product details");
      return;
    }
    
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setGeneratedDescription(
        `Elevate your style with this premium t-shirt featuring ${productInput}. ` +
        `Crafted from 100% soft cotton for ultimate comfort and durability. ` +
        `Perfect for casual outings, gift-giving, or everyday wear. ` +
        `Available in multiple sizes and colors to match your unique personality. ` +
        `Machine washable and designed to maintain its vibrant print after countless washes.`
      );
      setIsGenerating(false);
      toast.success("Description generated!");
    }, 2000);
  };

  const handleGenerateSEO = async () => {
    if (!seoInput.trim()) {
      toast.error("Please enter keywords");
      return;
    }
    
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedSEO(
        `**Title:** ${seoInput} T-Shirt | Premium Quality Print | Unique Design\n\n` +
        `**Tags:** ${seoInput}, custom t-shirt, graphic tee, printed shirt, cotton tee, gift idea, casual wear\n\n` +
        `**Meta Description:** Shop our exclusive ${seoInput} t-shirt collection. Premium quality, vibrant prints, comfortable fit. Free shipping on orders over $50.`
      );
      setIsGenerating(false);
      toast.success("SEO content generated!");
    }, 2000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-8">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
          AI-Powered Tools
        </h1>
        <p className="text-xl text-muted-foreground">
          Boost your productivity with intelligent automation
        </p>
      </div>

      <Tabs defaultValue="description" className="w-full max-w-5xl mx-auto">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="enhance">Image Enhance</TabsTrigger>
          <TabsTrigger value="background">Remove BG</TabsTrigger>
          <TabsTrigger value="bundle">Bundle Ideas</TabsTrigger>
        </TabsList>

        {/* Product Description Generator */}
        <TabsContent value="description" className="mt-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">AI Product Description Generator</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Enter your product details and let AI create a compelling description
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Product Details</label>
                <Textarea
                  placeholder="E.g., Funny cat astronaut design, space theme, colorful"
                  value={productInput}
                  onChange={(e) => setProductInput(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>
              
              <Button 
                onClick={handleGenerateDescription}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Wand2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Description
                  </>
                )}
              </Button>

              {generatedDescription && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Generated Description</label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(generatedDescription)}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                  </div>
                  <Textarea
                    value={generatedDescription}
                    readOnly
                    rows={6}
                    className="resize-none bg-secondary"
                  />
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* SEO Generator */}
        <TabsContent value="seo" className="mt-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Search className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">AI SEO Title & Tags Generator</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Generate SEO-optimized titles, tags, and meta descriptions
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Keywords</label>
                <Input
                  placeholder="E.g., vintage, retro, 80s style"
                  value={seoInput}
                  onChange={(e) => setSeoInput(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={handleGenerateSEO}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Wand2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate SEO Content
                  </>
                )}
              </Button>

              {generatedSEO && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Generated SEO Content</label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(generatedSEO)}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                  </div>
                  <Textarea
                    value={generatedSEO}
                    readOnly
                    rows={8}
                    className="resize-none bg-secondary font-mono text-sm"
                  />
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Image Enhancement */}
        <TabsContent value="enhance" className="mt-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">AI Image Enhancer</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Upscale and enhance your design images with AI
            </p>
            
            <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Upload Image to Enhance</p>
              <p className="text-sm text-muted-foreground mb-4">
                Supports PNG, JPG up to 10MB
              </p>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Choose File
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Background Remover */}
        <TabsContent value="background" className="mt-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Wand2 className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">AI Background Remover</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Remove backgrounds from images with one click
            </p>
            
            <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Upload Image</p>
              <p className="text-sm text-muted-foreground mb-4">
                Get transparent PNG instantly
              </p>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Choose File
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Bundle Suggestions */}
        <TabsContent value="bundle" className="mt-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">AI Bundle & Upsell Generator</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Get smart product bundle suggestions based on your catalog
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Your Products</label>
                <Textarea
                  placeholder="List your products, one per line&#10;E.g.,&#10;Cat Astronaut Tee&#10;Space Explorer Hoodie&#10;Galaxy Pattern Mug"
                  rows={6}
                  className="resize-none"
                />
              </div>
              
              <Button className="w-full">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Bundle Ideas
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}