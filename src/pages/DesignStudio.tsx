import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CanvasEditor } from "@/components/design-studio/CanvasEditor";
import { TShirtColorPicker } from "@/components/design-studio/TShirtColorPicker";
import { AIGenerationPanel } from "@/components/design-studio/AIGenerationPanel";

const DesignStudio = () => {
  const location = useLocation();
  const [tshirtColor, setTshirtColor] = useState("#FFFFFF");
  const [exportedDesign, setExportedDesign] = useState<string | null>(null);
  const [aiGeneratedImage, setAiGeneratedImage] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [savedDesignId, setSavedDesignId] = useState<string | null>(null);

  const handleSave = async () => {
    if (!exportedDesign) {
      toast.error("Please export your design first");
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('designs')
        .insert({
          user_id: user.id,
          prompt: "Custom canvas design",
          style: "custom",
          color_scheme: tshirtColor,
          image_url: exportedDesign,
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
          title: `Custom T-Shirt Design`,
          description: "Custom designed t-shirt",
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
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Professional T-Shirt Design Studio</h1>
        <p className="text-muted-foreground">Create custom designs with AI generation and professional editing tools</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - AI & Color */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>T-Shirt Settings</CardTitle>
              <CardDescription>Choose your t-shirt color</CardDescription>
            </CardHeader>
            <CardContent>
              <TShirtColorPicker 
                selectedColor={tshirtColor}
                onColorChange={setTshirtColor}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <AIGenerationPanel 
                onGenerate={setAiGeneratedImage}
                initialPrompt={location.state?.prompt || ""}
              />
            </CardContent>
          </Card>
        </div>

        {/* Center - Canvas Editor */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Design Canvas</CardTitle>
              <CardDescription>Add text, images, shapes and customize your design</CardDescription>
            </CardHeader>
            <CardContent>
              <CanvasEditor 
                tshirtColor={tshirtColor}
                aiGeneratedImage={aiGeneratedImage}
                onExport={setExportedDesign}
              />

              <div className="flex gap-2 mt-6">
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving || !exportedDesign || !!savedDesignId}
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DesignStudio;
