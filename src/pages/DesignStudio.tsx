import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, Save, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DesignStudio = () => {
  const location = useLocation();
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("cartoon");
  const [colorScheme, setColorScheme] = useState("vibrant");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [savedDesignId, setSavedDesignId] = useState<string | null>(null);

  // Load prompt from navigation state if available
  useEffect(() => {
    if (location.state?.prompt) {
      setPrompt(location.state.prompt);
    }
  }, [location]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a design prompt");
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);
    setSavedDesignId(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-tshirt-design', {
        body: { prompt, style, colorScheme }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setGeneratedImage(data.imageUrl);
      toast.success("Design generated successfully!");
    } catch (error) {
      console.error('Error generating design:', error);
      toast.error("Failed to generate design");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedImage) return;

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('designs')
        .insert({
          user_id: user.id,
          prompt,
          style,
          color_scheme: colorScheme,
          image_url: generatedImage,
        })
        .select()
        .single();

      if (error) throw error;

      setSavedDesignId(data.id);
      toast.success("Design saved to library!");
    } catch (error) {
      console.error('Error saving design:', error);
      toast.error("Failed to save design");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadToShopify = async () => {
    if (!savedDesignId) {
      toast.error("Please save the design first");
      return;
    }

    setIsUploading(true);
    try {
      const { data, error } = await supabase.functions.invoke('upload-design-to-shopify', {
        body: {
          designId: savedDesignId,
          title: `${style} T-Shirt - ${prompt.slice(0, 30)}`,
          description: prompt,
          price: "24.99"
        }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      toast.success("Product created on Shopify!", {
        description: `View at: ${data.productUrl || 'Shopify Admin'}`
      });
    } catch (error) {
      console.error('Error uploading to Shopify:', error);
      toast.error("Failed to upload to Shopify");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">AI T-Shirt Design Studio</h1>
        <p className="text-muted-foreground">Create custom t-shirt designs with AI and upload them to Shopify</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Design Parameters</CardTitle>
            <CardDescription>Describe your t-shirt design idea</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="prompt">Design Prompt</Label>
              <Input
                id="prompt"
                placeholder="e.g., funny cow wearing Santa hat eating cookies"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="style">Style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger id="style" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cartoon">Cartoon</SelectItem>
                  <SelectItem value="realistic">Realistic</SelectItem>
                  <SelectItem value="minimalist">Minimalist</SelectItem>
                  <SelectItem value="vintage">Vintage</SelectItem>
                  <SelectItem value="retro">Retro</SelectItem>
                  <SelectItem value="watercolor">Watercolor</SelectItem>
                  <SelectItem value="line-art">Line Art</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="color">Color Scheme</Label>
              <Select value={colorScheme} onValueChange={setColorScheme}>
                <SelectTrigger id="color" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vibrant">Vibrant</SelectItem>
                  <SelectItem value="pastel">Pastel</SelectItem>
                  <SelectItem value="monochrome">Monochrome</SelectItem>
                  <SelectItem value="warm">Warm Tones</SelectItem>
                  <SelectItem value="cool">Cool Tones</SelectItem>
                  <SelectItem value="neon">Neon</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || !prompt.trim()}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Design
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Preview Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Design Preview</CardTitle>
            <CardDescription>Your generated t-shirt design will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            {generatedImage ? (
              <div className="space-y-4">
                <div className="bg-secondary/20 rounded-lg p-4 flex items-center justify-center min-h-[400px]">
                  <img 
                    src={generatedImage} 
                    alt="Generated design" 
                    className="max-w-full max-h-[400px] object-contain"
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleSave} 
                    disabled={isSaving || !!savedDesignId}
                    variant="outline"
                    className="flex-1"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {savedDesignId ? "Saved" : "Save to Library"}
                  </Button>

                  <Button 
                    onClick={handleUploadToShopify}
                    disabled={isUploading || !savedDesignId}
                    className="flex-1"
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    Upload to Shopify
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-secondary/20 rounded-lg p-8 flex items-center justify-center min-h-[400px]">
                <div className="text-center text-muted-foreground">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Enter a prompt and click "Generate Design"</p>
                  <p className="text-sm mt-2">Your AI-generated design will appear here</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DesignStudio;
