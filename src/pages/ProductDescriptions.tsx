import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Copy, Download } from "lucide-react";
import { toast } from "sonner";

const ProductDescriptions = () => {
  const [productName, setProductName] = useState("");
  const [features, setFeatures] = useState("");
  const [tone, setTone] = useState("professional");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!productName || !features) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const sampleDescription = `Discover the ${productName} - a revolutionary product designed to enhance your lifestyle. ${features}

Key Features:
• Premium quality materials and craftsmanship
• Innovative design that stands out
• Built to last with exceptional durability
• Perfect for modern lifestyles

Transform your experience with ${productName}. Order now and enjoy the difference!`;
      
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
            <CardTitle className="text-foreground">Product Details</CardTitle>
            <CardDescription className="text-muted-foreground">Enter information about your product</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="product-name" className="text-foreground">Product Name *</Label>
              <Textarea
                id="product-name"
                placeholder="e.g., Wireless Bluetooth Headphones"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="min-h-[60px] bg-secondary border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="features" className="text-foreground">Key Features *</Label>
              <Textarea
                id="features"
                placeholder="List the main features, benefits, or specifications..."
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                className="min-h-[120px] bg-secondary border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone" className="text-foreground">Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger id="tone" className="bg-secondary border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual & Friendly</SelectItem>
                  <SelectItem value="luxury">Luxury & Premium</SelectItem>
                  <SelectItem value="technical">Technical & Detailed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
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
        <Card className="border-border bg-gradient-card">
          <CardHeader>
            <CardTitle className="text-foreground">Generated Description</CardTitle>
            <CardDescription className="text-muted-foreground">Your AI-powered content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="min-h-[300px] rounded-lg bg-secondary p-4">
              {generatedContent ? (
                <p className="whitespace-pre-wrap text-sm text-foreground">{generatedContent}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Your generated description will appear here...
                </p>
              )}
            </div>

            {generatedContent && (
              <div className="flex gap-2">
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="flex-1 border-border bg-card text-foreground hover:bg-secondary"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-border bg-card text-foreground hover:bg-secondary"
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
