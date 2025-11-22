import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Copy, Download, Upload, Wand2, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { removeBackground, loadImage } from "@/utils/backgroundRemoval";

export default function AITools() {
  const [productInput, setProductInput] = useState("");
  const [generatedDescription, setGeneratedDescription] = useState("");
  const [seoInput, setSeoInput] = useState("");
  const [generatedSEO, setGeneratedSEO] = useState("");
  const [bundleInput, setBundleInput] = useState("");
  const [generatedBundles, setGeneratedBundles] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");
  
  // Image refs
  const enhanceInputRef = useRef<HTMLInputElement>(null);
  const bgRemoveInputRef = useRef<HTMLInputElement>(null);
  const [enhanceImage, setEnhanceImage] = useState<string | null>(null);
  const [enhancedResult, setEnhancedResult] = useState<string | null>(null);
  const [bgRemoveImage, setBgRemoveImage] = useState<string | null>(null);
  const [bgRemovedResult, setBgRemovedResult] = useState<string | null>(null);

  const handleGenerateDescription = async () => {
    if (!productInput.trim()) {
      toast.error("Please enter product details");
      return;
    }
    
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-description', {
        body: { productDetails: productInput }
      });

      if (error) throw error;
      
      if (data.error) {
        toast.error(data.error);
        return;
      }

      setGeneratedDescription(data.description);
      toast.success("Description generated!");
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to generate description");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateSEO = async () => {
    if (!seoInput.trim()) {
      toast.error("Please enter keywords");
      return;
    }
    
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-seo', {
        body: { keywords: seoInput }
      });

      if (error) throw error;
      
      if (data.error) {
        toast.error(data.error);
        return;
      }

      setGeneratedSEO(data.seoContent);
      toast.success("SEO content generated!");
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to generate SEO content");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateBundle = async () => {
    if (!bundleInput.trim()) {
      toast.error("Please enter your product list");
      return;
    }
    
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-bundle-ideas', {
        body: { products: bundleInput }
      });

      if (error) throw error;
      
      if (data.error) {
        toast.error(data.error);
        return;
      }

      setGeneratedBundles(data.bundleIdeas);
      toast.success("Bundle ideas generated!");
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to generate bundle ideas");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEnhanceImage = async (file: File) => {
    setIsProcessing(true);
    setProcessingStatus("Uploading image...");
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageDataUrl = e.target?.result as string;
        setEnhanceImage(imageDataUrl);
        
        setProcessingStatus("Enhancing with AI...");
        const { data, error } = await supabase.functions.invoke('enhance-image', {
          body: { imageUrl: imageDataUrl }
        });

        if (error) throw error;
        
        if (data.error) {
          toast.error(data.error);
          return;
        }

        setEnhancedResult(data.enhancedImageUrl);
        toast.success("Image enhanced successfully!");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to enhance image");
    } finally {
      setIsProcessing(false);
      setProcessingStatus("");
    }
  };

  const handleRemoveBackground = async (file: File) => {
    setIsProcessing(true);
    try {
      const img = await loadImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setBgRemoveImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      const resultBlob = await removeBackground(img, setProcessingStatus);
      const resultUrl = URL.createObjectURL(resultBlob);
      setBgRemovedResult(resultUrl);
      toast.success("Background removed successfully!");
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to remove background");
    } finally {
      setIsProcessing(false);
      setProcessingStatus("");
    }
  };

  const downloadImage = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              Upscale and enhance your design images with AI (Powered by Lovable AI)
            </p>
            
            <input
              ref={enhanceInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleEnhanceImage(file);
              }}
            />
            
            {!enhanceImage ? (
              <div 
                className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => enhanceInputRef.current?.click()}
              >
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
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Original</p>
                    <img src={enhanceImage} alt="Original" className="w-full rounded-lg border" />
                  </div>
                  {enhancedResult && (
                    <div>
                      <p className="text-sm font-medium mb-2">Enhanced</p>
                      <img src={enhancedResult} alt="Enhanced" className="w-full rounded-lg border" />
                    </div>
                  )}
                </div>
                
                {isProcessing && (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{processingStatus}</span>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      setEnhanceImage(null);
                      setEnhancedResult(null);
                      enhanceInputRef.current?.click();
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Try Another Image
                  </Button>
                  {enhancedResult && (
                    <Button 
                      onClick={() => downloadImage(enhancedResult, 'enhanced-image.png')}
                      className="flex-1"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            )}
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
              Remove backgrounds from images with one click (Runs in browser, 100% free)
            </p>
            
            <input
              ref={bgRemoveInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleRemoveBackground(file);
              }}
            />
            
            {!bgRemoveImage ? (
              <div 
                className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => bgRemoveInputRef.current?.click()}
              >
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
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Original</p>
                    <img src={bgRemoveImage} alt="Original" className="w-full rounded-lg border" />
                  </div>
                  {bgRemovedResult && (
                    <div>
                      <p className="text-sm font-medium mb-2">Background Removed</p>
                      <div className="relative w-full rounded-lg border" style={{ 
                        backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                        backgroundSize: '20px 20px',
                        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                      }}>
                        <img src={bgRemovedResult} alt="No BG" className="w-full rounded-lg" />
                      </div>
                    </div>
                  )}
                </div>
                
                {isProcessing && (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{processingStatus}</span>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      setBgRemoveImage(null);
                      setBgRemovedResult(null);
                      bgRemoveInputRef.current?.click();
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Try Another Image
                  </Button>
                  {bgRemovedResult && (
                    <Button 
                      onClick={() => downloadImage(bgRemovedResult, 'no-background.png')}
                      className="flex-1"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download PNG
                    </Button>
                  )}
                </div>
              </div>
            )}
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
              Get smart product bundle suggestions based on your catalog (Powered by Lovable AI)
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Your Products</label>
                <Textarea
                  placeholder="List your products, one per line&#10;E.g.,&#10;Cat Astronaut Tee&#10;Space Explorer Hoodie&#10;Galaxy Pattern Mug"
                  rows={6}
                  className="resize-none"
                  value={bundleInput}
                  onChange={(e) => setBundleInput(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={handleGenerateBundle}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Bundle Ideas
                  </>
                )}
              </Button>

              {generatedBundles && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Generated Bundle Ideas</label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(generatedBundles)}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                  </div>
                  <Textarea
                    value={generatedBundles}
                    readOnly
                    rows={12}
                    className="resize-none bg-secondary"
                  />
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}